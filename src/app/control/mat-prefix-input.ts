import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { FieldType } from "@ngx-formly/core";
import { Subscription } from "rxjs";
import { DataService } from "../services/data.service";
import { isEmpty } from "lodash";
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
      <input *ngIf="opt"
        (change)="onselect($event)"
        matInput 
        [pattern]="this.opt.pattern ? this.opt.pattern : null"
  [required]="this.opt.required ? this.opt.required : false"
  [maxlength]="this.opt.maxLength ? this.opt.maxLength :null "
        placeholder="{{ this.field.props.placeholder }}"
        [formControl]="FormControl"
        [formlyAttributes]="field"
      />                
      <mat-error *ngIf="this.FormControl.touched && this?.formControl?.errors?.required">This {{ this.field.props?.label }} is required</mat-error>
      <mat-error *ngIf="this?.formControl?.errors?.pattern">This {{ this.field.props?.label }} is Pattern Not Match</mat-error>
      <mat-error *ngIf="this?.formControl?.errors?.uniqueItems==false">This {{ this.field.props?.label }}  Already Present </mat-error>
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
  constructor(private dataService:DataService) {
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
          this.onselect('')
        });
      };
    }

   console.log(this.formControl);
   
  }
CurrentVAlue:any
  onselect(event: any) {
    let data = event !=='' ? event.target.value : this.CurrentVAlue

    let pathcData:any=this.prefix+data
    console.log(this.prefix);
    this.CurrentVAlue=data
    // let value:any =  event.target.value
    if(this.field.props.searchableField) {
          let query:any={        start:0,end:1000,filter:[]              }
          this?.opt?.multifilter_condition?.conditions.map((res:any)=>{
       
            if(this?.opt?.multifiltertype=="local"){
             let value = sessionStorage.getItem(this.opt.filtervalueKey)
              res.value=value
            }else if(this.opt.valueType=="Dynamic"){
              res.value=pathcData
            }else{
              res.value=this.model[this.opt.filtervalueKey]
  
            }
          
          })
          query.filter.push(this.opt.multifilter_condition)
      //   }
       this.dataService.getDataByFilter(this.field.templateOptions.searchCollectionName,query).subscribe(
         (result:any) => {
          //  var list = result.data || [];
          console.log(result.data[0].response);
          
          //  field.parent.formControl.value[field.templateOptions.searchResult] = list;
          if(!isEmpty(result.data[0].response)){
            
            this.field.formControl.setErrors({uniqueItems:false}) //we are setting the error manually
          }else{

            this.field.formControl.setErrors({required:true}) //we are setting the error manually
            if(this.CurrentVAlue!==''){
              this.field.formControl.setErrors() 

            }

          }
         },
         error => {
             //Show the error popup
             console.error('There was an error!', error);
         }
       );
      }
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