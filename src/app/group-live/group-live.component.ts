import { Component, OnInit, ChangeDetectorRef } from '@angular/core'
import { SkywayService, User } from '../skyway.service'

@Component({
  selector: 'app-group-live',
  templateUrl: './group-live.component.html',
  styleUrls: ['./group-live.component.scss'],
})
export class GroupLiveComponent implements OnInit {
  public users: User[] = []
  public tests = [{ id: 1 }, { id: 2 }, { id: 7 }]
  constructor(public skyway: SkywayService, private changeDetector: ChangeDetectorRef) {}

  ngOnInit() {
    this.skyway.usersSubject.subscribe(users => {
      console.log(users)
      console.log(`len: ${users.length}`)
      this.users = users
      this.changeDetector.detectChanges()
    })
  }
  add() {
    this.tests.push({ id: 30 })
  }
}
