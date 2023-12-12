
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';




@Component({
  selector: 'app-button-renderer',
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

export class ActionButtonComponent implements ICellRendererAngularComp {
  params: any
  actions: any
  constructor(
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
