import { Timestamp } from '@angular/fire/firestore';

export interface IClip {
  id?: string;
  uid: string;
  displayName: string;
  title: string;
  filename: string;
  fileURL: string;
  timestamp: Timestamp;
  screenshotURL: string;
}
