import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import { AuthService, DatabasePath } from '../shared/services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  email: string;
  password: string;
  errorMessage: string;
  phone: string;

  // 手機驗證
  recaptchaVerifier: firebase.auth.RecaptchaVerifier;
  confirmationResult: firebase.auth.ConfirmationResult;
  coldDownTime = 30;
  verify: string;
  codeSent = false;

  constructor(
    public auth: AngularFireAuth,
    private afs: AngularFirestore,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authService.user$.subscribe(async (user) => {
      try {
        if (user) {
          const userDoc = await this.afs.doc(`${DatabasePath.Users}/${user.uid}`).ref.get();
          console.log('userDoc =>', userDoc);
        }
      } catch (e) {
        this.authService.logout();
      }
    });

    this.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', { 'size': 'invisible' });

  }

  loginGoogle() {
    // AngularFire 官方文件 -- 透過彈窗來登入
    // this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    this.authService.loginGoogle().catch(err => {
      console.error(err);
      this.errorMessage = err;
    });
  }



  creatUserWithEmail(email: string, password: string) {
    // Firebase Auth 官方文件 -- 使用帳號密碼新增使用者
    this.auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Signed in
        var user = userCredential.user;
        // ...
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        // ..
      });
  }


  // loginEmail(email: string, password: string) {
  //   // Firebase Auth 官方文件 -- 使用帳號密碼登入
  //   this.auth.signInWithEmailAndPassword(email, password)
  //     .then((userCredential) => {
  //       // Signed in
  //       var user = userCredential.user;
  //       // ...
  //     })
  //     .catch((error) => {
  //       var errorCode = error.code;
  //       var errorMessage = error.message;
  //     });
  // }

  loginFackbook() {
    // this.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider());
    this.authService.loginFacebook().catch(err => {
      console.log('login error: ' + err);
      this.errorMessage = err;
    });
  }

  loginPassword(email: string, password: string) {
    this.authService.loginPassword(email, password).then(result => {
      // sucess
    }).catch(err => {
      console.log('login error: ' + err);
      switch (err.code) {
        case 'auth/invalid-email':
          this.errorMessage = '無效email';
          break;

        case 'auth/user-disabled':
          this.errorMessage = '此帳號已停用';
          break;

        case 'auth/user-not-found':
          this.errorMessage = '無此帳號';
          break;

        case 'auth/wrong-password':
          this.errorMessage = '密碼錯誤';
          break;

        default:
          return null;
      }
    })
  }



  loginPhone(phone) {
    if (/^09\d{8}$/.test(phone) !== true) {
      alert('請確認手機格式');
      return;
    }
    if (!confirm(`是否驗證 ${phone} 此手機號碼？`)) {
      return null;
    }
    const phoneNumber = '+886' + phone.substring(1);
    firebase
      .auth()
      .signInWithPhoneNumber(phoneNumber, this.recaptchaVerifier)
      .then((confirmationResult) => {
        // this.verify = confirmationResult.verificationId;
        // console.log('發送成功 result =>' + confirmationResult)
        // this.otpIsCorrect = false;
        this.codeSent = true;
        this.confirmationResult = confirmationResult;
        alert('簡訊驗證碼已發送，請查看簡訊並輸入驗證碼');
        this.recaptchaVerifier.clear();
      }).catch((error) => {
        alert(error.message);
      });
  }



  logout() {
    this.auth.signOut();

    // 官方文件
    // firebase.auth().signOut().then(() => {
    //   // Sign-out successful.
    // }).catch((error) => {
    //   // An error happened.
    // });
  }

}
