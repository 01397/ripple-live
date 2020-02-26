import { Component, OnInit, PipeTransform, Pipe } from '@angular/core'
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore'
import { SkywayService } from '../skyway.service'
import { firestore } from 'firebase'
import { Observable } from 'rxjs'

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

  constructor(private db: AngularFirestore, private skyway: SkywayService) {
    this.group = `c${this.skyway.metadata.class}-t${this.skyway.metadata.table}`
    this.postCollection = this.db.collection<Post>('posts', ref =>
      ref
        .where('group', '==', this.group)
        .orderBy('timestamp')
        .limit(100)
    )
    this.posts = this.postCollection.valueChanges()
  }
  addItem(body: string) {
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
  join(body: string) {
    const id = this.db.createId()
    const post: Post = {
      name: this.skyway.metadata.name,
      body: `${this.skyway.metadata.table}グループに参加しました`,
      group: this.group,
      timestamp: firestore.Timestamp.fromDate(new Date()),
      level: 0,
    }
    this.postCollection.doc(id).set(post)
  }
  ngOnInit() {}
}
