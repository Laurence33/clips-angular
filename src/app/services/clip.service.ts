import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  CollectionReference,
  deleteDoc,
  doc,
  docData,
  Firestore,
  getDoc,
  limit,
  orderBy,
  query,
  startAt,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { IClip } from '../models/clip.model';
import { Auth } from '@angular/fire/auth';
import { getAuth } from '@firebase/auth';
import { firstValueFrom, Observable, of, switchMap } from 'rxjs';
import { deleteObject, getStorage, ref, Storage } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root',
})
export class ClipService {
  clipsCollection: CollectionReference<IClip>;
  pageClips: IClip[] = [];
  pendingRequest = false;

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

  async getClips() {
    if (this.pendingRequest) return;

    this.pendingRequest = true;

    const { length } = this.pageClips;
    const addToQry = [];

    if (length) {
      const lastDocId = this.pageClips[length - 1].id;
      const lastDocRef = doc(this.firestore, 'clips/' + lastDocId);
      const lastDoc = await firstValueFrom(
        docData(lastDocRef, { idField: 'id' })
      );
      addToQry.push(startAt(lastDoc));
    }
    const qry = query(
      this.clipsCollection,
      orderBy('timestamp', 'desc'),
      limit(6),
      ...addToQry
    );
    const result = await firstValueFrom(collectionData(qry, { idField: 'id' }));
    this.pageClips = [...this.pageClips, ...result];

    this.pendingRequest = false;
    return result;
    //1. bind() if necessary
    //2. call()
  }
}
