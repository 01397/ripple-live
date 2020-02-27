import { Component, OnInit, Input, SecurityContext } from '@angular/core'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'

@Component({
  selector: 'app-ytlive',
  templateUrl: './ytlive.component.html',
  styleUrls: ['./ytlive.component.scss'],
})
export class YtliveComponent implements OnInit {
  public videoUrl: string = ''
  @Input() set videoid(id: string) {
    if (!id) return
    const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://www.youtube.com/embed/' +
        id +
        '?autoplay=1&cc_load_policy=1&playsinline=1&controls=0&fs=0&modestbranding=1&color=white&rel=0'
    )
    this.videoUrl = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, safeUrl) || ''
  }

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {}
}
