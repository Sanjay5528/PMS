import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { MatIconModule } from '@angular/material/icon';
import { AuthenticationRoutingModule } from './authentication-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatGridListModule } from '@angular/material/grid-list';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { FormlyModule } from '@ngx-formly/core';
import { environment } from 'src/environments/environment';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { NbTooltipModule } from '@nebular/theme';


@NgModule({
  declarations: [
    
    ForgotPasswordComponent,
         LoginComponent,
         
  
  ],
  imports: [
    CommonModule,
    MatIconModule,
    AuthenticationRoutingModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatSelectModule,
    MatButtonModule,
    MatToolbarModule,
    MatMenuModule,
    MatGridListModule,MatToolbarModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    FormlyModule.forRoot({
      validationMessages: [{ name: 'required', message: 'This field is required' }],
    }),
  ],
  exports: [
  
    ForgotPasswordComponent,
   
  ],
  providers: [
    // AuthGuard,
  ],
})
export class AuthenticationModule { }
