import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'commentDate',
})
export class CommentDatePipe implements PipeTransform {
  transform(timestamp: number): string {
    const date = new Date(timestamp)
    return (
      date
        .getHours()
        .toString()
        .padStart(2, '0') +
      ':' +
      date
        .getMinutes()
        .toString()
        .padStart(2, '0')
    )
  }
}
