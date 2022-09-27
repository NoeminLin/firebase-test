import { AfterContentInit, AfterViewInit, Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import { AuthService, DatabasePath } from '../shared/services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit, AfterViewInit {
  email: string;
  password: string;
  errorMessage: string;
  phone: string;

  // 手機驗證
  appVerifier: firebase.auth.RecaptchaVerifier;
  confirmationResult: firebase.auth.ConfirmationResult;
  codeSent = false;
  canCodeSend = true;
  coldDownTime = 30;

  constructor(
    public auth: AngularFireAuth,
    private afs: AngularFirestore,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    console.log('ngOnInit');
    this.authService.user$.subscribe(async (user) => {
      try {
        if (user) {
          const userDoc = await this.afs.doc(`${DatabasePath.Users}/${user.uid}`).ref.get();
          console.log('userDoc =>', userDoc.data());
        }
      } catch (e) {
        this.authService.logout();
      }
    });

  }

  ngAfterViewInit() {
    console.log('ngAfterViewInit');

    this.appVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', { 'size': 'invisible' });
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

  createEmail(email: string, password: string) {
    this.authService.createEmail(email, password).catch(err => {
      console.log('login error: ' + err);
      this.errorMessage = err;
    });
  }

  loginEmail(email: string, password: string) {
    this.authService.loginEmail(email, password).then(result => {
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


  // 先寫在component裡面，再搬到service

  loginPhone(phone: string) {
    if (/^09\d{8}$/.test(phone) !== true) {
      alert('請確認手機格式');
      return;
    }
    const phoneNumber = '+886' + phone.substring(1);
    console.log('phoneNumber =>', phoneNumber);
    firebase.auth().signInWithPhoneNumber(phoneNumber, this.appVerifier)
      .then(confirmationResult => {
        this.codeSent = true;
        this.confirmationResult = confirmationResult;
        console.log('this.confirmationResult =>', this.confirmationResult)
        alert('簡訊驗證碼已發送，請查看簡訊並輸入驗證碼');
        this.appVerifier.clear();
        console.log('signInWithPhoneNumber sucess:')
      }).catch(err => {
        this.codeSent = false;
        this.canCodeSend = true;
        console.error(err);
        alert('簡訊驗證碼發送失敗，請重試。');
      });

  }



  async sendVerifiedCode(code) {
    try {
      console.log('this.confirmationResult', this.confirmationResult);
      // const confirmationResult = await this.confirmationResult.confirm(code);
      // console.log('confirmationResult', confirmationResult);
      // if (!confirmationResult) {
      //   console.log('驗證失敗')
      // }
    } catch (e) {
      console.log('e', e)
    }

    // if (!confirmationResult) {
    //   alert('驗證碼錯誤，請重新輸入');
    //   return false;
    // }
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
