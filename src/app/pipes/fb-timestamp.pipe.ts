import { Pipe, PipeTransform } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'fbTimestamp',
})
export class FbTimestampPipe implements PipeTransform {
  constructor(private datePipe: DatePipe) {}
  transform(value: Timestamp) {
    const date = value.toDate();
    return this.datePipe.transform(date, 'mediumDate');
  }
}
