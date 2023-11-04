import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DatatableComponent } from './datatable/datatable.component';

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppLayoutModule } from './app-layout/app-layout.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { DateAdapter, MatNativeDateModule, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormlyMatCheckboxModule } from '@ngx-formly/material/checkbox';
import { FormlyMatDatepickerModule } from '@ngx-formly/material/datepicker';
import { FormlyMatInputModule } from '@ngx-formly/material/input';
import { FormlyMatSelectModule } from '@ngx-formly/material/select';
import { FormlyMatRadioModule } from '@ngx-formly/material/radio';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormlyMatFormFieldModule } from '@ngx-formly/material/form-field';
import { FormlyMatTextAreaModule } from '@ngx-formly/material/textarea';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from '../services/token.interceptor';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { ActionButtonComponent } from './datatable/button';
import { FormlyMatToggleModule } from '@ngx-formly/material/toggle';
import { NgxChartsModule } from "@swimlane/ngx-charts";
import { NbMenuModule } from "@nebular/theme";
import { NbThemeModule, NbLayoutModule } from '@nebular/theme';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MyLinkRendererComponent } from './datatable/cellstyle';
import { MatGridListModule } from '@angular/material/grid-list';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ControlModule } from '../control/control.module';
import { DynamicFormComponent } from './dynamic-form/dynamic-form.component';
import { EngineersApprovalRequestComponent } from './engineers-approval-request/engineers-approval-request.component';
import { EngineerProfileComponent } from './engineer-profile/engineer-profile.component';
import { AppRoutingModule } from '../app-routing.module';
// import { TimesheetComponent } from './timesheet/timesheet.component';
import { NgxGanttModule } from '@worktile/gantt';
// //  import { NgGanttEditorModule } from 'ngx-gantt'
// import { CalendarModule } from 'angular-calendar';
// import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { MyprofileComponent } from './myprofile/myprofile.component';
// import { NgGanttEditorModule } from 'ng-gantt'
// import { NgGanttEditorModule } from 'ng-gantt'
// import { SchedulerModule } from 'angular-calendar-scheduler';
import { CreatecvComponent } from './createcv/createcv.component';
import { AggridTreeComponent } from './aggrid-tree/aggrid-tree.component';
import { ButtonComponent } from './aggrid-tree/button';
import { CalenderComponent } from './calender/calender.component';
//import { CreatecvComponent } from './createcv/createcv.component';
import { NgxEditorModule } from 'ngx-editor';
import { FullCalendarModule } from '@fullcalendar/angular';
import { TimesheetComponent } from './timesheet/timesheet.component';
import { ProjectteamComponent } from './projectteam/projectteam.component';
import { ProjectButtonComponent } from './projectteam/button';
// import { AppService } from './services/app.service';

// import { MatProgressSpinnerModule } from '@angular/material';

const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  },
};

const appearance: any = {
  appearance: 'outline'
};



@NgModule({
  declarations: [
    DatatableComponent,
    DynamicFormComponent,
    ActionButtonComponent,
    ProjectButtonComponent,
    DashboardComponent,
    MyLinkRendererComponent,
    EngineerProfileComponent,
    EngineersApprovalRequestComponent,
    //  TimesheetComponent,
    MyprofileComponent,
    CreatecvComponent,
    AggridTreeComponent,
    ButtonComponent,
    CalenderComponent,
    TimesheetComponent,
    ProjectteamComponent,
  ],
  imports: [
    AppRoutingModule,
    CommonModule,
    NbMenuModule,
    NgxChartsModule,
    FormlyMatToggleModule,
    BrowserModule,
    AgGridModule,
    MatProgressBarModule,
    BrowserAnimationsModule,
    CommonModule,
    MatButtonModule,
    AppLayoutModule,
    AuthenticationModule,
    FormlyModule,
    ReactiveFormsModule,
    FormlyMatCheckboxModule,
    FormlyMatDatepickerModule,
    FormlyMatInputModule,
    FormlyMatRadioModule,
    FormlyMatSelectModule,
    FlexLayoutModule,
    FormlyMaterialModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatSidenavModule,
    MatCardModule,
    MatMenuModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatSelectModule,
    FormlyMatFormFieldModule,
    FormlyMatTextAreaModule,
    MatNativeDateModule,
    MatDialogModule,
    FormsModule,
    MatFormFieldModule,
    MatTabsModule,
    MatDatepickerModule,
    ControlModule,
    MatGridListModule,
    FormlyModule.forRoot({
      validationMessages: [
        { name: 'required', message: "This field is required" }],
    }),
    MatExpansionModule,
    // CalendarModule.forRoot({
    //   provide: DateAdapter,
    //   useFactory: adapterFactory
    // }),
    // SchedulerModule.forRoot({ locale: 'en', headerDateFormat: 'daysRange', logEnabled: true }),
    // NgGanttEditorModule
    NgxGanttModule,
    FullCalendarModule,
    NgxEditorModule
  ],


  exports: [
    DatatableComponent,
    DynamicFormComponent,
    EngineersApprovalRequestComponent,
    EngineerProfileComponent,
    ControlModule,
    CalenderComponent,
    FullCalendarModule,
    NgxEditorModule
  ],

  providers: [
    DatePipe,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    { provide: LOCALE_ID, useValue: 'en-US' }
  ],
})
export class ComponentModule { }
