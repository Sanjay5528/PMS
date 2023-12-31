import { Component, OnInit, AfterViewInit, ViewChild, TemplateRef, EventEmitter, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';
import { values } from 'lodash';
import { Observable } from 'rxjs';
import { DataService } from '../services/data.service';
import { FormService } from '../services/form.service';
import { DynamicFormComponent } from '../component/dynamic-form/dynamic-form.component';
import { DialogService } from '../services/dialog.service';
import { HttpClient } from '@angular/common/http';
// import { EventComponent } from '../component/event/event.component';
import { MatSidenav } from '@angular/material/sidenav';
@Component({
  selector: 'button-input',
  template: `
   
  <style>
  .icon{
 margin-bottom: 20px;

  }
  .example-sidenav {
  width: 50%;
  height:100%
}

  .label {
    font-weight: bold;
    color: #555;
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

  .example-container {
  width: 500px;
  height: 300px;
  border: 1px solid rgba(0, 0, 0, 0.5);
}

.example-sidenav-content {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
}

.example-sidenav {
  padding: 20px;
}
  .storedDate:hover .button-group {
    display: inline-block;
  } */
  .example-form {
  min-width: 150px;
  max-width: 500px;
  width: 100%;
}

.example-full-width {
  width: 100%;
}
  
  .drawer-container {
            background-color: transparent !important;
            position: inherit;
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
          background-color: #5C6BC0;
          color: white;
          height: 30px;
          width: 30px;
          font-size: 9px;
          line-height: 3;
          vertical-align: middle;
        " 
      >
        <mat-icon >add</mat-icon>
      </button>
    </div>  
    <mat-drawer-container class="drawer-container" [hasBackdrop]='true' autosize>
        <mat-drawer #drawer  position="end"  mode="side" style="width: 50%"> 
            <div *ngIf="open_drawer == true">
                <div style="text-align-last: start; padding: 10px;">
 
                <app-event [Data]="data"></app-event>
                    <!-- <mat-icon (click)="close()">keyboard_backspace</mat-icon> -->
                </div>
                
            </div>
        </mat-drawer>
        </mat-drawer-container>
 
<!--  opened="true" -->

 
        
  <!-- </mat-drawer-content> -->
<!-- </mat-drawer-container>

   

<ng-template  #editViewPopup let-data>
<nestedform (onClose)="close($event)" [formName]="formName" [model]="data" ></nestedform>
</ng-template>


<div *ngFor="let field of storedDate ; let i=index " class="list-item" (mouseenter)="toggleButtons(i, true)" (mouseleave)="toggleButtons(i, false)" >
<div class="storedDate">
<div class="name-row">
<span class="bullet-point">&#8226;</span> 
<span style="justify-content: center;">
{{ field.role_name }} {{ field.team_name }}  {{field.employee_id}}  -->
<!-- {{field.team_name}} -->
<!-- <mat-icon style="padding-top: 3px;" *ngIf="field.showButtons" (click)="deleteItem(i)">delete</mat-icon>
  <mat-icon (click)="editItem(field)" style="padding-top: 3px;" *ngIf="field.showButtons">edit</mat-icon>
</span>
</div>
<div>





</div> -->
<!-- <div class="contact-row">
<span class="contact">{{ field.emailid }}, {{ field.mobilenumber }}</span> -->
<!-- </div> -->
<!-- </div>
</div> --> 
  `

})


export class ButtonInput extends FieldType<any> implements OnInit {


  data:any={}


  pageHeading: any

  collectionName: any
  showFiller = false;
  mode: any
  label: any
  formName: any
  public fields!: FormlyFieldConfig[]
  config: any
  @ViewChild("drawer") drawer!: MatSidenav;
  open_drawer: boolean = false
  onClose = new EventEmitter<any>();

  @ViewChild("editViewPopup", { static: true }) editViewPopup!: TemplateRef<any>;
  storedDate: any;



  constructor(
    private dialogService: DialogService,
    private httpclient: HttpClient,
    private dataservice: DataService
  ) {

    super()
  }



  ngOnInit(): void {
    // localStorage.removeItem('projectmembers')
    // this.storedDate = this.model[this.field.key]

    // if(this.model.isEdit==true){

    //   localStorage.setItem('projectmembers',JSON.stringify(this.storedDate))

    // }

    this.label = this.field.props?.label
    this.formName = this.field.props?.attributes


  }



  ngOnDestroy() {
    console.log("Component will be destroyed");
  }
  close_icon() {
    this.dialogService.closeModal()
  }



  toggleButtons(index: number, show: boolean): void {
    this.storedDate[index].showButtons = show;
  }
  onAddButonClick() {


    this.open_drawer = true
    this.drawer.open();
  }

  close(data: any) {

    console.log(data);

    this.dialogService.closeModal()
    let getData: any = localStorage.getItem('projectmembers')
    this.storedDate = JSON.parse(getData)

    this.field.formControl.setValue(this.storedDate)


  }
  deleteItem(index: number): void {
    this.storedDate.splice(index, 1);
    localStorage.setItem('projectmembers', JSON.stringify(this.storedDate));

  }
  editItem(item: any) {
    debugger

    item.isEdit = true
    this.dialogService.openDialog(this.editViewPopup, "40%", null, item);

  }



}