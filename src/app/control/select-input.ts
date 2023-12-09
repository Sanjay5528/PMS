import {
  ChangeDetectorRef,
  Component,
  OnInit,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { FieldType } from "@ngx-formly/core";
import { DataService } from "../services/data.service";
import { isEmpty } from "lodash";
import { DialogService } from "../services/dialog.service";

@Component({
  selector: "select-input",
  template: `
    <!-- <div class="center"><span>{{field.props!['label']}}</span></div> -->
    <!-- {{this.opt.options|json}} -->

    <mat-form-field >
      <mat-label>{{ field.props!["label"] }}</mat-label>
      <mat-select
        #matSelectInput
        [formlyAttributes]="field"
        [formControl]="thisFormControl"
        [required]="this.field.props.required"
        *ngIf="!field.props.readonly"
      >
        <mat-option
          *ngFor="let op of this.opt.options"
          [value]="op[this.valueProp]"
          (click)="selectionChange(op)"
        >
          <span *ngIf="this.opt.labeltype!='name'" [innerHTML]="op[this.labelProp]"></span>
          <span *ngIf="this.opt.labeltype == 'name'"> {{op["first_name"]}} {{op["last_name"]}}</span>
          
        </mat-option>
      </mat-select>
      <mat-error *ngIf="this.field.props.required">This {{ this.field.props?.label }} is required</mat-error>
      <input
        matInput
        readonly
        [formlyAttributes]="field"
        [value]="selectedValue"
        *ngIf="field.props.readonly"
      />
    </mat-form-field>
  `,
})
export class SelectInput extends FieldType<any> implements OnInit {
  opt: any;
  data: any;
  currentField: any;
  //default prop setting
  //default prop setting
  valueProp = "id";
  labelProp = "name";
  // dropdown: any;
  selectedValue: any = "";
  selectedObject: any;
  // optionsValue:any;
  constructor(public dataService: DataService,private cf: ChangeDetectorRef,public dialogServices:DialogService) {
    super();
  }

  public get thisFormControl() {
    return this.formControl as FormControl;
  }

  valueSlected(){
    this.selectedValue=this.formControl.value    
    this.thisFormControl?.setValue(this.selectedValue)
  }

  ngOnInit(): void {
    this.opt = this.field.props || {};
    this.labelProp = this.opt.labelProp;
    this.valueProp = this.opt.valueProp;
    this.currentField = this.field;
    this.subscribeOnValueChangeEvent();

  if(this?.opt?.multifilter&& this?.opt?.multifiltertype){
    this?.opt?.multifilter_condition?.conditions.map((res:any)=>{
     
      if(this?.opt?.multifiltertype=="local"){
       let value = sessionStorage.getItem(this.opt.local_name)
        res.value=value
      }
    
    })
    
    let filter_condition={filter:[
      {...this.opt.multifilter_condition}
    ]}
    this.dataService.getDataByFilter(this.opt?.Collections,filter_condition).subscribe((res:any)=>{
      // this.dataService.buildOptions(res.data[0].response, this.opt);
      console.log(res);
let values :any[] =[]
//? RESULTS Array of Object 
if(this.opt.specification){
      res.data[0].response.forEach((element:any) => {
        if(element&&element[this.opt.specification]){
       this.cf.detectChanges();
          values.push(element[this.opt.specification])
        }
      });

        // Update the options array within the subscription
        let totalvalue:any[]=[]
        values.forEach((data:any)=>{
            let val:any={...data}
            if(!isEmpty(val)){
            totalvalue.push( { label:val[0][this.opt.innerArray], value:val[0][this.opt.innerArray] });
          }
          
        })
        console.log(totalvalue);
        this.field.props.options=totalvalue
           this.opt.options=totalvalue
           this.cf.detectChanges();

      }
      else{
        res.data[0].response.forEach((data:any)=>{
          console.log(data);
          let datas:any={}
          datas[this.labelProp]=data[this.labelProp]
          datas[this.valueProp]=data[this.valueProp]
          values.push(datas)
        })
        // this.dropdown=values
        // this.optionsValue=values
        this.opt.options=values
        this.cf.detectChanges();
        // this.dataService.buildOptions(res.data[0].response, this.opt);

      }
    })
    this.cf.detectChanges();
  }
    if (this?.opt?.optionsDataSource?.collectionName!=undefined) {
      let name = this.opt.optionsDataSource.collectionName;
      this.dataService.getDataByFilter(name,{}).subscribe((res: any) => {
        console.log(res);
        
        this.dataService.buildOptions(res.data[0].response, this.opt);
      
          this.currentField.formControl.setValue(this.formControl.value);
          if(this.model.isEdit){
            this.valueSlected()
          }
        
      });
      this.cf.detectChanges();
    }
    if (this?.opt?.lookup==true) {
      let name = this.opt.endPoint;
      let value
      if(this?.opt?.multifiltertype=="local"){
         value= sessionStorage.getItem(this.opt.local_name)
    
       }
     
      this.dataService.lookupTreeData(name,value).subscribe((res: any) => {
        console.log(res);       
         let totalvalue:any[]=[]

        res.data.response.forEach((data:any)=>{
          console.log(data);
          let datas:any={}
          datas[this.labelProp]=data[this.labelProp]
          datas[this.valueProp]=data[this.valueProp]
          totalvalue.push(datas)
        })
        this.opt.options=totalvalue

        // this.dataService.buildOptions(res.data[0].response, this.opt);
      
          this.currentField.formControl.setValue(this.formControl.value);
          if(this.model.isEdit){
            this.valueSlected()
          }
        
          this.cf.detectChanges();
      });
    }

    if (this?.opt?.optionsDataSource?.collectionNameById!=undefined) {
      let name = this.opt.optionsDataSource.collectionNameById;
      let id :any
      if(this.opt.type=="local"){
       id= sessionStorage.getItem(this.opt.local_name);
      }
      console.log(id);
      this.dataService.getDataById(name, id).subscribe((res: any) => {
        ;
        this.dataService.buildOptions(res, this.opt);
        if(this.model.isEdit){
          this.valueSlected()
        }
        if (this.field.props.attribute) {
          //if the data in array of object
          let data = this.field.key
            .split(".")
            .reduce((o: any, i: any) => o[i], this.model);
          this.field.formControl.setValue(data);
       
        } else {

          this.field.formControl.setValue(this.model[this.field.key]);
        }
        this.cf.detectChanges();
      });
    }
    if (this.currentField.parentKey != undefined) {
     
      // (this.field.hooks as any).afterViewInit = (f: any) => {
        const parentControl:any = this.form.get(this.currentField.parentKey); //this.opt.parent_key);        
        console.log(parentControl);
        
        parentControl?.valueChanges.subscribe((val: any) => {
          if(val==undefined)return
           if(this?.opt?.Properties?.formVAlueChange && val!==undefined){
            this.opt.multifilter_condition.conditions.map((res:any)=>{
              res.value = val;
             if(this.opt.multifiltertype=="Simple"){
              if(this.model.isEdit){
                res.value=parentControl.defaultValue
                
              }else{
                res.value=val
              }
             }
             if(this.opt.multifiltertype=="Local"){
              res.value=sessionStorage.getItem(this.opt.local_name)
            }
            })
            let filter_condition:any={ start:0,end:5000, filter:[
              this.opt.multifilter_condition
            ]
          }
            let collectionName: any = this?.field?.parentCollectionName ? this?.field?.parentCollectionName : this.opt?.optionsDataSource?.collectionName;
            this.dataService.getDataByFilter(collectionName,filter_condition).subscribe((res:any)=>{
              // this.dataService.buildOptions(res.data[0].response, this.opt);
        
              
              if(isEmpty(res?.data[0]?.response)&&val!==undefined){
                let parentField:any= this.currentField.parentKey.toUpperCase().replace("_",' ')
                let currentField:any= this.currentField.key.toUpperCase().replace("_",' ')
                // ? To referesh the data
                this.opt.options=[]
                this.field.props.options =[]
                // this.dialogServices.openSnackBar(`No Data ${currentField} Available ${parentField}:- ${val}`,"OK")

                this.dialogServices.openSnackBar(`No Data ${currentField} Available ${parentField}`,"OK")
                return
              }

              if (this?.opt?.multifilterFieldName!==undefined) { //! To Take the value of array
                let specificField: any = res?.data[0]?.response[0]?.[this?.opt?.multifilterFieldName];
                if (specificField) {

                this.field.props.options = specificField.map((name: any) => {
                    return { label: name, value: name };
                });
                
                if(this.model.isEdit){
                  this.valueSlected()
                  this.cf.detectChanges();

                }
            this.cf.detectChanges();

              }

    
           
            }
             else if(this?.opt && this?.opt?.changefield) {
              // this.dataService.buildOptions(res.data[0].response, this.opt);
              this.field.props.options = res.data[0].response.map((values: any) => {
                return { label: values[this.opt.changefield], value: values[this.opt.changefield] };
            });
            this.opt.options = this.field.props.options 
            }else
               {
              // this.opt.options=[]
              // this.dataService.buildOptions(res.data[0].response, this.opt);
              this.field.props.options = res.data[0].response
            // // res.data[0].response.map((values: any) => {
            // //     return { label: values[this.labelProp], value: values[this.valueProp] };
            // // });

            this.opt.options = res.data[0].response
            this.cf.detectChanges();

            if(this.model.isEdit){
              this.valueSlected()
              this.currentField.formControl.setValue(this.formControl.value);
          }
            }

            })
        }
        //   let selectedOption: any;
        //   if (val == undefined) return;
        //   if (this.field.props.attribute == "array_of_object") {
            
        //     selectedOption = this.field.parentKey
        //       .split(".")
        //       .reduce((o: any, i: any) => o[i], this.model);
        //   } else {
        //     selectedOption = this.model[this.currentField.parentKey];
        //   }
        //   if (selectedOption != undefined) {
        //     this.dataService
        //       .getDataById(
        //         this.opt.optionsDataSource?.ParentcollectionName,
        //         selectedOption
        //       )
        //       .subscribe((res: any) => {
        //         console.log(res);
                
        //         if (res.data == null) {
        //           this.opt.options = [];
        //         } else {
        //           this.dataService.buildOptions(res, this.opt);
        //         }
        //         if (this.field.props.attribute) {
        //           //if the data in array of object
        //           let data = this.field.key
        //             .split(".")
        //             .reduce((o: any, i: any) => o[i], this.model);
        //           this.field.formControl.setValue(data);
        //         } else {
        //           this.field.formControl.setValue(this.model[this.field.key]);
        //         }
        //       });
        //   }
        });
      // }; 
    }
 
  }

  selectionChange(selectedObject: any) {
    // if (selectedObject && this.opt.onValueChangeUpdate && this.opt.onValueChangeUpdate instanceof Array) {
    //   for (const obj of this.opt.onValueChangeUpdate) {
    //     this.field.formControl.parent.controls[obj.key].setValue(
    //       selectedObject[obj.valueProp]
    //     );
    //   }

    // }    
    if (this.opt.onValueChangeUpdate) {
      this.field.form.controls[this.opt.onValueChangeUpdate.key].setValue(
        selectedObject[this.opt.onValueChangeUpdate.key]
      );
      selectedObject = {};
    } 
  }

  subscribeOnValueChangeEvent() {
    // on ParentKey changes logic to be implemented
    if (this.field.parentKey!= undefined) {
      console.log(this.field.parent_key);
      
      (this.field.hooks as any).afterViewInit = (f: any) => {
        const parentControl:any = this.form.get(this.field.parentKey); //this.opt.parent_key);
        parentControl?.valueChanges.subscribe((val: any) => {
          this.selectedObject = val;
          console.log(val);
          if(this?.opt?.Properties?.formVAlueChange){
            this.opt.multifilter_condition.conditions.map((res:any)=>{
             if(this.opt.multifiltertype=="Simple"){
              // if(res.value){
                if(this.model.isEdit){
                  res.value=parentControl.defaultValue

                }else{

                  res.value=val
                }
              // }
            }
            if(this.opt.multifiltertype=="Local"){
              res.value=sessionStorage.getItem(this.opt.local_name)
            }
            })
            let filter_condition={filter:[
              this.opt.multifilter_condition
            ]}            
            // this.dataService.getDataByFilter(this?.field?.parentCollectionName,filter_condition).subscribe((res:any)=>{
            //     let specificField:any = res?.data[0]?.response[0][this?.opt?.multifilterFieldName]
            //   this.field.props.options = specificField.map((name: any) => {
            //     return { label: name, value: name };
            //   });
            // })
            let collectionName: any = this?.field?.parentCollectionName ? this?.field?.parentCollectionName : this.opt?.optionsDataSource?.collectionName;
            this.dataService.getDataByFilter(collectionName,filter_condition).subscribe((res:any)=>{

            // this.dataService.getDataByFilter(this?.field?.parentCollectionName, filter_condition).subscribe((res: any) => {
              let specificField: any = res?.data[0]?.response[0]?.[this?.opt?.multifilterFieldName];
          
              if (specificField) {
                  this.field.props.options = specificField.map((name: any) => {
                      return { label: name, value: name };
                  });
                  if(this.model.isEdit){
                    this.valueSlected()
                  }
        
              } else {
                  // Handle the case when specificField is undefined
                  console.error("specificField is undefined");
              }
          });
          
        }
        });
      };
    }
    if (this.field.key === "modelName") {
      let model_name = sessionStorage.getItem("model_name");
      console.log(model_name);
     console.log(this.field);
     var filterCondition1 =
      {filter: [
      {
       clause: "AND",
       conditions: [
        { column: 'model_name', operator: "NOTEQUAL", value: model_name },
       ]
      }
      ]}
      // model_config
      //! to chnage 
      // this.dataService.getotherModuleName(model_name)
      this.dataService.getDataByFilter('model_config',filterCondition1)
      .subscribe((abc: any) => {
        console.log(abc);
        
        const unmatchedNames = abc.data[0].response;

        // Update the options array within the subscription
        this.field.props.options = unmatchedNames.map((name: any) => {
          return { label: name.model_name, value: name.model_name };
        });
        this.opt.options = this.field.props.options;
        console.log(this.opt.options)
      });
    }
   

  }
}
// Sample json
// {
// "type": "select-input",
// "key": "org_id",
// "className": "flex-6",
// "props": {
// "label": "Organizatiom",
// "labelPropTemplate": "{{org_name}}",
// "optionsDataSource": {
// "collectionName": "organisation"
// },
// "labelProp": "org_name",
// "valueProp": "_id",
// "required": true
// },"expressions": {
// "hide": "(model.access !=='SA')"
// }
// }