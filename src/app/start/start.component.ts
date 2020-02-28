import { Component, OnInit } from '@angular/core'
import { SkywayService } from '../skyway.service'
import { SystemService } from '../system.service'

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss'],
})
export class StartComponent implements OnInit {
  public name: string
  private tableId: number = 0
  private class: string = ''
  public progress = 0
  public version = ''

  constructor(private skyway: SkywayService, public system: SystemService) {
    const name = localStorage.getItem('userName')
    this.name = name !== null ? name : ''
  }

  ngOnInit() {
    console.log(name)
    console.log(this.name)
    this.version = this.system.version
    if (this.system.currentName !== '') this.progress = 1
  }

  next() {
    this.progress++
    if (this.progress >= 4) {
      this.skyway.join(`c${this.class}-t${this.tableId}`)
      this.system.screen = 'main'
    }
  }
  setName() {
    localStorage.setItem('userName', this.name)
    if (this.name === 'master') {
      this.skyway.setName('全体')
      this.system.screen = 'master'
      return
    }
    this.skyway.setName(this.name)
    this.next()
  }
  selectClass(i: number) {
    this.skyway.setClass(i)
    this.class = '' + i
    this.next()
  }
  selectTable(tableId: number) {
    this.skyway.setTable(tableId)
    this.tableId = tableId
    this.next()
  }
}
