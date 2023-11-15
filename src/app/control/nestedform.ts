import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, SimpleChange, SimpleChanges, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { DialogService } from 'src/app/services/dialog.service';
import { FormService } from 'src/app/services/form.service';
import { DatatableComponent } from '../component/datatable/datatable.component';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { isEmpty } from 'lodash';


@Component({
  selector: 'nestedform',
  template: `<mat-card style="width: 98%; margin: auto">
  <div style="text-align-last: end" *ngIf="config.editMode == 'popup'">
    <mat-icon (click)="cancel()">close</mat-icon>
  </div>
  <mat-card-header style="flex: 1 1 auto;">
    <div  style="width: 100%">
      <h2 style="text-align: center;" class="page-title">{{ pageHeading }} - {{ formAction }}</h2>
    </div>
  </mat-card-header>

  <mat-card-content style="padding-top: 10px">
    <div>
      <form [formGroup]="form" *ngIf="config">
        <formly-form
          [model]="model"
          [fields]="fields"
          [form]="form"
          [options]="options"
        >
        </formly-form>
      </form>
    </div>
  </mat-card-content>
  <mat-card-actions>
    <div style="text-align-last: end; width: 100%">
      <button
        style="margin: 5px"
        mat-button
        (click)="cancel()"
        *ngIf="config.onCancelRoute"
      >
        Cancel
      </button>
      <button
        style="margin: 5px"
        mat-button
        (click)="resetBtn('reset')"
        *ngIf="!this.id"
      >
        Reset
      </button>
      <button
        style="margin: 5px;  background:rgb(59,146,155)"
        mat-raised-button
        color="warn"
        (click)="frmSubmit(this.config)"
      >
        {{ butText }}
      </button>
    </div>
  </mat-card-actions>
</mat-card>
<div *ngIf="isDataError">
  <mat-icon color="warn">error</mat-icon>
  <span>Given ID is not valid</span>
</div>
<style></style>
`,

})
export class Nestedform {
  form = new FormGroup({});
  pageHeading: any
  formAction = 'Add'
  butText = 'Save'
  id: any
  keyField: any
  isDataError = false
  config: any = {}
  authdata: any
  options: any = {};
  fields!: FormlyFieldConfig[]
  paramsSubscription !: Subscription;
  @Input('formName') formName: any
  @Input('mode') mode: string = "page"
  @Input('model') model: any = {}
  @Output('onClose') onClose = new EventEmitter<any>();
  selectedModel: any = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formService: FormService,

    private dialogService: DialogService
  ) {

  }

  storeData: any;
  flag:any
  ngOnInit() {
    // this.initLoad()   
    let getdata: any = localStorage.getItem('projectmembers')
    this.storeData = JSON.parse(getdata)
    this.formAction = this.model.id ? 'Edit' : 'Add'
    this.butText = this.model.id ? 'Update' : 'Save';

  }

  ngOnChanges(changes: SimpleChanges) {
        if (this.formName && this.model) {
      this.id = this.model['_id']
      this.initLoad()
      
      this.formAction = this.model.id ? 'Edit' : 'Add'
    this.butText = this.model.id ? 'Update' : 'Save';
    }
   
  }

  
  frmSubmit(data: any) {
    debugger
    if(!this.form.valid){
      alert("Missing Requrid Field")
      this.form.markAllAsTouched();
      return
    }

let value:any=this.form.value
    let getdata: any = localStorage.getItem('projectmembers');
    let existingData: any[] = JSON.parse(getdata) || [];
    if (value && !isEmpty(existingData) && this.model.isEdit==undefined ) {
      const roleIndex = existingData.findIndex(item=> item.role_id == value.role_id);
if(roleIndex!==-1){
  // this.dialogService.openSnackBar("This Role ID Aldready Exist","OK")
  alert(`This ${value.role_id} Role ID Aldready Exist`)
  return
}
console.log(existingData);
const exists = existingData.some(item => item.employee_id === value.employee_id && item.team_name === value.team_name);

// Basic check simple a person can play one role in on team
const samePresonWithSameTaskName = existingData.findIndex(item => {
  console.log(item.employee_id == value.employee_id && item.team_name == value.team_name,'final');
  
  item.employee_id == value.employee_id && item.team_name == value.team_name});
  
  console.log(samePresonWithSameTaskName);
  
  if(samePresonWithSameTaskName!==-1|| exists==true){
alert(`This Employee ${value.employee_id } With this Role Exist ${value.role_name} on ${value.team_name}` )
        // this.dialogService.openSnackBar(, "OK")
        return
      }

      const samePreson = existingData.findIndex(item => item.employee_id === value.employee_id &&item.role_name === value.role_name&&item.team_name === value.team_name);
      console.log(samePreson);
      
      if(samePreson!==-1){
alert(`This Employee ${value.employee_id } With this Role Exist ${value.role_name}` )
        // this.dialogService.openSnackBar(, "OK")
        return
      }
      // A primary contact already exists, display an error message or handle the case as desired
    }
    // if(this.model){
    //   Object.assign(data,{teamid:data.teamid})
    // }
    let pushData = [];
    if (this.formAction === "Add") {
      for (let item of existingData) {
        pushData.push(item);
      }
      pushData.push(value);
      localStorage.removeItem("projectmembers");

    } else if (this.formAction === "Edit") {
      let getdata: any = localStorage.getItem('projectmembers');
      let data: any[] = JSON.parse(getdata) || [];
      for (let item of data) {
        if (item.roleid !== value.roleid) {
          pushData.push(item);
        }
      }
      pushData.push(value);

      localStorage.removeItem("projectmembers");
    }
    localStorage.setItem('projectmembers', JSON.stringify(pushData));
    this.goBack()
  }

 async initLoad() {
     this.formService.LoadInitData(this)
    
  }

  goBack(data?: any) {
    this.onClose.emit()


  }

  resetBtn(data?: any) {
    this.model = {}
    this.formAction = this.model.id ? 'Edit' : 'Add'
    this.butText = this.model.id ? 'Update' : 'Save';

  }

  cancel() {
    this.dialogService.closeModal()
  }


}