import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { DialogService } from 'src/app/services/dialog.service';
import { id } from '@swimlane/ngx-charts';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { Environment } from 'ag-grid-community';
import { HelperService } from 'src/app/services/helper.service';
import { environment } from 'src/environments/environment';



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  frmLogin!: FormGroup
  user_data: any
  hide: boolean = true;
  constructor(
    private helper: HelperService,
    private formBuilder: FormBuilder,
    private router: Router,
    private dataService: DataService,
    public jwtService: JwtHelperService,
    // public env: Environment
  ) {

  }
  ngOnInit(): void {
    localStorage.setItem('selectedOrgId', environment.OrgId)
    this.frmLogin = this.formBuilder.group({
      Id: new FormControl(null, Validators.required),
      Password: new FormControl(null, Validators.required),
    });

  }

  login() {
    let user_data = this.frmLogin.value
    // localStorage.setItem('selectedOrgId', this.helper.getSubDomainName());
    this.dataService.loginUser(user_data).subscribe((res: any) => {
      if (res) {
        // this.user_data = this.jwtService.decodeToken(res['data'].token)
        // console.log(this.user_data)
        localStorage.setItem('token', res.token);
        // sessionStorage.setItem("user_id", this.user_data.user_id);
        localStorage.setItem("name", res.name);
        // sessionStorage.setItem('role', this.user_data.role_id);
        // sessionStorage.setItem('email_id', this.user_data.email_id);
        // sessionStorage.setItem('org_id', this.user_data.org_id);
        // localStorage.setItem('hierarchy Level', this.user_data.hierarchy_level);
        localStorage.setItem('auth', JSON.stringify(res));
        this.router.navigate(['/home']);
      } else {
        alert(res.data)
      }
    })
  }

}
