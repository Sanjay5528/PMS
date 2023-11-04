import { Component, Input } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DataService } from 'src/app/services/data.service';
import { DialogService } from '../../../services/dialog.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ActivatedRoute, ParamMap,Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  forgetPassword: FormGroup;
  hide: boolean = true;
  @Input('frmLogin') frmLogin: any
  user:any

  constructor(private dataService: DataService,
    private jwtService:JwtHelperService,
    private dialogService: DialogService,
    private route: Router,private formBuilder: FormBuilder) {
    this.forgetPassword = this.formBuilder.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required]],

      confirmPassword: ['',[ Validators.required]],
    }, {
      validators: this.passwordMatchValidator // Add custom validator here
    });
 
    const jwtToken = localStorage.getItem('token') || '';
    this.user = this.jwtService.decodeToken(jwtToken);
  
  }


  // Custom validator function
  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (newPassword?.value !== confirmPassword?.value) {
     
     return { 'passwordMismatch': true };
    }

    return null;
  }
 
  
  resetPassword() {
    debugger
    let data = {
      id: this.user.id,
      old_pwd: this.forgetPassword.value.oldPassword,
      new_pwd: this.forgetPassword.value.newPassword
    }
    this.dataService.resetPwd(data).subscribe((res: any) => {
      if (res.success === 1) {
        this.dialogService.openSnackBar(res, "OK")
        this.dialogService.closeModal()
       
        return
       
      } else {
        alert(res)
      }
    })
  }
  
       



  

 back(){
  this.route.navigate([`/home`]);
 }



}

 

