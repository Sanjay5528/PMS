
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { JwtHelperService } from '@auth0/angular-jwt';



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
    <mat-icon  style="margin-top:9px" *ngIf="showMoreVert"
    [matMenuTriggerFor]="menu" >more_vert</mat-icon>
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
  showMoreVert=true
  userPermissions:any

  constructor( public jwtService: JwtHelperService
  ) {
  }
  agInit(params: any): void {
    debugger
    this.params = params;
    this.actions = this.params.context.componentParent.config.actions
  
      let token = localStorage.getItem("token") || ""; 
      let jwtParseToken = this.jwtService.decodeToken(token);
       this.userPermissions = jwtParseToken?.role;
       console.log(this.userPermissions ,"hoiii");
       
        // Code for when collectionName is "task"
     if (this.params.context.componentParent.config.collectionName === "task" || this.params.context.componentParent.config.collectionName === "project"|| this.params.context.componentParent.config.collectionName === "client" || this.params.context.componentParent.config.collectionName === "projectteam" ||this.params.context.componentParent.config.collectionName === "projectteammembers") {
        if (this.userPermissions !== "SA") {
            this.showMoreVert = false;
        }
    }
      
  }

  onClickMenuItem(item: any) {
    this.params.context.componentParent.onActionButtonClick(item, this.params.data)
  }

  refresh(param: any): boolean {
    return true
  }



}
