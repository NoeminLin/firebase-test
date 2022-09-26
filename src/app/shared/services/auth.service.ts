import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import firebase from 'firebase/compat/app';
import { Router } from '@angular/router';

export enum DatabasePath {
  Users = 'users',
}

export interface User {
  uid?: string;
  email?: string;
  password?: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  disabled?: boolean;
  loginAt?: Date;
  logoutAt?: Date;
  providerData?: any[];
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User>;
  uid: string;
  email: string;
  displayName: string;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    public auth: AngularFireAuth,
    public router: Router,
  ) {
    this.user$ = this.afAuth.user;
    this.user$.subscribe(async user => {
      if(user) {
        const userDoc = await this.afs.doc(`${DatabasePath.Users}/${user.uid}`).ref.get();

        this.uid = user.uid;
        this.displayName = user.displayName;
        this.email = user.email || userDoc.get('email');

        if(user.providerData.length !== 0) {
          const providerData = user.providerData.map(obj => Object.assign({}, obj));
          this.afs.doc(`${DatabasePath.Users}/${this.uid}`)
          .set({loginAt: new Date(), providerData: providerData}, {merge: true})
        } else {
          this.afs.doc(`${DatabasePath.Users}/${this.uid}`).set({ loginAt: new Date() }, { merge: true });
        }

      }
    })
  }

  private updateUserData({ uid, email, displayName, photoURL, providerData }: firebase.User) {
    const userRef = this.afs.doc(`${DatabasePath.Users}/${uid}`);
    const data = {
      displayName,
      photoURL,
      email,
      providerData: providerData.map(obj => Object.assign({}, obj)),
      loginAt: new Date()
    };
    return userRef.set(data, { merge: true });
    // return userRef.update(data);
    // 這邊要在想一下creatAt()的邏輯
  }



  loginGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/userinfo.email');
    provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
    return this.auth.signInWithPopup(provider).then((result) => {
      console.log('google login success:', result);
      return this.updateUserData(result.user);
    });
  }

  loginFacebook() {
    const provider = new firebase.auth.FacebookAuthProvider();
    provider.addScope('public_profile');
    provider.addScope('email');
    return this.afAuth.signInWithPopup(provider)
      .then(result => {
        console.log('facebook login success:', result);
        return this.updateUserData(result.user);
      });
  }


  loginPassword(email: string, password: string): Promise<any> {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }







  logout(): Promise<boolean> {
    return this.afs
      .doc(`${DatabasePath.Users}/${this.uid}`)
      .set({ logoutAt: new Date() }, { merge: true })
      .then(() => this.auth.signOut())
      .then(() => this.router.navigate(['/']));
  }




}
