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
  valueProp: any;
  labelProp: any;
  onValueChangeUpdate: any;
  label: any;
  dropdownList = [];
  currentField: any;
  prefix: any;
  country_code:any
  parent_field:any
  data:any
  api!:Subscription
  test:any
test2:any
private apiCalled = false;
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
    this.onValueChangeUpdate = this.opt.onValueChangeUpdate;
    this.parent_field=this.field?.props.parent_field
    console.log(this.parent_field)
    // todo
    // if(this?.opt?.type=="local"||this?.opt?.type=="session"){
    //   // console.log(this.opt);
    //   this.prefix=this.model[this.currentField.parentKey]+"-"      
    // }
    if (this.currentField.parentKey != "") {
      if(this?.opt?.type=="Simple"){
        // console.log(this.opt);
        this.prefix=this.model[this.currentField.parentKey]+"-"      
      }

      (this.field.hooks as any).afterViewInit = (f: any) => {
        const parentControl = this.form.get(this.currentField.parentKey); 
        parentControl?.valueChanges.subscribe((val: any) => {          
          if(this?.opt?.type=="Linked"){
            this.prefix=val
            +"-"      

          }
        
        });
      };
    }

    if(this.field.getdata=='local'){
    let calling_code=sessionStorage.getItem("countrycode")
    if(!this.apiCalled){
      this.apiCalled = true;
    // this.api= this.dataService.getparentdataById("code/country",calling_code).subscribe((res:any)=>{
    //   this.data=res?.data[0]
    //   this.api.unsubscribe()
    //   if(this.model[this.field.key]==undefined){
    //     this.prefix=this.data[this.parent_field]
    //      this.test2=this.prefix
    //     } else{
    //       let length=this.data[this.parent_field].length
    //      

    //      let test1=this.model[this.field.key]
    //      if(test1!==this.test){
    //       this.test=test1
    //       this.prefix=this.data[this.parent_field]
    //       if(test1.length>10){
    //         let split_data= test1.slice(length);
    //         this.formControl.setValue(split_data)
    //         this.prefix=this.data[this.parent_field]
            
    //       }
    //      }
     
  
    //     }
    //  })
    }
     
    }
  }

  onselect(event: any) {
    
    this.model["calling_code"]=this.prefix
    // let data = this.prefix.concat(event.target.value);
    // this.formControl.setValue(data)
  }

}

