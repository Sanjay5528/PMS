import { DatePipe } from '@angular/common';
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';

import { FieldType } from '@ngx-formly/core';
import * as moment from 'moment';
import { DataService } from '../services/data.service';

@Component({
  selector: 'datetime-input',
  template: `
  <mat-form-field style="width:100%">
  <mat-label>{{field.props!['label']}}</mat-label>
  <input matInput [ngxMatDatetimePicker]="picker " placeholder="Choose a date"  [formControl]="FormControl"  
    [min]="minDate" [readonly]="field.props?.readonly || false">

  <mat-datepicker-toggle matSuffix  [for]="$any(picker)" ></mat-datepicker-toggle>
  <ngx-mat-datetime-picker #picker [hideTime]="hideTime" [disabled]="field.props?.readonly || false" [showSpinners]="showSpinners" [showSeconds]="showSeconds" [touchUi]="touchUi"
    [color]="color" [enableMeridian]="enableMeridian" [stepHour]="stepHour" [stepMinute]="stepMinute" [stepSecond]="stepSecond"></ngx-mat-datetime-picker>
</mat-form-field> 
`,
})

export class DateTimeInput extends FieldType<any> implements AfterViewInit, OnInit {

  @ViewChild('picker') picker: any;

  public date!: moment.Moment;
  public disabled = false;
  public showSpinners = true;
  public showSeconds = false;
  public touchUi = false;
  public enableMeridian = true;
  public minDate!: Date;
  public maxDate!: Date;
  public stepHour = 1;
  public stepMinute = 1;
  public stepSecond = 1;
  public color: ThemePalette = 'primary';
  public defaultTime = [new Date().setHours(0, 0, 0, 0)];
  
  hideTime = false;
  valueProp: any;
  labelProp: any;
  opt: any;
   
  parentKey: any;
  selectedValue: any;

  ngAfterViewInit(): void {
  }


  public get FormControl() {
    return this.formControl as FormControl;
  }
  constructor(private datePipe: DatePipe ,public dataService: DataService) {
   super();
  }
  ngOnInit(): void {
    let value = this.model[this.field.key as string]
    this.hideTime = this.field.props?.['hideTime'] || false
    // Set the minDate to previous year and maxDate to future year
    // const currentYear = moment().year();
    // this.minDate = moment().year(currentYear - 1);
    // this.maxDate = moment().year(currentYear + 1);
    this.subscribeOnValueChangeEvent()
    if(this.field.props?.['minDate']){
      this.minDate=this.model[this.field.props?.['minDate']]||new Date ()
    }
    //this.minDate = moment().toDate();
      
    
  }

  subscribeOnValueChangeEvent() {
    // on ParentKey changes logic to be implemented
    if (this.field.parentKey! != "") {
      console.log(this.field.parentKey);
      
      (this.field.hooks as any).afterViewInit = (f: any) => {
        const parentControl = this.form.get(this.field.parentKey)//this.opt.parent_key);
        parentControl?.valueChanges.subscribe((val: any) => {
          this.minDate = val
          console.log(val);
          console.log(this.minDate);
          
        })

      }
    }
  }
}











// <mat-datepicker-toggle matSuffix [for]="$any(picker)" ></mat-datepicker-toggle>
  
//   <mat-datepicker #picker [disabled]="field.props?.readonly || false" ></mat-datepicker>
//  </mat-form-field> 
 

  
   

    
