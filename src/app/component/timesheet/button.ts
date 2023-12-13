
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { DataService } from 'src/app/services/data.service';




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

<div >
      <button mat-icon-button [matMenuTriggerFor]="menu" >
        <mat-icon>more_vert</mat-icon>
      </button>
      <mat-menu #menu="matMenu"> 
         <button mat-menu-item (click)="onClickMenuItem('add')">
          <mat-icon>add</mat-icon>
          <span>Add</span>
        </button>
        <button mat-menu-item (click)="onClickMenuItem('delete', params)">
          <mat-icon>delete</mat-icon>
          <span>Delete</span>
        </button>
      </mat-menu>
    </div>
  `
})

export class TimeSheetActionButtonComponent implements ICellRendererAngularComp {
  params: any
  actions: any
  constructor(
    public dataService:DataService
  ) {
  }
  agInit(params: any): void {
    this.params = params;
    
    this.actions = this.params.context.componentParent.config.actions
  }

  onClickMenuItem(item: any,params?:any) {
    console.log();
    if(item=="delete"){
        this.dataService.deleteDataById("unschedule",params.data._id).subscribe((res:any)=>{
            console.log(res);
            
        })
    }
    if(item=="add"){
        console.log(params);
        
    }
    // this.params.context.componentParent.onActionButtonClick(item, this.params.data)
  }

  refresh(param: any): boolean {
    return true
  }



}
