
import { Component, OnInit } from '@angular/core';
import { FormlyFieldInput } from '@ngx-formly/material/input';
import { DataService } from '../services/data.service';
import { v4 as uuid_v4 } from "uuid";
import * as moment from 'moment';
import { FormControl } from '@angular/forms';
import { FieldType } from '@ngx-formly/core';
import { isEmpty } from 'lodash';



@Component({
 selector: 'formly-field-input',
 template: `
   
    
  <mat-form-field class="example-full-width">
    <mat-label>{{to.label}}</mat-label>
    <input
      matInput
      #input
      [id]="id"
      [type]="to.type || 'text'"
      [readonly]="to.readonly"
      [required]="to.required"
      [formControl]="formControl"
      [formlyAttributes]="field"
      [pattern]="this.opt.pattern"

      [tabIndex]="to.tabindex"        
      [placeholder]="to.placeholder"     
      (blur)="frmSubmit($event,field)"
      (input)="inputEvent(input, $event)"
      (focus)="onFocus($event)"
    />     <mat-error *ngIf="this?.formControl?.errors?.required">This {{ this.field.props?.label }} is required</mat-error>
      <mat-error *ngIf="this?.formControl?.errors?.pattern">This {{ this.field.props?.label }} is Pattern Not Match</mat-error>
      <mat-error *ngIf="!this?.formControl?.errors?.uniqueItems&&this.value&&!this?.formControl?.errors?.pattern">This {{ this.field.props?.label }}  Already Present </mat-error>

</mat-form-field>

 `,
})

// (input)="inputEvent(input, $event)"   // this used for upper case input but last letter is working but it in small letter ex LLLl
// (keydown.enter)="frmSubmit($event,field)" // this used for enter button functionality
// (keydown.tab)="frmSubmit($event,field)"
export class FormlyFieldInputTextEnterKey extends FieldType<any> implements OnInit {

    public get FormControl() {
        return this.formControl as FormControl;
        
      }
      sameinput!:boolean
  constructor(private dataService:DataService){
    super();
  }
  opt:any
  ngOnInit() {    
    this.opt=this.field.props
    console.log(this);
    
  }

  frmSubmit(event:any,field:any) {   
    if (!field.templateOptions.onEnterSubmit) {
      try {
        let ctrl = event.currentTarget.form.elements[event.currentTarget.tabIndex+1]
        ctrl.focus()
        ctrl.click()
      } catch {

      }
      event.preventDefault()
      event.stopPropagation()
    }
     
    if(this.value!=null){
      this.frmLeave(this.value,field)  
    }
    
    }

  frmLeave(value:any, field:any) {
    if(field.templateOptions.searchableField) {
    //   let bookid= ''
    //   var filterQuery = [{
    //     clause: "$and",
    //     conditions: [
    //      {column: 'book_id', operator: "$eq", value:bookid}, // for book id
    //      {column: field.key, operator: "$eq", value:value} // same field in template option
    //     //  {column: field.templateOptions.searchColumnName, operator: "$eq", value:value}, // diff field from template option
    //    ]
    //  }]
    //  const keys = field.key
    // let query:any={}
    // if(this.opt.multifilter==true){ 
        let query:any={        start:0,end:1000,filter:[]              }
        this?.opt?.multifilter_condition?.conditions.map((res:any)=>{
     
          if(this?.opt?.multifiltertype=="local"){
           let value = sessionStorage.getItem(this.opt.filtervalueKey)
            res.value=value
          }else if(this.opt.valueType=="Dynamic"){
            res.value=this.value
          }else{
            res.value=this.model[this.opt.filtervalueKey]

          }
        
        })
        query.filter.push(this.opt.multifilter_condition)
    //   }
     this.dataService.getDataByFilter(field.templateOptions.searchCollectionName,query).subscribe(
       (result:any) => {
        //  var list = result.data || [];
        console.log(result.data[0].response);
        
        //  field.parent.formControl.value[field.templateOptions.searchResult] = list;
        if(!isEmpty(result.data[0].response)){
          
          field.formControl.setErrors({uniqueItems:false}) //we are setting the error manually
        };
        //  field.parent.formControl.get(field.templateOptions.columnName)._fields[0].templateOptions.options = list
       },
       error => {
           //Show the error popup
           console.error('There was an error!', error);
       }
     );
    }
  }
  value:any
  inputEvent(input: any, event: any) {
  input.value = event.target.value.toUpperCase();
    this.value=input.value
  }
  onFocus(event:any) {
    setTimeout(()=>{
      event.target.select()
    }, 50);
}
}

// Json EXample
// {
//   "type": "input-text-enterkey",
//   "key": "_id",
//   "className": "flex-1",
//   "templateOptions": {
//     "label": "Title Id",
//     "placeholder": "Title Id",
//     "maxLength": 15,
//     "required": true,
//     "searchableField": true,  // used to for checking it is unique name
//     "searchCollectionName": "book"						 // search in collection Name
//   } 
// }







