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
  public ytid: string = ''
  public tableName: string[] = []
  public tableNameFire: string[] = []
  constructor(private system: SystemService) {}

  ngOnInit() {
    this.system.statusDoc.valueChanges().subscribe(status => {
      if (!status) {
        console.error('unable to get master status')
        this.system.openSnack('全体講義の情報取得に問題があります (r23)')
        return
      }
      this.slide = status.style.slide
      this.ytlive = status.style.ytlive
      this.ytid = status.ytid || ''
      this.tableName = status.table
      this.tableNameFire = [...status.table]
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
    this.system.statusDoc.update({ ytid: this.ytid })
  }
  updateTableName() {
    this.system.statusDoc.update({ table: this.tableName })
  }
  // https://stackoverflow.com/questions/50139508/input-loses-focus-when-editing-value-using-ngfor-and-ngmodel-angular5
  trackByFn(index: number, item: any) {
    return index
  }
  groupNameChanged() {
    return !this.tableNameFire.every((v, i) => v === this.tableName[i])
  }
}
