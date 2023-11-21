import { HttpClient } from "@angular/common/http";
import {
  Component,
  TemplateRef,
  ViewChild,
  Input,
  SimpleChanges,
} from "@angular/core";
import { ActivatedRoute, Route, Router } from "@angular/router";
import { ICellRendererAngularComp } from "ag-grid-angular";
import * as moment from "moment";
import { DataService } from "src/app/services/data.service";
import { DialogService } from "src/app/services/dialog.service";
import { AggridTreeComponent } from "./aggrid-tree.component";
import { FormGroup } from "@angular/forms";
import { FormService } from "src/app/services/form.service";
import { HelperService } from "src/app/services/helper.service";
// import { DataService } from "../services/data.service";
// import { DialogService } from "../services/dialog.service";
// import { ProductComponent } from "./product.component";

@Component({
  selector: "app-button-renderer",
  template: `
    <!-- Modules Action Buttons -->
    <div *ngIf="parentRouteName=='module'" >
      <button mat-icon-button [matMenuTriggerFor]="modulemenu" aria-label="Example icon-button with a menu">
        <mat-icon style="padding-bottom:50px">more_vert</mat-icon>
      </button>
      <mat-menu #modulemenu="matMenu">
        <button mat-menu-item (click)="onClickMenuItem('edit', params.data)">
          <mat-icon>edit</mat-icon>
          <span>Edit</span>
        </button>
        <button mat-menu-item (click)="onClickMenuItem('delete', params.data)">
          <mat-icon>delete</mat-icon>
          <span>Delete</span>
        </button>
        <button  mat-menu-item (click)="onClickMenuItem('submodules', params.data)">
          <mat-icon>task</mat-icon>
          <span>Sub Modules</span>
        </button>
        <button mat-menu-item (click)="onClickMenuItem('task', params.data)">
          <mat-icon>task</mat-icon>
          <span>Task</span>
        </button>
        <button mat-menu-item (click)="onClickMenuItem('testcase', this)">
          <mat-icon>description</mat-icon>
          <span>Testcase</span>
        </button>
      </mat-menu>
    </div>
    
    <!-- Requirement Action Buttons -->
    <!--  -->
    <div  *ngIf="parentRouteName=='Requirement'">
      <button mat-icon-button [matMenuTriggerFor]="Requirementmenu" aria-label="Example icon-button with a menu">
        <mat-icon style="padding-bottom:50px">more_vert</mat-icon>
      </button>
      <mat-menu #Requirementmenu="matMenu">
      <button  mat-menu-item (click)="onClickRequirementMenuItem('addsubchild', params.data)">
          <mat-icon>add</mat-icon>
          <span>Sub Requriement</span>
        </button>
        <button mat-menu-item (click)="onClickRequirementMenuItem('edit', params.data)">
          <mat-icon>edit</mat-icon>
          <span>Edit</span>
        </button>
        <button mat-menu-item (click)="onClickRequirementMenuItem('delete', params.data)">
          <mat-icon>delete</mat-icon>
          <span>Delete</span>
        </button>
         <button mat-menu-item (click)="onClickRequirementMenuItem('task', params.data)">
          <mat-icon>task</mat-icon>
          <span>Task</span>
        </button>
        <button mat-menu-item (click)="onClickRequirementMenuItem('testcase', this)">
          <mat-icon>description</mat-icon>
          <span>Test Case </span>
        </button>
      </mat-menu>
    </div>
    
    <div  *ngIf="parentRouteName=='projectteam'">
      <button mat-icon-button [matMenuTriggerFor]="Team_Membermenu">
        <mat-icon style="padding-bottom:50px">more_vert</mat-icon>
      </button>
      <mat-menu #Team_Membermenu="matMenu">
      <button  mat-menu-item *ngIf="params?.data?.team_id" (click)="onclickTEamMembers('addsubchild', params.data)">
          <mat-icon>add</mat-icon>
          <span>Team Member</span>
        </button>
        <button mat-menu-item (click)="onclickTEamMembers('edit', params.data)">
          <mat-icon>edit</mat-icon>
          <span>Edit</span>
        </button>
        <button mat-menu-item (click)="onclickTEamMembers('delete', params.data)">
          <mat-icon>delete</mat-icon>
          <span>Delete</span>
        </button>
      </mat-menu>
    </div>
    <div *ngIf="parentRouteName=='test_result'" >
      <button mat-icon-button *ngIf="params?.data?._id" [matMenuTriggerFor]="test_resultmenu" aria-label="Example icon-button with a menu">
        <mat-icon style="padding-bottom:50px">more_vert</mat-icon>
      </button>
      <mat-menu #test_resultmenu="matMenu">
        
      <button mat-menu-item   (click)="onclicktestResulr('add', params.data)">
          <mat-icon>add</mat-icon>
          <span>Add Test Case</span>
        </button>
        <button mat-menu-item *ngIf="params?.data?.test_case_name" (click)="onclicktestResulr('edit', params.data)">
          <mat-icon>edit</mat-icon>
          <span>Edit Test Case</span>
        </button>
        <button  mat-menu-item *ngIf="params?.data?.test_case_name"  (click)="onclicktestResulr('testresult', params.data)">
          <mat-icon>task</mat-icon>
          <span>Test Result</span>
        </button>
      </mat-menu>
    </div>
    

    <ng-template #taskViewPopup class="example-sidenav" mode="over" style="margin: auto">
      <mat-card>
        <mat-card-header style="flex: 1 1 auto;">
 
        <div style="width: 100%">
          <h2 style="text-align: center;" class="page-title">{{model_heading}} </h2>
          </div>
          <div style="text-align-last: end">
            <mat-icon mat-dialog-close (click)="closedia()">close</mat-icon>
          </div>
 
        </mat-card-header>
        <div *ngIf="this.model_heading== 'Test Case - Add'||this.model_heading== 'Test Case - Add'">
    <span style="font-weight: bold;font-size: large;font-family: 'Times New Roman', Times, serif;font-style: italic;margin-left: 29px;margin-bottom: 10px;">Requirement Name : {{this.gridData.requirement_name}}</span>
      </div>  
        <mat-card-content style="padding-top: 10px">
          <form [formGroup]="form">
            <formly-form [fields]="fields" [form]="form" [model]="model"></formly-form>
          </form>
        </mat-card-content>
        <mat-card-actions>
          <div style="text-align-last: end; width: 100%">
            <button style="margin: 5px" mat-button mat-dialog-close (click)="closedia()">  Cancel </button>
            <button style="margin: 5px" mat-button (click)="resetBtn('reset')">  Reset </button>
            <button  style="margin: 5px;  background:rgb(59,146,155)"  mat-raised-button color="warn"  (click)="saveForm(this.parentRouteName, 'taskViewPopup')" *ngIf="continue_Save==true"> Continue & Save</button> 
            <button style="margin: 5px;  background:rgb(59,146,155)" mat-raised-button color="warn" (click)="this.continue_Save=false;saveForm(this.parentRouteName, 'taskViewPopup')" >   {{continue_Save==true?"Save & Close":"Save"}}  </button>
          </div>
        </mat-card-actions>
      </mat-card>
    </ng-template>
   
    <ng-template #modulesViewPopup class="example-sidenav" mode="over" let-data>
      <mat-card>
        <mat-card-header style="flex: 1 1 auto;">
          <div style="width: 100%">
            <h2 style="text-align: center;" class="page-title">{{model_heading}} </h2>
          </div>
          <div style="text-align-last: end">
            <mat-icon mat-dialog-close (click)="closedia()">close</mat-icon>
          </div>
        </mat-card-header>
        <mat-card-content style="padding-top: 10px">
          <form [formGroup]="form">
            <formly-form [fields]="fields"[form]="form" [model]="data"></formly-form>
          </form>
        </mat-card-content>

        <mat-card-actions>
          <div style="text-align-last: end; width: 100%">
            <button style="margin: 5px" mat-button  mat-dialog-close (click)="closedia()" > Cancel </button>
            <button style="margin: 5px" mat-button (click)="resetBtn()"> Reset </button> 
            <button style="margin: 5px;  background:rgb(59,146,155)"  mat-raised-button color="warn"  mat-button (click)="saveForm(this.parentRouteName, 'modulesViewPopup')" *ngIf="continue_Save==true"> Continue & Save</button> 
            <button  style="margin: 5px;  background:rgb(59,146,155)"  mat-raised-button color="warn" (click)="this.continue_Save=false;saveForm(this.parentRouteName, 'modulesViewPopup')" > Save   </button>
          </div>
        </mat-card-actions>
      </mat-card>
    </ng-template>
  `,
})
export class ButtonComponent implements ICellRendererAngularComp {
  data: any;
  public gridApi: any;
  row_data: any;
  model_heading:any="Sub Module Add "
  id: any;
  config: any;
  pageHeading: any;
  gridData: any;
  @ViewChild("popup", { static: true }) popup!: TemplateRef<any>;
  @ViewChild("modulesViewPopup", { static: true })
  modulesViewPopup!: TemplateRef<any>;
  @Input() selectedRows: any;
  public params: any;
  user: any;
  fields: any;
  jsonData: any;

  @ViewChild("taskViewPopup", { static: true })
  taskViewPopup!: TemplateRef<any>;
  @Input("model") model: any = {};
  form = new FormGroup({});
  selectedModel: any;
  formAction: any;
  formName: any;
  butText = "Save";
  onClose: any;
  continue_Save: any=false;
  constructor(
    public dataService: DataService,
    private dialogService: DialogService,
    private router: Router,

    private helperServices: HelperService,
    private route:ActivatedRoute,
    public ParentComponent: AggridTreeComponent // private httpclient: HttpClient,
  ) // public aggrid: AggridTreeComponent,
  // private formservice: FormService

  { }
parentRouteName:any
  agInit(params: any): void {
    debugger;
    this.gridData = params.data;
    this.params = params;
    this.route.params.subscribe(params => {
      this.parentRouteName=params['component']
    });
  }

  refresh(_params?: any): boolean {
    return true;
  }
  closedia() {
    localStorage.removeItem("projectmembers");
    this.dialogService.CloseALL()
  }

  delete_button() {
    let row: any = this.data;
    this.row_data = {
      name: row["name"],
      delete_flag: 1,
    };
    this.id = this.row_data.id;
    // this.dataService.disable(this.row_data, config, this.id).subscribe((res: any) => {
    //   this.dialog.openSnackBar("Data has been Deleted successfully", "OK")
    //   this.cancel()
    // })
  }
  onClickMenuItem(formAction: any, data?: any) {
     if (formAction == "submodules") {
      this.dataService.loadConfig("module").subscribe((frmConfig: any) => {
        this.formAction = "Add";
        this.config = frmConfig;
        this.model_heading="Sub Module - Add"
        this.fields = frmConfig.form.fields;
        this.dialogService.openDialog(this.modulesViewPopup,null, null, {});
      });
    } else if (formAction == "task") {
      this.dataService.loadConfig("task").subscribe((frmConfig: any) => {
        this.formAction = "Add";
        this.model_heading="Task - Add"

        this.config = frmConfig;
        this.fields = frmConfig.form.fields;
        sessionStorage.setItem("project_id", this.gridData.project_id);
        this.dialogService.openDialog(this.taskViewPopup,null, null, data);
      });
    } else if (formAction == "edit" ) {
      if( data.parentmodulename==''){
        this.model_heading="Module - Edit"

        this.dataService.loadConfig("module").subscribe((frmConfig: any) => {
          this.formAction = "Edit";
         data.isEdit=true;
         this.config = frmConfig;
          this.fields = frmConfig.form.fields;
          this.dialogService.openDialog(this.modulesViewPopup,null, null, data);
        });
      }else{
        this.model_heading="Sub Module - Edit"

        this.dataService.loadConfig("module").subscribe((frmConfig: any) => {
          this.formAction = "Edit";
         data.isEdit=true;
         this.config = frmConfig;
          this.fields = frmConfig.form.fields;
          this.dialogService.openDialog(this.modulesViewPopup,null, null, data);
        });
      }
    } else if (formAction == "delete") {
      if (confirm("Do you wish to delete this record?")) {
        // !Look Up delete
        this.dataService
          .deleteDataById("module", data._id)
          .subscribe((res: any) => {
            console.log(res);
            this.dialogService.openSnackBar(res.message, "OK");
          });
      }
    } else {
      this.data = this.gridData;
      // this.router.navigate(["/list/testcase/" + `${this.data.moduleid}`]);
    }
  }
  onClickRequirementMenuItem(formAction: any, data?: any) {
    console.log('dasdada',formAction);
    
    if (formAction == "addsubchild") {
     this.dataService.loadConfig(this.parentRouteName.toLowerCase()).subscribe((frmConfig: any) => {
       this.formAction = "Add";
       console.log(frmConfig);
       
       this.config = frmConfig;
       this.model_heading="Sub Requirement - Add"
       this.fields = frmConfig.form.fields;
       this.dialogService.openDialog(this.modulesViewPopup,null, null, {});
     });
   } else if (formAction == "edit" ) {
    if(data && data?.module_id){
    let findValue:any=this.ParentComponent.ValueToCompareRequriementModules.find(val=>val.label==data?.module_id)
    console.log(findValue.value);
    data.module_id= findValue.value;
    }
     if( data.parentmodulename==''){
       this.model_heading="Requirement - Edit"

       this.dataService.loadConfig(this.parentRouteName.toLowerCase()).subscribe((frmConfig: any) => {
         this.formAction = "Edit";
         this.config = frmConfig;
         this.fields = frmConfig.form.fields;
         data.isEdit=true;
         this.dialogService.openDialog(this.modulesViewPopup,null, null, data);
       });
     }else{
       this.model_heading="Sub Requirement - Edit"

       this.dataService.loadConfig(this.parentRouteName.toLowerCase()).subscribe((frmConfig: any) => {
         this.formAction = "Edit";
         this.config = frmConfig;
         data.isEdit=true;
         this.fields = frmConfig.form.fields;
         this.dialogService.openDialog(this.modulesViewPopup,null, null, data);
       });
     }
   } else if (formAction == "delete") {
     if (confirm("Do you wish to delete this record?")) {
       // !Look Up delete
       this.dataService
         .deleteDataById("requirement", data._id)
         .subscribe((res: any) => {
           console.log(res);
           this.dialogService.openSnackBar(res.message, "OK");
         });
     }
   } else  if (formAction == "task") {
     this.dataService.loadConfig("task").subscribe((frmConfig: any) => {
      this.formAction = "Add";
      this.config = frmConfig;     
        this.model_heading="Task - Add"
        sessionStorage.setItem("project_id", this.gridData.project_id);

      // data.isEdit=true;
      this.fields = frmConfig.form.fields;
      this.dialogService.openDialog(this.modulesViewPopup,null, null, data);
    })
   }else  if (formAction == "testcase") {
      this.dataService.loadConfig('testcase').subscribe((vals: any) => {
        this.formAction = "Add";
        this.continue_Save=true
        this.model_heading="Test Case - Add"
        this.config = vals;
        // data.isEdit=true;
        this.fields = vals.form.fields;
        this.dialogService.openDialog(this.taskViewPopup,null, null, data);
      });
  }else {
    this.data = this.gridData;
    // this.router.navigate(["/list/testcase/" + `${this.data.moduleid}`]);
  }
 }
 onclickTEamMembers(formAction:any,data?:any){
  // 
  if (formAction == "addsubchild") {
    this.dataService.loadConfig("teamaddmember").subscribe((frmConfig: any) => {
      this.formAction = "Add";
      console.log(frmConfig);
      
      this.config = frmConfig;
      this.model_heading="Team Member - Add"
      this.fields = frmConfig.form.fields;
      this.dialogService.openDialog(this.modulesViewPopup,null, null, {});
    });
  } else if (formAction == "edit" ) {
   if(data && data?.module_id){
   let findValue:any=this.ParentComponent.ValueToCompareRequriementModules.find(val=>val.label==data?.module_id)
   console.log(findValue.value);
   data.module_id= findValue.value;
   }
    if( data.parentmodulename==''){
      this.model_heading="Team Specification - Edit"

      this.dataService.loadConfig(this.parentRouteName.toLowerCase()).subscribe((frmConfig: any) => {
        this.formAction = "Edit";
        this.config = frmConfig;
        this.fields = frmConfig.form.fields;
        data.isEdit=true;
        this.dialogService.openDialog(this.modulesViewPopup,null, null, data);
      });
    }else{
      this.model_heading="Team Member - Edit"

      this.dataService.loadConfig("teamaddmember").subscribe((frmConfig: any) => {
        this.formAction = "Edit";
        this.config = frmConfig;
        data.isEdit=true;
        this.fields = frmConfig.form.fields;
        this.dialogService.openDialog(this.modulesViewPopup,null, null, data);
      });
    }
  } else if (formAction == "delete") {
    if (confirm("Do you wish to delete this record?")) {
      // !Look Up delete
      this.dataService
        .deleteDataById("team_specification", data._id)
        .subscribe((res: any) => {
          console.log(res);
          this.dialogService.openSnackBar(res.message, "OK");
        });
    }
  } 
  else {
   this.data = this.gridData;
   // this.router.navigate(["/list/testcase/" + `${this.data.moduleid}`]);
 }
 }
 onclicktestResulr(formAction:any,data?:any){
  // 
  if (formAction == "add") {
    this.dataService.loadConfig("testcase").subscribe((frmConfig: any) => {
      this.formAction = "Add";
      console.log(frmConfig);
      this.continue_Save=true
      this.model_heading="Test Case - Add"
      this.config = frmConfig;
      // this.model_heading=frmConfig.pageHeading
      this.fields = frmConfig.form.fields;
      this.dialogService.openDialog(this.taskViewPopup,null, null, {});
    });
  } 
  else if (formAction == "edit" ) {
   
      this.dataService.loadConfig("testcase").subscribe((frmConfig: any) => {
        this.formAction = "Edit";
        this.config = frmConfig;   
           this.model_heading="Test Case - Edit"

        data.isEdit=true;
        this.fields = frmConfig.form.fields;
        this.dialogService.openDialog(this.modulesViewPopup,null, null, data);
      });
    
  } else if (formAction == "testresult") {
    
    this.dataService.loadConfig("test_result").subscribe((frmConfig: any) => {
      this.formAction = "Add";
      this.config = frmConfig;   
         this.model_heading="Test Result - Add"

      // data.isEdit=true;
      this.fields = frmConfig.form.fields;
      this.dialogService.openDialog(this.modulesViewPopup,null, null, data);
    });
  } 
  
 }
  // if (ctrl.config.form.collectionName == "modules") {
  //   if (ctrl.autoGroupColumnDef?.headerName == "Parent Modules") {
  //     Object.assign(data, {
  //       parentmodulename: "",
  //       projectid: ctrl.response?.projectid || ctrl.grid.response.projectid,
  //     });
  //   } else if (
  //     ctrl.aggrid.autoGroupColumnDef.headerName == "Parent Modules"
  //   ) {
  //     Object.assign(data, {
  //       projectid: ctrl.response?.projectid || ctrl.grid.response.projectid,
  //       parentmodulename: ctrl.gridData.modulename,
  //     });
  //   } else {
  //     console.log("Object Assign isn't working");
  //   }
  // }
  saveForm(formName: any, val?: any) {
    debugger;
    if(!this.form.valid){
      const invalidLabels:any = this.helperServices.getDataValidatoion(this.form.controls);
      this.dialogService.openSnackBar("Error in " + invalidLabels, "OK");
     this.form.markAllAsTouched();   
    return
    }
    let values: any = this.form.value;
    if(formName=='Requirement'){
    if (val == "modulesViewPopup"&&(this.model_heading=="Sub Requirement - Add" || this.model_heading=="Requirement - Edit" || this.model_heading=="Sub Requirement - Edit" )) {
      values.project_id = this.ParentComponent.response?.project_id;
      values.parentmodulename = this.gridData.requirement_name;
    }
    else if(  this.model_heading=="Task - Add"){
      values.project_id = this.ParentComponent.response?.project_id;
      values.requirement_id = this.gridData._id;
      // values._id="SEQ|TASK"
    }  else if(  this.model_heading=="Test Case - Add"){
      values.project_id = this.ParentComponent.response?.project_id;
      values.requirement_id = this.gridData._id;
    }
    this.dataService.save(this.config.form.collectionName, values).subscribe((data: any) => {
        console.log(data);
        if(this.continue_Save!==true){

          this.dialogService.closeModal();
        }
        this.form.reset();
      });
    }else if(formName=='test_result'){
      if(  this.model_heading=="Test Case - Add"){
        values.project_id = this.ParentComponent.response?.project_id;
        values.requirement_id = this.gridData.requriment_id;
      } else if(this.model_heading=="Test Result - Add"){
        values.project_id = this.ParentComponent.response?.project_id;
        // values.requirement_id = this.gridData.requriment_id;
        values.testCase_id = this.gridData.test_case_id;

      }
      this.dataService.save(this.config.form.collectionName, values).subscribe((data: any) => {
        console.log(data);
        if(this.continue_Save!==true){

          this.dialogService.closeModal();
        }
        this.form.reset();
      });
    }
    else  {
      if(  this.model_heading=="Test Case - Add"){
        values.project_id = this.ParentComponent.response?.project_id;
        values.requirement_id = this.gridData._id;
      }
       // values.project_name=this.gridData.project_name
        // values.client_name = this.ParentComponent.response?.client_name;
        values.project_id = this.ParentComponent.response?.project_id;
        // values.project_name = this.ParentComponent.response?.project_name;
        if (this.gridData.modulename) {
          values.parentmodulename = this.gridData.modulename;
      } else if (this.gridData.team_id) {
          values.parentmodulename = this.gridData.team_id;
      }
      values.status='A'
        // values.project_id=this.gridData.project_id
      // if (val == "modulesViewPopup") {
      //   // values.project_name=this.gridData.project_name
      //   // values.client_name = this.ParentComponent.response?.client_name;
      //   values.project_id = this.ParentComponent.response?.project_id;
      //   // values.project_name = this.ParentComponent.response?.project_name;
  
      //   values.parentmodulename = this.gridData.modulename;
      //   // values.project_id=this.gridData.project_id
      // } else if (val == "taskViewPopup") {
      //   values.moduleid = this.gridData.moduleid;
      //   // values.project_name=this.gridData.project_name
      //   // values.project_id=this.gridData.project_id
      //   // values.client_name = this.ParentComponent.response?.client_name;
      //   values.project_id = this.ParentComponent.response?.project_id;
      //   // values.project_name = this.ParentComponent.response?.project_name;
      // } 
      this.dataService.save(this.config.form.collectionName, values).subscribe((data: any) => {
        console.log(data);
        this.dialogService.closeModal();
        this.form.reset();
      });
    }
    //! To To in transion For time Save
    // this.ParentComponent.getTreeData(this.parentRouteName,true);
    this.ParentComponent.ngOnInit()
  }


  resetBtn(data?: any) {
    debugger;
    this.model = {};
    this.formAction = this.model.id ? "Edit" : "Add";
    this.butText = this.model.id ? "Update" : "Save";
  }
}
