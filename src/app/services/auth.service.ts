import { Injectable, NgZone } from '@angular/core';



import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';

import { DataService } from './data.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  userData: any; // Save logged in user data
  constructor(
    private dataservice:DataService,
    public router: Router,
    public ngZone: NgZone // NgZone service to remove outside scope warning
  ) {
  
  }
 



  
  // Sign in with email/password
  // SignIn(email: string, password: string) {
  //   
  //   return this.afAuth
  //     .signInWithEmailAndPassword(email, password)
  //     .then((result) => {
  //       if (result.user?.emailVerified) {
  //         console.log(result.user)
  //         // this.SetUserData(result.user);
  //         this.afAuth.authState.subscribe((user) => {
  //           if (user) {
  //               /* Saving user data in localstorage when 
  //   logged in and setting up null when logged out */
  //   this.afAuth.authState.subscribe((user) => {
  //     if (user) {
  //       this.userData = user;
  //       sessionStorage.setItem('user', JSON.stringify(this.userData));
  //       JSON.parse(sessionStorage.getItem('user')!);
  //     } else {
  //       sessionStorage.setItem('user', 'null');
  //       JSON.parse(sessionStorage.getItem('user')!);
  //     }
  //   });
  //             this.router.navigate(['/home']);
  //           }
  //         });
  //       } else {
  //         throw new Error('Email is not verified');
  //       }
  //     })
  //     .catch((error) => {
  //       window.alert(error.message);
  //     });
  // }

  // Sign up with email/password
obj:any={}
obj1:any={}
obj2:any={}
obj3:any={}
//   SignUp( data:any) {
//     ;
//       this.obj2["firstname"]=data.first_name
//       this.obj2["lastname"]=data.last_name
//       this.obj2["mobilenumber"]=data.phoneNumber
//       this.obj2["emailid"]=data.email
//       this.obj3["country"]=data.country
//       this.obj["usertype"]=data.user_type
//       this.obj["engineerassigntype"]=data.engineerassigntype
//       this.obj1["contact"]=this.obj2
//       this.obj["primarycontact"]=this.obj1
// this.obj2["primaryaddress"]=this.obj3
//     var email = data.email.toString().trim()
//     var pwd = data.password.toString().trim()
//     console.log(this.obj)
//     return this.afAuth.createUserWithEmailAndPassword(email, pwd)
//       .then((result:any) => {
     
//         var newUser = result.user
//        this.obj["_id"]=newUser.uid
//     console.log(this.obj)
//     this.dataservice.postData("user",this.obj).subscribe((res:any)=>{
//       let data=res.data
//       console.log(data)
//     })
//         /* Call the SendVerificaitonMail() function when new user sign
//         up and returns promise */
//         this.SendVerificationMail();
//         this.SetUserData(newUser);
//       }).catch((error) => {
//         window.alert(error.message)
//       })
//   }
  
  
  
  
  // Send email verfificaiton when new user sign up
  // SendVerificationMail() {
  //   return this.afAuth.currentUser
  //     .then((u: any) => u.sendEmailVerification())
  //     .then(() => {
  //       this.router.navigate(['verify-email-address']);
  //     });
  // }

  // Reset Forggot password
  // ForgotPassword(passwordResetEmail: string) {
  //   return this.afAuth
  //     .sendPasswordResetEmail(passwordResetEmail)
  //     .then(() => {
  //       window.alert('Password reset email sent, check your inbox.');
  //     })
  //     .catch((error) => {
  //       window.alert(error);
  //     });
  // }
  // Returns true when user is looged in and email is verified
  get isLoggedIn(): boolean {
    const user = JSON.parse(sessionStorage.getItem('user')!);
    return user !== null && user.emailVerified !== false ? true : false;
  }

 
  // Sign in with Google
  // GoogleAuth() {
  //   return this.AuthLogin(new auth.GoogleAuthProvider()).then((res: any) => {
  //     this.router.navigate(['home']);
  //   });
  // }

  // Auth logic to run auth providers
  // AuthLogin(provider: any) {
  //   return this.afAuth
  //     .signInWithPopup(provider)
  //     .then((result:any) => {
  //       this.router.navigate(['home']);
  //       this.SetUserData(result.user);
  //     })
  //     .catch((error:any) => {
  //       window.alert(error);
  //     });
  // }
  // facebookLogin(){
  //   return this.doFacebookLogin(new auth.FacebookAuthProvider()).then((res:any)=>{
  //     this.router.navigate(['home']);
  //   })
  // }
  // doFacebookLogin(provider:any){
  //   return this.afAuth
  //     .signInWithPopup(provider)
  //     .then((res:any) => {
  //       this.router.navigate(['home']);
  //       this.SetUserData(res.user);
  //     })
  //     .catch((error:any) => {
  //       window.alert(error);
  //     });
  // }
  /* Setting up user data when sign in with username/password, 
  sign up with username/password and sign in with social auth  
  provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
  // SetUserData(user: any) {
  //   const userRef: AngularFirestoreDocument<any> = this.afs.doc(
  //     `users/${user.uid}`
  //   );
  //   const userData: User = {
  //     uid: user.uid,
  //     email: user.email,
  //     displayName: user.displayName,
  //     photoURL: user.photoURL,
  //     emailVerified: user.emailVerified,
    
   
  //   };
  //   return userRef.set(userData, {
  //     merge: true,
  //   });
  // }
  // Sign out
//   SignOut() {
//     return this.afAuth.signOut().then(() => {
//       sessionStorage.removeItem('user');
//       this.router.navigate(['login']);
//     });
//   }
// }
}