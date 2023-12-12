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


@Component({
  selector: 'appacc-button-renderer',
  template: `
<style>
::ng-deep.mat-mdc-dialog-container .mdc-dialog__surface {
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden !important;
}</style>
<div *ngIf="this.params?.label!='route'">
    <mat-icon  style="margin-top:9px" [matMenuTriggerFor]="menu" >more_vert</mat-icon>
    </div>
    <div *ngIf="this.params?.label=='route'">
    <mat-icon (click)="onClickMenuItem(this.params)" style="margin-top:9px">{{this.params.icon}}</mat-icon>
    </div>


    <mat-menu [overlapTrigger]="false" #menu="matMenu">
    <span *ngFor="let item of actions">
    <button mat-menu-item  (click)="onClickMenuItem(item)">
    <mat-icon >{{item.icon}}</mat-icon>{{item.label}}</button></span>
  </mat-menu>
  `
})

export class AccessActionButtonComponent implements ICellRendererAngularComp {
  
  params: any
 
 public actions: any
  
  


  constructor(
    private router: Router,
    private DataService: DataService,
    private dialogService: DialogService,
    private httpclient: HttpClient,
    private datePipe: DatePipe
  ) {


  }
  agInit(params: any): void {
    this.params = params;
    
    this.actions = this.params.context.componentParent.config.actions
  }

  onClickMenuItem(item: any) {
    this.params.context.componentParent.onActionButtonClick(item, this.params.data)
  }

  refresh(param: any): boolean {
    return true
  }
}
