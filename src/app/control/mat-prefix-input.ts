import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { FieldType } from "@ngx-formly/core";
import { Subscription } from "rxjs";
import { DataService } from "../services/data.service";
@Component({
  selector: "multiselect-input",
  template: `
    <style>
      .border {
        border: 1px solid rgb(158, 158, 158) !important;
        margin-bottom: 37px;
        border-radius: 4px;
        height: 50px;
        text-align: center;
      }
    </style>
    <mat-form-field>
      <span matPrefix>{{ prefix }}</span>
      <input
        (change)="onselect($event)"
        matInput
        placeholder="{{ this.field.props.placeholder }}"
        [formControl]="FormControl"
        [formlyAttributes]="field"
      />                
      <mat-error *ngIf="this?.formControl?.errors?.required">This {{ this.field.props?.label }} is required</mat-error>
      <mat-error *ngIf="this?.formControl?.errors?.pattern">This {{ this.field.props?.label }} is Pattern Not Match</mat-error>

      <!-- errors.pattern -->
    </mat-form-field>
  `,
})
export class MatPrefixInput extends FieldType<any> implements OnInit {
  opt: any;
  label: any;
  currentField: any;
  prefix: any;
  parent_field:any
  constructor() {
    super();
  }

  public get FormControl() {
    return this.formControl as FormControl;
  }

  ngOnInit(): void {
    this.label = this.field.props?.label;
    this.opt = this.field.props || {};
    this.currentField = this.field;    
    if (this.currentField.parentKey != "") {
      if(this?.opt?.type=="Simple"){
        this.prefix=this.model[this.currentField.parentKey]+"-" ; 
        this.model["ChangeKey"]=this.currentField.parentKey; //todo remove
      } if(this?.opt?.type=="local"){
        this.prefix=sessionStorage.getItem(this.currentField.parentKey)+"-" ; 
        // this.model["ChangeKey"]=this.currentField.parentKey; //todo remove
      }
      // (this.field.hooks as any).afterViewInit = (f: any) => {
      //   console.log(f);
      if(this?.opt?.type=="Linked"){
        const parentControl:any = this.form.get(this.currentField.parentKey); 
        console.log(parentControl);
        // ! To Avaiod 1 Time
        this.prefix=this.model[this.currentField.parentKey]+"-"      
        // After than we can get here
        parentControl.valueChanges.subscribe((val: any) => {   
                 console.log(val);
                 
            this.prefix=val+"-"    
        
        });
      };
    }

   console.log(this.formControl);
   
  }

  onselect(event: any) {
    this.formControl.setValue(event.target.value)
    console.log(this.formControl);
    
    // this.model[this.currentField.parentKey]=this.prefix+event.target.value
   
  }

}
// !outer the form 
// "Change_id": true,
// "changekeyfield":"project_id",
// ! inside the form
// {
//   "type": "matprefix-input",
//   "parentKey": "client_name", // ! it used to take the dynamic parent key
//   "className": "flex-6",
//   "props": {
//     "label": "Project ID",
    // "type": "Linked", //! Linked <==> dynamic change  // Simple <==> Static 
//     "placeholder": "Project ID",
//     "required": true,
//     "maxLength": 10,
//     "pattern": "^[A-Z][a-zA-Z]{1,}$"
//   },
//   "hideExpression": "model.isEdit || !model.client_name"
// }