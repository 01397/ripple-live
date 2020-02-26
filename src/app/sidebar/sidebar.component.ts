import { Component, OnInit } from '@angular/core'
import { SkywayService, LocalMediaState } from '../skyway.service'

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  public localState: LocalMediaState = { audio: false, video: false }

  constructor(public skyway: SkywayService) {}

  ngOnInit() {
    this.skyway.localState.subscribe(localState => {
      this.localState = localState
    })
  }

  join() {
    this.skyway.join('test-room')
  }
  toggleLocalAudio() {
    this.skyway.toggleLocalAudio()
  }
  toggleLocalVideo() {
    this.skyway.toggleLocalVideo()
  }
}
