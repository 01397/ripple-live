import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core'
import { SkywayService } from '../skyway.service'
import { SystemService } from '../system.service'

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
})
export class VideoComponent implements AfterViewInit, OnDestroy {
  @Input() stream?: MediaStream
  @Input() local: boolean = false
  @Input() focused: boolean = false
  @Input() label: string = ''
  @ViewChild('video', { static: false }) private video?: ElementRef<HTMLVideoElement>
  private playing: boolean = false
  public volume: number = 0
  private timer?: number

  constructor(private skyway: SkywayService, private system: SystemService, private detector: ChangeDetectorRef) {}

  ngAfterViewInit() {
    console.info(this.video)
    if (!this.video || !this.stream) {
      console.error('unable to play video')
      this.system.openSnack('動画の再生で問題が発生しました (v22)')
      return
    }
    const element = this.video.nativeElement
    element.muted = this.local
    // @ts-ignore
    element.playsInline = true
    element.srcObject = this.stream
    element.play().then(() => (this.playing = true))
    if (this.local === true) {
      this.skyway.localStreamUpdate.subscribe(stream => {
        if (this.playing) element.pause()
        element.srcObject = stream
        this.playing = false
        element.play().then(() => (this.playing = true))
      })
    } else if (this.focused === true) {
      this.skyway.focusUpdate.subscribe(stream => {
        if (this.playing) element.pause()
        element.srcObject = stream
        this.playing = false
        element.play().then(() => (this.playing = true))
      })
    }
    this.setVolumeWatcher()
  }
  setVolumeWatcher() {
    if (!this.stream) return 0
    const audioContext = new AudioContext()
    const analyser = audioContext.createAnalyser()
    analyser.fftSize = 128
    const source = audioContext.createMediaStreamSource(this.stream)
    source.connect(analyser)
    if (!this.label) return
    const task = () => {
      const binary = new Uint8Array(analyser.frequencyBinCount)
      analyser.getByteFrequencyData(binary)
      const volume = binary.reduce((a, b) => a + b) / analyser.frequencyBinCount
      this.volume = Math.min(volume, 100) / 100
      this.detector.detectChanges()
    }
    this.timer = window.setInterval(task, 100)
    task()
  }
  ngOnDestroy() {
    window.clearInterval(this.timer)
  }
}
