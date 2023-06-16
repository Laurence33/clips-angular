import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  CollectionReference,
  doc,
  Firestore,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { IClip } from '../models/clip.model';
import { Auth } from '@angular/fire/auth';
import { getAuth } from '@firebase/auth';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ClipService {
  clipsCollection: CollectionReference<IClip>;

  constructor(private firestore: Firestore, private auth: Auth) {
    this.clipsCollection = collection(
      this.firestore,
      '/clips'
    ) as CollectionReference<IClip>;
    this.auth = getAuth();
  }

  public createClip(data: IClip) {
    return addDoc(this.clipsCollection, data);
  }

  public getUserClips() {
    const user = this.auth.currentUser;
    if (user) {
      const qry = query(
        this.clipsCollection,
        where('uid', '==', this.auth.currentUser!.uid)
      );
      return collectionData(qry, { idField: 'id' });
    }
    return of([]) as Observable<IClip[]>;
  }

  public updateClip(clipId: string, title: string) {
    const docRef = doc(this.firestore, 'clips/' + clipId);
    return updateDoc(docRef, { title: title });
  }
}
