import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import Peer, { SfuRoom } from 'skyway-js'

interface User {
  id: string
  stream: MediaStream
}
export interface LocalMediaState {
  audio: boolean
  video: boolean
}

@Injectable({
  providedIn: 'root',
})
export class SkywayService {
  peer: Peer | null = null
  room: SfuRoom | null = null
  roomId: string = 'test'
  ROOM_MODE: 'sfu' | 'mesh' = 'sfu'
  users: { [key in string]: User } = {}
  localState = new BehaviorSubject<LocalMediaState>({ audio: true, video: true })
  isConnected = false

  constructor() {
    this.peer = new Peer({
      key: '9fa5a062-8447-46df-b6aa-86752eec9bd0',
      debug: 3,
      turn: true,
    })
    this.localState.subscribe(state => {
      console.log(state)
      if (!this.users.local) return
      this.users.local.stream.getVideoTracks()[0].enabled = state.video
      this.users.local.stream.getAudioTracks()[0].enabled = state.audio
    })
  }

  setLocalStream(stream: MediaStream) {
    this.users.local = {
      id: 'local',
      stream,
    }
  }

  async join(roomId: string) {
    const localStream = await navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: true,
      })
      .catch(console.error)
    if (!localStream) return
    this.setLocalStream(localStream)

    if (!this.peer || !this.peer.open || !this.users.local.stream) {
      return
    }

    this.room = this.peer.joinRoom(this.roomId, {
      mode: this.ROOM_MODE,
      stream: this.users.local.stream,
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
      this.users[stream.peerId] = {
        peerId: stream.peerId + '',
        // @ts-ignore
        stream,
      }
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
      delete this.users[peerId]
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
}
