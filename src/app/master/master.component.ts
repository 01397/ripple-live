import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core'
import { SkywayService, User } from '../skyway.service'
import { AngularFireModule } from '@angular/fire'
import { SystemService, Status } from '../system.service'

@Component({
  selector: 'app-master',
  templateUrl: './master.component.html',
  styleUrls: ['./master.component.scss'],
})
export class MasterComponent implements OnInit {
  public slide: Status['style']['slide'] = 'none'
  public ytlive: Status['style']['ytlive'] = 'full'
  constructor(private system: SystemService) {}

  ngOnInit() {
    this.system.statusDoc.valueChanges().subscribe(status => {
      if (!status) return
      this.slide = status.style.slide
      this.ytlive = status.style.ytlive
    })
  }
  updateSlideStatus(value: Status['style']['slide']) {
    this.slide = value
    this.system.statusDoc.update({ style: { slide: value, ytlive: this.ytlive } })
  }
  updateYtliveStatus(value: Status['style']['ytlive']) {
    this.ytlive = value
    this.system.statusDoc.update({ style: { slide: this.slide, ytlive: value } })
  }
  updateYoutubeId(id: string) {
    this.system.statusDoc.update({ ytid: id })
  }
}
