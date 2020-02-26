import { Injectable } from '@angular/core'
import { BehaviorSubject, of, Subject } from 'rxjs'
import Peer, { SfuRoom } from 'skyway-js'
import { Stream } from 'stream'

export interface User {
  id: string
  stream: MediaStream
}
export interface LocalMediaState {
  audio: boolean
  video: boolean
  screen: boolean
}

@Injectable({
  providedIn: 'root',
})
export class SkywayService {
  private peer: Peer | null = null
  private room: SfuRoom | null = null
  private ROOM_MODE: 'sfu' | 'mesh' = 'sfu'
  public metadata = { name: '', class: 0, table: '' }
  public roomId: string = 'test'
  private localUser?: User
  private localCameraStream?: MediaStream
  private users: User[] = []
  public usersSubject = new BehaviorSubject<User[]>([])
  public localState = new BehaviorSubject<LocalMediaState>({ audio: true, video: true, screen: false })
  public isConnected = false
  public localStreamUpdate = new Subject<MediaStream>()
  private removeScreenStreamShareEventListener: (() => void) | null = null

  constructor() {
    this.peer = new Peer({
      key: '9fa5a062-8447-46df-b6aa-86752eec9bd0',
      debug: 3,
      turn: true,
    })
    this.localState.subscribe(state => {
      console.log(state)
      if (!this.localUser) return
      const vt = this.localUser.stream.getVideoTracks()
      if (vt[0]) vt[0].enabled = state.video
      const at = this.localUser.stream.getAudioTracks()
      if (at[0]) at[0].enabled = state.video
    })
  }

  setLocalStream(stream: MediaStream) {
    this.localUser = {
      id: 'local',
      stream,
    }
    this.localCameraStream = stream
  }

  getLocalUser() {
    return this.localUser
  }

  toggleScreenShare() {
    if (this.localState.value.screen) {
      this.exitScreenShare()
    } else {
      this.enterScreenShare()
    }
  }

  enterScreenShare() {
    if (!this.localUser) return
    // @ts-ignore
    navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }).then((stream: MediaStream) => {
      // @ts-ignore
      this.localUser.stream = stream
      // @ts-ignore
      this.room.replaceStream(stream)
      this.localStreamUpdate.next(stream)
      this.localState.next({ audio: this.localState.value.audio, video: true, screen: true })
      const func = () => this.exitScreenShare()
      stream.addEventListener('inactive', func)
      this.removeScreenStreamShareEventListener = () => stream.removeEventListener('inactive', func)
    })
  }
  exitScreenShare() {
    console.log('stop caputuring screen')
    if (!this.room || !this.localUser || !this.localCameraStream) return
    const screenStream = this.localUser.stream
    screenStream.getTracks().forEach(track => track.stop())
    if (this.removeScreenStreamShareEventListener) {
      this.removeScreenStreamShareEventListener()
      this.removeScreenStreamShareEventListener = null
    }
    const stream = this.localCameraStream
    this.localUser.stream = stream
    this.room.replaceStream(stream)
    this.localStreamUpdate.next(stream)
    this.localState.next({ audio: this.localState.value.audio, video: true, screen: false })
  }

  async join(roomId: string) {
    this.roomId = roomId
    console.log(roomId)
    const localStream = await navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: true,
      })
      .catch(console.error)
    if (!localStream) return
    this.setLocalStream(localStream)

    if (!this.peer || !this.peer.open || !this.localUser) {
      return
    }

    this.room = this.peer.joinRoom(this.roomId, {
      mode: this.ROOM_MODE,
      stream: this.localUser.stream,
    }) as SfuRoom

    if (!this.room) return

    // 自分が参加
    // @ts-ignore
    this.room.once('open', () => {
      this.isConnected = true
      console.log('=== You joined ===')
    })

    // 他人が参加
    this.room.on('peerJoin', peerId => {
      console.log(`=== ${peerId} joined ===`)
    })

    // 他人が参加
    this.room.on('stream', async stream => {
      this.users.push({
        // @ts-ignore
        peerId: stream.peerId + '',
        // @ts-ignore
        stream,
      })
      this.usersSubject.next(this.users)
      console.log(this.users)
      /*
      const element = document.createElement('video')
      element.classList.add('remote-video')
      element.srcObject = stream
      element.playsInline = true
      // @ts-ignore
      element.setAttribute('data-peer-id', stream.peerId)
      remoteVideos.append(element)
      await element.play().catch(console.error)
      */
    })

    // 誰かが離脱
    this.room.on('peerLeave', peerId => {
      const index = this.users.findIndex(v => v.id === peerId)
      delete this.users[index]
      this.usersSubject.next(this.users)
      /*
      const remoteVideo = remoteVideos.querySelector(`[data-peer-id=${peerId}]`) as HTMLVideoElement
      if (!remoteVideo || !remoteVideo.srcObject || !(remoteVideo.srcObject instanceof MediaStream)) return
      remoteVideo.srcObject.getTracks().forEach(track => track.stop())
      remoteVideo.srcObject = null
      remoteVideo.remove()
      console.log(`=== ${peerId} left ===`)
      */
    })

    // 自分が離脱
    this.room.once('close', () => {
      this.isConnected = false
      /*
      sendTrigger.removeEventListener('click', this.sendMessage)
      console.log('== You left ===')
      Array.from(remoteVideos.children).forEach(remoteVideo => {
        if (!remoteVideo || !remoteVideo.srcObject || !(remoteVideo.srcObject instanceof MediaStream)) return
        remoteVideo.srcObject.getTracks().forEach(track => track.stop())
        remoteVideo.srcObject = null
        remoteVideo.remove()
      })
      */
    })

    // 他人からのメッセージ
    this.room.on('data', ({ data, src }) => {
      console.log(`${src}: ${data}`)
    })
  }

  sendMessage(message: string) {
    if (this.room === null || this.peer === null) return
    this.room.send(message)
    console.log(`${this.peer.id}: ${message}\n`)
  }

  toggleLocalAudio() {
    const status = this.localState.value
    status.audio = !status.audio
    this.localState.next(status)
  }
  toggleLocalVideo() {
    const status = this.localState.value
    status.video = !status.video
    this.localState.next(status)
  }

  setName(name: string) {
    console.log(name)
    this.metadata.name = name
  }
  setClass(cl: number) {
    this.metadata.class = cl
  }
  setTable(table: string) {
    this.metadata.table = table
  }
}
