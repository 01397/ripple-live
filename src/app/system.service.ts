import { Injectable } from '@angular/core'
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore'

export interface Status {
  style: {
    ytlive: 'full' | 'wipe' | 'none'
    slide: 'full' | 'wipe' | 'none'
  }
  target: {
    c1: boolean
    c2: boolean
  }
  ytid: string | null
  slideURL: string | null
  table: string[]
}

@Injectable({
  providedIn: 'root',
})
export class SystemService {
  userConfig = {
    name: '',
    group: '',
  }
  public screen: 'start' | 'main' | 'master' = 'start'
  public version = 'バージョン 0.5'
  public statusDoc: AngularFirestoreDocument<Status>
  public tableNames: string[] = []

  constructor(db: AngularFirestore) {
    this.statusDoc = db.doc<Status>('config/status')
    this.statusDoc.valueChanges().subscribe(status => {
      if (!status) return
      this.tableNames = status.table
    })
  }
}
