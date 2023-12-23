import { NgModule } from '@angular/core';
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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MyLinkRendererComponent } from './datatable/cellstyle';
import { MatGridListModule } from '@angular/material/grid-list';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ControlModule } from '../control/control.module';
import { DynamicFormComponent } from './dynamic-form/dynamic-form.component';
import { AppRoutingModule } from '../app-routing.module';
import {MatStepperModule} from '@angular/material/stepper';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DynamicFilterComponent } from './dynamic-filter/dynamic-filter.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { MasterSingleDetailFormComponent } from './master-single-detail-form/master-single-detail-form.component';
import { MasterButtonComponent } from './master-single-detail-form/master-button';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AccessrightComponent } from './ACL/accessright/accessright.component';
import { AccessActionButtonComponent } from './ACL/accessright/action-button';
import { CellComponent } from './ACL/accessright/radiobutton';
import { IndividualAccessComponent } from './ACL/individual-access/individual-access.component';
import { Icon } from './dashboard/icon';
import { RoleDataAclComponent } from './ACL/role-data-acl/role-data-acl.component';
import { viewCellComponent } from './ACL/individual-access/view-button';
import {MatChipsModule} from '@angular/material/chips';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { DatasetComponent } from './dataset/dataset.component';


import {  DragDropModule } from '@angular/cdk/drag-drop';
import { NgmodelComponent } from './dataset/ngmodel/ngmodel.component';
import { AggridTreeComponent } from './aggrid-tree/aggrid-tree.component';
import { ProjectteamComponent } from './projectteam/projectteam.component';
import { TimesheetComponent } from './timesheet/timesheet.component';
import { CreatecvComponent } from './createcv/createcv.component';
import { ProjectButtonComponent } from './projectteam/button';
import { ButtonComponent } from './aggrid-tree/button';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalenderComponent } from './calender/calender.component';
import { ExpansionComponent } from './checkformaly/expansion/expansion.component';
import { DropDownAgggrid } from './master-single-detail-form/dropdownAggrid';
import { NestedtablesComponent } from './nestedtables/nestedtables.component';
import { NgxGanttModule } from '@worktile/gantt';
import { GantchartComponent } from './gantchart/gantchart.component';
import { TimeSheetActionButtonComponent } from './timesheet/button';
import { MatRadioModule } from '@angular/material/radio';
import { CardComponent } from './card/card.component';
import { ParentchildCardComponent } from './parentchild-card/parentchild-card.component';


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

    ProjectButtonComponent,
    ButtonComponent, //! Project button component
    TimeSheetActionButtonComponent,
    DynamicFormComponent,
    DynamicFilterComponent,Icon,
    ActionButtonComponent
    ,AccessActionButtonComponent
    ,CellComponent,
    viewCellComponent,
    MyLinkRendererComponent,
    MasterSingleDetailFormComponent
    ,MasterButtonComponent,
    DashboardComponent, 
    AccessrightComponent, 
    IndividualAccessComponent, 
    RoleDataAclComponent, 
    DatasetComponent, 
     NgmodelComponent,
     AggridTreeComponent,
     CreatecvComponent,
     CalenderComponent,
     ProjectteamComponent,
     TimesheetComponent,
     ExpansionComponent,DropDownAgggrid, NestedtablesComponent, GantchartComponent, CardComponent, ParentchildCardComponent
  ],
  imports: [
    NgSelectModule,
    MatStepperModule,
    AppRoutingModule,
    CommonModule,
    NbMenuModule,
    DragDropModule,
    NgxChartsModule,
    MatChipsModule,
    FormlyMatToggleModule,
    BrowserModule,
    AgGridModule,
    NgxGanttModule,
    MatRadioModule,
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
    MatButtonToggleModule,
    FormlyMatRadioModule,
    FormlyMatSelectModule,
    FlexLayoutModule,
    FormlyMaterialModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    MatInputModule,
    MatAutocompleteModule,
    MatListModule,
    MatSidenavModule,
    MatCardModule,
    MatIconModule,
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
    FullCalendarModule,
    MatExpansionModule,
    MatSlideToggleModule,
    ControlModule

  ],


  exports: [
    DatatableComponent,
    DynamicFormComponent,    FullCalendarModule,

    DynamicFilterComponent,
  ],

  providers: [
    DatePipe,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
})
export class ComponentModule { }
