import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DataService } from 'src/app/services/data.service';
import { DialogService } from '../../../services/dialog.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  
  hide: boolean = true;
  @Input('frmLogin') frmLogin: any

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private route:ActivatedRoute,
    private helperServices:HelperService,
    private router:Router
  ) {

  }
  
// password

forgetPassword = this.formBuilder.group({
  password: new FormControl(null, Validators.required),
  confirm_password: new FormControl(null, Validators.required),
  // otp: new FormControl(null, Validators.required)
});

  // forgetPassword = this.formBuilder.group({
  //   newPassword: new FormControl(null, Validators.required),
  //   confirmPassword: new FormControl(null, Validators.required),
  //   // otp: new FormControl(null, Validators.required)
  // });
flag:boolean=false;
response:any
data:any
accesskey:any
  ngOnInit() {
    this.route.queryParams.subscribe((params:any) => {
      console.log(params.accesskey);
      let data :any=params.accesskey
     this.accesskey=params.accesskey
      this.dataService.verify_key(data).subscribe((xyz:any)=>{
        console.log(xyz);
        if(xyz.data==null){
          this.data="Your Activation Key is Expired"
        }else{
          this.response=xyz.data[0]._id
          this.flag=true;
        }
      })
    });
  

  }



  forgotPassword() {
    
    if(!this.forgetPassword.valid){
      
      function collectInvalidLabels(controls:any,invalidLabels='') {
        for (const key in controls) {
            if (controls.hasOwnProperty(key)) {
                const control = controls[key];
        
                 if (control instanceof FormControl && control?.status === 'INVALID') {
                    invalidLabels +=key.toUpperCase().replaceAll("_",' ') + ",";
                    
                    
                
            }
        }
        console.log(invalidLabels);
        
      }
      var n =invalidLabels.lastIndexOf(",")
      var value=invalidLabels.substring(0,n)
      return value;
    
      // this.helperServices.getDataValidatoion(this.forgetPassword.controls)
    }
    const label:any= collectInvalidLabels(this.forgetPassword.controls)
    console.log(label);
    
    this.dialogService.openSnackBar(label,"ok")
    return
  }
    let user_data = this.forgetPassword.value
    // console.log();
    console.log(user_data);
    
    this.dataService.generate_pwd(this.accesskey,user_data).subscribe((res: any) => {
      if (res.status === 200) {
        this.dialogService.openSnackBar("Successfully Activated", "OK")
        this.router.navigateByUrl('login')
        // resolve(res)
        // this.dialogService.closeModal()
        return
      } else {
        this.dialogService.openSnackBar("Error in Sending Data", "OK")
        // alert(res.data)
      }


    })

  }
}

