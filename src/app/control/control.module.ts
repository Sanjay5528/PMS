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
import {  HtmlInput } from './html-input';
import { MultiSelectInput } from './multiselect-input';
import {  SelectInput } from './select-input';
import { DateTimeInput } from './datetime-input';
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
import { MatPrefixInput } from './mat-prefix-input';
import { PasswordInput } from './password-input';
import { CustomPopupInput } from './custompopup-input';
import { TimeInput } from './timepicker';
import { GoogleMapsModule } from '@angular/google-maps';
import { Location } from './location';
import { CallingcodeInput } from './calling-code-input';
import {NgxMatIntlTelInputComponent} from 'ngx-mat-intl-tel-input';
import { BrowserModule } from '@angular/platform-browser';
import { ArrayTodateStringPipe, ArrayToStringPipe, LastIndexPipe, SumPipe } from '../pipe/arraytostring';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormlyFieldSelectAutocomplete } from './select-autocomplete.type';
import { MapComponent } from './map';
import { LogoComponent } from './profile-logo';
import { patchWork } from './patchwork';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { tooglebutton } from './tooglebutton';
import { Card } from './card';
import { radiobutton } from './radiobutton';
import { RepeatTypeComponent } from './repeat';
import { Chips } from './chips';
import {MatChipsModule} from '@angular/material/chips';



export function minlengthValidationMessage(err:any, field: FormlyFieldConfig) {
  return `Should NOT be shorter than ${field.props?.minLength} characters`;
}

export function maxlengthValidationMessage(err:any, field: FormlyFieldConfig) {
  return `Should NOT be longer than ${field.props?.maxLength} characters`;
}

export function minValidationMessage(err:any, field: FormlyFieldConfig) {
  return `Should be >= ${field.props?.min}`;
}

export function maxValidationMessage(err:any, field: FormlyFieldConfig) {
  return `Should be <= ${field.props?.max}`;
}

export function multipleOfValidationMessage(err:any, field: FormlyFieldConfig) {
  return `Should be multiple of ${field.props?.step}`;
}

export function exclusiveMinimumValidationMessage(err:any, field: FormlyFieldConfig) {
  return `Should be > ${field.props?.step}`;
}

export function exclusiveMaximumValidationMessage(err:any, field: FormlyFieldConfig) {
  return `Should be < ${field.props?.step}`;
}

export function patternValidationMessage(err:any, field: FormlyFieldConfig) {
  console.log(field);
  
  return `Invalid ${field.props?.label}`
}
export function uniqueItemsValidationMessag(err:any, field: FormlyFieldConfig) {
  return `This ${field.props?.label} is already exists in database `
}

export function required(err:any, field: FormlyFieldConfig) {
  return `This ${field.props?.label} is Required `
}

const lang = 'en-US';
const formlyConfig = {
  wrappers: [{ name: 'addons', component: PrefixInput }],
  extensions: [{ name: 'addons', extension: { onPopulate: addonsExtension } }],

  extras: { lazyRender: true, resetFieldOnHide: true },
  validationMessages: [
    { name: 'required', message: required },
    { name: 'null', message: 'Should be null' },
    { name: 'minlength', message: minlengthValidationMessage },
    { name: 'maxlength', message: maxlengthValidationMessage },
    { name: 'min', message: minValidationMessage },
    { name: 'max', message: maxValidationMessage },
    { name: 'multipleOf', message: multipleOfValidationMessage },
    { name: 'exclusiveMinimum', message: exclusiveMinimumValidationMessage },
    { name: 'exclusiveMaximum', message: exclusiveMaximumValidationMessage },
    { name: 'uniqueItems', message: uniqueItemsValidationMessag },
    { name: 'pattern', message: patternValidationMessage}
  ],


  types: [
    { name: 'tab-input', component: Tab },
    { name: 'select-input', component: SelectInput },
    { name: 'html-input', component: HtmlInput },
    { name: 'multiselect-input', component: MultiSelectInput },
    { name: 'label-view', component: LabelView },
    { name: 'map', component: MapComponent },
    { name: 'logo', component: LogoComponent },
    { name: 'datetime-input', component: DateTimeInput },
    { name: 'file-input', component: FileInput },
    { name: 'image-input', component: ImageInput },
    { name: 'autoId-input', component: AutogenerateId }, // input text entry key
    { name: 'button-input', component: ButtonInput },
    { name: 'password-input', component: PasswordInput},
    { name: 'matprefix-input', component: MatPrefixInput},
    {name: 'select-autocomplete',component: FormlyFieldSelectAutocomplete},
    { name: 'custompopup-input', component: CustomPopupInput},
    { name: 'time-input', component: TimeInput},
    { name: 'location', component: Location},
    { name: 'toogle', component: tooglebutton},
    { name: 'card', component: Card},
    { name: 'patch-work', component: patchWork},
    { name: 'calling-code-input', component:CallingcodeInput },
    { name: 'radio-button', component:radiobutton },
    { name: 'repeat', component: RepeatTypeComponent },
    { name: 'chips', component:Chips },

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
    PasswordInput,RepeatTypeComponent,
    CustomPopupInput,
    TimeInput,
    Location,LogoComponent,tooglebutton,Card,
    CallingcodeInput,patchWork,Chips,
    FormlyFieldSelectAutocomplete,MapComponent
    
  ],
  imports: [
    BrowserModule,
    CommonModule,
    MatCardModule,
    MatTabsModule,
    MatDatepickerModule,
    MatAutocompleteModule,
    MatButtonModule,
    NgxMatDatetimePickerModule,
    NgxMatMomentModule,
    MatNativeDateModule,FormsModule,
    BrowserAnimationsModule,
    AgGridModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    FormlyMatDatepickerModule,
    FormlyModule.forRoot(formlyConfig),
    FormsModule,MatChipsModule,
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
    NgxMatTimepickerModule,
    GoogleMapsModule,
    NgxMatIntlTelInputComponent,
    MatDatepickerModule,
    NgxMatTimepickerModule,
    MatIconModule,MatSlideToggleModule,
    NgxMatDatetimePickerModule
   
  ],
  exports: [
    Tab,
    FileInput,
    HtmlInput,
    LabelView,
    MultiSelectInput,
    SelectInput,
    DateTimeInput,
    ImageInput,
    AutogenerateId,RepeatTypeComponent,
    ButtonInput,
    Nestedform,
    PrefixInput,
    MatPrefixInput,
    PasswordInput,
    CustomPopupInput,
    TimeInput,
    Location,
    LogoComponent,
    CallingcodeInput,
    patchWork,
    FormlyFieldSelectAutocomplete,
    MapComponent
    
  ],
  providers: [
    ArrayTodateStringPipe, ArrayToStringPipe, LastIndexPipe, SumPipe,
    { provide: LOCALE_ID, useValue: lang }],
})
export class ControlModule { }
