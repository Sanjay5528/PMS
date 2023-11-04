
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';
import { values } from 'lodash';
import { Observable } from 'rxjs';
import { DataService } from '../services/data.service';
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
  <mat-label>{{field.props!['label']}}</mat-label>
  
  <ng-select
  [items]="dropdownList"
  [clearSearchOnAdd]="true"
  [multiple]="true"
  [bindLabel]="labelProp"
  [closeOnSelect]="true"
  [bindValue]="valueProp"
   
  (click)="my()"

  [formControl]="FormControl"     
  [formlyAttributes]="field"
  >
  
  <ng-template ng-option-tmp let-item="item" let-item$="item$" let-index="index">
    <input id="item-{{index}}" type="checkbox" [ngModel]="item$.selected" [ngModelOptions]="{standalone: true}"/>
    <span [innerHTML]="item[this.labelProp]"></span>
</ng-template> 

</ng-select>
<mat-error *ngIf="FormControl.hasError('required') && FormControl.touched">
  {{ this.field.props.label }} is required
</mat-error>
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
filter:any[]=[]
  constructor(private dataService: DataService) {
    super()
  }
my(){
  // console.log(res,'res');
console.log(this.field.formControl.value);
let data =this.field.formControl.value
let val:any[]=[]  
// data.forEach((element:any) => {
// const obj:any = this.filter.filter((arr:any)=>{
//   console.log(arr.firstname);
//       console.log(element);
      
//   arr.firstname==element
//     })
//     val.push(obj)
//   });
//   console.log(val);
// const val: any[] = [];
console.log(this.valueProp);

data.forEach((element: any) => {
  const matchedObjects: any[] = this.filter.filter((arr: any) => {    
    return arr.firstname === element; 
  });
  matchedObjects.forEach((matchedObj: any) => {
    val.push({
      firstname: matchedObj.firstname,
      employeeid: matchedObj.employeeid,
    });

  });
});
// this.field.formControl.setValue(val)
// this.field.formControl.addControl()
console.log(val);
console.log(this.field.form.value);
this.field.form['data']=val

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
    console.log(this.valueProp);
    console.log(this.labelProp);
    console.log(this.opt);
    
    this.onValueChangeUpdate = this.opt.onValueChangeUpdate;

    if (this.opt.optionsDataSource.collectionName) {
      let name = this.opt.optionsDataSource.collectionName
      this.dataService.getData(name).subscribe((res: any) => {
        this.dropdownList = res.data
        console.log(res.data);
let data =res.data
let arr:any [] =[]
data.forEach((element:any) => {
  let val:any={}
  val.employeeid=element.employeeid
  val.firstname=element.firstname
arr.push(val)
});        console.log(arr);
this.filter=arr
        this.dataService.buildOptions(res, this.opt);
      });
    }

   
 
      
      if(this.currentField.parentKey!= "") {
        
        (this.field.hooks as any).afterViewInit = (f:any) => {
          
            const parentControl = this.form.get(this.currentField.parentKey)//this.opt.parent_key);
            parentControl?.valueChanges.subscribe((val:any) =>{
              let selectedOption = this.model[this.currentField.parentKey]
             if( selectedOption!=undefined){
                this.dataService.getDataById(this.field.ParentcollectionName,selectedOption).subscribe((res: any) => {
                this.dropdownList = res
                this.dataService.buildOptions(res, this.opt);
              })
             }
            })
           
          }
       }
         
        
     }
  




}


