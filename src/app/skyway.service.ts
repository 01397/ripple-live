import { Injectable } from '@angular/core'
import { BehaviorSubject, of, Subject } from 'rxjs'
import Peer, { SfuRoom } from 'skyway-js'
import { AngularFireDatabase } from '@angular/fire/database'
import { SystemService } from './system.service'

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
  public roomId: string = 'test'
  private localUser?: User
  private users: User[] = []
  public usersSubject = new BehaviorSubject<User[]>([])
  public localState = new BehaviorSubject<LocalMediaState>({ audio: true, video: true, screen: false })
  public isConnected = false
  public localStreamUpdate = new Subject<MediaStream>()
  public focusUpdate = new Subject<MediaStream>()
  private removeScreenStreamShareEventListener: (() => void) | null = null
  public peerUserList: { [key in string]: string } = {}
  public audioDevice: string | null = null
  public videoDevice: string | null = null

  constructor(private rdb: AngularFireDatabase, private system: SystemService) {
    this.peer = new Peer({
      key: '7ac5f2e0-8604-4beb-83c5-12166e74d90a',
      debug: 0,
      turn: true,
    })
    this.localState.subscribe(state => {
      console.log(state)
      // ログイン時などストリームがない状態
      if (!this.localUser) {
        return
      }
      const vt = this.localUser.stream.getVideoTracks()
      if (vt[0]) vt[0].enabled = state.video
      const at = this.localUser.stream.getAudioTracks()
      if (at[0]) at[0].enabled = state.audio
    })
  }

  setLocalStream(stream: MediaStream) {
    this.localUser = {
      id: 'local',
      stream,
    }
  }

  getLocalUser() {
    return this.localUser
  }

  getMediaStream(type: 'audioOnly' | 'webCam' | 'screen'): Promise<MediaStream> {
    switch (type) {
      case 'screen':
        return (
          navigator.mediaDevices
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
        )
      case 'audioOnly':
        if (this.audioDevice !== null) {
          return navigator.mediaDevices.getUserMedia({
            audio: {
              deviceId: this.audioDevice,
            },
            video: false,
          })
        }
        return navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        })
      case 'webCam':
        return navigator.mediaDevices.getUserMedia({
          audio:
            this.audioDevice !== null
              ? {
                  deviceId: this.audioDevice,
                }
              : true,
          video: {
            deviceId: this.videoDevice !== null ? this.videoDevice : undefined,
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
    }
  }

  toggleScreenShare() {
    if (this.localState.value.screen) {
      this.exitScreenShare()
    } else {
      this.enterScreenShare()
    }
  }

  async enterScreenShare() {
    if (!this.localUser || !this.room) {
      this.system.openSnack('画面共有は利用できません。 (s118)')
      return
    }
    try {
      const screenStream: MediaStream = await this.getMediaStream('screen')
      const audioStream: MediaStream = await this.getMediaStream('audioOnly')
      audioStream.addTrack(screenStream.getVideoTracks()[0])
      const stream = audioStream
      const currentStream = this.localUser.stream
      currentStream.getTracks().forEach(track => track.stop())
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
      stream.getVideoTracks()[0].addEventListener('ended', func)
      this.removeScreenStreamShareEventListener = () => {
        stream.removeEventListener('inactive', func)
        stream.getVideoTracks()[0].removeEventListener('ended', func)
      }
    } catch (error) {
      console.error(error)
      this.system.openSnack('画面共有は利用できません。')
    }
  }
  async exitScreenShare() {
    console.log('stop caputuring screen')
    if (!this.room || !this.localUser) {
      console.error('no room or no user')
      this.system.openSnack('映像を切り替えることができません (s152)')
      return
    }
    try {
      const stream = await this.getMediaStream('webCam')
      const screenStream = this.localUser.stream
      screenStream.getTracks().forEach(track => track.stop())
      if (this.removeScreenStreamShareEventListener) {
        this.removeScreenStreamShareEventListener()
        this.removeScreenStreamShareEventListener = null
      }
      this.localUser.stream = stream
      this.room.replaceStream(stream)
      this.localStreamUpdate.next(stream)
      this.localState.next({ audio: this.localState.value.audio, video: true, screen: false })
    } catch (error) {
      console.error('no webcam?')
      this.system.openSnack('Webカメラへの切り替えに問題があります (s169)')
    }
  }

  async join(roomId: string) {
    this.roomId = roomId
    console.log(roomId)
    try {
      const localStream = await this.getMediaStream('webCam')
      this.setLocalStream(localStream)
    } catch (e) {
      // カメラなしデバイスなど。
      this.system.openSnack('カメラやマイクは利用できません。')
      console.error(e)
      /*const cvs = document.createElement('canvas')
      cvs.width = 16
      cvs.height = 9
      const ctx = cvs.getContext('2d')
      if (!ctx) return
      ctx.fillStyle = "#ffaa00"
      ctx.fillRect(0, 0, 16, 9)*/
      const stream = new MediaStream()
      this.localUser = {
        id: 'local',
        stream,
      }
    }

    if (!this.peer || !this.peer.open || !this.localUser) {
      console.error('no connection?')
      this.system.openSnack('映像配信の接続に問題があります (s181)')
      return
    }
    this.rdb.database.ref(`rooms/${this.system.currentGroup}/${this.peer.id}`).set(this.system.currentName)

    this.room = this.peer.joinRoom(this.roomId, {
      mode: this.ROOM_MODE,
      stream: this.localUser.stream,
    }) as SfuRoom

    if (!this.room) {
      console.error('no room')
      this.system.openSnack('テーブルへ参加できませんでした (s193)')
      return
    }

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

    const userDoc = this.rdb.object<{ [key in string]: string }>('users')
    userDoc.update({
      [this.peer.id]: this.system.currentName,
    })
    userDoc.valueChanges().subscribe(users => {
      this.peerUserList = users || {}
    })
    this.rdb.database
      .ref('users/' + this.peer.id)
      .onDisconnect()
      .remove()
    this.rdb.database
      .ref(`rooms/${this.system.currentGroup}/${this.peer.id}`)
      .onDisconnect()
      .remove()
  }
  exitRoom() {
    if (!this.room) {
      console.error('"room" is null')
      this.system.openSnack('参加しているテーブルがありません (s259)')
    } else {
      this.room.close()
    }
    this.users = []
    this.usersSubject.next(this.users)
    if (!this.peer) {
      console.error('"peer" is null')
      this.system.openSnack('接続がありません (s267)')
    } else {
      this.rdb.database.ref(`rooms/${this.system.currentGroup}/${this.peer.id}`).remove()
    }
  }

  sendMessage(message: string) {
    if (this.room === null || this.peer === null) {
      console.error('unable to send message')
      this.system.openSnack('接続がありません (s276)')
      return
    }
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
    this.system.currentName = name
  }
  setClass(cl: number) {
    this.system.currentClass = cl
  }
  setTable(table: number) {
    this.system.currentTable = table
  }
}
