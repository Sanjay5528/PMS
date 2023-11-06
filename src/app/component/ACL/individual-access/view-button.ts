import { Component } from '@angular/core';

@Component({
  template: `
  <div *ngIf="View">
      <input style="margin-left: 20px;" type="radio" [name]="radioName" [(ngModel)]="radioValue" (click)="onClickMenuItem('N')" [value]="'N'" > None
      <input style="margin-left: 20px;" type="radio" [name]="radioName" [(ngModel)]="radioValue" (click)="onClickMenuItem('E')" [value]="'E'" > Edit
      <input style="margin-left: 20px;" type="radio" [name]="radioName" [(ngModel)]="radioValue" (click)="onClickMenuItem('V')" [value]="'V'" > View
  </div>
  <div *ngIf="!View">
      <input style="margin-left: 20px;" type="radio" [name]="radioName" [(ngModel)]="radioValue" (click)="onClickMenuItem('N')" [value]="'N'" > None
      <input style="margin-left: 20px;" type="radio" [name]="radioName" [(ngModel)]="radioValue" (click)="onClickMenuItem('V')" [value]="'V'" > View
  </div>
    `,
})
export class viewCellComponent {
  public radioValue: any;
  public radioName: any;
  params: any
View:any
  agInit(params: any): void {
    this.params=params
    this.radioValue = params.data.acl;
    console.log(params.data,'role-data-acl');
    
    if(params.data.acl!=="V"){
        this.View=true
    }else{
        this.View=false
    }
    // else{
    //   this.radioValue =null
    // }
    this.radioName = 'radio' + params.rowIndex;
  console.log(params.data.column_name,params.data.acl);
  
    // this.actions = this.params.context.componentParent.config.actions
  }
  
  onClickMenuItem(item: any) {
    this.params.context.componentParent.onActionButtonClick(item, this.params.data)
  }
}
