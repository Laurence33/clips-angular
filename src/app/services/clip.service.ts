import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  CollectionReference,
  deleteDoc,
  doc,
  Firestore,
  orderBy,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { IClip } from '../models/clip.model';
import { Auth } from '@angular/fire/auth';
import { getAuth } from '@firebase/auth';
import { Observable, of, switchMap } from 'rxjs';
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

  public getUserClips(sort$: Observable<string>) {
    const user = this.auth.currentUser;
    if (user) {
      return sort$.pipe(
        switchMap((sort) => {
          const qry = query(
            this.clipsCollection,
            where('uid', '==', this.auth.currentUser!.uid),
            orderBy('timestamp', sort === '1' ? 'desc' : 'asc')
          );
          return collectionData(qry, { idField: 'id' });
        })
      );
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
      const videoRef = ref(this.storage, 'clips/' + clip.filename);
      // Delete the file
      await deleteObject(videoRef);
      // Create a reference to the file to delete
      const screenshotRef = ref(
        this.storage,
        'screenshots/' + clip.screenshotFilename
      );
      // Delete the file
      await deleteObject(screenshotRef);
      // Firestore document reference
      const docRef = doc(this.firestore, 'clips/' + clip.id);
      // Delete firestore document
      await deleteDoc(docRef);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
