import { Component, OnInit } from '@angular/core'
import { SafeUrl, DomSanitizer } from '@angular/platform-browser'
import { firestore } from 'firebase'
import { AngularFirestore } from '@angular/fire/firestore'
import { Status } from '../system.service'

@Component({
  selector: 'app-slide',
  templateUrl: './slide.component.html',
  styleUrls: ['./slide.component.scss'],
})
export class SlideComponent implements OnInit {
  public source: SafeUrl = ''

  constructor(private db: AngularFirestore, private sanitizer: DomSanitizer) {
    db.doc<Status>('config/status')
      .valueChanges()
      .subscribe(status => {
        if (!status || !status.slideURL) return
        this.source = sanitizer.bypassSecurityTrustResourceUrl(status.slideURL)
      })
  }

  ngOnInit() {}
}
