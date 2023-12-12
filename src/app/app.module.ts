import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ComponentModule } from './component/component.module';
import { FormlyModule } from '@ngx-formly/core';
import { ReactiveFormsModule } from '@angular/forms';
import { JwtModule } from '@auth0/angular-jwt';
import { MatFormFieldDefaultOptions, MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { AuthGuardService } from './services/auth-guard.service';
import { NgxGanttModule } from '@worktile/gantt';

const appearance: MatFormFieldDefaultOptions = {
  appearance: 'outline'
};

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ComponentModule,
    FormlyModule,
    ReactiveFormsModule,
    MatButtonModule,
    NgxGanttModule,
    ScrollingModule,
    FlexLayoutModule,
    MatExpansionModule,
    MatGridListModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
      },
    }),
  ],

  providers: [
    AuthGuardService,
    
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: appearance
    }],

  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
export function tokenGetter() {
  return sessionStorage.getItem("token");
}

