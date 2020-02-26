import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'

import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { VideoComponent } from './video/video.component';
import { GroupLiveComponent } from './group-live/group-live.component';
import { CommonModule } from '@angular/common';
import { StartComponent } from './start/start.component';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    VideoComponent,
    GroupLiveComponent,
    StartComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
