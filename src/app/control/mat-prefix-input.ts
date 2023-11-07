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
    </mat-form-field>
  `,
})
export class MatPrefixInput extends FieldType<any> implements OnInit {
  opt: any;
  //default prop setting
  // valueProp: any;
  // labelProp: any;
  // onValueChangeUpdate: any;
  label: any;
  // dropdownList = [];
  currentField: any;
  prefix: any;
  // country_code:any
  parent_field:any
//   data:any
//   api!:Subscription
//   test:any
// test2:any
// private apiCalled = false;
  constructor(private dataService: DataService,) {
    super();
  }

  public get FormControl() {
    return this.formControl as FormControl;
  }

  ngOnInit(): void {
    this.label = this.field.props?.label;
    this.opt = this.field.props || {};
    this.currentField = this.field;
    // this.onValueChangeUpdate = this.opt.onValueChangeUpdate;
    
    if (this.currentField.parentKey != "") {
      if(this?.opt?.type=="Simple"){
        // console.log(this.opt);
        this.prefix=this.model[this.currentField.parentKey]+"-"      
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

    if(this.field.getdata=='local'){ 
    }
  }

  onselect(event: any) {
    
    // this.model["calling_code"]=this.prefix
   
  }

}

