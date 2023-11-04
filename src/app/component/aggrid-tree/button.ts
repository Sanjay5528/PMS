import { HttpClient } from "@angular/common/http";
import {
  Component,
  TemplateRef,
  ViewChild,
  Input,
  SimpleChanges,
} from "@angular/core";
import { Route, Router } from "@angular/router";
import { ICellRendererAngularComp } from "ag-grid-angular";
import * as moment from "moment";
import { DataService } from "src/app/services/data.service";
import { DialogService } from "src/app/services/dialog.service";
import { AggridTreeComponent } from "./aggrid-tree.component";
import { FormGroup } from "@angular/forms";
import { FormService } from "src/app/services/form.service";
// import { DataService } from "../services/data.service";
// import { DialogService } from "../services/dialog.service";
// import { ProductComponent } from "./product.component";

@Component({
  selector: "app-button-renderer",
  template: `
  <div>
  <button
      mat-icon-button
      [matMenuTriggerFor]="menu"
      aria-label="Example icon-button with a menu"
    >
      <mat-icon style="padding-bottom:50px">more_vert</mat-icon>
    </button>
    <mat-menu #menu="matMenu">
     
    <button mat-menu-item (click)="onClickMenuItem('submodules')">
    <mat-icon>task</mat-icon>
        <span>Sub Modules</span>
      </button>
      <button mat-menu-item (click)="onClickMenuItem('task')">
      <mat-icon>task</mat-icon>
        <span>Task</span>
      </button>
      <button mat-menu-item (click)="onClickMenuItem('testcase', this)">
      <mat-icon>description</mat-icon>
        <span>Testcase</span>
      </button>
    </mat-menu>
  </div>
  <ng-template #taskViewPopup>
  <mat-card>
  <mat-card-header style="flex: 1 1 auto;">
  <div style="width: 100%">
    <h2 style="text-align: center;" class="page-title">Task</h2>
  </div>
  <div style="text-align-last: end">
    <mat-icon mat-dialog-close>close</mat-icon>
  </div>
</mat-card-header>
<mat-card-content style="padding-top: 10px">
<form [formGroup]="form">
  <formly-form [fields]="fields" [form]="form" [model]="model"></formly-form>

</form>
</mat-card-content>
<mat-card-actions>
    <div style="text-align-last: end; width: 100%">
      <button style="margin: 5px" mat-button mat-dialog-close>
        Cancel
      </button>
      <button style="margin: 5px" mat-button (click)="resetBtn('reset')">
         Reset
      </button>
      <button style="margin: 5px;  background:rgb(59,146,155)" mat-raised-button
        color="warn"  (click)=" saveForm(this.config)">
        Save
      </button>
    </div>
  </mat-card-actions>
</mat-card>
</ng-template><div>
  <button
      mat-icon-button
      [matMenuTriggerFor]="menu"
      aria-label="Example icon-button with a menu"
    >
      <mat-icon style="padding-bottom:50px">more_vert</mat-icon>
    </button>
    <mat-menu #menu="matMenu">
    <button mat-menu-item (click)="onClickMenuItem('submodules')">
    <mat-icon>task</mat-icon>
        <span>Sub Modules</span>
      </button>
      <button mat-menu-item (click)="onClickMenuItem('task')">
      <mat-icon>task</mat-icon>
        <span>Task</span>
      </button>
    </mat-menu>
  </div>
<ng-template #modulesViewPopup>
<mat-card>
<mat-card-header style="flex: 1 1 auto;">
<div style="width: 100%">
  <h2 style="text-align: center;" class="page-title">Sub Modules</h2>
</div>
<div style="text-align-last: end">
  <mat-icon mat-dialog-close>close</mat-icon>
</div>
</mat-card-header>
<mat-card-content style="padding-top: 10px">
<form [formGroup]="form">
<formly-form [fields]="fields" [form]="form" [model]="model"></formly-form>

</form>
</mat-card-content>

<mat-card-actions>
  <div style="text-align-last: end; width: 100%">
    <button style="margin: 5px" mat-button mat-dialog-close>
      Cancel
    </button>
    <button style="margin: 5px" mat-button  (click)="resetBtn()">
       Reset
    </button>
    <button style="margin: 5px;  background:rgb(59,146,155)" mat-raised-button
      color="warn" (click)=" saveForm(this.config)">
      Save
    </button>
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
  id: any;
  config: any
  pageHeading: any
  deletedData: any;
  @ViewChild("popup", { static: true }) popup!: TemplateRef<any>;
  @ViewChild("modulesViewPopup", { static: true }) modulesViewPopup!: TemplateRef<any>;
  @Input() selectedRows: any;
  public params: any;
  user: any;
  fields: any
  jsonData: any;

  @ViewChild("taskViewPopup", { static: true }) taskViewPopup!: TemplateRef<any>;
  @Input('model') model: any = {}
  form = new FormGroup({});
  selectedModel: any;
  formAction: any;
  formName: any;
  butText = 'Save'
  onClose: any;
   

  constructor(
    public dataService: DataService,
    private dialog: DialogService,
    private router: Router,
    public grid: AggridTreeComponent,
    private httpclient: HttpClient,
    public aggrid: AggridTreeComponent,
    private formservice: FormService

  ) { }

  ngOnInit() {
   
  }
  agInit(params: any): void {
    debugger
    this.deletedData = params.data;
    console.log("hello",this.deletedData)
  }

  refresh(_params?: any): boolean {
    return true;
  }

  //   onDelete($event: any) {
  //     // this.deletedData = $event.api.getSelectedRows();
  //     // let a = $event.gridApi.getSelectedRows();
  //     this.dataService
  //       .getSupplierDelete(this.deletedData._id)
  //       .then((res: any) => {

  //         // this.selectedRows = this.gridApi.remove.getSelectedRows();
  //         if (res.success === 1) {
  //           this.fullSupplier.getSupplier()
  //           // alert(res.data);
  //           this.cancel();

  //           // this.data = res.data;
  //         }
  //       });
  //     // this.fullSupplier.getSupplier();
  //   }
  delete() {
    this.dialog.openDialog(this.popup, "20%", "20%", {});
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

  cancel() {
    this.dialog.dialogRef.close();
  }
  ctrl: any
  onClickMenuItem(value: any, data?: any) {
    debugger
    console.log(value);
    
    if (value == 'submodules' ) {
      this.dialog.openDialog(this.modulesViewPopup,  "50%", '530px', {});
      this.httpclient
        .get("assets/jsons/modules-form.json")
        .subscribe((frmConfig: any) => {
          this.formAction = "Add"
          this.config = frmConfig;
          //  this.aggrid.saveForm(this.data)
          this.fields = frmConfig.form.fields;
          // this.pageHeading = frmConfig.pageHeading;
          // this.doAction(data, data[id])
        });

      // this.aggrid.onSelectionChanged(event)
      // this.router.navigate(['/list/modules'])
    } 
     
    else if (value == 'task') {
      this.dialog.openDialog(this.taskViewPopup, "50%", null, {});
      this.httpclient
        .get("assets/jsons/task-form.json")
        .subscribe((frmConfig: any) => {
          this.formAction = "Add"
          this.config = frmConfig;
          //  this.aggrid.saveForm(this.data)
          this.fields = frmConfig.form.fields;
          // this.pageHeading = frmConfig.pageHeading;
          // this.doAction(data, data[id])
        });

      // this.router.navigate(['/add/task']);
      //this.data.taskname = taskname;
      this.data = this.params.data;

      this.grid.onAddButonClick(this.data);
    }

    else {
      this.data = this.deletedData
      this.router.navigate(['/list/testcase/' + `${this.data.moduleid}`]);
    }
  }




  saveForm(_data: any) {
    debugger
    this.formservice.saveFormData(this).then((res: any) => {
      // if (res) {
      //   console.log("Added Successfully");
      // }
      if (res != undefined) {
        this.aggrid.ngOnInit()
       //this.agInit(this.params.data)
        //this.goBack(res)
      }
    })
    //this.aggrid.getTreeData()
  }

  goBack(data?: any) {
    debugger
    if (this.config.editMode == 'page') {
      this.router.navigate([`${this.config.onCancelRoute}`]);
    } else if (this.config.editMode == 'popup') {
      this.router.navigate([`${this.config.onCancelRoute}`]);
      if (data) {
        this.onClose.emit(data)
      } else {
        this.onClose.emit({ action: this.formAction, data: this.model })
       }
      // return 
    }
  }


  

  resetBtn(data?: any) {
    debugger
    this.model = {}
    this.formAction = this.model.id ? 'Edit' : 'Add'
    this.butText = this.model.id ? 'Update' : 'Save';

  }
 
}

