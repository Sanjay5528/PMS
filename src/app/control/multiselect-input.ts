
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';
import { DataService } from '../services/data.service';

import { DialogService } from '../services/dialog.service';

@Component({
  selector: 'multiselect-input',
  template: `
  <style>

  </style>
  <div>
<!--   
  <ng-select
  [items]="dropdownList"
  [clearSearchOnAdd]="true"
  [multiple]="true"
  [placeholder]="field.props!['label']"
  [bindLabel]="labelProp"
  [closeOnSelect]="true"
  [bindValue]="valueProp"
  [formControl]="FormControl"  
  appearance="outline"
  [formlyAttributes]="field"            [closeOnSelect]="false"

  >
  <ng-template ng-option-tmp let-item="item" let-item$="item$" let-index="index">
    <input id="item-{{index}}" type="checkbox" [ngModel]="item$.selected" [ngModelOptions]="{standalone: true}"/>
    <span [innerHTML]="item[this.labelProp]"></span>
</ng-template> 
</ng-select> -->
<!-- <div  > -->
  <ng-select  
  [dropdownPosition]="'bottom'"
  [placeholder]="field.props!['label']"
  [items]="dropdownList"
  [clearSearchOnAdd]="true"
  [multiple]="true"
  [bindLabel]="labelProp"
  [closeOnSelect]="false"
  [bindValue]="valueProp"
  [formControl]="FormControl"     
  [formlyAttributes]="field"
  appearance="outline"
  >
  <ng-template ng-option-tmp let-item="item" let-item$="item$" let-index="index" style="height: 25px;">
    <input id="item-{{index}}" type="checkbox" [ngModel]="item$.selected" [ngModelOptions]="{standalone: true}"/>
    <span style="margin-left:5px" [innerHTML]="item[this.labelProp]"></span>
</ng-template> 

<ng-template ng-multi-label-tmp let-items="items" let-clear="clear">
  <div class="ng-value" *ngFor="let item of items | slice:0:2">
    <span class="ng-value-label"> {{$any(item)[this.labelProp]}}</span>
    <span class="ng-value-icon right" (click)="clear(item)"  aria-hidden="true">×</span>

  </div>
  <div class="ng-value" *ngIf="items.length > 2">
    <span class="ng-value-label">{{items.length - 2}} more...</span>
  </div>
</ng-template>
</ng-select>
<!-- </div> -->
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


    if (this.opt.optionsDataSource.collectionName) {
      let name = this.opt.optionsDataSource.collectionName
      let query:any={}
      if(this.opt.multifilter==true){ 
        query ={
        start:0,end:1000,filter:[]
              }
        this?.opt?.multifilter_condition?.conditions.map((res:any)=>{
     
          if(this?.opt?.multifiltertype=="local"){
           let value = sessionStorage.getItem(this.opt.filtervalueKey)
            res.value=value
          }else{
            res.value=this.model[this.opt.filtervalueKey]
          }
        
        })
        query.filter.push(this.opt.multifilter_condition)
      }
      this.dataService.getDataByFilter(name,query).subscribe((res: any) => {
        let values:any=res.data[0].response
        console.log(res.data);
        
        if(this.opt.attributes.type=="default"){
          this.field.props.options = values.map((insideValue: any) => {
            return { label: insideValue[this.opt.attributes.Takenlabelkey], value: insideValue[this.opt.attributes.Takenvaluekey] };
        });
        this.dropdownList = this.field.props.options 
        }else{

          this.dropdownList = res.data
        }


      });
    }

   
 
      
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
