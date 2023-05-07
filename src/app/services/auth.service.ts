import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, UserCredential, authState, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { } from '@firebase/auth';
import { doc, DocumentReference, setDoc } from '@firebase/firestore';
import { Observable } from 'rxjs';
import {delay, map} from 'rxjs/operators';
import IUser from 'src/app/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public isAuthenticated$: Observable<boolean>;
  public isAuthenticatedWithDelay$: Observable<boolean>;

  constructor(
      private auth: Auth, private fs: Firestore
  ) {
   // this.auth = getAuth();
    this.isAuthenticated$ = authState(this.auth).pipe(map(user => !!user));
    this.isAuthenticatedWithDelay$ = this.isAuthenticated$.pipe(
      delay(1000)
    );
  }


  async register(values: IUser) {
    try{
      let userCred: UserCredential;
      userCred = await createUserWithEmailAndPassword(this.auth, values.email!, values.password!);
      console.log(userCred);

      // Remove the password before saving to Firestore
      if(values.password)
        delete values.password;
      console.log('Deleted password', values);

      const userDocRef = doc(this.fs, `users/${userCred.user.uid}`) as DocumentReference<IUser>;
      await setDoc(userDocRef, values);
      // we cannot update User properties now using userCred.user.updateProfile();
    }catch(err: any){
      console.log('Error on auth service',err);
      throw this.adaptError(err.code);

    }
  }

  async login(email: string, password: string) {
    try{
      const userCred = await signInWithEmailAndPassword(this.auth, email, password);
    }catch(ex: any){
      console.log('Error on auth service:', ex);
     throw this.adaptError(ex.code);
    }
  }

  async logout() {
    return signOut(this.auth);
  }

  adaptError(errCode: string): string{
    switch(errCode){
      case 'auth/email-already-in-use':
        return "Email already in use.";
      case 'auth/user-not-found':
        return 'Email or password incorrect';
      case 'auth/wrong-password':
        return 'Email or password incorrect';
      case 'auth/network-request-failed':
        return 'Please check your internet connection';
      default:
        return "Unknown error occurred";
    }
  }

}
