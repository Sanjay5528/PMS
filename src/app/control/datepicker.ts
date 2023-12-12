import { DatePipe } from '@angular/common';
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';

import { FieldType } from '@ngx-formly/core';
import * as moment from 'moment';
import { DialogService } from '../services/dialog.service';

@Component({
  selector: 'date-input',
  template: `
  <mat-form-field class="example-full-width" appearance="outline">
  <mat-label>{{field.props!['label']}}</mat-label>
  <input [readonly]="true" matInput  (dateChange)="currentPeriodClicked($event)"  [formControl]="formControl" [formlyAttributes]="field" [min]="minFromDate" [max]="maxFromDate" [matDatepicker]="frompicker" [required]="this.opt.required" />
  <mat-datepicker-toggle matSuffix [for]="frompicker" [disabled]="field.props?.readonly"></mat-datepicker-toggle>
  <mat-datepicker #frompicker  disabled="false" ></mat-datepicker>
  <mat-error *ngIf="this?.formControl?.errors?.required">This {{ this.field.props?.label }} is required</mat-error>
  <mat-error *ngIf="this?.formControl?.errors?.dob">This {{ this.field.props?.label }} is more than 18 years </mat-error>

</mat-form-field> 
`,
})

export class DateInput extends FieldType<any> implements  OnInit {
  
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
  constructor(private datePipe: DatePipe,private dialogSerivce:DialogService) {
    super();
  }
  ngOnInit(): void {
    debugger
this.currentField = this.field
this.required=this.field.props?.required
    this.opt=this.field.props
    if(this?.opt?.attributes?.hide=="past_date"){
      
      this.minFromDate=moment().add(this?.opt?.attributes?.add_days || 0, 'day')
  }
    if(this?.model?.isEdit==true&& this?.opt?.dynamic==true){
      this.minFromDate=this.formControl.value
    }

  if(this?.opt?.attributes?.hide=="future_date"){
      this.maxFromDate=moment().add(this?.opt?.attributes?.add_days || 0, 'day')
  }
  if(this?.model?.isEdit==true&& this?.opt?.overrideFromDate?.dynamic==true){
  const todate:any=this.form.get(this.opt.overrideFromDate.ToDAtekey)
    this.minFromDate=this.formControl.value
    this.maxFromDate=moment(todate?.value);
        todate?.valueChanges.subscribe((val: any) => {
          this.maxFromDate = val
        })
      }


    if (this.currentField.parentKey!= "") {      
      (this.field.hooks as any).afterViewInit = (f: any) => {
      let field =  this.currentField.parentKey
        const parentControl = this.form.get(field)
        parentControl?.valueChanges.subscribe((val: any) => {
          this.minFromDate = val
        })

      }
    }
  }
  // currentPeriodClicked(data:any){}

  currentPeriodClicked(data:any){
    console.log(this.field.dynamicvaltidateDate);
    console.log(this.field.validiotionType);
    
    if(this.field.dynamicvaltidateDate == true){
      console.log(this.field.validiotionType=="dob");
      
      if(this.field.validiotionType=="dob"){
        let presentDate = moment();
        let differenceInYears = moment(presentDate).diff(data.value, 'years');
        
        console.log(differenceInYears);
        
        if (differenceInYears <= 18) {
          this.dialogSerivce.openSnackBar(`The Date You Chose (${this.opt.label}) should be 18 years or more.`, "OK");
          this.formControl.setErrors({dob:true})
        }
        
      }
    }

    if(this.field.valtidateDate == true){
if(this.field.childKey){
  if (typeof this.model[this.field.childKey] === 'string') {
    // Parse the string date to a Moment.js object
    this.secondDate = moment(this.model[this.field.childKey]);
  } if ( this.model[this.field.childkey2] === true) {
    // Parse the string date to a Moment.js object
    this.secondDate = moment()
  } 
  else {
    this.secondDate = this.model[this.field.childKey];
  }
  this.firstDate = data.value
  this.formControl.setValue(data.value)

}else if (this.field.parentKey){
      if (typeof this.model[this.field.parentKey] === 'string') {
        // Parse the string date to a Moment.js object
        this.firstDate = moment(this.model[this.field.parentKey]);
      } else {
        this.firstDate = this.model[this.field.parentKey];
      }
      this.secondDate = data.value
      this.formControl.setValue(data.value)
    }

      let yearsDiff = this.secondDate.year() - this.firstDate.year();
      let monthsDiff = this.secondDate.month() - this.firstDate.month();

if (monthsDiff < 0) {
  yearsDiff--;
  monthsDiff += 12;
}

let a = `${yearsDiff}.${monthsDiff}`;
const cleanStr = a.replace(/[^0-9.-]/g, ''); // Remove non-numeric characters
const number = parseFloat(cleanStr); // Parse the string as a float

let formattedNumber;
if (Number.isInteger(number)) {
  // If the number has no decimal part, add two decimal places
  formattedNumber = number.toFixed(2);
} else {
  // Otherwise, remove trailing zeros after the decimal point
  formattedNumber = number
}

this.field.formControl.parent.controls[this.field.props.onValueChangeUpdate.key].setValue(formattedNumber);
    }
  }
}