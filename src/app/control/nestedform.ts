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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formService: FormService,
    
    private dialogService: DialogService
  ) {
   
  }
 storeData:any;
 
  ngOnInit() {
    this.initLoad()
    // let getdata:any =sessionStorage.getItem('point_of_contacts')
    // this.storeData =JSON.parse(getdata)
    
      
  }

  ngOnChanges(changes: SimpleChanges) {
    const currentItem: SimpleChange = changes['item'];
    if (this.formName && this.model) {
      this.id = this.model['_id']
      this.initLoad()
    }
  }

  frmSubmit(data: any) {
    
    
    let pushData = [];
    if (!this.form.valid) {
      this.dialogService.openSnackBar("Error in your data or missing mandatory fields", "OK")
      return;
    }

    if(this.config.split_data){
      // let length=this.model[this.config.split_data].length
      // let split_data:any= this.model[this.config?.split_column].slice(length);
      let data:any=this.form.value
      data[this.config.split_column]=this.model[this.config.split_data].concat(this.model[this.config.split_column]);
    }
    if (this.formAction === "Add") {
  
      // let getdata: any = sessionStorage.getItem('point_of_contacts');
      // let existingData: any[] = JSON.parse(getdata) || [];
  
  //     if (existingData.length >= 4) {
  //       this.dialogService.openSnackBar("Maximum 4 contacts only allowed to add", "OK")
  //       // Maximum limit reached, display an error message or handle the case as desired
  //       return;
  //     }
  //     const primaryContact = existingData.find(
  //       (item: any) => item[this.config.check_condition] === "Primary Contact"
  //     );
  //     const secondaryContact = existingData.find(
  //       (item: any) => item[this.config.check_condition] === "Secondary Contact"
  //     );
  
  //     if (this.model[this.config.check_condition] === "Primary Contact" && primaryContact) {
  //       this.dialogService.openSnackBar("Primary contact already exists", "OK")
  //       // A primary contact already exists, display an error message or handle the case as desired
  //       return;
  //     }
  //     if (this.model[this.config.check_condition] === "Secondary Contact" && secondaryContact) {
  //       this.dialogService.openSnackBar("Secondary contact already exists", "OK")
  //       // A primary contact already exists, display an error message or handle the case as desired
  //       return;
  //     }
  
  //     for (let item of existingData) {
  //       pushData.push(item);
  //     }
  //     pushData.push(this.form.value);
  //   }  else if (this.formAction === "Edit") {
  //   let getdata: any = sessionStorage.getItem('point_of_contacts');
  //   let data: any[] = JSON.parse(getdata) || [];

  //   // Add existing data excluding the matching item
  //   for (let item of data) {
  //     if (item[this.config.keyField] !== this.model['this.config.keyField']) {
  //       pushData.push(item);
  //     }
  //     var clone_data:any=data.filter((a:any)=>{
  //      return  a[this.config.keyField]!=this.model[this.config.keyField]
  //     })
  
  //     let new_data:any=this.form.value
  //     new_data=Object.assign(this.form.value, {"contact_type":this.model['contact_type']})
  //  clone_data.push(new_data)
  //     console.log(clone_data)
  
    }

  //   // Add the updated form value
  //   pushData=clone_data

  //   sessionStorage.removeItem("point_of_contacts");
  // }
  //     sessionStorage.setItem('point_of_contacts',JSON.stringify(pushData));
  //     console.log(sessionStorage)
  //     this.goBack()
  }

  initLoad() {
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