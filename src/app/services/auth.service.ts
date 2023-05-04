import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, UserCredential } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { doc, DocumentReference, setDoc } from '@firebase/firestore';
import IUser from 'src/app/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
      private auth: Auth, private fs: Firestore
  ) { }


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

  adaptError(errCode: string): string{
    switch(errCode){
      case 'auth/email-already-in-use':
        return "Email already in use.";
      default:
        return "Unknown error occurred";
    }
  }

}
