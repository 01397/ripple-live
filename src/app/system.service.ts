import { Injectable } from '@angular/core'
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore'
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database'
import { database } from 'firebase'

export interface Status {
  style: {
    ytlive: 'full' | 'wipe' | 'none' | 'sound'
    slide: 'full' | 'wipe' | 'none'
  }
  target: {
    c1: boolean
    c2: boolean
  }
  ytid: string | null
  slideURL: string | null
  table: string[]
  fixedText: string
}

export interface Post {
  name: string
  group: string
  timestamp: number | Object
  body: string
  level: number
}

@Injectable({
  providedIn: 'root',
})
export class SystemService {
  public screen: 'start' | 'main' | 'master' = 'start'
  public version = 'バージョン 1.1'
  public statusDoc: AngularFirestoreDocument<Status>
  public tableNames: string[] = []
  public currentClass: number = 0
  public currentTable: number = 0
  public currentName: string = ''
  public get currentGroup() {
    return `c${this.currentClass}-t${this.currentTable}`
  }
  public postRef?: AngularFireList<Post>
  private leaveRef?: firebase.database.OnDisconnect
  private snackText: string[] = []
  public configDialog: boolean = false

  constructor(db: AngularFirestore, public rdb: AngularFireDatabase) {
    this.statusDoc = db.doc<Status>('config/status')
    this.statusDoc.valueChanges().subscribe(status => {
      if (!status) return
      this.tableNames = status.table
    })
  }

  joinGroup() {
    const post: Post = {
      name: this.currentName,
      body: `${this.tableNames[this.currentTable]}グループに参加しました`,
      group: this.currentGroup,
      timestamp: database.ServerValue.TIMESTAMP,
      level: 0,
    }
    this.postRef = this.rdb.list<Post>('posts/' + this.currentGroup, ref =>
      ref.orderByChild('timestamp').limitToLast(100)
    )
    this.postRef.push(post)
    this.leaveRef = this.rdb.database
      .ref('posts/' + this.currentGroup)
      .push()
      .onDisconnect()
    this.leaveRef.set({
      name: this.currentName,
      body: `${this.tableNames[this.currentTable]}グループから離れました`,
      group: this.currentGroup,
      timestamp: database.ServerValue.TIMESTAMP,
      level: 0,
    })
  }
  leaveGroup() {
    this.rdb.database
      .ref('posts/' + this.currentGroup)
      .push()
      .set({
        name: this.currentName,
        body: `${this.tableNames[this.currentTable]}グループから離れました`,
        group: this.currentGroup,
        timestamp: database.ServerValue.TIMESTAMP,
        level: 0,
      })
    if (this.leaveRef) this.leaveRef.cancel()
  }
  addChatItem(body: string) {
    if (!this.postRef) {
      console.error('unable to send message')
      this.openSnack('送信できませんでした (m93)')
      return
    }
    const post: Post = {
      name: this.currentName,
      body: body,
      group: this.currentGroup,
      timestamp: new Date().getTime(),
      level: 1,
    }
    this.postRef.push(post)
  }
  openSnack(msg: string) {
    this.snackText.push(msg)
    setTimeout(() => {
      this.snackText.splice(0, 1)
    }, 4000)
  }
  getSnacks() {
    return this.snackText
  }
  showConfigDialog() {
    this.configDialog = true
  }
  hideConfigDialog() {
    this.configDialog = false
  }
}
