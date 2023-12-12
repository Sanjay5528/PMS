import { HttpClient } from '@angular/common/http';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSidenav } from '@angular/material/sidenav';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import * as moment from 'moment';
import { DataService } from 'src/app/services/data.service';
import { DialogService } from 'src/app/services/dialog.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ICellRendererParams } from 'ag-grid-community';


@Component({
  selector: 'app-cell-color',
  template: `

  <style>
  
  .primary {
    color: red;
  }
  .secondary {
    color: black;
  }
  </style>
  <div
  [ngClass]=" flag ? 'primary' : 'secondary'">{{this.cellValue}}</div>`

})

export class dateCellColorComponent implements ICellRendererAngularComp {
 
cellValue:any
flag: boolean = false;
data:any
date:any
  constructor(
    private router: Router,

    private DataService: DataService,
    private dialogService: DialogService,
    private httpclient: HttpClient,
    private datePipe: DatePipe
  ) {


  }
    refresh(params: ICellRendererParams<any, any>): boolean {
       return true
    }
  agInit(params: any): void {
    this.cellValue=params.value
    // const date = new Date(this.cellValue);
   let date:any =moment(this.cellValue, "DD-MM-YYYY").toDate();
   date=moment(date).format("MM-DD-yyyy")
    this.date=moment(date).isValid()
    
    if(this.date == false){
        this.flag=true
    }
    else if(this.date == true){
        let valid_date=moment(date).format('YYYY-MM-DD')
        let current_date= moment().format('YYYY-MM-DD')
       if(valid_date <= current_date){
        this.flag=true
       }else{
        this.flag=false
       }
    }
    
  }
}