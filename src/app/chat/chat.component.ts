import { Component, OnInit, PipeTransform, Pipe, ElementRef, ViewChild, OnDestroy } from '@angular/core'
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database'
import { SkywayService } from '../skyway.service'
import { firestore } from 'firebase'
import { Observable, Subject } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { SystemService, Post } from '../system.service'

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
  public posts?: Observable<Post[]>
  public formMessage: string = ''
  @ViewChild('postContainer', { static: false }) private chatContainer?: ElementRef<HTMLDivElement>

  constructor(private system: SystemService) {
    this.join()
    if (!this.system.postRef) {
      console.error('system.postRef is undefined...')
      return
    }
    this.posts = this.system.postRef.valueChanges()
    this.posts.subscribe(() => {
      setTimeout(() => {
        if (!this.chatContainer) return
        const element = this.chatContainer.nativeElement
        element.scrollTop = element.scrollHeight
      }, 200)
    })
  }
  ngOnInit() {}
  addItem() {
    this.system.addChatItem(this.formMessage)
    this.formMessage = ''
  }
  join() {
    this.system.joinGroup()
  }
  ngOnDestroy() {
    this.system.leaveGroup()
  }
}
