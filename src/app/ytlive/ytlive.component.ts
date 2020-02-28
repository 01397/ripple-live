import { Component, OnInit, Input, SecurityContext } from '@angular/core'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'

@Component({
  selector: 'app-ytlive',
  templateUrl: './ytlive.component.html',
  styleUrls: ['./ytlive.component.scss'],
})
export class YtliveComponent implements OnInit {
  public videoUrl: any | null = null
  @Input() set videoid(id: string) {
    if (!id) return
    this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://www.youtube.com/embed/' +
        id +
        '?autoplay=1&cc_load_policy=1&playsinline=1&controls=0&fs=0&modestbranding=1&color=white&rel=0'
    )
  }

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {}
}
