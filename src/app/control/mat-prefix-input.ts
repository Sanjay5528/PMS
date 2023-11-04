
import { Component, OnInit} from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldType} from '@ngx-formly/core';
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
  <mat-form-field>
   <span matPrefix>{{prefix}}</span>
   <input (change)="onselect($event)" matInput placeholder={{this.field.props.placeholder}}  [formControl]="FormControl"     
   [formlyAttributes]="field"  >
</mat-form-field>
  `,

})


export class MatPrefixInput extends FieldType<any> implements OnInit {
  opt: any
  //default prop setting
  valueProp :any
  labelProp :any
  onValueChangeUpdate: any
  label: any
  dropdownList = []
  currentField:any
  prefix:any

  constructor(private dataService: DataService) {
    super()
  }


  public get FormControl() {
    return this.formControl as FormControl;
    
  }

 

  ngOnInit(): void {
    this.label = this.field.props?.label
    this.opt = this.field.props || {};
    this.currentField = this.field
    this.onValueChangeUpdate = this.opt.onValueChangeUpdate;


  

   
 
      
      if(this.currentField.parentKey!= "") {
        
        (this.field.hooks as any).afterViewInit = (f:any) => {
          debugger
            const parentControl = this.form.get(this.currentField.parentKey)//this.opt.parent_key);
            parentControl?.valueChanges.subscribe((val:any) =>{
                debugger
              let selectedOption 
              selectedOption=this.field.parentKey.split(".").reduce((o:any, i:any) =>
              o[i], this.model
             );
             if( selectedOption!=undefined){
                this.dataService.getDataById(this.field.ParentCollectionName,selectedOption).subscribe((res: any) => {
                    if(res.data!=null){
                        let data=res.data[0]
                       this.prefix=data[ this.opt.attribute.key]
                      }
               
              })
             }
            })
           
          }
       }
         
        
     }
  
     onselect(event:any){
         let data=this.prefix.concat(event.target.value)
        this.formControl.setValue(data)
     }



}


