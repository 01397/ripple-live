import { Component, OnInit, SecurityContext } from '@angular/core'
import { DomSanitizer } from '@angular/platform-browser'
import { AngularFirestore } from '@angular/fire/firestore'
import { Status } from '../system.service'

@Component({
  selector: 'app-slide',
  templateUrl: './slide.component.html',
  styleUrls: ['./slide.component.scss'],
})
export class SlideComponent implements OnInit {
  public source: string = ''

  constructor(private db: AngularFirestore, private sanitizer: DomSanitizer) {
    db.doc<Status>('config/status')
      .valueChanges()
      .subscribe(status => {
        if (!status || !status.slideURL) return
        this.source =
          this.sanitizer.sanitize(
            SecurityContext.RESOURCE_URL,
            sanitizer.bypassSecurityTrustResourceUrl(status.slideURL)
          ) || ''
      })
  }

  ngOnInit() {}
}
