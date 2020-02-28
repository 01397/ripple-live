import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core'
import { SkywayService, User } from '../skyway.service'
import { SystemService, Status } from '../system.service'

@Component({
  selector: 'app-group-live',
  templateUrl: './group-live.component.html',
  styleUrls: ['./group-live.component.scss'],
})
export class GroupLiveComponent implements OnInit {
  @Input() master: boolean = false
  public users: User[] = []
  public focusIndex: number = 0
  public sidebarOpened: boolean = true
  public displayStyle: Status['style'] = {
    slide: 'none',
    ytlive: 'none',
  }
  public videoid: string | null = null
  constructor(public skyway: SkywayService, public system: SystemService, private changeDetector: ChangeDetectorRef) {}

  ngOnInit() {
    this.skyway.usersSubject.subscribe(users => {
      console.log(users)
      console.log(`len: ${users.length}`)
      this.focusIndex = Math.max(0, Math.min(users.length - 1, this.focusIndex))
      this.users = users
      this.changeDetector.detectChanges()
    })
    this.system.statusDoc.valueChanges().subscribe(status => {
      if (!status) {
        console.error('unable to get master status')
        this.system.openSnack('全体講義の情報取得に問題があります (g33)')
        return
      }
      this.displayStyle = status.style
      this.videoid = status.ytid
      this.changeDetector.detectChanges()
    })
  }
  setFocus(index: number) {
    this.focusIndex = index
    this.skyway.focusUpdate.next(this.users[index].stream)
    this.changeDetector.detectChanges()
  }
  toggleSidebar() {
    this.sidebarOpened = !this.sidebarOpened
  }
}
