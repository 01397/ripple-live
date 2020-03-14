import { Component, OnInit, PipeTransform, Pipe, ElementRef, ViewChild, OnDestroy } from '@angular/core'
import { Observable, Subject, of } from 'rxjs'
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
  private compositionJustEnd: boolean = false

  constructor(private system: SystemService) {
    this.join()
    if (!this.system.postRef) {
      console.error('system.postRef is undefined...')
      system.openSnack('チャットが取得できません (c23)')
      return
    }
    this.posts = this.system.postRef.valueChanges()
    this.posts.subscribe(posts => {
      setTimeout(() => {
        if (!this.chatContainer) {
          console.error('unable to get chatContainer')
          system.openSnack('チャットの更新に問題があります (c31)')
          return
        }
        const element = this.chatContainer.nativeElement
        element.scrollTop = element.scrollHeight
      }, 200)
      const latest = posts[posts.length - 1]
      if (latest.level !== 0 && latest.name !== this.system.currentName) {
        const notification = new Notification(latest.name, {
          renotify: true,
          tag: 'new post',
          body: latest.body,
        })
        notification.onclick = () => window.onclick
      }
    })
  }
  ngOnInit() {}
  addItem() {
    if (this.formMessage === '') return
    this.system.addChatItem(this.formMessage)
    this.formMessage = ''
  }
  join() {
    this.system.joinGroup()
  }
  ngOnDestroy() {
    this.system.leaveGroup()
  }
  onEnter() {
    if (!this.compositionJustEnd) {
      this.addItem()
    } else {
      this.compositionJustEnd = false
    }
  }
  compositionEnd() {
    this.compositionJustEnd = true
  }
}
