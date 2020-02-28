import { Component, OnInit, SecurityContext } from '@angular/core'
import { DomSanitizer } from '@angular/platform-browser'
import { AngularFirestore } from '@angular/fire/firestore'
import { Status, SystemService } from '../system.service'

@Component({
  selector: 'app-slide',
  templateUrl: './slide.component.html',
  styleUrls: ['./slide.component.scss'],
})
export class SlideComponent implements OnInit {
  public source: string = ''

  constructor(private db: AngularFirestore, private sanitizer: DomSanitizer, private system: SystemService) {
    this.db
      .doc<Status>('config/status')
      .valueChanges()
      .subscribe(status => {
        if (!status || !status.slideURL) {
          console.error('unable to get master status')
          this.system.openSnack('全体講義の情報取得に問題があります (l21)')
          return
        }
        this.source =
          this.sanitizer.sanitize(
            SecurityContext.RESOURCE_URL,
            sanitizer.bypassSecurityTrustResourceUrl(status.slideURL)
          ) || ''
      })
  }

  ngOnInit() {}
}
