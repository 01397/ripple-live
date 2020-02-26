import { Component, OnInit } from '@angular/core'
import { SkywayService } from '../skyway.service'
import { SystemService } from '../system.service'

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss'],
})
export class StartComponent implements OnInit {
  public name: string = ''
  private table: string = ''
  private class: string = ''
  public progress = 0
  public tables = ['張', '鄭', '郭', '藤田', '志田', '岡崎', '甲斐', '武田']

  constructor(private skyway: SkywayService, private system: SystemService) {}

  ngOnInit() {}

  next() {
    this.progress++
    if (this.progress >= 4) {
      this.skyway.join(`c${this.class}-t${this.table}`)
      this.system.screen = 'main'
    }
  }
  setName(name: string) {
    this.skyway.setName(name)
    this.next()
  }
  selectClass(i: number) {
    this.skyway.setClass(i)
    this.class = '' + i
    this.next()
  }
  selectTable(table: string) {
    this.skyway.setTable(table)
    this.table = table
    this.next()
  }
}
