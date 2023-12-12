import { Component } from '@angular/core';

@Component({
  template: `
  
    <input style="margin-left: 20px;" type="radio" [name]="radioName" [(ngModel)]="radioValue" (click)="onClickMenuItem('N')" [value]="'N'" > None
    <input style="margin-left: 20px;" type="radio" [name]="radioName" [(ngModel)]="radioValue" (click)="onClickMenuItem('E')" [value]="'E'" > Edit
    <input style="margin-left: 20px;" type="radio" [name]="radioName" [(ngModel)]="radioValue" (click)="onClickMenuItem('V')" [value]="'V'" > View
  
    `,
})
export class CellComponent {
  public radioValue: any;
  public radioName: any;
  params: any

  agInit(params: any): void {
    this.params=params
    // if(params.data.ACL=="N"||params.data.ACL=="V"||params.data.ACL=="E"){
      this.radioValue = params.data.acl;
    // }else{
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
