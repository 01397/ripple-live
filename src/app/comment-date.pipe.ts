import { Pipe, PipeTransform } from '@angular/core';
import { firestore } from 'firebase';

@Pipe({
  name: 'commentDate',
})
export class CommentDatePipe implements PipeTransform {
  transform(timestamp: firestore.Timestamp): string {
    const date = timestamp.toDate()
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
