import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  CollectionReference,
  deleteDoc,
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
import { deleteObject, getStorage, ref, Storage } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root',
})
export class ClipService {
  clipsCollection: CollectionReference<IClip>;

  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private storage: Storage
  ) {
    this.clipsCollection = collection(
      this.firestore,
      '/clips'
    ) as CollectionReference<IClip>;
    this.auth = getAuth();
    this.storage = getStorage();
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

  async deleteClip(clip: IClip): Promise<boolean> {
    try {
      // Create a reference to the file to delete
      const desertRef = ref(this.storage, 'clips/' + clip.filename);
      // Delete the file
      await deleteObject(desertRef);
      // Firestore document reference
      const docRef = doc(this.firestore, 'clips/' + clip.id);
      // Delete firestore document
      await deleteDoc(docRef);
      return true;
    } catch (e) {
      return false;
    }
  }
}
