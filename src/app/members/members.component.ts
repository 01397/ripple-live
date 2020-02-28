import { Component, OnInit } from '@angular/core'
import { SystemService } from '../system.service'
import { AngularFireDatabase } from '@angular/fire/database'

interface RoomData {
  room: string
  member: string[]
}
type MemberData = RoomData[]

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss'],
})
export class MembersComponent implements OnInit {
  public memberData:MemberData = []
  constructor(private rdb: AngularFireDatabase, private system: SystemService) {}

  ngOnInit() {
    this.rdb
      .object<{ [room in string]: { [peerId in string]: string } }>('rooms')
      .valueChanges()
      .subscribe(rooms => {
        const result: MemberData = []
        for (const key in rooms) {
          if (!rooms.hasOwnProperty(key)) continue
          const members = Object.values(rooms[key])
          const cl = key.split('-')[0].slice(1)
          const tb = Number(key.split('-')[1].slice(1))
          result.push({
            room: `${cl}時間目 ${this.system.tableNames[tb]}テーブル`,
            member: members,
          })
        }
        this.memberData = result
      })
  }
}
