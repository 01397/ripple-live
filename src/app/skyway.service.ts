import { Injectable } from '@angular/core'
import { BehaviorSubject, of, Subject } from 'rxjs'
import Peer, { SfuRoom } from 'skyway-js'
import { AngularFirestore } from '@angular/fire/firestore'

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
  public metadata = { name: '', class: 0, table: 0 }
  public roomId: string = 'test'
  private localUser?: User
  private localCameraStream?: MediaStream
  private users: User[] = []
  public usersSubject = new BehaviorSubject<User[]>([])
  public localState = new BehaviorSubject<LocalMediaState>({ audio: true, video: true, screen: false })
  public isConnected = false
  public localStreamUpdate = new Subject<MediaStream>()
  public focusUpdate = new Subject<MediaStream>()
  private removeScreenStreamShareEventListener: (() => void) | null = null
  public peerUserList: { [key in string]: string } = {}

  constructor(private db: AngularFirestore) {
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

  async enterScreenShare() {
    if (!this.localUser || !this.room) return

    const screenStream: MediaStream = await navigator.mediaDevices
      // @ts-ignore
      .getDisplayMedia({
        audio: false,
        video: {
          width: {
            max: 1152,
          },
          height: {
            max: 648,
          },
          frameRate: 10,
        },
      })
    const audioStream: MediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    })
    audioStream.addTrack(screenStream.getVideoTracks()[0])
    const stream = audioStream
    this.localUser.stream = stream
    this.room.replaceStream(stream)
    this.localStreamUpdate.next(stream)
    this.localState.next({
      audio: this.localState.value.audio,
      video: true,
      screen: true,
    })
    const func = () => this.exitScreenShare()
    stream.addEventListener('inactive', func)
    this.removeScreenStreamShareEventListener = () => stream.removeEventListener('inactive', func)
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
        video: {
          width: {
            min: 320,
            max: 640,
          },
          height: {
            min: 240,
            max: 360,
          },
          frameRate: 10,
        },
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
        id: stream.peerId + '',
        // @ts-ignore
        stream,
      })
      this.usersSubject.next(this.users)
      console.log(this.users)
    })

    // 誰かが離脱
    this.room.on('peerLeave', peerId => {
      console.log(`=== ${peerId} left ===`)
      const index = this.users.findIndex(v => v.id === peerId)
      delete this.users[index]
      this.users.splice(index, 1)
      this.usersSubject.next(this.users)
    })

    // 自分が離脱
    this.room.once('close', () => {
      this.isConnected = false
    })

    // 他人からのメッセージ
    this.room.on('data', ({ data, src }) => {
      console.log(`${src}: ${data}`)
    })

    const userDoc = this.db.doc<{ [peerId in string]: string }>('config/users')
    userDoc.update({
      [this.peer.id]: this.metadata.name,
    })
    userDoc.valueChanges().subscribe(users => {
      this.peerUserList = users || {}
    })
  }
  exitRoom() {
    if (!this.room) return
    this.room.close()
    this.users = []
    this.usersSubject.next(this.users)
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
  setTable(table: number) {
    this.metadata.table = table
  }
}
