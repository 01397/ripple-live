import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'

import { AppComponent } from './app.component'
import { SidebarComponent } from './sidebar/sidebar.component'
import { VideoComponent } from './video/video.component'
import { GroupLiveComponent } from './group-live/group-live.component'
import { CommonModule } from '@angular/common'
import { StartComponent } from './start/start.component'
import { ChatComponent } from './chat/chat.component'
import { CommentDatePipe } from './comment-date.pipe'
import { AngularFireModule } from '@angular/fire'
import { AngularFirestoreModule } from '@angular/fire/firestore'
import { AngularFireDatabaseModule } from '@angular/fire/database'
import { environment } from 'src/environments/environment'
import { MasterComponent } from './master/master.component'
import { YtliveComponent } from './ytlive/ytlive.component'
import { SlideComponent } from './slide/slide.component'
import { MembersComponent } from './members/members.component'
import { AngularFireAuthModule } from '@angular/fire/auth'

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    VideoComponent,
    GroupLiveComponent,
    StartComponent,
    ChatComponent,
    CommentDatePipe,
    MasterComponent,
    YtliveComponent,
    SlideComponent,
    MembersComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireDatabaseModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
