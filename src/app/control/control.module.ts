import { NgModule, Component, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Tab } from './tab';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { AgGridModule } from 'ag-grid-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyMatDatepickerModule } from '@ngx-formly/material/datepicker';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule } from '@angular/material/dialog';
import { HtmlInput } from './html-input';
import { MultiSelectInput } from './multiselect-input';
import { SelectInput } from './select-input';
import { DateTimeInput } from './datetime-input';
import{DateInput}from './date-input';
 
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgxMatDatetimePickerModule } from '@angular-material-components/datetime-picker';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { FileUploadModule } from 'ng2-file-upload';
import { NgSelectModule } from '@ng-select/ng-select';

import { LabelView } from './label';
import { FileInput } from './file-input';
import { ImageInput } from './image-input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AutogenerateId } from './autogenerateid-input';
import { ButtonInput } from './button-input';
import { Nestedform } from './nestedform';
import { addonsExtension } from './prefix-extensions';
import { PrefixInput } from './prefix-input';
import { DataService } from '../services/data.service';
import { MatPrefixInput } from './mat-prefix-input';
import { ArrayTypeComponent } from './formly-array.type';
import { DatePickerInput } from './datepicker-input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormlyAutocomplete } from './autocomplete-input';
 
// import { RepeatTypeComponent } from './formly-array.type';
// import { ArrayTypeComponent } from './formly-array.type';
// import { ArrayTypeComponent } from '';



const lang = 'en-US';
const formlyConfig = {
  wrappers: [{ name: 'addons', component: PrefixInput }],
  extensions: [{ name: 'addons', extension: { onPopulate: addonsExtension } }],

  extras: { lazyRender: true, resetFieldOnHide: true },
  validationMessages: [
    { name: 'required', message: 'This field is required' }
  ],

  types: [
    { name: 'tab-input', component: Tab },
    { name: 'select-input', component: SelectInput },
    { name: 'html-input', component: HtmlInput },
    { name: 'multiselect-input', component: MultiSelectInput },
    { name: 'label-view', component: LabelView },
    { name: 'datetime-input', component: DateTimeInput },
    { name: 'file-input', component: FileInput },
    { name: 'image-input', component: ImageInput },
    { name: 'autoId-input', component: AutogenerateId },
    { name: 'button-input', component: ButtonInput },
    { name: 'repeat', component: ArrayTypeComponent },
    { name: 'auto', component: AutogenerateId },
    {name:'date-input',component:DateInput},
    {name:'datepicker-input',component:DatePickerInput},
    {name:'autocomplete-input',component:FormlyAutocomplete}
  ]
}

@NgModule({
  declarations: [
    Tab,
    FileInput,
    HtmlInput,
    LabelView,
    MultiSelectInput,
    SelectInput,
    DateTimeInput,
    ImageInput,
    AutogenerateId,
    ButtonInput,
    Nestedform,
    PrefixInput,
    MatPrefixInput,
    DateInput,
    DatePickerInput,
    // RepeatTypeComponent
    ArrayTypeComponent,
    FormlyAutocomplete
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatTabsModule,
    MatDatepickerModule,
    MatButtonModule,
    NgxMatDatetimePickerModule,
    NgxMatMomentModule,
    MatNativeDateModule,
    BrowserAnimationsModule,
    AgGridModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    FormlyMatDatepickerModule,
    FormlyModule.forRoot(formlyConfig),
    FormsModule,
    AngularEditorModule,
    MatIconModule,
    MatMenuModule,
    MatSelectModule,
    MatInputModule,
    MatOptionModule,
    MatFormFieldModule,
    MatExpansionModule,
    MatDialogModule,
    MatNativeDateModule,
    FormlyMatDatepickerModule,
    MatCheckboxModule,
    NgxMatTimepickerModule.setLocale(lang),
    FileUploadModule,
    NgSelectModule,
    MatAutocompleteModule
  ],
  exports: [
    Tab,
    HtmlInput,
    LabelView,
    MultiSelectInput,
    SelectInput,
    DateTimeInput,
    FileInput,
    ImageInput,
    AutogenerateId,
    ButtonInput,
    Nestedform,
    PrefixInput,
    MatPrefixInput,
    DateInput,
    DatePickerInput,
    FormlyAutocomplete
     
  ],
  providers: [{ provide: LOCALE_ID, useValue: lang }],
})
export class ControlModule { }
