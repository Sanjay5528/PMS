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
import { FormGroup } from "@angular/forms";
import { FormService } from "src/app/services/form.service";
// import { ProjectteamComponent } from "./projectteam.component";
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
     
    <button mat-menu-item (click)="onClickMenuItem('edit')">
    <mat-icon>edit</mat-icon>
        <span>Edit</span>
      </button>
      <button mat-menu-item (click)="onClickMenuItem('delete')">
      <mat-icon>delete</mat-icon>
        <span>Delete</span>
      </button>
      
    </mat-menu>
    </div>

    <ng-template #editViewPopup>
    <mat-card>
    <mat-card-header style="flex: 1 1 auto;">
    <div style="width: 100%">
      <h2 style="text-align: center;" class="page-title">Project Team -Edit</h2>
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
       
        <button style="margin: 5px;  background:rgb(59,146,155)" mat-raised-button
          color="warn"  (click)=" saveForm(this.config)">
          Update
        </button>
      </div>
    </mat-card-actions>
  </mat-card>
  </ng-template>
  
  
  
   
 
 
 

  `,
})

export class ProjectButtonComponent implements ICellRendererAngularComp {
  data: any;
  public gridApi: any;
  row_data: any;
  id: any;
  config: any
  pageHeading: any
  deletedData: any;
  @ViewChild("popup", { static: true }) popup!: TemplateRef<any>;
  @ViewChild("editViewPopup", { static: true }) editViewPopup!: TemplateRef<any>;
  @Input('model') model: any = {}
  @Input() selectedRows: any;
  public params: any;
  form = new FormGroup({});
  user: any;
  fields: any
  jsonData: any;
  formAction: any;
  doAction: any;
  butText:any
  onClose: any;
  formName!: string
  collectionName!: string;
  listData: any
  constructor(
    public dataService: DataService,
    private dialog: DialogService,
    private router: Router,
    //  public grid: ProjectteamComponent,
    private httpclient: HttpClient,
    //  public aggrid: ProjectteamComponent,
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
  onClickMenuItem(value: any,data?:any) {
    debugger
    console.log(value);
    
    if (value == 'edit' ) {
     
      this.dialog.openDialog(this.editViewPopup, "89%",0, this.deletedData);
      this.httpclient
        .get("assets/jsons/projectteam-form.json")
        .subscribe((frmConfig: any) => {
          this.formAction = "edit"
         
          this.config = frmConfig;
          
          //  this.aggrid.saveForm(this.data)
          this.fields = frmConfig.form.fields;
           this.pageHeading = frmConfig.pageHeading;
           this.model = this.deletedData
           //this.doAction(data, data[this.deletedData])
        });

      // this.aggrid.onSelectionChanged(event)
      // this.router.navigate(['/list/modules'])
    } 
     else if (value == "delete") {
      debugger
      if (confirm("Do you wish to delete this record?")) {
        // debugger
        
          if(this.collectionName = "entities/projecteam"|| this.formAction == "delete"){
          data=this.deletedData
        this.dataService.deleteDataById(this.collectionName, data._id).subscribe((res: any) => {
          this.dialog.openSnackBar('Data has been deleted successfully', 'OK');
          //this.getList();
        });
      }
         
      }
    }
  
  }
  getList(data?: any) {  
    if (!data) {
      // ! UNDO
      // this.dataService.getdata(this.collectionName).subscribe((res: any) => {
      //   if (res) {
      //     this.listData = res.data
      //   }
      //   else {
      //     this.listData = []
      //   }
      //   this.gridApi.sizeColumnsToFit();
      // });
    } else {
      console.log("No data")
    }
   }

  saveForm(_data: any) {
    debugger
    this.formservice.saveFormData(this).then((res: any) => {
      // if (res) {
      //   console.log("Added Successfully");
      // }
      if (res != undefined) {
        this.ngOnInit()
       //this.agInit(this.params.data)
        this.goBack(res)
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
