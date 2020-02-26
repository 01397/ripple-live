import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core'
import { SkywayService } from '../skyway.service'

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
})
export class VideoComponent implements AfterViewInit {
  @Input() id: string = ''
  @ViewChild('video', { static: false }) private video?: ElementRef<HTMLVideoElement>

  constructor(private skyway: SkywayService) {}

  ngAfterViewInit() {
    console.info(this.video)
    console.info(this.skyway.users)
    if (!this.video) return
    const element = this.video.nativeElement
    element.muted = true
    // @ts-ignore
    element.playsInline = true
    element.srcObject = this.skyway.users[this.id].stream
    element.play().catch(console.error)
  }
}
