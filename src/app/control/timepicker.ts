import { DatePipe } from '@angular/common';
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';

import { FieldType } from '@ngx-formly/core';
import * as moment from 'moment';

@Component({
  selector: 'time-input',
  template: `
  <mat-form-field appearance="fill">
    <mat-label>{{field.props!['label']}}</mat-label>
    <input   [placeholder]="field.props!['placeholder']"  [formControl]="FormControl"  [formlyAttributes]="field" matInput [ngxMatTimepicker]="picker" [required]="this.field.props.required" />
    <mat-error *ngIf="this.field.props.required">This field is required</mat-error>
    <ngx-mat-timepicker #picker></ngx-mat-timepicker>
    <mat-icon
    matSuffix
    [ngxMatTimepicker]="picker"
  
    >schedule</mat-icon
  >
  </mat-form-field>

`,
})
export class TimeInput extends FieldType<any> implements  OnInit {

//   @ViewChild('picker') picker: any;



  public get FormControl() {
    return this.formControl as FormControl;
  }
  constructor(private datePipe: DatePipe) {
    super();
  }
  ngOnInit(): void {
   
  }
}