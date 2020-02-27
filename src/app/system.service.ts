import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root',
})
export class SystemService {
  userConfig = {
    name: '',
    group: '',
  }
  public screen: 'start' | 'main' | 'master' = 'start'

  constructor() {}
}
