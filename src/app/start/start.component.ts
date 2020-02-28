import { Component, OnInit } from '@angular/core'
import { AngularFireAuth } from '@angular/fire/auth'
import { SkywayService } from '../skyway.service'
import { SystemService } from '../system.service'
import { auth } from 'firebase'

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

  constructor(private skyway: SkywayService, public system: SystemService, private auth: AngularFireAuth) {
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
    if (this.name === 'staff') {
      this.loginWithGoogle()
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
  async loginWithGoogle() {
    const res = await this.auth.auth.signInWithPopup(new auth.GoogleAuthProvider())
    if (res.user && res.user.email === 'uec.programming@gmail.com') {
      this.skyway.setName('全体')
      this.system.screen = 'master'
      this.system.openSnack('管理者ログインに成功しました')
    }
  }
}
