import { HttpClient } from "@angular/common/http";
import {
  Injectable,
  Output,
  ViewChild,
  EventEmitter,
  TemplateRef,
} from "@angular/core";
import * as _ from "lodash";
import { async, catchError, throwError } from "rxjs";
import { Observable, Subject } from "rxjs";
import { DataService } from "./data.service";
import { DialogService } from "./dialog.service";
import { HelperService } from "./helper.service";
import { values } from "lodash";
import * as moment from "moment";
import { AggridTreeComponent } from "../component/aggrid-tree/aggrid-tree.component";

@Injectable({
  providedIn: "root",
})
export class FormService {
  authdata: any;
  user_id: any;
  email: any;
  role_id: any;
  formData = new FormData();
  field: any;
  refId: any;
  model: any;
  dialogservice: any;
  public file: any;
  formControl: any;
  show_button: boolean = true;

  constructor(
    private helperService: HelperService,
    private dataService: DataService,
    private dialogService: DialogService,
    private httpclient: HttpClient
  ) // public aggrid :AggridTreeComponent
  {}

  LoadInitData(ctrl: any) {
    //if id availe, load the existing data
    if (ctrl.id) {
      ctrl.collectionName = ctrl.formName;
      this.LoadData(ctrl).subscribe((res: any) => {
        console.log("existing data loaded");
        this.LoadConfig(ctrl);
      });
    } else {
      this.LoadConfig(ctrl);
    }
  }

  LoadConfig(ctrl: any) {
    this.httpclient
      .get("assets/jsons/" + ctrl.formName + "-" + "form.json")
      .subscribe(async (config: any) => {
        ctrl.config = config;
        ctrl.pageHeading = config.pageHeading;
        ctrl.collectionName = config.form.collectionName;
        ctrl.mode = config.addEditMode ? config.addEditMode : "popup";
        ctrl.model["keyField"] = config.keyField || "id";
        if (ctrl.config.form.collectionName == "project") {
          if (sessionStorage.getItem("ById")) {
            ctrl.model.clientname = sessionStorage.getItem("ById");
          }
        }

        ctrl.id = ctrl.model[config.keyField] || ctrl.model["_id"];
        ctrl.formAction = ctrl.id ? "Edit" : "Add";
        ctrl.butText = ctrl.id ? "Update" : "Save"; //buttons based on the id
        console.log(ctrl.id ? "Edit" : "Add");

        if (ctrl.formAction == "Edit" && ctrl.config.mode == "page") {
          // this.LoadData(ctrl).subscribe((res: any) => {

          ctrl.fields = config.form.fields;
          // })
        } else if (ctrl.formAction == "Edit" && ctrl.mode == "popup") {
          ctrl.model["isEdit"] = true;
          ctrl.model["isshow"] = true;
          ctrl.model["ishide"] = true;
          ctrl.isFormDataLoaded = true;
          ctrl.formAction = ctrl.config.formAction || "Edit";
          ctrl.isEditMode = true;
        }
        ctrl.fields = config.form.fields;
      });
  }

  LoadData(ctrl: any): Observable<boolean> {
    var nextValue = new Subject<boolean>();
    this.LoadFormData(ctrl).subscribe((exists) => {
      nextValue.next(exists);
    });
    return nextValue.asObservable();
  }

  LoadFormData(ctrl: any): Observable<boolean> {
    debugger;
    var nextValue = new Subject<boolean>();
    console.log(ctrl);
    
    if (ctrl.id) {
      this.dataService.getDataById(ctrl.collectionName, ctrl.id).subscribe(
        (result: any) => {
          console.log(result);
          
          if (result && result.data[0] && result != null) {
            ctrl.model = result.data[0] || {};
            //we need old data, if update without any changes
            ctrl.modelOldData = _.cloneDeep(ctrl.model);
            ctrl.model["isEdit"] = true;
            ctrl.model["isshow"] = true;
            ctrl.model["ishide"] = true;
            ctrl.isFormDataLoaded = true;
            ctrl.isDataError = false; //???
            ctrl.formAction = ctrl.config.formAction || "Edit";
            ctrl.isEditMode = true;
            nextValue.next(true);
            console.log("if");
          } else {
            ctrl.model["isEdit"] = false;
            ctrl.formAction = "Add";
            ctrl.isFormDataLoaded = false;
            nextValue.next(false);
          }
        },
        (error) => {
          console.error("There was an error!", error);
          nextValue.next(false);
        }
      );
    } else {
      nextValue.next(false);
    }
    return nextValue.asObservable();
  }

  // Add and update the form
  async saveFormData(ctrl: any, file?: any): Promise<any> {
    debugger;
    return new Promise(async (resolve, reject) => {
      if (!ctrl.form.valid) {
        let array = "";
        ctrl.form.markAllAsTouched();
        
        function collectInvalidLabels(controls: any) {
          for (const key in controls) {
            if (controls.hasOwnProperty(key)) {
              const data = controls[key].status;
              if (data === "INVALID") {
                array += controls[key]._fields[0].props.label + ",";
              }
            }
          }
        }

        // Start collecting invalid labels
        collectInvalidLabels(ctrl.form.controls);
        const modifiedString = array.slice(0, -1);
        this.dialogService.openSnackBar("Error in " + modifiedString, "OK");
        resolve(undefined);
        return;
      }

      var data: any = ctrl.form.value;
      if (ctrl?.form?.data) {
        data.data = ctrl.form.data;
      }
      if (ctrl.config.form.collectionName == "modules") {
        if (ctrl.autoGroupColumnDef?.headerName == "Parent Modules") {
          Object.assign(data, {
            parentmodulename: "",
            projectid: ctrl.response?.projectid || ctrl.grid.response.projectid,
          });
        } else if (
          ctrl.aggrid.autoGroupColumnDef.headerName == "Parent Modules"
        ) {
          Object.assign(data, {
            projectid: ctrl.response?.projectid || ctrl.grid.response.projectid,
            parentmodulename: ctrl.deletedData.modulename,
          });
        } else {
          console.log("Object Assign isn't working");
        }
      } 
      else if (ctrl.config.form.collectionName == "projectteam") {
        debugger;
        Object.assign(data, {
          projectid: ctrl.response?.projectid || ctrl.grid.response.projectid,
        });
      }
       else if (ctrl.config.form.collectionName == "task") {
        console.log(ctrl, "ctrl");
        if (ctrl.butText == "Update") {
          debugger;
          Object.assign(data, {
            moduleid: ctrl.model.moduleid,
            projectid: ctrl.model.projectid,
            projectname: ctrl.model.projectname,
          });
          this.dataService.update(data, ctrl).subscribe((res: any) => {
            res;
            this.dialogService.openSnackBar(
              "Data has been updated successfully",
              "OK"
            );
            resolve(res);
          });
        }
         else {
          Object.assign(data, {
            moduleid: ctrl.deletedData.moduleid,
            projectid: ctrl.response?.projectid || ctrl.grid.response.projectid,
            projectname: ctrl.grid.response.projectname,
          });
          console.log("lavanya", data);
        }
      }
       else if (ctrl.collectionName == "testcase") {
        Object.assign(data, { moduleid: ctrl.moduleid });
      } 
      
      else if (ctrl.collectionName == "testresult") {
        
        Object.assign(data, {
          testcasename: sessionStorage.getItem("testcasename"),
        });
        Object.assign(data, {
          projectname: sessionStorage.getItem("projectname"),
        });

      } 
        else {
        console.log("Invalid Form");
      }

      //while saving set default values
      // || ctrl.config.formAction == 'Add'
      if (ctrl.formAction == "Add" || ctrl.config.formAction == "Add") {
        var defaultValues = ctrl.config.form.defaultValues || [];
        this.loadDefaultValues(defaultValues, data, ctrl.model);
        ctrl.model = data;
        if (ctrl.collectionName == "employee" && ctrl.formName == "employee") {
          let userdetails: any = {};
          //let dob= moment(data.dob).format("DD-MM-YYYY ");

          userdetails["_id"] = data.email;
          userdetails["name"] = data.firstname + " " + data.lastname;
          userdetails["pwd"] = data.contactno;
          userdetails["role"] = "employee";
          userdetails["employeeid"] = data.employeeid;
          userdetails["accessright"] = data.accessright;
          console.log(userdetails, "user");
          this.dataService.save(data, ctrl).subscribe((res: any) => {
            console.log(res);
          });
          this.dataService
            .saveAll("user", userdetails)
            .subscribe((res: any) => {
              res;
              // this.dialogService.openSnackBar("Data has been updated successfully", "OK")
              this.dialogService.openSnackBar("Data Added Successfully", "OK");
              resolve(res);
            });
        }
        // else if((ctrl.collectionName=="employee"&&ctrl.formName=="employee")){
        //   let userdetails:any={}
        //   let dob= moment(data.dob).format("DD-MM-YYYY ");

        //   userdetails['_id']=data.email
        //        userdetails['name']=data.firstname+' '+data.lastname
        //        userdetails['pwd']=dob
        //        userdetails['role']='cleint'
        //        userdetails['employeeid']=data.employeeid

        // console.log(userdetails,'user');

        // }
        else {
          // this.dataService.save(data, ctrl).subscribe((res: any) => {
          //   console.log(res)
          //   res
          //   if (res.data != null) {
          //     this.dialogService.openSnackBar("Data Added Successfully", "OK")
          //     resolve(res)
          //     this.dialogService.closeModal()
          //     // this.aggrid.getTreeData()
          //     return
          //   }

          //  else {

          //     this.dialogService.openSnackBar(res.message, "OK")
          //   }
          // })

          this.dataService
            .save(data, ctrl)
            .pipe(
              catchError((error) => {
                if (error.status === 400) {
                  return throwError(error); // Pass the error through
                }
                return throwError(error); // Handle other errors if needed
              })
            )
            .subscribe(
              (res: any) => {
                if (res.data != null) {
                  this.dialogService.openSnackBar(
                    "Data Added Successfully",
                    "OK"
                  );
                  resolve(res);
                  this.dialogService.closeModal();
                } else {
                  this.dialogService.openSnackBar(res.message, "OK");
                }
              },
              (error) => {
                if (error.status === 400) {
                  // Handle the duplicate ID error here
                  this.dialogService.openSnackBar(
                    "ID is Already Exist, Create New",
                    "OK"
                  );
                } else {
                  // Handle other HTTP request errors here
                }
              }
            );
        }
      } else {
        debugger;
        ctrl.model = data;
        console.log(
          ctrl.collectionName == "employee" && ctrl.formName == "employee"
        );

        if (
          (ctrl.collectionName == "employee" && ctrl.formName == "employee") ||
          (ctrl.collectionName == "employee" && ctrl.formName == "employee")
        ) {
          let userdetails: any = {};
          if (
            ctrl.collectionName == "employee" &&
            ctrl.formName == "employee"
          ) {
            userdetails["role"] = "employee";
          } else {
            userdetails["role"] = "client";
          }
          //let dob= moment(data.dob).format("DD-MM-YYYY");

          userdetails["_id"] = data.email;
          userdetails["name"] = data.firstname + " " + data.lastname;
          userdetails["pwd"] = data.contactno;
          userdetails["employeeid"] = data.employeeid;
          userdetails["accessright"] = data.accessright;
          debugger;
          console.log(userdetails, "user");
          this.dataService.update(data, ctrl).subscribe((res: any) => {
            res;
            this.dialogService.openSnackBar(
              "Data has been updated successfully",
              "OK"
            );
            // resolve(res)
            this.dataService
              .UpdateAll("user", data.email, userdetails)
              .subscribe((res: any) => {
                res;
                this.dialogService.openSnackBar(
                  "Data has been updated successfully",
                  "OK"
                );
                resolve(res);
              });
          });
        } else {
          this.dataService.update(data, ctrl).subscribe((res: any) => {
            res;
            this.dialogService.openSnackBar(
              "Data has been updated successfully",
              "OK"
            );
            resolve(res);
          });
        }
      }
    });
  }

  //default values type
  loadDefaultValues(defaultValues: any, formData: any, model: any) {
    //sync way
    defaultValues.map((obj: any) => {
      let val;
      if (obj.type == "date") {
        formData[obj.colName] = moment()
          .utc()
          .startOf("day")
          .add(obj.addDays || 0, "day")
          .format(obj.format || "yyyy-MM-DDT00:00:00.000Z");
      } else if (obj.value.startsWith("@")) {
        val = obj.value.slice(1);
        formData[obj.colName] = model[val];
      } else if (obj.type == "exp") {
        if (obj.source == "local") {
          val = JSON.parse(localStorage.getItem(obj.value) || "");
          let data = val[obj.object][obj.object1];
          formData[obj.colName] = data;
        }
      } else {
        formData[obj.colName] = obj.value;
      }
    });
  }
}
