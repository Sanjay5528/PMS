

import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import * as moment from 'moment';

@Component({
  selector: 'app-complex-form',
  template: `

<style>
  .form-array-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
    grid-gap: 20px;
    padding: 10px;
  }

  fieldset {
    display: flex;
    flex-direction: column;
    border: 1px solid #ccc;
    padding: 10px;
  }
</style>

<div class="form-array-container">
  <div *ngFor="let field of field.fieldGroup;let i = index" >
<div style="height: 20px;    margin-bottom: 10px;">
<mat-checkbox *ngIf="(this.opt.checkboxIndex-1)==i"

      [(ngModel)]="checkboxValue"
        (click)="patchData()"
      >
      <p *ngIf="(this.opt.checkboxIndex-1)==i"> {{  this.opt.label }}</p>
      </mat-checkbox>
      
  
</div>
    <fieldset>

      <legend style="margin-left: 23px;">
      <b>{{ field.props?.label }}</b>
    
    </legend>
      <div *ngFor="let subField of field.fieldGroup">
        <formly-field [field]="subField"></formly-field>
      </div>
    </fieldset>
  </div>
</div>

  `,
})
export class FormlyFieldset extends FieldType {
  constructor(){
    super();
    console.log(this);
    
  }
  opt: any;
  label: any;
  checkboxValue = false;
  ngOnInit(): void {
    this.opt = this.field || {};
    if(this.model.isEdit==true) {
      let value: any = this.form.value;
      let valueKey: any = this.opt.patch;
      let patchKey: any = this.opt.patch_value;
      this.checkboxValue=true;
      const areValuesEqual = this.areObjectsEqual(value[valueKey], value[patchKey]);
  console.log("Are values equal?", areValuesEqual);
      for (const key in value[patchKey]) {
        // if (Object.prototype.hasOwnProperty.call(value[patchKey], key)) {
        //   const element = object[key];
          
        // }
      
        if(value[patchKey][key]!==value[valueKey][key]){
this.checkboxValue=false
        }

      }
      
    }
  }

  patchData() {
    let value: any = this.form.value;
    console.log(value);
    
    let valueKey: any = this.opt.patch;
    let patchKey: any = this.opt.patch_value;
    if(this.checkboxValue){
      let vals: any =this.replace(value[patchKey]);
      console.log(vals);
      
      this.form.get(valueKey)?.setValue(vals);
    }else{
      let vals: any =this.empty(value[patchKey]);
      this.form.get(valueKey)?.setValue(vals);
    }
   
  }

  replace(obj: any) {
    const result: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = obj[key] === undefined ? '' : obj[key];
      }
    }
    return result;
  }
  
  empty(obj: any) {
    const result: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = '' 
      }
    }
    return result;
  }
  
  areObjectsEqual(obj1: any, obj2: any): boolean {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

}
// {
//   "type":"fieldset",

//       "props": {
//           "label": "Primary Contact"
//       },
//       "fieldGroup": [     
        
//               {
//                   "type": "input",
//                   "key": "primaryaddr",
//                   "className": "flex-6",
//                   "props": {
//                       "label": "Address",
//                       "placeholder": "Address",
//                       "pattern": "^[a-zA-Z0-9&>/;,:-_/]+( [a-zA-Z0-9&>/;,:-_/!@-]+)*$",
//                       "required": true
//                   }
//               },
//               {
//                   "type": "select-input",
//                   "key": "pricountry_name",
//                   "className": "flex-6",
//                   "props": {
//                       "label": "Country",
//                       "placeholder": "Country",
//                       "labelPropTemplate": " {{country_name}}",
//                       "multifilter":true,
//                       "optionsDataSource": {
//                           "collectionName": "country"
//                       },
//                       "labelProp": "country_name",
//                       "valueProp": "country_name",
//                       "required": true
//                   }
//               },
//               {
//                   "type": "select-input",
//                   "key": "pristates",
//                   "className": "flex-6",
//                   "parentKey": "pricountry_name",
//                   "parentCollectionName": "country",
//                   "props": {
//                       "label": "State",
//                       "labelPropTemplate": "{{states}}",
//                       "Properties": {
//                         "formVAlueChange":true
//                       },
//                       "multifiltertype":"Simple",
//                       "multifilterFieldName":"states",
//                       "multifilter_condition": {
//                         "clause": "AND",
//                         "conditions": [
//                           {
//                                 "column": "country_name",
//                             "operator": "EQUALS",
//                             "type": "string",
//                             "value": ""
//                           }
//                         ]
//                       },
                    
//                       "labelProp": "label",
//                       "valueProp": "value",
//                       "required": true
                        
//                   }
//               },
//               {
//                   "type": "input",
//                   "key": "primarycity",
//                   "className": "flex-6",
//                   "props": {
//                       "label": "City",
//                       "placeholder": "City",
//                       "pattern": "^[a-zA-Z0-9&>/;,:-_/]+( [a-zA-Z0-9&>/;,:-_/!@-]+)*$",
//                       "required": true
//                   }
//               },
//               {
//                   "type": "input",
//                   "key": "primarypincode",
//                   "className": "flex-6",
//                   "props": {
//                       "label": "Postal code",
//                       "placeholder": "Postal code",
//                       "pattern": "^[1-9][0-9]{5}$",
//                       "maxLength": 6,
//                       "required": true
//                   }
//               }
//           ]
      


// }