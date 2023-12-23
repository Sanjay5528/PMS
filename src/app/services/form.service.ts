import { HttpClient } from '@angular/common/http';
import { Injectable, Output, ViewChild, EventEmitter, Input } from '@angular/core';
import * as _ from 'lodash';
import { async, catchError } from 'rxjs';
import { Observable, Subject } from 'rxjs';
import { DataService } from './data.service';
import { DialogService } from './dialog.service';
import { HelperService } from './helper.service'; 
import * as moment from 'moment';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { ArrayToStringPipe } from '../pipe/arraytostring';
import { v4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class FormService {
  constructor(
    private helperService: HelperService,
    private dataService: DataService,
    private dialogService: DialogService,public arraytostring:ArrayToStringPipe,
    private httpclient: HttpClient) {
   
  }

  LoadMasterInitData(ctrl:any) {
    this.dataService.loadScreenConfigJson(ctrl.formName).subscribe(async config=>{
      console.log(config);
      
        ctrl.config = config
        
        ctrl.pageHeading = config.pageHeading
        ctrl.collectionName = config.form.collectionName
        // ctrl.model = config.model ? config.model : {};
        // ctrl.isPopupEdit=ctrl.detailForm.isPopupEdit
        // ctrl.detailModel=ctrl.detailForm.fields
        ctrl.mode = config.addEditMode ? config.addEditMode : 'popup'
        ctrl.fields = config.form.fields
        this.LoadData(ctrl)
        // this.loadSupportData(ctrl)
        // if (config.getWeightFromMachine) {
        //   this.serialPortService.init()
        // }
      })
    }
  /**
 * This Main method We CAll in form Services 
 * @id if id availabe ,IT  load the existing data 
 * @ctrl This is Total content from the parent componet.
 */
  LoadInitData(ctrl: any) {
    
    
    if (ctrl.id) {
      ctrl.collectionName = ctrl.formName
      this.LoadData(ctrl).subscribe((res: any) => {
        console.log(ctrl,"existing data loaded")
        this.LoadConfig(ctrl)
      })
    } else {
      this.LoadConfig(ctrl)
    }
  }

  /**
 * This Function help to get the screen config from data base
 * @ctrl This is Total content from the parent componet.
 */
  LoadConfig(ctrl: any) {
    
    // form or any other screen keyField (it should be given in form)
    this.dataService.loadScreenConfigJson(ctrl.formName).subscribe(async config=>{
      ctrl.config = config
      ctrl.pageHeading = config.pageHeading
      ctrl.collectionName = config.form.collectionName
      ctrl.mode = config.screenEditMode ? config.screenEditMode : 'popup'
      ctrl.model["keyField"] = config.keyField || 'id'
      ctrl.id = ctrl.model[config?.keyField] || ctrl?.model["_id"] 
      ctrl.formAction = ctrl.id ? 'Edit' : 'Add';
      ctrl.butText = ctrl.id ? 'Update' : 'Save';   //buttons based on the id
      
        if (ctrl.formAction == 'Edit' && ctrl.config.mode == 'page') {
                  // this.LoadData(ctrl).subscribe((res: any) => {
        ctrl.fields = config.form.fields
        // })
      }
      else if (ctrl.formAction == 'Edit' && ctrl.mode == 'popup') {
        

        ctrl.model['isEdit'] = true
        ctrl.model['isshow'] = true
        ctrl.model['ishide'] = true
        ctrl.isFormDataLoaded = true
        ctrl.formAction = ctrl.config.formAction || 'Edit';
        ctrl.isEditMode = true;
      }
      ctrl.fields = config.form.fields
    })
  }

  extractValidationKeywords(tag: any) {
    const matchResult = tag.match(/validate:"(.*?)"/);
    if (matchResult && matchResult[1]) {
      const keywords = matchResult[1].split(",");
      return keywords.map((keyword: any) => keyword.trim());
    }
    return [];
  }

  //"json:"within" bson:"within"  validate:"omitempty,within=2d
  extractComparisonOperator(tag: any) {
    const matchResult = tag.match(
      /\b(eq|gt|gte|lt|lte|min|max|regexp|between_age|within|ne)\b/
    );
    if (matchResult) {
      return matchResult[0];
    }
    return null;
  }

  resetDetailModel(ctrl: any) {

    let form = ctrl.config.detailForm
    if (form) {
      ctrl.detailModel = {}
      ctrl.isDetailEditMode = false
      ctrl.butText = "Add"
      if (form.defaultFocusIndex) {
        form.fields[form.defaultFocusIndex].focus = true
        //TODO ??
        // form.fields[form.defaultFocusIndex].defaultValue = ""
      }
    }
  }

  updateDetailFormData(ctrl:any): Promise<any> {

    return new Promise(async (resolve, reject) => {
      //validate all the form fields
      console.log(ctrl);
      
      if (!ctrl.detailForm.valid) {
       
      const invalidLabels:any = this.helperService.getDataValidatoion(ctrl.detailForm.controls);
      this.dialogService.openSnackBar("Error in " + invalidLabels, "OK");
     ctrl.detailForm.markAllAsTouched();
        ctrl.detailForm.fields[ctrl.detailDefaultFocusIndex].focus = true
        resolve(false)
        return
      }
      //get the form data

      var data = ctrl.detailForm.value
      data[ctrl.config.detailForm.mapColumn] = ctrl.id
      if(ctrl.config.mapColumnDiff==true){
        data[ctrl.config.detailForm.mapColumn] = ctrl.model[ctrl.config.mapColumnfield]

      }
      // TO CREATE the STRUCT
      if(ctrl.config.extraData){
        this.Create_struct(ctrl,data).then((val:any)=>{
          console.log(val,'strusct');
          data=val; //! reassign the data from change the structure 
          if(ctrl?.config?.detailForm?.customfilter){
            data[ctrl.config.detailForm.mapColumn] = ctrl?.model?.model_name

          }else{

            data[ctrl.config.detailForm.mapColumn] = ctrl.id
          }
          var findIndex = -1
          console.log(ctrl);
          
          if(ctrl.butText == "Add"){
            var defaultValues = ctrl.config.detailForm.defaultValues || []
            this.loadDefaultValues(defaultValues, data, ctrl.model)
            this.dataService.save(ctrl.config.detailForm.collectionName,data).subscribe(
                (res:any) => {
              ctrl.isEditMode = false
              const transaction: any = {
             add: [ data],
                };
                const result = ctrl.gridApi.applyTransaction(transaction);
                console.log(transaction, result)
             
              this.resetDetailModel(ctrl)
              this.dialogService.openSnackBar("Data has been updated successfully", "OK");              
              
              if (findIndex >= 0) {
                //data already in the grid
                ctrl.listData[findIndex] = data
              } else {
                ctrl.listData.unshift(data)
              }
              ctrl.tempListData = ctrl.listData;
              ctrl.listData = [...ctrl.listData]
              ctrl.tempListData = ctrl.listData;
              resolve(data)
  
            },
            error => {
              resolve(undefined)
            } //this.dialogService.openSnackBar("Data has been added successfully","OK")
          )
          }else{
            //! If Data Present means  it edit mode

            if(ctrl.keyColumn == undefined){
              ctrl.keyColumn='_id'
            }
            var id :any=ctrl.selectedRow[ctrl.keyColumn]

      var uniqueColumn = ctrl.config.detailForm.uniqueColumn
      
      // data[ctrl.config.detailForm.mapColumnname] = ctrl.model.name 
  if (uniqueColumn) { //grid level validation
  findIndex = ctrl.listData.findIndex((e:any) => e[uniqueColumn] == data[uniqueColumn])     //unique column
  if (!ctrl.isDetailEditMode && findIndex > -1) {
    //unique column data found in the grid
    console.log("column data found in the grid");
    
    this.dialogService.openSnackBar("Data already exists", "OK")
    resolve(undefined)
    return
  }
  }
            // delete data._ids
            this.dataService.update(ctrl.config.detailForm.collectionName, id,   data).subscribe(
              res => {
                ctrl.isEditMode = false
                
                this.resetDetailModel(ctrl)
                this.dialogService.openSnackBar("Data has been updated successfully", "OK");              
                if (findIndex >= 0) {
                  //data already in the grid
                  ctrl.listData[findIndex] = data
                } else {
                  ctrl.listData.unshift(data)
                }
                // ctrl.tempListData = ctrl.listData;
                // ctrl.listData = [...ctrl.listData]
                // ctrl.tempListData = ctrl.listData;
                data["_id"]=id
                const transaction: any = {
                  update: [ data],
                  };
                  const result = ctrl.gridApi.applyTransaction(transaction);
                  console.log(transaction, result)
                      
                resolve(data)
  
              },
              error => {
                resolve(undefined)
              } //this.dialogService.openSnackBar("Data has been added successfully","OK")
            )
          }
        

        })
      }
      else{
      var findIndex = -1
    
        if(ctrl.butText == "Add"){
          var defaultValues = ctrl.config.detailForm.defaultValues || []
          this.loadDefaultValues(defaultValues, data, ctrl.model)
          if(ctrl?.config?.detailForm?.Change_id){  
            data[ctrl?.config?.detailForm?.changekeyfield]=data[ctrl?.config?.detailForm?.addkeyfield]+"-"+data[ctrl?.config?.detailForm?.changekeyfield]
          }
        this.dataService.save(ctrl.config.detailForm.collectionName,data).subscribe(
          (res:any) => {
            ctrl.isEditMode = false
            this.resetDetailModel(ctrl)
            this.dialogService.openSnackBar("Data has been updated successfully", "OK");   
            // let values:any={}
            //   values["_id"]=res.data["insert ID"]
                // Object.assign(data,values)           
                data["_id"]=res.data["insert ID"]
             data.Apitype="Add"

           
            // if (findIndex >= 0) {
            //   //data already in the grid
            //   ctrl.listData[findIndex] = data
            // } else {
            //   ctrl.listData.unshift(data)
            // }
            // ctrl.tempListData = ctrl.listData;
            // ctrl.listData = [...ctrl.listData]
            // ctrl.tempListData = ctrl.listData;
            resolve(data)

          },
          error => {
            resolve(undefined)
          } //this.dialogService.openSnackBar("Data has been added successfully","OK")
        )
        }else{
          
    var uniqueColumn = ctrl.config.detailForm.uniqueColumn
    // data[ctrl.config.detailForm.mapColumnname] = ctrl.model.name 
if (uniqueColumn) { //grid level validation
findIndex = ctrl.listData.findIndex((e:any) => e[uniqueColumn] == data[uniqueColumn])     //unique column
if (!ctrl.isDetailEditMode && findIndex > -1) {
  //unique column data found in the grid
  console.log("column data found in the grid");
  
  this.dialogService.openSnackBar("Data already exists", "OK")
  resolve(undefined)
  return
}
}
          // let id =data._id
          if(ctrl.keyColumn == undefined){
            ctrl.keyColumn='_id'
          }
          var id :any=ctrl.selectedRow[ctrl.keyColumn]
          delete data._id //? IdK

          this.dataService.update(ctrl.config.detailForm.collectionName, id,   data).subscribe(
            (res:any) => {
              ctrl.isEditMode = false
             data.Apitype="Update"
              this.resetDetailModel(ctrl)
              this.dialogService.openSnackBar("Data has been updated successfully", "OK");              
             
          data._id =id;
              // if (findIndex >= 0) {
              //   //data already in the grid
              //   ctrl.listData[findIndex] = data
              // } else {
              //   ctrl.listData.unshift(data)
              // }
              // ctrl.tempListData = ctrl.listData;
              // ctrl.listData = [...ctrl.listData]
              // ctrl.tempListData = ctrl.listData;
              
              data["_id"]=id
              // Object.assign(data,ctrl.model)  
            
              resolve(data)

            },
            error => {
              resolve(undefined)
            } //this.dialogService.openSnackBar("Data has been added successfully","OK")
          )
        }
      }
    })
  }




  
  LoadDetailConfig(ctrl:any) {
    ctrl.form.disable()

    ctrl.keyCol = ctrl.config.detailForm.keyColumn || 'cno'
    ctrl.detailDefaultFocusIndex = ctrl.config.detailForm.defaultFocusIndex || 0
    ctrl.detailFields = ctrl.config.detailForm.fields
    ctrl.detailModel = ctrl.config.detailForm.model ? ctrl.config.detailForm.model : {};
    ctrl.isPopupEdit = ctrl.config.detailForm.isPopupEdit || false
    ctrl.listData = []
    
    ctrl.tempListData = ctrl.listData;
    ctrl.detailListConfig = ctrl.config.detailListConfig
    ctrl.filterOptions = ctrl.config.detailListConfig.filterOptions
    ctrl.actions = ctrl.config.detailListConfig.actions || []
    ctrl.actionPopup =ctrl.config.detailListConfig.actionPopup || []         //popup form screen in master table
    ctrl.delete=ctrl.config.detailListConfig.delete || []
    //TODO
  ctrl.detailListFields =  ctrl.config.detailListConfig.fields
  
    ctrl.config.detailListConfig.fields.forEach((e:any) => 
    // {
    //   if (e.type) {
    //     if (e.type == "date") {
    //         e["valueFormatter"] =  (params:any) => params.value == null ? "" : moment(params.value).format(e.format || "DD/MM/YY");
    //     } 
    //   }
    // });
    
    {
      console.log(e,'e');
      console.log(e.type,'type');

      if (e.type == "datetime" || e.type == "date") {
        e.valueGetter = (params: any) => {
          if (params.data && params.data[e.field]) {
            console.log('dasd');
            
            return moment(params.data[e.field]).format(
              e.format || "DD-MM-YYYY "
            );
          }
          return ' '
        };
      }
      if (e.type == "color") {
        e.cellStyle = (params: any) => {
          return { color: "blue" };
        };
      }
      if (e.type == "arraytostring") {        
        e.valueFormatter = (params: any) => {
            if (params.data && params.data[e.field]&& !_.isEmpty(params.data[e.field])) {
            let txt = "";
            if(e.valueType=="plainArray"){
              let input=params.data[e.field] ;
              
              for (let i=0; i < input?.length;i++){
                txt += input[i] +","
               }
               console.log("txt",txt);
               
               var n =txt.lastIndexOf(",")
               var value=txt.substring(0,n)
               console.log(value);
               
               return value
              
            }else{
              let input=params.data[e.field] ;
              let attribute=e.value
              for (let i=0; i < input?.length;i++){
                txt += (input[i][attribute]) +","
               }
               var n =txt.lastIndexOf(",")
               var value=txt.substring(0,n)
               return value
              }

            }
            return

        };
        e.type='text'
      }  
      if (e.width) {
        e["width"] = e.width;
      } 
      // if (e.type == "set_Filter" && e.filter == "agSetColumnFilter") {
      //   if (e.Diffkey == true) {
      //     e.filterParams = {
      //       values: (params: any) => {
      //         let filter:any={
       //           start: 0,
      //           end: 1000,
      //           filter: this.filterQuery,
      //         }
      //         if(this.allFilter!==undefined){
      //         filter=this.allFilter;
      //         }
      //         this.DataService.getDataByFilter(this.collectionName, filter).subscribe((xyz: any) => {
      //           const apidata = xyz.data[0].response;
      //           const uniqueArray = Array.from(
      //             new Map( apidata.map((obj: any) => [obj[e.field], obj])).values()
      //           );
      //           params.success(uniqueArray);
      //         });
      //       },
      //       keyCreator: (params: KeyCreatorParams) => {
      //         return [params.value[e.keyCreator], e.keyCreator, true];
      //       },
      //       valueFormatter: (params: any) => {
      //         return params.value[e.field];
      //       },
      //     };
      //   } else {
      //     e.filterParams = {
      //       values: (params: any) => {
      //         let filter:any={
      //           start: 0,
      //           end: 1000,
      //           filter: this.filterQuery,
      //         }
      //         if(this.allFilter!==undefined){
      //         filter=this.allFilter;
      //         }
      //         this.dataService.getDataByFilter(this.collectionName,filter).subscribe((xyz: any) => {
      //           const apidata = xyz.data[0].response
      //             .map((result: any) => {
      //               let val = result[e.field];
      //               if (val !== undefined) {
      //                 return val;
      //               }
      //             })
      //             .filter((val: any) => val !== undefined); // Filter out undefined values
      //           params.success(apidata);
      //         });
      //       },
      //     };
      //   }
      // }
      //if the object in nested array
      // if (e.type == "set_Filter" && e.filter == "agSetColumnFilter" &&e.object_type == "nested_array") {
      //   debugger;
      //   e.filterParams = {
      //     values: (params: any) => {
      //       let filter:any={
      //         start: 0,
      //         end: 1000,
      //         filter: this.filterQuery,
      //       }
      //       if(this.allFilter!==undefined){
      //       filter=this.allFilter;
      //       }
      //       this.DataService.getDataByFilter(this.collectionName,filter).subscribe((xyz: any) => {
      //         const apidata = xyz.data[0].response
      //           .map((result: any) => {
      //             //let val = result[e.field];
      //             let val = e.field
      //               .split(".")
      //               .reduce((o: any, i: any) => o[i], result);
      //             if (val !== undefined) {
      //               return val;
      //             }
      //           })
      //           .filter((val: any) => val !== undefined); // Filter out undefined values
      //         params.success(apidata);
      //       });
      //     },
      //   };
      // }
    })

  }


  /**
 * @DynamicStruct This method used for the Get in String Format into Split 
 * @example it make a string like this json:"efef" bson:"efef"  validate:"omitempty,min=4" in individual value
 * @ctrl This is Data TO split.
 */
split_Struct(ctrl:any): Promise<any> {
    return new Promise(async (resolve, reject) => {
console.log(ctrl);

      const operator = this.extractComparisonOperator(ctrl.tag);
      const validationKeywords = this.extractValidationKeywords(ctrl.tag);
          //json:"efef" bson:"efef"  validate:"omitempty,min=4"
          if (ctrl.tag.includes("required")) {
            ctrl.required = "yes";
          } else if (ctrl.tag.includes("omitempty")) {
            ctrl.required = "no";
          }
          
          const typeMapping: { [key: string]: string } = {
            string: "string",
            int: "number",
            int64: "number",
            float32: "number",
            float64: "number",
            bool: "boolean",
            "time.time": "Date",
          };

          const selectedType = ctrl.type;
          const selectedTypes = ctrl.type; //  "[]string"
          const arrayPart = selectedTypes?.replace(/[^[\]]+/g, ""); //  "[]"

          const cleanTypeString = selectedType?.replace("[]", "");
          if (arrayPart.includes("[]")) {
            ctrl.array_field = "yes";
          }

          if (cleanTypeString in typeMapping) {
            // const angularDataType = typeMapping[cleanTypeString];
            ctrl.select_field = "custom_datatype";
            ctrl.type = cleanTypeString;
          } else {
            ctrl.modelName = cleanTypeString;
            ctrl.select_field = "predefined";
          }

          if (operator) {
            ctrl.enumerate_validation = operator;
            const dynamicValueMatchResult = ctrl.tag.match(new RegExp(`${operator}=(\\d+)`)
            );
            if (dynamicValueMatchResult && dynamicValueMatchResult[1]) 
            {
              const extractedValue = dynamicValueMatchResult[1];
              ctrl.validation = extractedValue;
            } else if (operator == "regexp") 
            {
              const regexpMatchResult =
                ctrl.tag.match(/regexp=([^,]+)/);
              ctrl.validation = regexpMatchResult[1];
            }
          }
          const withinMatchResult = ctrl.tag.match(
            /within=(\d+)([ydmwYDMW])/
          );
          if (withinMatchResult &&withinMatchResult[1] &&withinMatchResult[2])
          {
            const value = withinMatchResult[1];
            const unit = withinMatchResult[2];
            const withinValue = value + unit;
            ctrl.validation = withinValue;
           
          }

          //"json:"hh" bson:"hh"  validate:"required,min=5,max=10"
          const betweenAgeMatchResult = ctrl.tag.match(
            /between_age=(\d+)-(\d+)/
          );
          if (betweenAgeMatchResult && betweenAgeMatchResult[1] && betweenAgeMatchResult[2]) 
          {
            const value2 = betweenAgeMatchResult[2];
            ctrl.additional_input_advanced = value2;
          }
          const minMaxMatchResult =
            ctrl.tag.match(/min=(\d+).*max=(\d+)/);
          if (minMaxMatchResult &&minMaxMatchResult[1] &&minMaxMatchResult[2]) 
          {
            const maxLimit = parseInt(minMaxMatchResult[2]);
            ctrl.enumerate_validation = "in_between";
            ctrl.additional_input_advanced = maxLimit;
          }
        
          resolve(ctrl)
    })

}

  LoadData(ctrl: any): Observable<boolean> {
    
    var nextValue = new Subject<boolean>()
    this.LoadFormData(ctrl).subscribe((exists:any) => {
    nextValue.next(exists)
      if (exists && ctrl.config.formType=='master-detail') {
        //load detailed form details and its data, if available
        
        this.LoadDetailConfig(ctrl)
        this.LoadDetailDataList(ctrl,ctrl.id)
        this.resetDetailModel(ctrl)
      }
    })
    return nextValue.asObservable()
  }

// !Need TO do in same componenet for server side pagination
  LoadDetailDataList(ctrl:any,id:string,addtionalFilterConditions?:any) {

    if(ctrl.config.diffApi==true){
      let key:any=ctrl.model[ctrl.config.idToSend]
      this.dataService.lookupTreeData(ctrl.config.endPoint,key).subscribe(
        (result:any) => {
        ctrl.listData=result.data.response ||  []
        // ctrl.listData = res.data[0].response|| [];
        ctrl.tempListData = ctrl.listData;
        ctrl.gridApi.sizeColumnsToFit();
        },
        error => {
          ctrl.listData = []
          ctrl.tempListData = ctrl.listData;
          //Show the error popup
          console.error('There was an error!', error);
        })
       
      
    }else{





      let filterCondition :any
      //master-detail mapping record filter condition
      if(ctrl?.config?.detailForm?.customfilter){
         filterCondition = [
          { column: ctrl.config.detailForm.mapColumn,
              operator: "EQUALS",
            value:ctrl.model[ctrl?.config?.detailForm?.customkey]
            },
          ]
      
      }else{
  
        filterCondition = [
          { column: ctrl.config.detailForm.mapColumn,
              operator: "EQUALS",
            value:id
            },
          ]
      }
      console.log(filterCondition);
  
    this.dataService.makeFilterConditions(ctrl.detailListConfig.defaultFilter,filterCondition,ctrl.detailModel)
    this.dataService.makeFilterConditions(ctrl.detailListConfig.fixedFilter,filterCondition,ctrl.detailModel)
  
      //when we apply filter the top filter controls,
      //this conditions to be merged with the above filter condition
      if (addtionalFilterConditions) {
      
      filterCondition = _.merge(filterCondition,addtionalFilterConditions)
      }
      //load detail (child) collection data
      var filterQuery = {filter:[{
        clause: "AND",
        conditions: filterCondition
      }]}
      
  
    this.dataService.getDataByFilter(ctrl.config.detailForm.collectionName,filterQuery).subscribe(
      (result:any) => {
          ctrl.listData = result.data[0].response|| [];
          ctrl.tempListData = ctrl.listData;
          ctrl.gridApi.sizeColumnsToFit();
        },
        error => {
          ctrl.listData = []
          ctrl.tempListData = ctrl.listData;
          //Show the error popup
          console.error('There was an error!', error);
        }
      );
    }

  }

  /**
 * This method used for the Get the data from the database 
 * Take the Old Data in modelOldData 
 * @ctrl This is Total content from the parent componet.
 */
  LoadFormData(ctrl: any): Observable<boolean> {
    var nextValue = new Subject<boolean>()
    if (ctrl.id) {
      this.dataService.getDataById(ctrl.collectionName, ctrl.id).subscribe(
        (result: any) => {
          
          if (result && result.data && result != null) {
            //  result data is array of index 0 
            ctrl.model = result.data[0] || {}          
            ctrl.model['isEdit'] = true
            ctrl.model['isshow'] = true
            ctrl.model['ishide'] = true
            ctrl.isFormDataLoaded = true
            ctrl.isDataError = false //???
            ctrl.formAction = ctrl.config.formAction || 'Edit';
            ctrl.isEditMode = true;
            //we need old data, if update without any changes
            ctrl.modelOldData = _.cloneDeep(ctrl.model)
            nextValue.next(true)
          } else {
            ctrl.model['isEdit'] = false
            ctrl.formAction = 'Add';
            ctrl.isFormDataLoaded = false
            nextValue.next(false)
          }
        },
        error => {
          console.error('There was an error!', error);
          nextValue.next(false)
        }
      )
    } else {
      nextValue.next(false)
    }
    return nextValue.asObservable();
  }


  
  /**
 * This method used Save or update the data / Add and update the form
 * Take the Old Data in modelOldData 
 * @param ctrl This is Total content from the parent componet
 */
  async saveFormData(ctrl: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      // this.helperService.validateAllFormFields(ctrl.form); I Dont what is it ?
      
      if (!ctrl.form.valid) {
      //   function collectInvalidLabels(controls: any, invalidLabels: string = ''): string {
      //     for (const key in controls) {
      //         if (controls.hasOwnProperty(key)) {
      //             const control = controls[key];
          
      //             if (control instanceof FormGroup) {
      //                 invalidLabels += collectInvalidLabels(control.controls);
      //             } else if (control instanceof FormControl && control.status === 'INVALID') {
      //                 // Access the label property assuming it exists in the control
      //                 invalidLabels +=controls[key]._fields[0].props.label + ",";
      //             }else if(control instanceof FormArray && control.status === 'INVALID'){
      //               invalidLabels +=controls[key]._fields[0].props.label + ",";
      //             }
      //         }
      //     } 
      //     return invalidLabels;
      // }
      const invalidLabels:any = this.helperService.getDataValidatoion(ctrl.form.controls);
      this.dialogService.openSnackBar("Error in " + invalidLabels, "OK");
      // const invalidLabels:any = collectInvalidLabels(ctrl.form.controls);
        // ctrl.dialogService.openSnackBar("Error in " + invalidLabels, "OK");
       ctrl.form.markAllAsTouched();
        ctrl.butonflag=false
        return ;
      }
      var data = ctrl.form.value
      // ?SYSTEM USER
      let role_type:any =this.dataService.getdetails().role
      if(ctrl?.config?.rolebased&& role_type!=="SA"){
       data.org_id=this.dataService.getdetails().org_id
      }
// ?SYSTEM USER
      if(ctrl?.config?.user&&role_type!=="SA"){
        data.org_id=this.dataService.getdetails().org_id 
        data.user_type=role_type
      }
// ? PREFIX
      if(ctrl?.config?.Change_id && (ctrl.model.isEdit !==true||ctrl.formAction == 'Add')){

        // data.org_id=this.dataService.getdetails().profile.org_id
        // data._id=data.org_id+"-"+data._id
        data[ctrl.config.changekeyfield]=data[ctrl.config.addkeyfield]+"-"+data[ctrl.config.changekeyfield]
      }

      // It can be done in any project with different screen config
      //while saving set default values

        if (ctrl.formAction == 'Add') {
          var defaultValues = ctrl.config.form.defaultValues || []
          this.loadDefaultValues(defaultValues,data,ctrl.model)
          this.dataService.save(ctrl.collectionName,data).pipe(
            catchError((error:any) => {
              ctrl.butonflag=false
              return error }) ).subscribe((res: any) => {
            if(res){
              
              if(ctrl?.config?.user){
                this.updateuser(ctrl,res);
              } 
              
              this.dialogService.openSnackBar("Data has been Inserted successfully", "OK")
             resolve(res)

          }
             else {
              this.dialogService.openSnackBar(res.error_msg, "OK")
            }
          })
        }
        else {
          delete data._id
          this.dataService.update(ctrl.collectionName,ctrl.id,data).pipe(
            catchError((error:any) => {
              ctrl.butonflag=false
              // console.error('Error occurred:', error);
              return error
            })
    ).subscribe((res: any) => {
          this.dialogService.openSnackBar("Data has been updated successfully", "OK")
          
            resolve(res)
          })
        }
      

    })
  }



  updateuser(ctrl:any,refId:any){
    
      let datas:any={}
      if(ctrl?.collectionName=='client'){
         datas={
          _id:ctrl.model.contact_details.email_id,
          first_name:ctrl.model.contact_details.first_name + " " +ctrl.model.contact_details.last_name,
          mobile_number:ctrl.model.contact_details.mobile_number,
          user_type:ctrl.collectionName.toLowerCase(),
          role:'Admin',
          org_id:ctrl.model._id 
        }
     }else{
    datas={
            _id:ctrl.model.email,
            name:ctrl.model.first_name+" "+ctrl.model.last_name,
            user_type: ctrl.collectionName.toLowerCase(),
            mobile_number:ctrl.model.mobile_number,
            role:ctrl.model.designation,
            employee_id:ctrl.model.employee_id,
            status:"Email Sended"
          }
        }
     this.dataService.save('user',datas).subscribe((res: any) => {
     console.log(res);
     
    }
    )
     
  }

  /**
 * This method used for the Get the data from model into Tag of String
 * @ctrl This is Total content from the parent componet.
 */
Create_struct(ctrl:any,value:any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    var data :any= {}
    
    // Get the column name and convert it to lowercase
    const attributesName = value.column_name.toLowerCase();

    // Capitalize the first letter of the column name
    const formattedName =
      attributesName.charAt(0).toUpperCase() +
      attributesName.slice(1).toLowerCase();

    // Initialize the Tag string with common values
    // let Tag = `json:"${attributesName}" bson:"${attributesName}" validate:"`;
    var jsonvalues = (value.column_name === "ID" || value.column_name === "Id" || value.column_name === "_id") ? "_id" : value.column_name.toLowerCase();

    // Initialize the Tag string with common values
    let Tag = `json:"${jsonvalues}" bson:"${jsonvalues}" validate:"`;
    // Set the type if it's not undefined
    if (value.type === undefined) {
      value.type = value.modelName;
    }

    // Add "[]" if it's an array field
    if (value.array_field === "yes") {
      value.type = "[]" + value.type;
    }

    // Add "required" or "omitempty" based on the "required" property
    Tag += value.required === "yes" ? "required" : "omitempty";

    // Handle various enumerate_validation cases
    switch (value.enumerate_validation) {
      case "between_age":
        Tag += `,between_age=${value.validation}-${value.additional_input_advanced}`;
        break;
      case "regexp":
        Tag += `,regexp=${value.validation}`;
        break;
      case "eq":
        Tag += `,eq=${value.validation}`;
        break;
      case "ne":
        Tag += `,ne=${value.validation}`;
        break;
      case "gt":
        Tag += `,gt=${value.validation}`;
        break;
      case "gte":
        Tag += `,gte=${value.validation}`;
        break;
      case "lt":
        Tag += `,lt=${value.validation}`;
        break;
      case "lte":
        Tag += `,lte=${value.validation}`;
        break;
      case "within":
        Tag += `,within=${value.validation}`;
        break;
      case "in_between":
        if (value.validation && value.additional_input_advanced) {
          Tag += `,min=${value.validation},max=${value.additional_input_advanced}`;
        } else if (value.validation) {
          Tag += `,min=${value.validation}`;
        } else if (value.additional_input_advanced) {
          Tag += `,max=${value.additional_input_advanced}`;
        }
        break;
      case "min":
      case "max":
        Tag += `,${value.enumerate_validation}=${value.validation}`;
        break;
    }

    // Add the closing double quote to the Tag string
    Tag += '"';

    // Update the "data" object properties
    // data._id=ctrl.detailModel._id
          data.tag = Tag;
          data.max = undefined;
          data.min = undefined;
          data.column_name = value.column_name = formattedName;
          data.header=value.header;
          data.type=value.type;
          data.type=value.type;
          data.description=value.description;
          data.collection_name=value.collection_name;
          data.is_reference=value.is_reference;
          data.field=value.field;
          data.json_field = jsonvalues;


    resolve(data);
  }
  )
}

/**
 * This method used load default values type
*/
  loadDefaultValues(defaultValues:any,formData:any,model:any) {     
    //sync way
    defaultValues.map((obj:any)=>{
     let val
       if (obj.type=="date") {
        formData[obj.colName] = moment().utc().startOf('day').add(obj.addDays || 0 ,'day').format(obj.format||'yyyy-MM-DDT00:00:00.000Z')
      } else if (obj?.value?.startsWith('@')) {
           val= obj.value.slice(1)
          formData[obj.colName] = model[val]
      } else if (obj.type == "exp") {
        if (obj.source == "local") {
          val =JSON.parse(sessionStorage.getItem(obj.value) || '');
          let data = val[obj.object][obj.object1]
          formData[obj.colName] = data
        }
      }else if (obj.type == "prefix") {
        // if (obj.source == "project_id") {
          val =formData[obj.source]
          // let data = val[obj.object][obj.object1]
          formData[obj.colName] ="SEQ|"+val
        // }
      }
      else {
        formData[obj.colName] = obj.value
      }
    })
  }

  LoadDefaultTreeComponent(ctrl:any): Observable<boolean>{
        var nextValue = new Subject<boolean>()
        this.LoadScreenForTreeData(ctrl).subscribe(Screenfinsihed=>{
          console.log(Screenfinsihed);
          console.warn("Screen-ctrl",ctrl);
          
          if(Screenfinsihed){
            this.LoadDataForTreeData(ctrl).subscribe(Datafinsihed=>{
              console.log(ctrl);
              
              nextValue.next(Datafinsihed)
            })
          }
        })
       
        return nextValue.asObservable();
  }
  LoadScreenForTreeData(ctrl:any): Observable<boolean> {
    var nextValue = new Subject<boolean>()
    ctrl.columnDefs=[]
    debugger
console.log("InSDEILoadScreenForTreeData");

  if(ctrl.formName=="module"){
    ctrl.gridOptions.autoGroupColumnDef={
        headerName: "Parent Modules",
        minWidth: 200,
        cellRendererParams: { suppressCount: true },
        sortable: false,
    resizable: true,
    filter: false 
  }

//   ctrl.autoGroupColumnDef={
//     headerName: "Parent Modules",
//     minWidth: 200,
//     cellRendererParams: { suppressCount: true },
//     sortable: false,
// resizable: true,
// filter: false 
// }
ctrl.gridOptions.pagination=true
ctrl.gridOptions.paginationPageSize=100
ctrl.gridOptions.getRowId=function (params:any) { return params.data._id }
ctrl.gridOptions.treeData=true
ctrl.gridOptions.getDataPath=(data: any) => { return data.treePath };
ctrl.gridOptions.groupDefaultExpanded=-1


  ctrl.columnDefs=
  // ctrl.columnDefs.push(  
 [ 
  {
    headerName: 'Start Date',
    field: 'startdate',
    width: 40,
    editable: false,
    filter: 'agDateColumnFilter',
    valueFormatter: function (params:any) {
      if(params.value){

        return moment(params.value).format('D/M/ YYYY');
      }
      return ''
        },

  },
  {
    headerName: 'End Date',
    field: 'enddate',
    width: 40,
    editable: false,
    filter: 'agDateColumnFilter',
    valueFormatter: function (params:any) {
      if(params.value){

        return moment(params.value).format('D/M/ YYYY');
      }
      return ''  
      },
  },
  {
  
    field: 'Action',
    maxWidth:85,
    sortable:false,filter: false,
   menuTabs: [],
   lockPosition: 'right',
   lockPinned: true,
    pinned:'right',
    cellRenderer: 'buttonRenderer'

  }
]
ctrl.gridOptions.columnDefs=ctrl.columnDefs
  // )
   if(ctrl.gridaldreadyloaded==true &&  ctrl?.gridApi != null && ctrl?.gridApi != undefined ){
  ctrl.gridApi.updateGridOptions(ctrl.gridOptions)
  ctrl.gridApi.setSideBarVisible(false);

}
nextValue.next(true)

  }else if(ctrl.formName=="Requirement") {
 

    ctrl.gridOptions.treeData=true
    ctrl.gridOptions.getDataPath=(data: any) => { return data.treePath };

ctrl.gridOptions.groupDefaultExpanded=-1
  ctrl.gridOptions.getRowId=function (params:any) { return params.data._id }
  ctrl.gridOptions.excludeChildrenWhenTreeDataFiltering=true; 
    ctrl.gridOptions.autoGroupColumnDef={
      headerName: "Parent Requriement",
      field:"CheckIndex",
      minWidth: 200,
      cellRendererParams: { suppressCount: true },
      sortable: false,
      resizable: true,
      filter: false
}
// ctrl.autoGroupColumnDef={
//   headerName: "Parent Requriement",
//   field:"CheckIndex",
//   minWidth: 200,
//   cellRendererParams: { suppressCount: true },
//   sortable: false,
//   resizable: true,
//   filter: false
// }
    const Sprintvalue:any=ctrl.sprintCellEditorParams
    const modelvalue:any=ctrl.moduleCellEditorParams
   
    ctrl.columnDefs=
    // .push(  
      [
    //   {
    //   headerName: 'Parent Requirement ID',
    //   field: 'parentmodulename',
    //   width: 40,
    //   filter: 'agTextColumnFilter',
    //   editable: true,
    //   hide: true
    // },  
     {
      headerName: 'Requirement Name',
      field:"CheckIndex",
      width: 40,
      filter: 'agTextColumnFilter',
      initialHide:true
    },
    {
      headerName: 'Sprint Id',
      field: 'sprint_id',
      width: 40,
      editable: true,
      filter: 'agNumberColumnFilter',
      cellEditor: 'agRichSelectCellEditor',
      cellEditorParams: {
        values:Sprintvalue
      },
    }, {
      headerName: 'Module Id',
      field: 'module_id',
      width: 40,
      editable: true,
      filter: 'agTextColumnFilter', 
      cellEditor: 'agRichSelectCellEditor',
      cellEditorParams: {
        values:modelvalue
      },
    }, {
      headerName: 'Test Case Count',
      field: 'number_of_TestCase_count',
      maxWidth: 160,
      editable: false,
      filter: 'agNumberColumnFilter',
    }, {
      headerName: 'Task Count',
      field: 'number_of_Task_count',
      maxWidth: 160,
      editable: false,
      filter: 'agNumberColumnFilter',
    },
    {
  
      field: 'Action',
      maxWidth:85,sortable:false,filter: false,
     menuTabs: [],
     lockPosition: 'right',
     lockPinned: true,
      pinned:'right',
      cellRenderer: 'buttonRenderer'
  
    }
  ] 
  ctrl.gridOptions.columnDefs=ctrl.columnDefs
  if(ctrl.gridaldreadyloaded==true &&  ctrl?.gridApi != null && ctrl?.gridApi != undefined ){
    ctrl.gridApi.updateGridOptions(ctrl.gridOptions)
    ctrl.gridApi.setSideBarVisible(false);
  }
nextValue.next(true)

  }
  else if(ctrl.formName=="projectteam") {
ctrl.gridOptions.treeData=true
ctrl.gridOptions.getDataPath=(data: any) => { return data.treePath };
ctrl.gridOptions.getRowId=function (params:any) { return params.data._id }
ctrl.gridOptions.pagination=true
ctrl.gridOptions.paginationPageSize=100
ctrl.gridOptions.groupDefaultExpanded=-1
    ctrl.gridOptions.autoGroupColumnDef={
      headerName: "Team  Name",
      field:"name",
      // minWidth: 200,
      cellRendererParams: { suppressCount: true },
      sortable: false,
      resizable: true,
      filter: false
}
// ctrl.autoGroupColumnDef={
//   headerName: "Team Specification Name",
//   field:"name",
//   // minWidth: 200,
//   cellRendererParams: { suppressCount: true },
//   sortable: false,
//   resizable: true,
//   filter: false
// }
    ctrl.columnDefs=[
    // .push(	
				
		{ 
			"headerName": "Employee Name", "field": "employe_name" 
		},
	  { 
		"headerName": "Project Role", "field": "role_id" 
	},  { 
		"headerName": "Reporting Person", "field": "approved_by_name" 
	},
  {
    headerName: 'Start Date',
    field: 'scheduled_start_date',
    width: 45,
    editable: false,
    filter: 'agDateColumnFilter',
    valueFormatter: function (params:any) {
      if(params.value){

        return moment(params.value).format('D/M/ YYYY');
      }
      return ''
    },

  },
  {
    headerName: 'End Date',
    field: 'scheduled_end_date',
    width: 40,
    editable: false,
    filter: 'agDateColumnFilter',
    valueFormatter: function (params:any) {
      if(params.value){

        return moment(params.value).format('D/M/ YYYY');
      }
      return ''    
    },
  },
	  { 
		"headerName": "status", "field": "status" 
	}
  ,
  {
  
    field: 'Action',
    maxWidth:85,sortable:false,filter: false,
   menuTabs: [],
   lockPosition: 'right',
   lockPinned: true,
    pinned:'right',
    cellRenderer: 'buttonRenderer'

  }
  // {
	// 			"headerName": "Team Id",
	// 			"field": "team_id",
	// 			"sortable": true,
	// 			"filter": "agTextColumnFilter"
	// 		},	{
	// 			"headerName": "Team Name",
	// 			"field": "team_name",
	// 			"sortable": true,
	// 			"filter": "agTextColumnFilter"
	// 		},
	// 		{
	// 			"headerName": "status",
	// 			"field": "status",
	// 			"sortable": true,
	// 			"filter": "agTextColumnFilter"
	// 		}
      // )
]
// ctrl.cfg.detectChanges()

ctrl.gridOptions.columnDefs=ctrl.columnDefs
nextValue.next(true)

if(ctrl.gridaldreadyloaded==true &&  ctrl?.gridApi != null && ctrl?.gridApi != undefined ){
  ctrl.gridApi.updateGridOptions(ctrl.gridOptions)
  ctrl.gridApi.setSideBarVisible(false);
}

  }
  else if(ctrl.formName=="test_result") {
    ctrl.gridOptions.groupDefaultExpanded=-1
ctrl.gridOptions.groupAllowUnbalanced=true;
ctrl.gridOptions.pagination=true;
ctrl.gridOptions.getRowId=function (params:any) { return params.data.unique }

ctrl.gridOptions.paginationPageSize=100
    ctrl.gridOptions.autoGroupColumnDef={
      headerName: "Requirement Name",
      field:"requirement_name",
      cellRendererParams: { suppressCount: true },
      sortable: false,
      resizable: true,
      filter: false
}
ctrl.gridOptions.treeData=false;
// ctrl.autoGroupColumnDef={
//   headerName: "Requirement Name",
//   field:"requirement_name",
//   maxWidth: 280,
//   cellRendererParams: { suppressCount: true },
//   sortable: false,
//   resizable: true,
//   filter: false
// }
    ctrl.columnDefs=[
    // .push(  
      {
        headerName: 'Module id',
        field: 'module_id',
        width: 40,
        enableRowGroup:true,
        showRowGroup:false,
        hide:true,
        filter: 'agTextColumnFilter',
      },
    //  {
    //     headerName: 'Requirement Id',
    //     field: 'requriment._id',
    //     width: 40,rowGroup:true,showRowGroup:false,
    //     filter: 'agTextColumnFilter',
    //   }, 
      {
      headerName: 'Requirement Name',
      field: 'requirement_name',
      width: 40,       
      showRowGroup:false,
      resizable:true, 
      enableRowGroup:true,
      filter: 'agTextColumnFilter',
    },
   {
      headerName: 'Test Case Name',
      field: 'test_case_name',
      width: 40,
      editable: false,
      filter: 'agTextColumnFilter',
    }, {
      headerName: 'Test Case Type',
      field: 'test_case_scenario',
      width: 40,
      editable: false,
      filter: 'agTextColumnFilter',
    }, 
    {
      headerName: 'Total Test Result ',
      field: 'test_cases_length',
      width: 40,
      editable: false,
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'Test Result Stauts',
      field: 'test_result_stauts',
      width: 40,
      editable: false,
      filter: 'agTextColumnFilter',
    },{
      headerName: 'Bug Count',
      field: 'bug_count',
      width: 40,
      editable: false,
      filter: 'agTextColumnFilter',
    },
    // Need Separate
    // {
    //   field: 'test_data',
    //   editable: true,
    //   cellEditor: 'agLargeTextCellEditor',
    //   cellEditorPopup: true,
    //   cellEditorPopupPosition:'under',
    //   cellEditorParams: {
    //     component:function(parms:any){
    //       console.error(parms);
    //       return "<p [innerHTML]={{parms.data}}></p>"
    //     }
    //     ,
    //     maxLength: '300',
    //     cols: '50',
    //     rows: '6',
    //   },
    // }, 
    {
  
      field: 'Action',
      maxWidth:85,sortable:false,filter: false,
     menuTabs: [],
     lockPosition: 'right',
     lockPinned: true,
      pinned:'right',
      cellRenderer: 'buttonRenderer'
  
    }
  ]

    // )
// ctrl.cfg.detectChanges()
ctrl.gridOptions.columnDefs=ctrl.columnDefs
if(ctrl.gridaldreadyloaded==true &&  ctrl?.gridApi != null && ctrl?.gridApi != undefined ){
  ctrl.gridApi.updateGridOptions(ctrl.gridOptions)
  ctrl.gridApi.setSideBarVisible(false);
}
nextValue.next(true)

  }
  else if(ctrl.formName=="bug_list"||ctrl.formName=="regression") {
    ctrl.pageHeading="Bug List"
    ctrl.gridOptions.treeData=false
    // ctrl.autoGroupColumnDef={}
ctrl.gridOptions.sideBar= {
  toolPanels: [
      {
          id: 'columns',
          labelDefault: 'Columns',
          labelKey: 'columns',
          iconKey: 'columns',
          toolPanel: 'agColumnsToolPanel',
          minWidth: 225,
          maxWidth: 225,
          width: 225
      },
      {
          id: 'filters',
          labelDefault: 'Filters',
          labelKey: 'filters',
          iconKey: 'filter',
          toolPanel: 'agFiltersToolPanel',
          minWidth: 180,
          maxWidth: 400,
          width: 250
      }
  ],
  position: 'right',
   
  // defaultToolPanel: 'filters',
};
ctrl.gridOptions.pagination=true
ctrl.gridOptions.paginationPageSize=100
ctrl.gridOptions.pivotMode=false
ctrl.gridOptions.enableCellExpressions=true 
ctrl.defaultColDef.enablePivot=true;
ctrl.defaultColDef.enableRowGroup=true;
ctrl.gridOptions.getRowId=function (params:any) { return params.data._id }

ctrl.gridOptions.suppressAggFuncInHeader=true
ctrl.defaultColDef.sortable=true;
ctrl.defaultColDef.editable=false;
ctrl.defaultColDef.enableValue=true;
ctrl.defaultColDef.pivot=true;
// ctrl.gridOptions.tool=true;
// ctrl.gridOptions.columnTypes= {
//   valueColumn: {
//     editable: true,
//     aggFunc: 'sum',
//     valueParser: 'Number(newValue)',
//     cellClass: 'number-cell',
//     cellRenderer: 'agAnimateShowChangeCellRenderer',
//     filter: 'agNumberColumnFilter',
//   },
//   totalColumn: {
//     cellRenderer: 'agAnimateShowChangeCellRenderer',
//     cellClass: 'number-cell',
//   },
// };  [tooltipInteraction]="true"
 ctrl.gridOptions.tooltipInteraction=true
ctrl.defaultColDef.menuTabs=['generalMenuTab','filterMenuTab','columnsMenuTab'];
// ctrl.defaultColDef.menuTabs.push('')
    ctrl.columnDefs=[
    // .push(  
      // {
      //   headerName: 'Total',
      //   type: 'totalColumn',
      //   // we use getValue() instead of data.a so that it gets the aggregated values at the group level
      //   valueGetter:
      //     'getValue("a")',
      // }, { field: 'a', type: 'valueColumn',valueFormatter:(params:any)=>{
      //    return params.node.rowIndex
      // } },
        {
        headerName: 'Issue ID',
        field: 'test_case_id',
        width: 40,
        // rowGroup:true,
        // showRowGroup:false,
        // hide:true,
        enableValue: true,
        filter: 'agTextColumnFilter',
      },
  //  {
  //     headerName: 'Test Result Status',
  //     field: 'testcase.test_case_name',
  //     width: 40,
  //     editable: false,
  //     filter: 'agTextColumnFilter',
  //   },
   
   {
      headerName: 'Test Case Name',
      field: 'testcase.test_case_name',
      width: 40,        enableValue: true,
      editable: false,
      filter: 'agTextColumnFilter',
    }, 
     {
      headerName: 'Test Case Type',
      field: 'testcase.test_case_scenario',
      width: 40,
      editable: false,        enableValue: true,

      filter: 'agTextColumnFilter',
    }, 
    {
      headerName: 'Issue Type',
      field: 'test_result.error_type',
      width: 40,
      editable: false,        enableValue: true,

      filter: 'agTextColumnFilter',
      valueFormatter:function(parse:any){
        if(parse?.value){
          return  parse.value.toUpperCase().replaceAll("_",' ')
        }
      },
      enableRowGroup:true,
    },
    {
      headerName: 'Issue Priority', 
      // headerName: 'Issue Severity',
      field: 'test_result.error_priority',
      width: 40,     
      maxWidth:150,
        tooltipField: 'test_result.error_priority',
        enableValue: true,
      editable: false,
      valueFormatter:function(parse:any){
        if(parse?.value){
          let data:any =' '
          return data
        // return parse.value.toUpperCase().replaceAll("_",' ')
      } 
    },cellStyle :(params: any) =>{ 
      let style: string;

if (params.value === "high") {
  style = '#FF5733';
} else if (params.value === "low") {
  style = '#EFECCA';
} else if (params.value === "medium") {
  style = '#A7DBD8';
} else if (params.value === "show stoper") {
  style = '#900C3F';
} else {
  style = ''; 
}

    return {'background-color': style}
  },
      enableRowGroup:true,
      filter: 'agTextColumnFilter',
    }, {
      headerName: 'Raised By',
      field: 'bugemploye_name',
      width: 40,        enableValue: true,

      editable: false,
      
      enableRowGroup:true,
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'assign to',
      field: 'taskemploye_name',
      width: 40,
      editable: false,        enableValue: true,

      
      enableRowGroup:true,
      filter: 'agTextColumnFilter',
    },
    // {
    //   headerName: 'Done By',
    //   field: 'bug_count',
    //   width: 40,
    //   editable: false,
    //   filter: 'agTextColumnFilter',
    // },
    {
      headerName: 'Status',
      field: 'devops_Status',
      width: 40,        enableValue: true,

      editable: false,
      filter: 'agTextColumnFilter',
    }
    // ,
    //   {
  
    //   field: 'Action',
    //   sortable:false,
    //   filter:false,
    //   resizable:false,
    //   maxWidth: 110,
    //   cellRenderer: 'buttonRenderer'
  
    // }
  ]
    // )
// ctrl.cfg.detectChanges()
ctrl.gridOptions.columnDefs=ctrl.columnDefs
if(ctrl.gridaldreadyloaded==true &&  ctrl?.gridApi != null && ctrl?.gridApi != undefined ){
  ctrl.gridApi.updateGridOptions(ctrl.gridOptions)
}
nextValue.next(true)

  }
  else if(ctrl.formName=="team_member") {
    // ctrl.pageHeading="Team Member"
    const Assigned:any=ctrl.AssignTOCellEditorParams
ctrl.gridOptions.getRowId=function (params:any) { return params.data._id }

    ctrl.gridOptions.treeData=true
    ctrl.gridOptions.getDataPath=(data: any) => { return data.treePath };

ctrl.gridOptions.pagination=true
ctrl.gridOptions.paginationPageSize=50
    ctrl.gridOptions.autoGroupColumnDef={
      headerName: "Requriement Name",
      field:"requirement_name",
      minWidth: 200,
      cellRendererParams: { suppressCount: true },
      sortable: false,
      resizable: true,
      filter: false,
      // refData:
}
// ctrl.autoGroupColumnDef={
//   headerName: "Requriement Name",
//   field:"requirement_name",
//   minWidth: 200,
//   cellRendererParams: { suppressCount: true },
//   sortable: false,
//   resizable: true,
//   filter: false,
// }

ctrl.gridOptions.rowSelection='single'
ctrl.gridOptions.groupSuppressBlankHeader=true;
ctrl.gridOptions.groupDefaultExpanded=-1
ctrl.gridOptions.getRowId=function(rowData:any){return rowData.data['_id']}
    ctrl.columnDefs =[
    // .push(  
    
      {
        headerName: "Task Id",
        field: "task_id",
        cellDataType: "text",
        editable: false,
        sortable: true,
      },
      {
        headerName: "Task Type",
        cellDataType: "text",
        field: "task_type",
        editable: function(parms: any) {
          return parms.data.taskeditable
        },cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
          values:["UI/UX","API","Testing","UI Development"]
        },
      },{
        headerName: "Task Name",
        cellDataType: "text",
        field: "task_name",
        editable: function(parms: any) {
          return parms.data.taskeditable
        }
      },
      
      // {
      //   headerName: "Days",
      //   field: "days",

      //   editable: function(parms) {
      //     return parms.data.taskeditable
      //   },
      //   cellDataType: "number",
      //   cellEditor: "agNumberCellEditor",
      //   cellEditorParams: {
      //     min: 0,
      //     max: 100,
      //     precision: 2,
      //   },
      // }, 
      {
        headerName: "Allocated Hours",
        cellDataType: "number",
        field: "allocated_hours",
        editable: function(parms: any) {
          return parms.data.taskeditable
        } ,cellEditor: "agNumberCellEditor",
        cellEditorParams: {
          min: 0,
          max: 40,
          precision: 0,
        },
      },
      {
        headerName: "Start Date",
        cellDataType: "date",
        field: "scheduled_start_date",
        cellEditor: "agDateCellEditor",
        // cellEditorParams: {
        //     min: moment
        //  }
        valueFormatter: function (params: any) {
          if (params.value) {
            let data=params.value
            return moment(data).format("DD-MM-YYYY");
          }
          return '' 
        },
        editable: function(parms: any) {
          return parms.data.taskeditable
        }
      },
      {
        headerName: "End Date",
        cellDataType: "date",
        field: "scheduled_end_date",
        valueFormatter: function (params: any) {
          if (params.value) {
            let data=params.value
            return moment(data).format("DD-MM-YYYY");
          }
          return '' 
        },
        editable: function(parms: any) {
          return parms.data.taskeditable
        }
      },
     
      {
        headerName: "Depend Task",
        cellDataType: "text",
        field: "depend_task",

        editable: function(parms: any) {
          return parms.data.taskeditable
        }      },
      {
        headerName: "Assigned to ",
        field: "assigned_to",
        cellDataType: "text",

        editable: function(parms: any) {
          return parms.data.taskeditable
        } ,     cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
          values:Assigned
        },
      },
      {
  
        field: 'Action',
        maxWidth:85,sortable:false,filter: false,
       menuTabs: [],
       lockPosition: 'right',
       lockPinned: true,
        pinned:'right',
        cellRenderer: 'buttonRenderer'
    
      }
  
    ] 
ctrl.gridOptions.columnDefs=ctrl.columnDefs
if(ctrl.gridaldreadyloaded==true &&  ctrl?.gridApi != null && ctrl?.gridApi != undefined ){
  ctrl.gridApi.updateGridOptions(ctrl.gridOptions)
  ctrl.gridApi.setSideBarVisible(false);
}
nextValue.next(true)

  }else{
    nextValue.next(false)
  }
   
  return nextValue.asObservable();

  }

  //   LoadDataForTreeData(ctrl:any): Observable<boolean>{
  //     var nextValue = new Subject<boolean>()

  //     return nextValue.asObservable();

  // }

  LoadDataForTreeData(ctrl:any) : Observable<boolean> {
    var nextValue = new Subject<boolean>()
    // ! UNDO
    if (ctrl.gridApi) { ctrl.gridApi.updateGridOptions({rowData:[]}) }
    
    if(ctrl.formName=="module"){
    this.fetchModuleData(ctrl).subscribe(finsihed=>{
      nextValue.next(finsihed)
    })
      }else if(ctrl.formName=="Requirement"){
        this.fetchRequirementData(ctrl).subscribe(finsihed=>{
          nextValue.next(finsihed)
        })
      }else if(ctrl.formName=="projectteam"){
        this.fetchProjectTeamData(ctrl).subscribe(finsihed=>{
          nextValue.next(finsihed)
        })
       }else if(ctrl.formName=="test_result"){
        this.fetchTestResultData(ctrl).subscribe(finsihed=>{
          nextValue.next(finsihed)
        })
      }else if(ctrl.formName=="bug_list"){
        
        this.dataService.lookUpBug(ctrl.response.project_id,'').subscribe((res:any)=>{
    // ctrl.cfg.detectChanges()
    ctrl.listData=res.data.response
    nextValue.next(true)

    // ctrl.gridApi.applyTransaction({add:[ctrl.listData]})
    ctrl.gridApi.updateGridOptions({rowData:ctrl.listData})
          // ctrl.gridApi.setSideBarVisible(true);
          // ctrl.updateGrid()
    
          // if(ctrl.formName=="bug_list"){ctrl.gridApi.setSideBarVisible(true)}
    
        })
       }else if(ctrl.formName=="regression"){
            this.dataService.getDataById("regression",ctrl.parms ).subscribe((res:any)=>{
              
              ctrl.dataService.lookUpBug(ctrl.response.project_id,res.data[0].regression_id).subscribe((res:any)=>{
                let data:any=res.data.response
    // ctrl.cfg.detectChanges()
    
                ctrl.listData=data
                nextValue.next(true)

                // ctrl.updateGrid()
                // ctrl.gridApi.applyTransaction({add:[ctrl.listData]})
                ctrl.gridApi.updateGridOptions({rowData:ctrl.listData})
              })
            })
          }     else if(ctrl.formName=="team_member"){
            // ctrl.dataService
            // .getDataById("project", "6554bb7e052126c9587741a5")
            // .subscribe((data: any) => {
            //   console.log(data);
              this.dataService
                .lookupTreeData("task_requriment", ctrl.response.project_id)
                .subscribe((res: any) => {
                  // ctrl.listData = res.data.response;
                  if(res.data.response!=null){
                    ctrl.GroupRow(res.data.response);
                  }
                });
              
            // });
        }  else if(ctrl.formName=="sprint"){
          // ctrl.dataService
          // .getDataById("project", "6554bb7e052126c9587741a5")
          // .subscribe((data: any) => {
          //   console.log(data);
          let Projectfiler:any={
            start:0,end:1000,filter:[{
              
                clause: "AND",
                conditions: [
                  {column: "project_id",operator: "EQUALS",type: "string",value: ctrl.response.project_id},
                ],
              
            }]
          }
            this.dataService
              .getDataByFilter("sprint", Projectfiler)
              .subscribe((res: any) => {
                // ctrl.listData = res.data.response;
                // if(res.data.response!=null){
                //   ctrl.GroupRow(res.data.response);
                // }
              });
            
          // });
      }  else if(ctrl.formName=="release"){
        // ctrl.dataService
        // .getDataById("project", "6554bb7e052126c9587741a5")
        // .subscribe((data: any) => {
        //   console.log(data);
          this.dataService
            .lookupTreeData("task_requriment", ctrl.response.project_id)
            .subscribe((res: any) => {
              // ctrl.listData = res.data.response;
              // if(res.data.response!=null){
              //   ctrl.GroupRow(res.data.response);
              // }
            });
          
        // });
    }
    return nextValue.asObservable();

      // if(ctrl?.gridApi != null || ctrl?.gridApi != undefined){
      //   ctrl.gridApi.updateGridOptions({rowData:ctrl.listData})
      //   // ctrl.gridApi.setColumnDefs(ctrl.columnDefs)
      //  ctrl.gridApi.setSideBarVisible(false);
      //   ctrl.gridApi.refreshClientSideRowModel('group')
      //   // ctrl.gridApi.refreshClientSideRowModel()
      // }
      // if(ctrl.formName=="bug_list"){ctrl.gridApi.setSideBarVisible(true)}
    
    
    }
    // taskdount:any=1
    
     fetchModuleData(ctrl:any): Observable<any>{
      var nextValue = new Subject<boolean>()
      let Projectfiler:any={
        start:0,end:1000,filter:[{
          
            clause: "AND",
            conditions: [
              {column: "project_id",operator: "EQUALS",type: "string",value: ctrl.response.project_id},
            ],
          
        }]
      }
    // ctrl.response.project_id
        this.dataService.getDataByFilter("modules", Projectfiler).subscribe((res: any) => {
          ctrl.listData = [] 
          let data:any=res.data[0].response
          for (let idx = 0; idx < data.length; idx++) {
            const row = data[idx];
            if (row.parentmodulename == "" || !row.parentmodulename) {
              row.treePath = [row.modulename];
            } else {
              var parentNode = ctrl.listData.find((d:any) => d.modulename == row.parentmodulename);
              if (
                parentNode &&
                parentNode.treePath &&
                !parentNode.treePath.includes(row.modulename)
              ) {
                row.treePath = [...parentNode.treePath];
                row.treePath.push(row.modulename);
              }
            }
            ctrl.listData.push(row);
    // ctrl.cfg.detectChanges()
    console.log(ctrl.listData);
    
            // ctrl.getmodules()
          }
          if (ctrl.gridApi) {
            // ctrl.gridApi.applyTransaction({add:[ctrl.listData]})
            ctrl.gridApi.updateGridOptions({rowData:ctrl.listData})
            nextValue.next(true)
          }
        });
        // ctrl.updateGrid();
        return nextValue.asObservable();

    }
    
     fetchRequirementData(ctrl:any) : Observable<any>{
      var nextValue = new Subject<boolean>()

      this.dataService.lookupTreeData("requriment",ctrl.response.project_id).subscribe((res:any) =>{
        const data = res.data.response; 
        if(data !=null){
          // let ParentValue:any []=data.filter((row:any)=>{ return row.parentmodulename == "" || !row.parentmodulename }) 
        let parentTreeData: any[] = [];
        let childIndex: { [key: string]: number } = {};
        let parentIndex: number = 1; // Initialize parentIndex
        if(!_.isEmpty(data)){
          data.forEach((row: any) => {
            if (row && row.module_id) {
              let datafound = ctrl.ValueToCompareRequriementModules == undefined || _.isEmpty(ctrl.ValueToCompareRequriementModules) ? ctrl.moduleCellEditorParams(true) : ctrl.ValueToCompareRequriementModules;
              let findValue: any = datafound.find((val: any) => val.value == row.module_id);
              row.module_id = findValue?.label;
            }
          
            if (row.parentmodulename == "" || !row.parentmodulename) {
              row.treePath = [row.requirement_name];
              row.index = parentIndex.toString();
              row.CheckIndex=row.index+' ' +row.requirement_name
              row.parentIndex = null; // Use null for top-level elements
              parentTreeData.push(row);
            } else {
              const parent = parentTreeData.find((d) => d._id === row.parentmodulename);
              if (parent) {
                childIndex[row.parentmodulename] = (childIndex[row.parentmodulename] || 0) + 1;
                row.treePath = [...parent.treePath, row.requirement_name];
                row.parentIndex = parent.index;
                row.index = `${row.parentIndex}.${childIndex[row.parentmodulename]}`;
                row.CheckIndex=row.index+' ' +row.requirement_name
                parentTreeData.push(row);
              }
            }
          
            if (!row.parentmodulename) {
              parentIndex++;
            }
          });
        // ctrl.cfg.detectChanges()
        
          ctrl.listData = parentTreeData;
          // ctrl.updateGrid()
          if (ctrl.gridApi) {
            // ctrl.gridApi.applyTransaction({add:[ctrl.listData]})
            ctrl.gridApi.updateGridOptions({rowData:ctrl.listData})
          }
          nextValue.next(true)
        }
        
          
        }
        
              })
              return nextValue.asObservable();

    }
    
     fetchProjectTeamData(ctrl:any) : Observable<boolean> {
      var nextValue = new Subject<boolean>()
      let Projectfiler:any={
        start:0,end:1000,filter:[{
          
            clause: "AND",
            conditions: [
              {column: "project_id",operator: "EQUALS",type: "string",value:ctrl.response.project_id },
            ],
          
        }]
      }
      // let allvalues:any=[]
      // ctrl.dataService.getDataByFilter("team_specificationList",Projectfiler )
      this.dataService.lookupTreeData("team_specificationList",ctrl.response.project_id ).subscribe((res: any) => {
        ctrl.listData = [] 
        // for (let idx = 0; idx < res.data.response.length; idx++) {
        //   const row = res.data.response[idx];
        if(res != null ){
    
          for (let idx = 0; idx < res.length; idx++) {
            const row = res[idx];
            if (row.parentmodulename == "" || !row.parentmodulename) {
              row.treePath = [row._id];
            } else {
              var parentNode = ctrl.listData.find((d:any) => d._id == row.parentmodulename);
              if (
                parentNode &&
                parentNode.treePath &&
                !parentNode.treePath.includes(row._id)
              ) {
                row.treePath = [...parentNode.treePath];
                row.treePath.push(row.user_id);
              }
            } 
            // allvalues.push(res);
            
            ctrl.listData.push(row);
        }
    // ctrl.updateGrid()
    if (ctrl.gridApi) {
      // ctrl.gridApi.applyTransaction({add:[ctrl.listData]})
      ctrl.gridApi.updateGridOptions({rowData:ctrl.listData})
    
    }
    nextValue.next(true)
        }
      });
      // console.log(allvalues);      
        return nextValue.asObservable();

    }
    
     fetchTestResultData(ctrl:any) : Observable<boolean> {
      var nextValue = new Subject<boolean>()
      this.dataService.lookupTreeData("regression",ctrl.response._id).subscribe((res:any)=>{
        if(res.data.response != null ){
          let test_Case_Details:any[]=[]
          res.data.response.forEach((xyz:any)=>{
            if(!_.isEmpty(xyz.test_result)){
        
              test_Case_Details.push(...xyz.test_result)
            }
          }) 
        let overalldata: any[] = [];
        let virtualDAta:any=res.data.response
        virtualDAta.forEach((vals: any) => {
          vals.testcase.forEach((data: any) => {
            let testcase_id=data._id
            let combinedData = {
                ...data,
                ...vals.requirement,
            };
            combinedData["requriment_id"] = vals.requirement._id
            combinedData["test_case_id"] = testcase_id
            const refFound: any[] = test_Case_Details.filter((d: any) => {return d.testCase_id == combinedData.test_case_id});
            if(!_.isEmpty(refFound)){
              const hasFailures: boolean = refFound.some((d: any) => {return d.result_status === "F"});
              const failList: any = refFound.filter((d: any) => {return d.result_status === "F" });
              const resultStatus = hasFailures ? "Fail" : "Pass";
              combinedData['bug_list']=failList
              combinedData['test_result_stauts']=resultStatus      
              combinedData['bug_count']=failList.length
              combinedData['test_cases']=refFound
              combinedData['test_cases_length']=refFound.length
            }
            combinedData.unique=v4()
            overalldata.push(combinedData);
        });
        if (vals?.requirement?.module_id==undefined) {
          vals.requirement['module_id'] = "No Module Id Present";
        }
        if (vals.testcase.length === 0) {
          let combinedData = {
            ...vals.requirement,
        };
          combinedData["requriment_id"] = vals.requirement._id
          combinedData.unique=v4()
            overalldata.push(combinedData);
        }
          });
      // ctrl.cfg.detectChanges()
      
        ctrl.listData = overalldata;
        nextValue.next(true)
        // ctrl.updateGrid()
        if (ctrl.gridApi) {
          // ctrl.gridApi.applyTransaction({add:[ctrl.listData]})
          ctrl.gridApi.updateGridOptions({rowData:ctrl.listData})
        }
        }
      })
      return nextValue.asObservable();

    }
}

