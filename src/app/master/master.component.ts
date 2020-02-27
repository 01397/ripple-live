import { Component, OnInit, ViewChild, ElementRef } from '@angular/core'
import Peer, { SfuRoom } from 'skyway-js'

@Component({
  selector: 'app-master',
  templateUrl: './master.component.html',
  styleUrls: ['./master.component.scss'],
})
export class MasterComponent implements OnInit {
  constructor() {}

  ngOnInit() {
    this.init()
  }
  async init() {
    
  }
}
