import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { DialogService } from 'src/app/services/dialog.service';
import { environment } from 'src/environments/environment';
import { HelperService } from 'src/app/services/helper.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  frmLogin!: FormGroup
  user_data: any
  hide: boolean = true;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private dataService: DataService,
    private jwtService:JwtHelperService,
    private helpService:HelperService,
    private dialogService:DialogService
  ) {

  }
  ngOnInit(): void {
    
    sessionStorage.setItem('selectedOrgId', environment.OrgId)
    this.frmLogin = this.formBuilder.group({
      id: new FormControl('sanjay123sanjay12@gmial.com',Validators.required),
      password: new FormControl('Sanjay#321',Validators.required)
    });
  }

  login() {
    let user_data = this.frmLogin.value
    this.dataService.login(user_data).subscribe((res: any) => {
      if (res) {
        this.user_data = this.jwtService.decodeToken(res.data.LoginResponse.token)
        sessionStorage.setItem('selectedOrgId', environment?.OrgId)
        sessionStorage.setItem('token', res.data.LoginResponse.token);
        sessionStorage.setItem('auth', JSON.stringify(res));
        this.dialogService.openSnackBar(res.data.Message  ,"OK");
        let employee_id:any = this.helpService.getEmp_id();
        this.router.navigate(['/Dashboard',"User",employee_id]);
    }
  })
  }


 


}
