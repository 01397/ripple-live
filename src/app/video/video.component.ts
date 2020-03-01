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
  private playProcess: boolean = false
  public volume: number = 0
  private timer?: number
  private timer2?: number

  constructor(private skyway: SkywayService, private system: SystemService, private detector: ChangeDetectorRef) {}

  ngAfterViewInit() {
    console.info(this.video)
    if (!this.video || !this.stream) {
      console.error('unable to play video')
      this.system.openSnack('動画の再生で問題が発生しました (v22)')
      return
    }
    const element = this.video.nativeElement
    element.muted = this.local || this.focused
    // @ts-ignore
    element.playsInline = true
    this.play(element, this.stream)
    if (this.local === true) {
      this.skyway.localStreamUpdate.subscribe(stream => {
        this.play(element, stream)
      })
    } else if (this.focused === true) {
      this.skyway.focusUpdate.subscribe(stream => {
        this.play(element, stream)
      })
    }
    this.setVolumeWatcher()
    this.timer2 = window.setInterval(() => {
      if (!element.paused) return
      console.log('try play()')
      element.play()
    }, 5000)
  }
  setVolumeWatcher() {
    if (!this.stream) return 0
    try {
      // @ts-ignore
      const ctx = window.AudioContext || window.webkitAudioContext
      const audioContext = new ctx()
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
    } catch (e) {
      console.error(e)
    }
  }
  ngOnDestroy() {
    window.clearInterval(this.timer)
    window.clearInterval(this.timer2)
  }
  play(element: HTMLVideoElement, stream: MediaStream) {
    if (element.srcObject) {
      if ('id' in element.srcObject && stream.id && element.srcObject.id == stream.id && !this.playProcess) {
        return
      }
    }
    element.srcObject = stream
    console.log('playVideo')
    this.playProcess = true
    element
      .play()
      .then(() => {
        this.playProcess = false
      })
      .catch(e => {
        console.error(e)
        console.error('再生中断エラー...')
        this.playProcess = false
      })
  }
}
