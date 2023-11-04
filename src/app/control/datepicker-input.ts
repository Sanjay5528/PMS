import { DatePipe } from '@angular/common';
import { Component, OnInit, AfterViewInit, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';
import * as moment from 'moment';

@Component({
 selector: 'datepicker-input',
 template: `
 <mat-form-field style="width:100%">
 <mat-label>{{field.props!['label']}}</mat-label>
 <input matInput [matDatepicker]="picker " placeholder="Choose a date" [formControl]="FormControl" 
 [min]="minDate" [readonly]="true">

 <mat-datepicker-toggle matSuffix [for]="$any(picker)" ></mat-datepicker-toggle>
 
 <mat-datepicker #picker [disabled]="field.props?.readonly || false" ></mat-datepicker>
</mat-form-field> 
`,
})

// <ngx-mat-datetime-picker #picker [hideTime]="hideTime" [disabled]="field.props?.readonly || false" 
// [color]="color" [enableMeridian]="enableMeridian"></ngx-mat-datetime-picker>


// <mat-form-field class="example-full-width" appearance="fill">
// <mat-label>{{field.props!['label']}}</mat-label>
// <mat-error *ngIf="this.field.props.required">{{field.validation.messages['required']}}</mat-error>
// <input [readonly]="true" matInput [formControl]="formControl" [formlyAttributes]="field" [min]="minFromDate" [max]="maxFromDate" [matDatepicker]="frompicker" [required]="this.opt.required" />
// <mat-datepicker-toggle matSuffix [for]="frompicker" [disabled]="field.props?.readonly"></mat-datepicker-toggle>
// <mat-datepicker #frompicker disabled="false" ></mat-datepicker>
// </mat-form-field> 
export class DatePickerInput extends FieldType<any> implements AfterViewInit, OnInit {

 @ViewChild('picker') picker: any;

 public date!: moment.Moment;
 public disabled = false;
 public showSpinners = true;
 public touchUi = false;
 public enableMeridian = true;
 public minDate: Date | undefined;
 public color: ThemePalette = 'primary';
 // public defaultTime = [new Date().setHours(0, 0, 0, 0)]
 hideTime = false
 ngAfterViewInit(): void {
 }


 public get FormControl() {
 return this.formControl as FormControl;
 }
 constructor(private datePipe: DatePipe) {
 super();
 }


 ngOnInit(): void {
 debugger
 let value = this.model[this.field.key as string]
 this.hideTime = this.field.props?.['hideTime'] || false
 this.subscribeOnValueChangeEvent()

 // if(this.model.status){ 
 // if (this.field.formControl?.value) {
 // return
 // }
 // }

 if (this.field.props?.['minDate']) {
 this.minDate = this.model[this.field.props?.['minDate']] || new Date()
 }
 }

 // subscribeOnValueChangeEvent() {
 // // on ParentKey changes logic to be implemented
 // debugger
 // if (this.field.parentKey! != "") {
 // (this.field.hooks as any).afterViewInit = (f: any) => {
 // const parentControl = this.form.get(this.field.parentKey)//this.opt.parent_key);
 // parentControl?.valueChanges.subscribe((val: any) => {
 // this.minDate = val
 // })

 // }
 // }
 // }

 subscribeOnValueChangeEvent() {
 if (this.field.parentKey! != "") {
 (this.field.hooks as any).afterViewInit = (f: any) => {
 const parentControl = this.form.get(this.field.parentKey);
 parentControl?.valueChanges.subscribe((val: any) => {
 this.minDate = val; // Disable dates based on the selected date in the parent
 });
 }
 }
}
}