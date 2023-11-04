import { Component, OnInit, AfterViewInit, ViewChild, TemplateRef, EventEmitter } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';
import { values } from 'lodash';
import { Observable } from 'rxjs';
import { DataService } from '../services/data.service';
import { FormService } from '../services/form.service';
import { DynamicFormComponent } from '../component/dynamic-form/dynamic-form.component';
import { DialogService } from '../services/dialog.service';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'button-input',
  template: `
  <style>

  
  .icon{
margin-bottom: 20px;

  }
  .label {
    font-weight: bold;
    color: #555;
    margin-left:15px
  }
  .list-item {
    margin-bottom: 10px;
  }
  
  .storedDate {
    display: grid;
    grid-template-rows: auto auto;
    align-items: center;
  }
  
  .name-row {
    display: flex;
    align-items: center;
  }
  
  .bullet-point {
    margin-right: 5px;
  }
  
 
  
  .contact-row {
    display: flex;
    align-items: center;
  }
  
  .contact {
    margin-left: 10px;
  }
  
  .button-group {
    display: none;
    margin-left: 10px;
  }
  
  .storedDate:hover .button-group {
    display: inline-block;
  }
  
  
  
  </style>
   <div class=icon>
   <mat-label class="label">{{field.props!['label']}}</mat-label>
      <button
     
        [formlyAttributes]="field"
        matTooltip="Add"
        mat-mini-fab
        (click)="onAddButonClick()"
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
    </div>

    <div *ngFor="let field of storedDate ; let i=index " class="list-item" (mouseenter)="toggleButtons(i, true)" (mouseleave)="toggleButtons(i, false)" >
    <div class="storedDate" style="color:black">
    <div class="name-row">
    <span class="bullet-point">&#8226;</span> 
    <span class="name"  style="color:black">{{ field.first_name }} {{ field.last_name }}</span>
    </div>
    <div class="contact-row" >
    <span class="contact"  style="color:black">{{ field.email_id }}, {{ field.mobile_number }}</span>
    <div class="button-group" *ngIf="field.showButtons">
      <mat-icon (click)="deleteItem(i)">delete</mat-icon>
      <mat-icon (click)="editItem(field)">edit</mat-icon>
    </div>
    </div>
    </div>
    </div>





<ng-template  #editViewPopup>
<nestedform (onClose)="close($event)" [formName]="formName" [model]="data" ></nestedform>
</ng-template>




  `,

})


export class ButtonInput extends FieldType<any> implements OnInit {
  pageHeading: any
  collectionName: any
  mode: any
  label: any
  formName: any
  data:any={}
  public fields!: FormlyFieldConfig[]
  config: any
  onClose = new EventEmitter<any>();
  
  // form = new FormGroup({});


  @ViewChild("editViewPopup", { static: true }) editViewPopup!: TemplateRef<any>;
  storedDate: any;
  constructor(
    private dialogService: DialogService,
    private httpclient: HttpClient,
    private dataservice: DataService
  ) { super() 
    }



  ngOnInit(): void {
    
    this.label = this.field.props?.label
    this.formName = this.field.props?.attributes
    this.storedDate=this.model[this.field.key]
    if( this.storedDate?.length!=0 && this.storedDate!=undefined){
      this.field.formControl.setValue(this.storedDate)
    }
    
  }
  ngOnDestroy() {
    console.log("Component will be destroyed");
  //  sessionStorage.removeItem("point_of_contacts")
  }
  close_icon() {
    this.dialogService.closeModal()
  }
 

  // ...
  
  toggleButtons(index: number, show: boolean): void {
    this.storedDate[index].showButtons = show;
  }
  onAddButonClick() {
    
    
  this.data={}
  
    this.dialogService.openDialog(this.editViewPopup, "40%", null, {});
  }

  close($data: any) {
    
    this.data
    this.dialogService.closeModal()
    // let getData:any =sessionStorage.getItem('point_of_contacts')
  //  this.storedDate =JSON.parse(getData)
  //  
    this.field.formControl.setValue( this.storedDate)
 
 
  }
  deleteItem(index: number): void {
    this.storedDate.splice(index, 1);
    // sessionStorage.setItem('point_of_contacts', JSON.stringify(this.storedDate));
  
  }
editItem(item:any){
  this.data=item
  this.dialogService.openDialog(this.editViewPopup, "40%", null, item);

}

  
  
}