import { Component, OnInit } from '@angular/core'
import { SkywayService, LocalMediaState, User } from '../skyway.service'
import { SystemService } from '../system.service'

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  public localState: LocalMediaState = { audio: false, video: false, screen: false }
  public stream: MediaStream | null = null

  constructor(public skyway: SkywayService, public system: SystemService) {}

  ngOnInit() {
    this.skyway.localState.subscribe(localState => {
      this.localState = localState
    })
  }
  toggleLocalAudio() {
    this.skyway.toggleLocalAudio()
  }
  toggleLocalVideo() {
    this.skyway.toggleLocalVideo()
  }
  toggleScreenShare() {
    this.skyway.toggleScreenShare()
  }
  reselectGroup() {
    this.skyway.exitRoom()
    this.system.screen = 'start'
  }
  showConfigDialog() {
    this.system.showConfigDialog()
  }
}
