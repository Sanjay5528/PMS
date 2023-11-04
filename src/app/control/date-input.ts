import { DatePipe } from '@angular/common';
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';

import { FieldType } from '@ngx-formly/core';
import * as moment from 'moment';

@Component({
 selector: 'date-input',
 template: `
 <mat-form-field class="example-full-width" appearance="fill">
 <mat-label>{{field.props!['label']}}</mat-label>
 <mat-error *ngIf="this.field.props.required">{{field.validation.messages['required']}}</mat-error>
 <input [readonly]="true" matInput [formControl]="formControl" [formlyAttributes]="field" [min]="minFromDate" [max]="maxFromDate" [matDatepicker]="frompicker" [required]="this.opt.required" />
 <mat-datepicker-toggle matSuffix [for]="frompicker" [disabled]="field.props?.readonly"></mat-datepicker-toggle>
 <mat-datepicker #frompicker disabled="false" ></mat-datepicker>
</mat-form-field> 
`,
})

export class DateInput extends FieldType<any> implements OnInit {
 
opt:any
 minFromDate!: any;
 maxFromDate!: any | null;
 minToDate!: Date | null;
 maxToDate!: Date;
 required:any
 currentField:any
 disabled:boolean =true
 secondDate:any
 firstDate:any

 public get FormControl() {
 return this.formControl as FormControl;
 }
 constructor(private datePipe: DatePipe) {
 super();
 }
 ngOnInit(): void {
debugger
this.currentField = this.field
this.required=this.field.props?.required
 this.opt=this.field.props
 if(this.opt.attributes.hide=="past_date"){
 this.minFromDate=moment().add(this.opt.attributes.add_days || 0, 'day')
 }

 if(this.opt.attributes.hide=="future_date"){
 this.maxFromDate=moment().add(this.opt.attributes.add_days || 0, 'day')
 }


 if (this.currentField.parentKey!= "") {
 debugger
 (this.field.hooks as any).afterViewInit = (f: any) => {
 let field = this.currentField.parentKey
 const parentControl = this.form.get(field)
 parentControl?.valueChanges.subscribe((val: any) => {
 this.minFromDate = val
 })

 }
 }
 }
 


}