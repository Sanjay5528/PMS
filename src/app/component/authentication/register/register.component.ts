import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
// import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  frmRegister!: FormGroup;
  user_data: any;
  hide: boolean = true;
  callingCode: string = "+44"; // Default calling code for the selected country (e.g., "+44" for Great Britain)


  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private dataService: DataService,
    public jwtService: JwtHelperService,
    private dialogService: DialogService,
    // public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.frmRegister = this.formBuilder.group({
      first_name: new FormControl(null, [Validators.required, Validators.pattern('^[a-zA-Z]+$')]),
      last_name: new FormControl(null, [Validators.required, Validators.pattern('^[a-zA-Z]+$')]),
      user_type: new FormControl(null, [Validators.required]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      phoneNumber: new FormControl(null, [Validators.required, Validators.pattern("[6789][0-9]{9}")]),
      password: new FormControl(null, [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{8,10}$/)]),
      country: new FormControl(null, Validators.required),
      engineerassigntype: new FormControl(null, Validators.required)
    });

  }

  register() {
    if (!this.frmRegister.valid) {
      this.dialogService.openSnackBar("Error in your data or missing mandatory fields", "OK");
      return;
    }
    // this.authService.SignUp(this.frmRegister.value);
  }
  countries: any = [
    {
      full: "Great Britain",
      short: "GB",
      callingCode: "+44"
    },
    {
      full: "United States",
      short: "US",
      callingCode: "+1"
    },
    {
      full: "Canada",
      short: "CA",
      callingCode: "+1"
    },
    {
      full: "India",
      short: "IN",
      callingCode: "+91"
    }
  ];
  selectedCountry: string = "GB";

  selectedCountryControl = new FormControl(this.selectedCountry);
  onCountryChange(event: any) {
    const selectedCountry = event.value;
    const country = this.countries.find(
      (c: any) => c.short === selectedCountry
    );
    this.callingCode = country.callingCode;
  }


}