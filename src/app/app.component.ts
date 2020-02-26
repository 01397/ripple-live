import { Component, OnInit } from '@angular/core'
import { SystemService } from './system.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'ripple-live'
  constructor(public system: SystemService) {}
}
