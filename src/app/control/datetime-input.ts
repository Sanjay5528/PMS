import { DatePipe } from '@angular/common';
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';

import { FieldType } from '@ngx-formly/core';
import * as moment from 'moment';

@Component({
  selector: 'datetime-input',
  template: `
  <mat-form-field style="width:100%">
  <mat-label>{{field.props!['label']}}</mat-label>
  <input matInput [ngxMatDatetimePicker]="picker " [placeholder]="placeholder"  [formControl]="FormControl"  
  [min]="minDate" [max]="maxDate"  [readonly]="field.props?.readonly || false" [required]="required"/>
  <mat-error *ngIf="required">This field is required</mat-error>
  <mat-datepicker-toggle matSuffix  [for]="$any(picker)" ></mat-datepicker-toggle>
  <ngx-mat-datetime-picker #picker [hideTime]="hideTime" [disabled]="field.props?.readonly || false" 
  [showSpinners]="showSpinners" [showSeconds]="showSeconds" [touchUi]="touchUi"
     [enableMeridian]="enableMeridian" [stepHour]="stepHour" [stepMinute]="stepMinute" [stepSecond]="stepSecond"
     [color]="color"></ngx-mat-datetime-picker>
   
    </mat-form-field> 

`,
})
export class DateTimeInput extends FieldType implements AfterViewInit, OnInit {


  @ViewChild('picker') picker: any;

  public date!: moment.Moment;
  public disabled = false;
  public showSpinners = true;
  public showSeconds = false;
  public touchUi = false;
  public enableMeridian = true;
  public minDate!: Date
  public maxDate!: Date
  public stepHour = 1;
  public stepMinute = 1;
  public stepSecond = 1;
  public color: ThemePalette = 'accent';
  public defaultTime = [new Date().setHours(0, 0, 0, 0)]
  hideTime = false
  placeholder: any
  required: any
  ngAfterViewInit(): void {
  }


  public get FormControl() {
    return this.formControl as FormControl;
  }
  constructor(private datePipe: DatePipe) {
    super();
  }
  ngOnInit(): void {
    this.required = this.field.props?.required
    this.placeholder = this.field.props?.placeholder
    // this.hideTime = this.field.props?.['hideTime'] || false
    // this.minDate=new Date()
    // if(this.field.props?.['hide_past_date']==true){
    //   this.minDate=new Date()
    // }
    this.minDate = moment().toDate();

    this.hideTime = this.field.props?.['hideTime'] || false
  }
}