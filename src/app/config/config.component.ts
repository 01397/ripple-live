import { Component, OnInit } from '@angular/core'
import { SystemService } from '../system.service'
import { SkywayService } from '../skyway.service'

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss'],
})
export class ConfigComponent implements OnInit {
  public audioDevices: MediaDeviceInfo[] = []
  public videoDevices: MediaDeviceInfo[] = []
  constructor(private systemService: SystemService, public skywayService: SkywayService) {}

  ngOnInit() {
    navigator.mediaDevices
      .enumerateDevices()
      .then(devices => {
        this.audioDevices = devices.filter(v => v.kind === 'audioinput')
        this.videoDevices = devices.filter(v => v.kind === 'videoinput')
      })
      .catch(err => {
        console.error('enumerateDevide ERROR:', err)
      })
  }
  closeConfig() {
    this.systemService.configDialog = false
    this.skywayService.updateMediaSource()
  }
}
