import { Component, OnInit, PipeTransform, Pipe, ElementRef, ViewChild } from '@angular/core'
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore'
import { SkywayService } from '../skyway.service'
import { firestore } from 'firebase'
import { Observable } from 'rxjs'
import { SystemService } from '../system.service'

interface Post {
  name: string
  group: string
  timestamp: firestore.Timestamp
  body: string
  level: number
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  public postCollection: AngularFirestoreCollection<Post>
  public posts: Observable<Post[]>
  private group: string
  public formMessage: string = ''
  @ViewChild('postContainer', { static: false }) private chatContainer?: ElementRef<HTMLDivElement>

  constructor(private db: AngularFirestore, private skyway: SkywayService, private system: SystemService) {
    this.group = `c${this.skyway.metadata.class}-t${this.skyway.metadata.table}`
    this.postCollection = this.db.collection<Post>('posts', ref =>
      ref
        .where('group', '==', this.group)
        .orderBy('timestamp')
        .limitToLast(30)
    )
    this.posts = this.postCollection.valueChanges()
    this.posts.subscribe(() => {
      setTimeout(() => {
        if (!this.chatContainer) return
        const element = this.chatContainer.nativeElement
        element.scrollTop = element.scrollHeight
      }, 200)
    })
  }
  addItem() {
    const body = this.formMessage
    this.formMessage = ''
    const id = this.db.createId()
    const post: Post = {
      name: this.skyway.metadata.name,
      body: body,
      group: this.group,
      timestamp: firestore.Timestamp.fromDate(new Date()),
      level: 1,
    }
    this.postCollection.doc(id).set(post)
  }
  join() {
    const id = this.db.createId()
    const post: Post = {
      name: this.skyway.metadata.name,
      body: `${this.system.tableNames[this.skyway.metadata.table]}グループに参加しました`,
      group: this.group,
      timestamp: firestore.Timestamp.fromDate(new Date()),
      level: 0,
    }
    this.postCollection.doc(id).set(post)
  }
  ngOnInit() {
    this.join()
  }
}
