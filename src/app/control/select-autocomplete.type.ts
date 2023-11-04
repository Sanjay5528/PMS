import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldType} from '@ngx-formly/material/form-field';
import { Observable } from 'rxjs';
import { DataService } from '../services/data.service';

@Component({
  selector: 'formly-field-select-autocomplete',
  template: `
     <input type="text"
           matInput
           #autoCompleteInput
           [formControl]="FormControl"
           [formlyAttributes]="field"
           [matAutocomplete]="auto" />
    <mat-autocomplete #auto="matAutocomplete" (optionSelected)="selectionChange(this.field,autoCompleteInput)">
      <mat-option *ngFor="let op of filteredOptions" [value]="op[this.valueProp]">
        {{ op[this.labelProp] }}
      </mat-option>
    </mat-autocomplete>
  `,
})
export class FormlyFieldSelectAutocomplete extends FieldType<any> implements OnInit {
  constructor(private dataService:DataService){
    super()
  }
 filteredOptions: any[]=[];
 opt:any
 //default prop setting
data:any={}
 valueProp = "_id"
 labelProp = "name"
 onValueChangeUpdate :any
 public get FormControl() {
  return this.formControl as FormControl;
}
  ngOnInit(): void {
    this.opt = this.field.props || {};
    if (!this.to.optionsDataSource || this.to.options) {
      return;
    }
    this.labelProp = this.opt.labelProp
    this.valueProp = this.opt.valueProp
    this.onValueChangeUpdate = this.opt.onValueChangeUpdate
    // if (this.to.optionsDataSource.methodName) {
    //   this.data=this?.to
    //  (this.dataService[this.data.optionsDataSource.methodName](this.dataService.getDataByPath(this.field.parent, this.to.optionsDataSource.param)) as Observable<any>)
    //   .subscribe((res:any)=>{
    //      this.dataService.buildOptions(res,this.opt)
    //   })
    // } else
     if (this.to.optionsDataSource.collectionName) {
     this.dataService.getDataByFilter(this.to.optionsDataSource.collectionName,this.to.optionsDataSource.filter)
     .subscribe((res :any)=>{
         this.dataService.buildOptions(res.data[0].response,this.opt)
     })
    }
    this.formControl.valueChanges.subscribe((val:any)=>{
        const filterValue = val.toLowerCase();
        this.filteredOptions = this.opt.options.filter((option:any) => option.name.toLowerCase().includes(filterValue));
    })
  }

  selectionChange(ctrl:any,inputObj:any){
     let obj = this.filteredOptions.find(o=>o[this.valueProp] == ctrl.formControl.value)
     if (obj) inputObj.value = obj[this.labelProp]
     if (this.onValueChangeUpdate) {
      ctrl.formControl.parent.controls[this.onValueChangeUpdate.key].setValue(obj[this.onValueChangeUpdate.labelProp])
      //ctrl.model[this.onValueChangeUpdate.key] = obj[this.onValueChangeUpdate.labelProp]
     }
  }
}
