import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { FirestoreComponent } from './firestore/firestore.component';
import { AngularFireModule } from '@angular/fire/compat';
import { AuthComponent } from './auth/auth.component';
import { SETTINGS as AUTH_SETTINGS } from '@angular/fire/compat/auth';
// import { USE_DEVICE_LANGUAGE } from '@angular/fire/compat/auth';
// import { LANGUAGE_CODE } from '@angular/fire/compat/auth';
// import { TENANT_ID } from '@angular/fire/compat/auth';

@NgModule({
  declarations: [
    AppComponent,
    FirestoreComponent,
    AuthComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
  ],
  providers: [
    // { provide: AUTH_SETTINGS, useValue: { appVerificationDisabledForTesting: false } },
    // { provide: USE_DEVICE_LANGUAGE, useValue: true },
    // { provide: LANGUAGE_CODE, useValue: 'fr' },
    // { provide: TENANT_ID, useValue: 'tenant-id-app-one' },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
