import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  CollectionReference,
  Firestore,
} from '@angular/fire/firestore';
import { IClip } from '../models/clip.model';

@Injectable({
  providedIn: 'root',
})
export class ClipService {
  clipsCollection: CollectionReference<IClip>;
  constructor(private firestore: Firestore) {
    this.clipsCollection = collection(
      this.firestore,
      '/clips'
    ) as CollectionReference<IClip>;
  }

  public createClip(data: IClip) {
    return addDoc(this.clipsCollection, data);
  }
}
