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
import { FullCalendarModule } from '@fullcalendar/angular';
import { NGX_MAT_DATE_FORMATS } from '@angular-material-components/datetime-picker';
// import { NgGanttEditorModule } from 'ng-gantt';
// import { NgGanttEditorModule } from 'ng-gantt';



const appearance: MatFormFieldDefaultOptions = {
  appearance: 'outline'
};
const DATE_TIME_FORMAT = {
  parse: {
    dateInput: 'l, LT',
  },
  display: {
    dateInput: 'l, LT',
    monthYearLabel: 'MM yyyy',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  }
}

@NgModule({
  declarations: [
    AppComponent


  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ComponentModule,
    FormlyModule,
    ReactiveFormsModule,
    MatButtonModule,
    ScrollingModule,
    FlexLayoutModule,
    MatExpansionModule,
    FullCalendarModule,
    MatGridListModule,
    // NgGanttEditorModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
      },
    }),
    // NgGanttEditorModule

  ],

  providers: [
    AuthGuardService,

    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: appearance
    },
    { provide: NGX_MAT_DATE_FORMATS, useValue: DATE_TIME_FORMAT }
  ],

  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
export function tokenGetter() {
  return sessionStorage.getItem("token");
}



// {
//   "type": "logo_upload",
//   "key": "addressLogoHidden",
//   "className": "flex-1",
//   "props": {
//     "label": "Address Logo",
//     "placeholder": "Address Logo",
//     "required": true,
//     "expressions": {
//       "hide": "!model.addressLogoHidden"
//     }
//   }
// }