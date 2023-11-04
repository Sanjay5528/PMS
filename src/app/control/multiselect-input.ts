
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';
import { DataService } from '../services/data.service';

import { DialogService } from '../services/dialog.service';

@Component({
  selector: 'multiselect-input',
  template: `
  <style>
  .border{
    border: 1px solid rgb(158,158,158) !important;
    margin-bottom: 37px;
    border-radius: 4px;
    height: 50px;
    text-align: center;
  }
  </style>
  <div>
  <mat-label>{{field.props!['label']}}</mat-label>
  
  <ng-select
  [items]="dropdownList"
  [clearSearchOnAdd]="true"
  [multiple]="true"
  [bindLabel]="labelProp"
  [closeOnSelect]="true"
  [bindValue]="valueProp"
  [formControl]="FormControl"     
  [formlyAttributes]="field"
  >
  <ng-template ng-option-tmp let-item="item" let-item$="item$" let-index="index">
    <input id="item-{{index}}" type="checkbox" [ngModel]="item$.selected" [ngModelOptions]="{standalone: true}"/>
    <span [innerHTML]="item[this.labelProp]"></span>
</ng-template> 
</ng-select>
</div>
  `,

})


export class MultiSelectInput extends FieldType<any> implements OnInit {
  opt: any
  //default prop setting
  valueProp :any
  labelProp :any
  onValueChangeUpdate: any
  label: any
  dropdownList = []
  currentField:any

  constructor(private dataService: DataService,
    private dialogService:DialogService) {
    super()
  }


  public get FormControl() {
    return this.formControl as FormControl;
    
  }

 

  ngOnInit(): void {
    this.label = this.field.props?.label
    this.opt = this.field.props || {};
    this.labelProp = this.opt.labelProp
    this.valueProp = this.opt.valueProp
    this.currentField = this.field
    this.onValueChangeUpdate = this.opt.onValueChangeUpdate;


    // if (this.opt.optionsDataSource.collectionName) {
    //   let name = this.opt.optionsDataSource.collectionName
    //   this.dataService.getparentdata(name).subscribe((res: any) => {
    //     this.dropdownList = res.data
    //     this.dataService.buildOptions(res, this.opt);
    //   });
    // }

   
 
      
      if(this.currentField.parentKey!= "") {
        
        (this.field.hooks as any).afterViewInit = (f:any) => {
          
            const parentControl = this.form.get(this.currentField.parentKey)//this.opt.parent_key);
            parentControl?.valueChanges.subscribe((val:any) =>{
              let selectedOption = this.model[this.currentField.parentKey]
            //  if( selectedOption!=undefined){
            //     this.dataService.getparentdataById(this.field.ParentcollectionName,selectedOption).subscribe((res: any) => {
            //     this.dropdownList = res
            //     this.dataService.buildOptions(res, this.opt);
            //   })
            //  }
            })
           
          }
       }
         
        
     }

    
 



}
