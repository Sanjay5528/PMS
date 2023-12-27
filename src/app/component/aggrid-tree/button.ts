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
import { v4 as uuidv4 } from "uuid";

@Component({
  selector: "app-button-renderer",
  template: `
    <!-- Modules Action Buttons -->

    <div *ngIf="parentRouteName=='module'" >
      <button mat-icon-button [matMenuTriggerFor]="modulemenu" aria-label="Example icon-button with a menu">
        <mat-icon style="padding-bottom:50px">more_vert</mat-icon>
      </button>
      <mat-menu #modulemenu="matMenu">
      <button  mat-menu-item (click)="onClickMenuItem('submodules', params)">
          <mat-icon>add</mat-icon>
          <span>Sub Modules</span>
        </button>
         <button mat-menu-item (click)="onClickMenuItem('edit', params)">
          <mat-icon>edit</mat-icon>
          <span>Edit</span>
        </button>
        <button mat-menu-item (click)="onClickMenuItem('delete', params)">
          <mat-icon>delete</mat-icon>
          <span>Delete</span>
        </button>
       
        <!-- <button mat-menu-item (click)="onClickMenuItem('task', params.data)">
          <mat-icon>task</mat-icon>
          <span>Task</span>
        </button>
        <button mat-menu-item (click)="onClickMenuItem('testcase', this)">
          <mat-icon>description</mat-icon>
          <span>Testcase</span>
        </button> -->
      </mat-menu>
    </div> 

    <div  *ngIf="parentRouteName=='Requirement'">
      <button mat-icon-button [matMenuTriggerFor]="Requirementmenu" aria-label="Example icon-button with a menu">
        <mat-icon style="padding-bottom:50px">more_vert</mat-icon>
      </button>
      <mat-menu #Requirementmenu="matMenu">
      <button  mat-menu-item (click)="onClickRequirementMenuItem('addsubchild', params)">
          <mat-icon>add</mat-icon>
          <span>Sub Requriement</span>
        </button>
        <button mat-menu-item (click)="onClickRequirementMenuItem('edit', params)">
          <mat-icon>edit</mat-icon>
          <span>Edit</span>
        </button>
        <button mat-menu-item (click)="onClickRequirementMenuItem('delete', params)">
          <mat-icon>delete</mat-icon>
          <span>Delete</span>
        </button>
         <button mat-menu-item (click)="onClickRequirementMenuItem('task', params)">
          <mat-icon>task</mat-icon>
          <span>Add Task</span>
        </button>
        <button mat-menu-item (click)="onClickRequirementMenuItem('testcase', this)">
          <mat-icon>description</mat-icon>
          <span>Add Test Case </span>
        </button>
      </mat-menu>
    </div>
    
    <div  *ngIf="parentRouteName=='projectteam'">
      <button mat-icon-button [matMenuTriggerFor]="Team_Membermenu">
        <mat-icon style="padding-bottom:50px">more_vert</mat-icon>
      </button>
      <mat-menu #Team_Membermenu="matMenu">
      <button  mat-menu-item *ngIf="params?.data?.name" (click)="onclickTEamMembers('addsubchild', params)">
          <mat-icon>add</mat-icon>
          <span>Team Member</span>
        </button>
        <button mat-menu-item (click)="onclickTEamMembers('edit', params)">
          <mat-icon>edit</mat-icon>
          <span>Edit</span>
        </button>
        <button mat-menu-item (click)="onclickTEamMembers('delete', params)">
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
        
      <button mat-menu-item   (click)="onclicktestResulr('add', params)">
          <mat-icon>add</mat-icon>
          <span>Add Test Case</span>
        </button>
        <button mat-menu-item *ngIf="params?.data?.test_case_name" (click)="onclicktestResulr('edit', params)">
          <mat-icon>edit</mat-icon>
          <span>Edit Test Case</span>
        </button>
        <button  mat-menu-item *ngIf="params?.data?.test_case_name"  (click)="onclicktestResulr('testresult', params)">
          <mat-icon>task</mat-icon>
          <span>Add Test Result</span>
        </button> 
        <button mat-menu-item (click)="onclicktestResulr('delete', params)">
          <mat-icon>delete</mat-icon>
          <span>Delete Test Case</span>
        </button>
      </mat-menu>
    </div>

    <div  *ngIf="parentRouteName=='bug_list'">
      <button mat-icon-button *ngIf="params?.data?._id"  [matMenuTriggerFor]="Bugmenu" aria-label="Example icon-button with a menu">
        <mat-icon style="padding-bottom:50px">more_vert</mat-icon>
      </button>
      <mat-menu #Bugmenu="matMenu">
      <button  mat-menu-item (click)="onclickBug('bug', params)">
      <mat-icon>edit</mat-icon>
          <span>Bug Result</span>
        </button>
        <button mat-menu-item (click)="onclickBug('delete', params)">
          <mat-icon>delete</mat-icon>
          <span>Delete</span>
        </button>
      </mat-menu>
    </div>
    
    <div  *ngIf="parentRouteName=='team_member'">
      <button mat-icon-button  [matMenuTriggerFor]="Taskmenu" aria-label="Example icon-button with a menu">
        <mat-icon style="padding-bottom:50px">more_vert</mat-icon>
      </button>
      <mat-menu #Taskmenu="matMenu">
      <button  mat-menu-item *ngIf="params?.data?.task_id==undefined" (click)="onclickTask('add', params)">
      <mat-icon>add</mat-icon>
          <span>Task</span>
        </button>
        <button mat-menu-item *ngIf="params?.data?.task_id!==undefined" (click)="onclickTask('delete', params)">
          <mat-icon>delete</mat-icon>
          <span>Delete</span>
        </button>
      </mat-menu>
    </div>
      
    <div  *ngIf="parentRouteName=='release'">
      <button mat-icon-button  [matMenuTriggerFor]="Taskmenu" >
        <mat-icon style="padding-bottom:50px">more_vert</mat-icon>
      </button>
      <mat-menu #Taskmenu="matMenu">
      <button  mat-menu-item  (click)="onclicktestRelease('release_sprint', params)">
      <mat-icon>add</mat-icon>
          <span>Add Sprint</span>
        </button>
    <button  mat-menu-item (click)="onclicktestRelease('edit', params)">
      <mat-icon>edit</mat-icon>
          <span>Edit Release</span>
        </button>
        <button mat-menu-item (click)="onclicktestRelease('delete', params)">
          <mat-icon>delete</mat-icon>
          <span>Delete Release </span>
        </button>
      </mat-menu>
    </div>

    <div  *ngIf="parentRouteName=='sprint'">
      <button mat-icon-button  [matMenuTriggerFor]="sprint" >
        <mat-icon style="padding-bottom:50px">more_vert</mat-icon>
      </button>
      <mat-menu #sprint="matMenu">
    <button  mat-menu-item (click)="onclicktestSprint('edit', params)">
      <mat-icon>edit</mat-icon>
          <span>Edit </span>
        </button>
        <button mat-menu-item  (click)="onclicktestSprint('delete', params)">
          <mat-icon>delete</mat-icon>
          <span>Delete  </span>
        </button>
      </mat-menu>
    </div>

    <div  *ngIf="parentRouteName=='functionaltesting'">
      <button mat-icon-button  [matMenuTriggerFor]="Taskmenu" >
        <mat-icon style="padding-bottom:50px">more_vert</mat-icon>
      </button>
      <mat-menu #Taskmenu="matMenu">
      <button  mat-menu-item  (click)="onclicktesttesting('CustomRoute', 'test_result')">
      <mat-icon>view_module</mat-icon>
          <span>Test Result</span>
        </button>
        <button  mat-menu-item  (click)="onclicktesttesting('CustomRoute', 'individual_report')">
      <mat-icon>view_module</mat-icon>
          <span>Bug Report</span>
        </button>
    <button  mat-menu-item (click)="onclicktesttesting('edit', params)">
      <mat-icon>edit</mat-icon>
          <span>Edit</span>
        </button>
        <button mat-menu-item (click)="onclicktesttesting('delete', params)">
          <mat-icon>delete</mat-icon>
          <span>Delete</span>
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
            <!-- <button style="margin: 5px" mat-button (click)="resetBtn('reset')">  Reset </button> -->
            <button style="margin: 5px" mat-button (click)="resetBtn('reset')" *ngIf="(butText|lowercase )!=='update' " >Reset</button>

            <button  style="margin: 5px;  background:rgb(59,146,155)"  mat-raised-button color="warn"  (click)="saveForm(this.parentRouteName, 'taskViewPopup')" *ngIf="continue_Save==true"> Continue & Save</button> 
            <button style="margin: 5px;  background:rgb(59,146,155)" mat-raised-button color="warn" (click)="this.continue_Save=false;saveForm(this.parentRouteName, 'taskViewPopup')" >   {{continue_Save==true?"Save & Close":butText}}  </button>
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
            <!-- <button style="margin: 5px" mat-button (click)="this.form.reset();resetBtn()"> Reset </button>  -->
            <button style="margin: 5px" mat-button (click)="resetBtn('reset')" *ngIf="(butText|lowercase )!=='update' " >Reset</button>

            <button style="margin: 5px;  background:rgb(59,146,155)"  mat-raised-button color="warn"  mat-button (click)="saveForm(this.parentRouteName, 'modulesViewPopup')" *ngIf="continue_Save==true"> Continue & Save</button> 
            <button  style="margin: 5px;  background:rgb(59,146,155)"  mat-raised-button color="warn" (click)="this.continue_Save=false;saveForm(this.parentRouteName, 'modulesViewPopup')" > {{butText}}   </button>
          </div>
        </mat-card-actions>
      </mat-card>
    </ng-template>
  `,
})
export class ButtonComponent implements ICellRendererAngularComp {
  data: any;
  model_heading:any="Sub Module Add "
  id: any;
  config: any;
  gridData: any;
  @ViewChild("modulesViewPopup", { static: true })  modulesViewPopup!: TemplateRef<any>;
  public params: any;
  fields: any;

  @ViewChild("taskViewPopup", { static: true })  taskViewPopup!: TemplateRef<any>;
   model: any = {};
  form = new FormGroup({});
  selectedModel: any;
  formAction: any;
  formName: any;
  butText:any = "Save";
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
    this.gridData = params.data;
    this.form.reset();
    this.params = params;
    this.route.params.subscribe(params => {
     this.parentRouteName=params['Action']
    });
  }

  refresh(_params?: any): boolean {
    return true;
  }
  
  closedia() {
    localStorage.removeItem("projectmembers");
    this.continue_Save=false
    this.form.reset();
    this.dialogService.CloseALL()
  }

  onClickMenuItem(formAction: any, params?: any) {
  let  data:any=params.data
     if (formAction == "submodules") {
      this.dataService.loadConfig("module").subscribe((frmConfig: any) => {
        this.formAction = "Add";
        this.config = frmConfig;       
          this.butText="Save"

        this.model_heading="Sub Module - Add"
        this.fields = frmConfig.form.fields;
        this.dialogService.openDialog(this.modulesViewPopup,null, null, {});
      });
    } else if (formAction == "task") {
      this.dataService.loadConfig("task").subscribe((frmConfig: any) => {
        this.formAction = "Add";
        this.model_heading="Task - Add"
        this.butText="Save"

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
         this.butText="Update"
         this.id=data._id;
          this.fields = frmConfig.form.fields;
          this.dialogService.openDialog(this.modulesViewPopup,null, null, data);
        });
      }else{
        this.model_heading="Sub Module - Edit"

        this.dataService.loadConfig("module").subscribe((frmConfig: any) => {
          this.formAction = "Edit";
         data.isEdit=true;
         this.butText="Update";
         this.id=data._id;
         this.config = frmConfig;
          this.fields = frmConfig.form.fields;
          this.dialogService.openDialog(this.modulesViewPopup,null, null, data);
        });
      }
    } else if (formAction == "delete") {
      if (confirm("Do you wish to delete this record?")) {
        // !Look Up delete
        this.dataService
          .deleteDataById("modules", data._id)
          .subscribe((res: any) => {
            console.log(res);
            this.dialogService.openSnackBar(res.message, "OK");
            const transaction: any = {
              remove: [data],
            };
            const result = params.api.applyTransaction(transaction);
            console.log(transaction, result);
          // });
          });
      }
    } else {
      this.data = this.gridData;
      // this.router.navigate(["/list/testcase/" + `${this.data.moduleid}`]);
    }
  }

  onClickRequirementMenuItem(formAction: any, params?: any) { 
    let data:any=params.data
    if (formAction == "addsubchild") {
     this.dataService.loadConfig(this.parentRouteName.toLowerCase()).subscribe((frmConfig: any) => {
       this.formAction = "Add";
       this.butText="Save"
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
         this.butText="Update"
         this.config = frmConfig;
         this.fields = frmConfig.form.fields;
         data.isEdit=true;
         this.id=data._id;
         this.dialogService.openDialog(this.modulesViewPopup,null, null, data);
       });
     }else{
       this.model_heading="Sub Requirement - Edit"

       this.dataService.loadConfig(this.parentRouteName.toLowerCase()).subscribe((frmConfig: any) => {
         this.formAction = "Edit";
         this.butText="Update"
         this.config = frmConfig;
         data.isEdit=true;
         this.id=data._id;
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
           const transaction: any = {
            remove: [data],
          };
          const result = params.api.applyTransaction(transaction);
          console.log(transaction, result);
        // });
         });
     }
   } else  if (formAction == "task") {
     this.dataService.loadConfig("task").subscribe((frmConfig: any) => {
      this.formAction = "Add";   
      this.butText="Save"
      this.config = frmConfig;     
      this.model_heading="Task - Add"
      sessionStorage.setItem("project_id", this.gridData.project_id);
      this.fields = frmConfig.form.fields;
      this.dialogService.openDialog(this.modulesViewPopup,null, null, data);
    })
   }else  if (formAction == "testcase") {
      this.dataService.loadConfig('testcase').subscribe((vals: any) => {
        this.formAction = "Add";
        this.continue_Save=true
        this.model_heading="Test Case - Add"      
        this.butText="Save"
        this.config = vals;
        this.fields = vals.form.fields;
        this.dialogService.openDialog(this.taskViewPopup,null, null, data);
      });
  }else {
    this.data = this.gridData;
    // this.router.navigate(["/list/testcase/" + `${this.data.moduleid}`]);
  }
 }

 onclickTEamMembers(formAction:any,params?:any){
  let data:any=params.data
  if (formAction == "addsubchild") {
    this.dataService.loadConfig("teamaddmember").subscribe((frmConfig: any) => {
      this.formAction = "Add";
      this.butText="Save"
      this.config = frmConfig;
      this.model_heading="Team Member - Add"
      this.fields = frmConfig.form.fields;
      this.dialogService.openDialog(this.modulesViewPopup,null, null, {});
    });
  } else if (formAction == "edit" ) {
    // ? Find The Model Value
   if(data && data?.module_id){
   let findValue:any=this.ParentComponent.ValueToCompareRequriementModules.find(val=>val.label==data?.module_id)
   data.module_id= findValue.value;
   }
    if( data.parentmodulename==''){
      this.model_heading="Team Group Name - Edit"
      this.dataService.loadConfig(this.parentRouteName.toLowerCase()).subscribe((frmConfig: any) => {
        this.formAction = "Edit";
        this.butText="Update"   
        this.id=data._id;
        this.config = frmConfig;
         this.fields = frmConfig.form.fields;
        data.isEdit=true;
        this.dialogService.openDialog(this.modulesViewPopup,null, null, data);
      });
    }else{
      this.model_heading="Team Member - Edit"

      this.dataService.loadConfig("teamaddmember").subscribe((frmConfig: any) => {
        this.formAction = "Edit";
        this.butText="Update"
        this.config = frmConfig;       
        data.isEdit=true;     
        this.id=data._id;

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
          const transaction: any = {
            remove: [data],
          };
          const result = params.api.applyTransaction(transaction);
          console.log(transaction, result);
        // });
        });
    }
  } 
  else {
   this.data = this.gridData;
   // this.router.navigate(["/list/testcase/" + `${this.data.moduleid}`]);
 }
 }

 onclicktestResulr(formAction:any,params?:any){
  let data:any=params.data

  if (formAction == "add") {
    this.dataService.loadConfig("testcase").subscribe((frmConfig: any) => {
      this.formAction = "Add";
      this.butText="Save"
      this.continue_Save=true
      this.model_heading="Test Case - Add"
      this.config = frmConfig;     
      this.fields = frmConfig.form.fields;
      this.dialogService.openDialog(this.taskViewPopup,null, null, {});
    });
  } 
  else if (formAction == "edit" ) {
      this.dataService.loadConfig("testcase").subscribe((frmConfig: any) => {
        this.formAction = "Edit";
        this.butText="Update"   
        this.id=data._id;

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
      this.butText="Save"
      this.fields = frmConfig.form.fields;
      this.dialogService.openDialog(this.modulesViewPopup,null, null, data);
    });
  } else if (formAction == "delete") {
    if (confirm("Do you wish to delete this record?")) {
      // !Look Up delete
      this.dataService
        .deleteDataById("testcase", data.test_case_id)
        .subscribe((res: any) => {
          console.log(res);
          this.dialogService.openSnackBar(res.message, "OK");
          const transaction: any = {
            remove: [data],
          };
          const result = params.api.applyTransaction(transaction);
          console.log(transaction, result);
        // });
        });
    }
  } 
  
 }

 realseAdd:any=false

 onclicktestRelease(formAction:any,params?:any){
  let data:any=params.data

  if (formAction == "release_sprint") {
    this.dataService.loadConfig("release_sprint").subscribe((frmConfig: any) => {
      this.formAction = "Add";
      this.butText="Save" 
      this.model={}
      this.realseAdd=true
      sessionStorage.setItem("release_id",this.gridData._id)
      this.model_heading="Sprint - Add"
      this.config = frmConfig;     
      this.fields = frmConfig.form.fields;
      this.dialogService.openDialog(this.taskViewPopup,null, null, {});
    });
  } 
  else if (formAction == "edit" ) {
      this.dataService.loadConfig("realse").subscribe((frmConfig: any) => {
        this.formAction = "Edit";
        this.butText="Update"   
        this.id=data._id;

        this.config = frmConfig;   
        this.model_heading="Release - Edit"
        data.isEdit=true;
        this.fields = frmConfig.form.fields;
        this.dialogService.openDialog(this.modulesViewPopup,null, null, data);
      });
    
  }  else if (formAction == "delete") {
    if (confirm("Do you wish to delete this record?")) {
      // !Look Up delete
      this.dataService
        .deleteDataById("release", data._id)
        .subscribe((res: any) => {
          console.log(res);
          this.dialogService.openSnackBar(res.message, "OK");
          const transaction: any = {
            remove: [data],
          };
          const result = params.api.applyTransaction(transaction);
          console.log(transaction, result);
        // });
        });
    }
  } 
  
 }
 
 onclicktestSprint(formAction:any,params?:any){
  let data:any=params.data
 if (formAction == "edit" ) {
      this.dataService.loadConfig("sprint").subscribe((frmConfig: any) => {
        this.formAction = "Edit";
        this.butText="Update"   
        this.id=data._id;

        this.config = frmConfig;   
        this.model_heading="Release - Edit"
        data.isEdit=true;
        this.fields = frmConfig.form.fields;
        this.dialogService.openDialog(this.modulesViewPopup,null, null, data);
      });
    
  }  else if (formAction == "delete") {
    if (confirm("Do you wish to delete this record?")) {
      // !Look Up delete
      this.dataService
        .deleteDataById("sprint", data._id)
        .subscribe((res: any) => {
          console.log(res);
          this.dialogService.openSnackBar(res.message, "OK");
          const transaction: any = {
            remove: [data],
          };
          const result = params.api.applyTransaction(transaction);
          console.log(transaction, result);
        // });
        });
    }
  } 
  
 }
 onclicktesttesting(formAction:any,params?:any){
  let data:any=params.data
 if (formAction == "edit" ) {
      this.dataService.loadConfig("functionaltesting").subscribe((frmConfig: any) => {
        this.formAction = "Edit";
        this.butText="Update"   
        this.id=data._id;

        this.config = frmConfig;   
        this.model_heading="Functional Testing - Edit"
        data.isEdit=true;
        this.fields = frmConfig.form.fields;
        this.dialogService.openDialog(this.modulesViewPopup,null, null, data);
      });
    
  } else if (formAction == "CustomRoute" ) {
    if(params=="test_result"){
      console.log(this.gridData);
      
      this.router.navigate(["project",this.gridData._id,'test_result'])
    }else if(params=="individual_report"){
      this.router.navigate(["project",this.gridData._id,'regression'])
    } 
}   else if (formAction == "delete") {
    if (confirm("Do you wish to delete this record?")) {
      // !Look Up delete
      this.dataService
        .deleteDataById("regression", data._id)
        .subscribe((res: any) => {
          console.log(res);
          this.dialogService.openSnackBar(res.message, "OK");
          const transaction: any = {
            remove: [data],
          };
          const result = params.api.applyTransaction(transaction);
          console.log(transaction, result);
        // });
        });
    }
  } 
  
 }

 onclickBug(formAction:any,params:any){
  let data:any=params.data
  if (formAction == "bug") {
    this.dataService.loadConfig("bug").subscribe((frmConfig: any) => {
      this.formAction = "Edit";
      this.butText="Save"
      // this.continue_Save=true
      this.model_heading="Bug Result - Edit"
      this.config = frmConfig;     
      this.fields = frmConfig.form.fields;
      console.log(data);
      let values:any={}
      // devops_justification devops_status
      values['test_data']=data.testcase.test_data
      values['expected_result']=data.testcase.expected_result
      values['actual_result']=data.test_result.actual_result
      values['result_proof']=data.test_result.result_proof
      values['requirement_name']=data?.requirement?.requirement_name
      values['test_case_name']=data?.testcase?.test_case_name
      values['test_case_scenario']=data?.testcase?.test_case_scenario

      values['devops_justification']=data?.test_result?.devops_justification
      values['devops_status']=data?.test_result?.devops_status

      this.dialogService.openDialog(this.modulesViewPopup,null, null, values);
    });
  } else if (formAction == "delete") {
    if (confirm("Do you wish to delete this record?")) {
      // !Look Up delete
      this.dataService
        .deleteDataById("team_specification", data._id)
        .subscribe((res: any) => {
          console.log(res);
          this.dialogService.openSnackBar(res.message, "OK");
          const transaction: any = {
            remove: [data],
          };
          const result = params.api.applyTransaction(transaction);
          console.log(transaction, result);
        // });
        });
    }
  } 
 }

 onclickTask(formAction:any,params:any){
  if(formAction=="add"){

    let values:any={}
    // values['requirement_name']=params.data.requirement_name
    values['requirement_id']=params.data._id
    values['project_id']=params.data.project_id
    values["_id"]=`SEQ|${params.data.project_id}`
    this.dataService.save("task",values).subscribe((res:any)=>{
      // console.log();
      values["_id"]=res.data["insert ID"]
      values["task_id"]=res.data["insert ID"]
      values["treePath"]=[...params.data.treePath,res.data["insert ID"]]
    values["taskeditable"]=true
      const result = params.api.applyTransaction({ add: [values] });
      console.log(result);
      // params.context.componentParent.TaskIdChange()
      
    })
  }

  if(formAction=="delete"){
    if (confirm("Do you wish to delete this record?")) {
      this.dataService.deleteDataById(
        "task",
        params.data._id
      ).subscribe((res: any) => {
        this.dialogService.openSnackBar(
          "Data has been deleted successfully",
          "OK"
        );
        const result = params.api.applyTransaction({ remove: [ params.data] });
        console.log(result);
        // const transaction: ServerSideTransaction = {
        //   remove: [data],
        // };
        // const result = this.gridApi.applyServerSideTransaction(transaction);
        // console.log(transaction, result);
      });
    }
  }
// values["treePath"]=params.data.treePath
 }

  saveForm(formName: any, val?: any) {
console.log(this.form);
console.log(this.form.valid);

    
    if(!this.form.valid){
      const invalidLabels:any = this.helperServices.getDataValidatoion(this.form.controls);
      this.dialogService.openSnackBar("Error in " + invalidLabels, "OK");
     this.form.markAllAsTouched();   
    return
    }

    let values: any = this.form.value;
    if(formName=='Requirement'){
    if (val == "modulesViewPopup"&&(this.model_heading=="Sub Requirement - Add" )) {
      values.project_id = this.ParentComponent.response?.project_id;
      values.parentmodulename = this.gridData._id;
      // values._id= "SEQ|requriment|"+values.project_id;
      values._id= "SEQ|"+values.project_id;

    }
 
    else if(  this.model_heading=="Task - Add"){
      values.project_id = this.ParentComponent.response?.project_id;
      values.requirement_id = this.gridData._id;
      values._id = "SEQ|"+values.project_id ;
      // values._id = "SEQ|Task|"+values.project_id ;

      values.status="Open"
      // values._id="SEQ|TASK"
    }  else if(  this.model_heading=="Test Case - Add"){
      values.project_id = this.ParentComponent.response?.project_id;
      values.requirement_id = this.gridData._id;
      values.testCase_Created=this.helperServices.getEmp_id()
      // values._id = "SEQ|Test_Case|"+values.project_id ;
      values._id = "SEQ|"+values.project_id ;


    }
    if(this.id==undefined&&this.butText=="Save"|| this.formAction == 'Add'){
      console.log('save');
      this.dataService.save(this.config.form.collectionName, values).subscribe((data: any) => {
        console.log(data);
        if(this.continue_Save!==true){
          this.dialogService.CloseALL();
        }
        if(this.model_heading=="Sub Requirement - Add" ){

        }
        values._id=data.data["insert ID"]
        this.form.reset();   
        this.ParentComponent.getTreeData()

      //   const transaction: any = {
      //     add: [ values],
      //     };
      //  const result= this.params.context.componentParent.gridApi.applyTransaction(transaction)
      //  console.log(result);
       
      });
          }
          else{
      console.log('update');
      delete values._id
      this.dataService.update(this.config.form.collectionName, this.id,values).subscribe((data: any) => {
        console.log(data);
        values._id=this.id
        if(this.continue_Save!==true){
          this.id=undefined
          this.dialogService.CloseALL();
        }
        this.form.reset();  
 if(this.model_heading=="Sub Requirement - Add" ){
  values.treePath=[...this.gridData.treePath]
  values.treePath.push(values.requirement_name)
  // childIndex[row.parentmodulename] = (childIndex[row.parentmodulename] || 0) + 1;
  // values.treePath = [...parent.treePath, values.requirement_name];
  // values.parentIndex = this.gridData.index;
  // values.index = `${values.parentIndex}.${childIndex[values.parentmodulename]}`;
  // values.CheckIndex=values.index+' ' +values.requirement_name
  // // parentTreeData.push(row);
        }        
        this.form.reset();   
       
      //   const transaction: any = {
      //     update: [ values],
      //     };
      //     console.log(values);
          
      //  const result= this.params.context.componentParent.gridApi.applyTransaction(transaction)
      //  console.log(result);
          this.ParentComponent.ngOnInit()

      });
          }
 
    }
    else if(formName=='test_result'){
      let updateBug:any=false
      if(  this.model_heading=="Test Case - Add"){
        values.project_id = this.ParentComponent.response?.project_id;
        values.requirement_id = this.gridData.requriment_id;    
        values.testCase_Created=this.helperServices.getEmp_id()
        // values._id = "SEQ|Test_Case|"+values.project_id ;
        values._id = "SEQ|"+values.project_id ;


      } else if(this.model_heading=="Test Result - Add"){
        values.project_id = this.ParentComponent.response?.project_id;
        // values.requirement_id = this.gridData.requriment_id;
        values.testCase_id = this.gridData.test_case_id;
        values.doneBy=this.helperServices.getEmp_id()
        // values._id = "SEQ|Test_Result|"+values.project_id ;
        values._id = "SEQ|"+values.project_id ;
        // values.regression_id=
        values.regression_id = this.ParentComponent.response._id    ;
        if(values.result_status=='F'){
          updateBug=true;
        }
      }
      // this.dataService.save(this.config.form.collectionName, values).subscribe((data: any) => {
      //   console.log(data);
      //   if(this.continue_Save!==true){

      //     this.dialogService.closeModal();
      //   }
        

      //   this.form.reset();
      // });
      values.status='A'

      if(this.id==undefined&&this.butText=="Save"|| this.formAction == 'Add'){
        console.log('save');
        this.dataService.save(this.config.form.collectionName, values).subscribe((data: any) => {
          if(this.continue_Save!==true){
            this.dialogService.CloseALL();
          }
            if(updateBug==true){
            this.InsertBug(values,data)
            return
          }
          this.form.reset();
    //       else{
    // 
    this.ParentComponent.ngOnInit()
    //

    //       }
            });
          }else{
        this.dataService.update(this.config.form.collectionName, this.id,values).subscribe((data: any) => {
          console.log(data);
          if(this.continue_Save!==true){
            this.id=undefined
            this.dialogService.CloseALL();
          }
        
          this.form.reset();
          this.ParentComponent.ngOnInit()

        });
      }}else  {
        values.project_id = this.ParentComponent.response?.project_id;
        
        if(formName=='release'&&this.realseAdd==true){
          // if(values._id==undefined|| values._id ==null){
            let prefix=sessionStorage.getItem("release_id")
            values.release_id=prefix          
            values._id=prefix+"-"+values._id
          // }
        }

       // values.project_name=this.gridData.project_name
        // values.client_name = this.ParentComponent.response?.client_name;
        // values.project_name = this.ParentComponent.response?.project_name;
        if (this.gridData.modulename &&this.model_heading!="Module - Edit" ) {
          values.parentmodulename = this.gridData.modulename;
      }   
      if(formName=='team_member'){
        values.project_id = this.ParentComponent.response?.project_id;

      }
       
      if(this.model_heading=="Test Case - Add"){
        values.project_id = this.ParentComponent.response?.project_id;
        values.requirement_id = this.gridData._id;  
              values._id = "SEQ|"+values.project_id ; 

      } 
      if(this.id==undefined&&this.butText=="Save"|| this.formAction == 'Add'){
        console.log('save');
        if (this.gridData._id && this.parentRouteName=="projectteam") {
          values.parentmodulename = this.gridData._id;
      } 
      values.status='A'

        this.dataService.save(this.config.form.collectionName, values).subscribe((data: any) => {
          console.log(data);
          if(this.continue_Save!==true){
  
            this.dialogService.CloseALL();
          }
          this.form.reset();
        });
            }
            else{
        console.log('update');
        this.dataService.update(this.config.form.collectionName, this.id,values).subscribe((data: any) => {
          console.log(data);
          if(this.continue_Save!==true){
            this.id=undefined
            this.dialogService.CloseALL();
          }
          this.form.reset();
        });
            }
    }
    this.ParentComponent.ngOnInit()

    }


  resetBtn(data?: any) {
    this.form.reset()
    this.form.reset()
    this.model = {};
    this.formAction = this.model.id ? "Edit" : "Add";
    this.butText = this.model.id ? "Update" : "Save";
  }

  InsertBug(formData:any,refId:any){
console.log(formData);
console.warn(refId);
console.error(this.gridData);
let data:any={}
// data['_id']="SEQ|BUG|"+this.gridData.project_id
data['_id']="SEQ|"+this.gridData.project_id

data['test_result_id']=refId.data["insert ID"]
data['test_case_id']=this.gridData.test_case_id;
data['project_id']=this.gridData.project_id
data['regression_id']=formData.regression_id


this.dataService.save("bug",data).subscribe((res:any)=>{
  console.log(res);
  let values:any={}
  values['bug_Id']=res.data["insert ID"]
  values['Status']='created'

  this.dataService.save("bug_Histoy",data).subscribe((res:any)=>{
    console.log(res);

  // this.dataService.update("task",,data).subscribe((res:any)=>{
  //   console.log(res);
  // })
    this.ParentComponent.ngOnInit()
  })

  // this.ParentComponent.ngOnInit()
})

  }

}
