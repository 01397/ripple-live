import { Component, OnInit } from '@angular/core'
import { SkywayService, LocalMediaState, User } from '../skyway.service'

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  public localState: LocalMediaState = { audio: false, video: false, screen: false }
  public stream: MediaStream | null = null

  constructor(public skyway: SkywayService) {}

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
}
