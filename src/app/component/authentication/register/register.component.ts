import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { DialogService } from 'src/app/services/dialog.service';


export function ConfirmPasswordValidator(controlName: string, matchingControlName: string) {
  return (formGroup: FormGroup) => {
    let control = formGroup.controls[controlName];
    let matchingControl = formGroup.controls[matchingControlName]
    if (
      matchingControl.errors &&
      !matchingControl.errors['confirmPasswordValidator']
    ) {
      return;
    }
    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ confirmPasswordValidator: true });
    } else {
      matchingControl.setErrors(null);
    }
  };
}
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  frmRegister!: FormGroup;
  user_data: any;
  hide_password: boolean = true;
  hide_cpassword: boolean = true;
  callingCode: string = "+91"; // Default calling code for the selected country (e.g., "+44" for Great Britain)
  showEngineerAssignType: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private dataService: DataService,
    public jwtService: JwtHelperService,
    private dialogService: DialogService,
    public authService: AuthService
  ) {}
countries:any
roles:any
  ngOnInit(): void {
    this.frmRegister = this.formBuilder.group({
      firstname: new FormControl(null, [Validators.required, Validators.pattern('^[a-zA-Z]+$')]),
      lastname: new FormControl(null, [Validators.required, Validators.pattern('^[a-zA-Z]+$')]),
     
      emailid: new FormControl(null, [Validators.required, Validators.email]),
      mobilenumber: new FormControl(null, [Validators.required, Validators.pattern("[6789][0-9]{9}")]),
      password: new FormControl(null, Validators.compose([Validators.required,Validators.pattern(/^(?=\D*\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z]).{8,30}$/)])),
      confirmpassword:new FormControl(null, Validators.compose([
        Validators.required])),
      country:new FormControl(null,Validators.required),
    },{ validator: ConfirmPasswordValidator('password', 'confirmpassword') });
  


    this.dataService.getDataByFilter("country",{}).subscribe((res:any)=>{
      this.countries=res.data[0].response
      console.log(this.countries)
    })

  }

  register() {
    
    if (!this.frmRegister.valid) {
      this.dialogService.openSnackBar("Error in your data or missing mandatory fields", "OK");
      return;
    }
    //concat the calling code and mobile number
    let data:any={}
    let data1:any={}
    
    data1['firstname']='Admin'
    data1['lastname']='Admin'
    data1['emailid']='Admin'
    data1['mobilenumber']='Admin'
    data['password']='Admin'
    data['contact']='Admin'
    
  }


 
  onCountryChange(country: any) {
    this.callingCode = country.callingcode;
  }

}
