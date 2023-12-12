import { Component, OnInit, AfterViewInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';
import { values } from 'lodash';
import { Observable } from 'rxjs';
import { DataService } from '../services/data.service';
import { DialogService } from '../services/dialog.service';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'custompopup-input',
  template: `
  <style>
  .mat-mdc-dialog-container .mdc-dialog__surface {
    width: 100%;
    height: 100%;
    overflow: hidden !important;
}

  .mat-mdc-dialog-container::-webkit-scrollbar{
    display: none !important;

  }
  .badge {
    color: black;
    padding: 4px 8px;
    text-align: center;
    border-radius: 20px;
    border:1px solid black
  }

  .mat-button{
    display: flex;
    position:absolute;
    bottom:0;
    right:0;
  }
  .item{
    max-width: 300px;
    overflow-wrap: break-word !important;
    word-wrap: break-word !important;
    
  }

  // .bind-data{
  //     width: 50%;
  //     display: flex;
  //     flex-direction:row;
  //     grid-gap: 9px;
  //     margin: 27px -2px;
  //     flex-wrap: wrap;
  // }
  
  .mat-icon {
    -webkit-user-select: none;
    user-select: none;
    background-repeat: no-repeat;
    display: inline-block;
    fill: currentColor;
    height: 22px;
    width: 24px;
    overflow: hidden;
    font-size: 20px;
    vertical-align:middle  !important;
}
  ::ng-deep .mat-mdc-form-field-focus-overlay {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    /* position: absolute; */
    opacity: 0;
    pointer-events: none;
}

::ng-deep .ng-select {
  position:relative !important;
}
  .border{
    border: 1px solid rgb(158,158,158) !important;
    margin-bottom: 37px;
    border-radius: 4px;
    height: 50px;
    text-align: center;
  }
  

  .parent {
    display: flex;
    flex-wrap: wrap;
    width: 90%;
    margin-bottom: 10px;
    margin-left: 12px;
}

.parent   > div {
  overflow-wrap: break-word;
  max-width: 300px;
  margin: 2px;
  text-align: left;
}




  
  .child{
    word-wrap: break-word;
    overflow-wrap: break-word;
    width: fit-content;
    border: 1px solid #ccc;
    padding: 10px;
    color: black;
    padding: 2px 8px;
    border-radius: 12px;
    margin: 5px 1px 1px 1px;
    flex-direction: column;
}
  
  </style>

<div style="margin:28px 2px">
  <mat-label style="color:black;">{{field.props!['label']}}</mat-label>
  
  <button
  type="button"
       [formlyAttributes]="field"
        matTooltip="Add"
        mat-mini-fab
        (click)="onAddButonClick($event)"
        style="
          margin-left: 30px;
          background-color: #B0B0B0;
          color: white;
          height: 24px;
          width: 24px;
          font-size: 9px;
          line-height: 3;
          vertical-align: middle;
        "
      >
        <mat-icon>add</mat-icon>
      </button>
      <div  class="parent" [formControl]="FormControl" [formlyAttributes]="field" >
      <div class="child" *ngFor="let item of custom_data;let i=index" >
     {{item}}<mat-icon (click)=remove_data(i,item)>close</mat-icon>
      </div>
      </div>
      </div>


    <ng-template   #editViewPopup  style="height: auto">
    <div style="text-align-last: end">
    <mat-icon (click)="close()">close</mat-icon>
  </div>
  <div>
    <mat-tab-group preserveContent>
     <mat-tab  label={{this.field.label1}}>
    <div style="height:400px" *ngIf="dropdownList">
    <ng-select
    [items]="dropdownList"
    [clearSearchOnAdd]="true"
    [multiple]="true"
    [bindLabel]="labelProp"
    [closeOnSelect]="false"
    [bindValue]="valueProp"
    [(ngModel)]="selected_data"
    (close)="onchange_data($event)"
    >
    <ng-template ng-option-tmp let-item="item" let-item$="item$" let-index="index">
      <input id="item-{{index}}" type="checkbox" [ngModel]="item$.selected" [ngModelOptions]="{standalone: true}"/>
      <span [innerHTML]="item[this.labelProp]"></span>
  </ng-template> 
  </ng-select>
   </div>

     
     </mat-tab>
     
     <mat-tab *ngIf="this.field.showcustom == true"  label= {{this.field.label2}}>
     <mat-form-field appearance="fill">
     <input matInput [(ngModel)]="username" /><span matSuffix><mat-icon (click)="addcustom()">add</mat-icon></span>
   </mat-form-field>
   
   <div style="margin:1px 12px" *ngFor="let a of  data">{{a}}</div>
     </mat-tab>
     


     </mat-tab-group>
     </div>
     <div class="mat-button">
     <div style="margin-top:auto"><button   (click)="add()" style="margin: 5px" mat-raised-button>Add</button></div>
     <div style="margin-top:auto"><button mat-raised-button (click)="close()" style="margin: 5px">Cancel</button></div>
     </div>
         
    </ng-template>


  `,

})


export class CustomPopupInput extends FieldType<any> implements OnInit {
  opt: any
  //default prop setting
  valueProp :any
  labelProp :any
  onValueChangeUpdate: any
  label: any
  dropdownList :any[]= []
  selected_data:any
  currentField:any
  username:any
  custom_data:any[]=[]
  show:any
  data:any[]=[]
  @ViewChild("editViewPopup", { static: true }) editViewPopup!: TemplateRef<any>;
  constructor(private dataService: DataService,
    private dialogService:DialogService,
    private dialog: MatDialog,) {
    super()
  }
  
  public get FormControl() {
    return this.formControl as FormControl;
    
  }

  ngOnInit(): void {
   this.show=this.field.showcustom
    this.label = this.field.props?.labelS
    this.opt = this.field.props || {};
    this.labelProp = this.opt.labelProp
    this.valueProp = this.opt.valueProp
    this.custom_data=this.model[this.field.key]
    this.getdata()
     }


     
     onAddButonClick(event:any){
     this.dialogService.openDialog(this.editViewPopup, "40%", "70%", {});
     }

     getdata(){
      if (this.opt.optionsDataSource.collectionName) {
        let name = this.opt.optionsDataSource.collectionName
        this.dataService.getDataByFilter(name,{}).subscribe((res: any) => {
          this.dropdownList = res.data[0].response
          this.dataService.buildOptions(res[0].response, this.opt);
          console.log(this.opt.options)
        });
      }
     }


     addcustom(){
        
        if(this.username!=""){
          this.data.push(this.username)
          this.username=""  
        }
        
     }

     add(){
    let array=[]
      
        this.dialogService.closeModal()
        for(let i=0;i<this.data.length;i++){
          array.push(this.data[i])
        }

        if(this.selected_data==""){this.selected_data=undefined}

        if(this.selected_data!=undefined ){
        for(let i=0;i<this.selected_data.length;i++){
         array.push(this.selected_data[i])
        }
      }

      if(this.custom_data!=undefined){
        this.custom_data=[...this.custom_data,...array]
      }else{
        this.custom_data=array
      }
        this.field.formControl.setValue(this.custom_data)
        this.data=[]
        this.selected_data=''
     }

     close(){
      this.dialogService.closeModal()
     }

      onchange_data(event:any){
      this.selected_data
      }

     remove_data(index:any,data:any){
     this.custom_data.splice(index,1)
     }

}