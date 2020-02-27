import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core'
import { SkywayService } from '../skyway.service'

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
})
export class VideoComponent implements AfterViewInit {
  @Input() stream?: MediaStream
  @Input() local: boolean = false
  @Input() focused: boolean = false
  @Input() label: string = ''
  @ViewChild('video', { static: false }) private video?: ElementRef<HTMLVideoElement>

  constructor(private skyway: SkywayService, private changeDetector: ChangeDetectorRef) {}

  ngAfterViewInit() {
    console.info(this.video)
    if (!this.video || !this.stream) return
    const element = this.video.nativeElement
    element.muted = this.local
    // @ts-ignore
    element.playsInline = true
    element.srcObject = this.stream
    element.play()
    if (this.local === true) {
      this.skyway.localStreamUpdate.subscribe(stream => {
        element.pause()
        element.srcObject = stream
        element.play()
      })
    } else if (this.focused === true) {
      this.skyway.focusUpdate.subscribe(stream => {
        element.pause()
        element.srcObject = stream
        element.play()
      })
    }
  }
}
