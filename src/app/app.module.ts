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
import { AngularFirestoreModule, AngularFirestore } from '@angular/fire/firestore'
import { environment } from 'src/environments/environment';
import { MasterComponent } from './master/master.component'

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
  ],
  imports: [BrowserModule, CommonModule, FormsModule, AngularFireModule.initializeApp(environment.firebaseConfig)],
  providers: [AngularFirestore],
  bootstrap: [AppComponent],
})
export class AppModule {}
