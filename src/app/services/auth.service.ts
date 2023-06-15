import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  UserCredential,
  authState,
  signInWithEmailAndPassword,
  signOut,
  fetchSignInMethodsForEmail,
  updateProfile,
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  DocumentReference,
  setDoc,
} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { delay, map, filter, switchMap } from 'rxjs/operators';
import IUser from 'src/app/models/user.model';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public isAuthenticated$: Observable<boolean>;
  public isAuthenticatedWithDelay$: Observable<boolean>;
  public redirect = false;

  constructor(
    private auth: Auth,
    private fs: Firestore,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // this.auth = getAuth();
    this.isAuthenticated$ = authState(this.auth).pipe(map((user) => !!user));
    this.isAuthenticatedWithDelay$ = this.isAuthenticated$.pipe(delay(1000));
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        map((e) => this.route.firstChild),
        switchMap((route) => route?.data ?? of({ authOnly: false }))
      )
      .subscribe((data) => {
        this.redirect = data['authOnly'] ?? false;
      });
  }

  async register(values: IUser) {
    try {
      let userCred: UserCredential;
      userCred = await createUserWithEmailAndPassword(
        this.auth,
        values.email!,
        values.password!
      );
      console.log(userCred);

      // Remove the password before saving to Firestore
      if (values.password) delete values.password;
      console.log('Deleted password', values);

      const userDocRef = doc(
        this.fs,
        `users/${userCred.user.uid}`
      ) as DocumentReference<IUser>;
      await setDoc(userDocRef, values);
      // we cannot update User properties now using userCred.user.updateProfile();
      await updateProfile(this.auth.currentUser!, {
        displayName: values.name,
        // photoURL: 'https://example.com/jane-q-user/profile.jpg',
      });
    } catch (err: any) {
      console.log('Error on auth service', err);
      throw this.adaptError(err.code);
    }
  }

  async login(email: string, password: string) {
    try {
      const userCred = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
    } catch (ex: any) {
      console.log('Error on auth service:', ex);
      throw this.adaptError(ex.code);
    }
  }
  async logout(event?: Event) {
    if (event) event.preventDefault();

    await signOut(this.auth);

    if (this.redirect) await this.router.navigateByUrl('/');
  }

  async emailExists(email: string) {
    try {
      const res = await fetchSignInMethodsForEmail(this.auth, email);
      console.log('fetch Sign in methods result:', res);
      if (res.length) {
        return true;
      }
    } catch (ex: any) {
      throw this.adaptError(ex.code);
    }
    return false;
  }

  adaptError(errCode: string): string {
    switch (errCode) {
      case 'auth/email-already-in-use':
        return 'Email already in use.';
      case 'auth/user-not-found':
        return 'Email or password incorrect';
      case 'auth/wrong-password':
        return 'Email or password incorrect';
      case 'auth/network-request-failed':
        return 'Please check your internet connection';
      default:
        return 'Unknown error occurred';
    }
  }
}
