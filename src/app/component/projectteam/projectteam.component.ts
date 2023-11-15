 
import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {
  ColDef,
  ColGroupDef,
  ColumnApi,
  FirstDataRenderedEvent,
  GetDataPath,
  GridApi,
  GridReadyEvent,
  RowGroupingDisplayType,
} from "ag-grid-community";
import { DialogService } from 'src/app/services/dialog.service';
import { ActivatedRoute,Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import * as moment from 'moment';
import { FormService } from 'src/app/services/form.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import "ag-grid-enterprise";
import { ActionButtonComponent } from '../datatable/button';
 
import { FormlyFieldConfig } from '@ngx-formly/core';
import { ProjectButtonComponent } from './button';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-projectteam',
  templateUrl: './projectteam.component.html',
  styleUrls: ['./projectteam.component.css']
})
export class ProjectteamComponent {

  form = new FormGroup({});
  gridApi!: GridApi<any>;
  rowSelected: any[] = []
  selectedModel: any = {}
  public listData: any[] = []
  groupDefaultExpanded = -1;
  data: any[] = [];
  selectedRows: any[] = []
  frameworkComponent: any;
  
  context: any
  fields: FormlyFieldConfig[] = [];
  config: any
  tasklist: any
  @ViewChild("page", { static: true }) page!: TemplateRef<any>;
  @ViewChild("editViewPopup", { static: true }) editViewPopup!: TemplateRef<any>;
  @Input('model') model: any = {}
  pageHeading: any
  id: any
  response: any
  columnDefs: (ColDef | ColGroupDef)[] = [
     
      {
          headerName: 'Project Name',
          field: 'projectname',
          sortable: true,
          filter: 'agTextColumnFilter'
      },
      {
          headerName: 'Project Team Id',
          field: 'teamid',
          sortable: true,
          filter:' agTextColumnFilter'
      },
      {
          headerName: 'Project Team Description',
          field: 'teamdes',
          sortable: true,
          filter: "agTextColumnFilter"
      },
      {
          headerName: 'Status',
          field: 'status',
          sortable: true,
          filter: "agTextColumnFilter"
      
      },
      
    {
     
      headerName: "Actions",
      cellRenderer: "buttonRenderer",
      cellRendererParams: {
          onClick: "this.onBtnClick1.bind(this)",
          label: "Click 1"
      }
  }

  ]
  selectedRow: any;
  formAction: any;
  formName: any;
  //doAction: any;
  valueChanged: any;
  rowData: any;
  collectionName: any;
  butText = 'Save'
  onClose: any;
  desiredProjectId!: string;
  
  

  constructor(private httpclient: HttpClient, private formService: FormService,
    private dialogService: DialogService, private route: ActivatedRoute,   private router: Router,
    private dataService: DataService, private formservice: FormService,private formBuilder: FormBuilder) {
      this.context = { componentParent: this };
      this.frameworkComponent = {
        buttonRenderer: ProjectButtonComponent
      }  
  } 

  ngOnInit() {
    debugger
    
    // this.getmodules()  
    this.route.params.subscribe(params => {
      this.id = params['id'];
    });

    this.dataService.getDataById("project", this.id).subscribe((res: any) => {
      this.response = res.data[0]
      sessionStorage.setItem("projectname", this.response.projectname)
 })
//  this.dataService.getDataId1("query/projectteam",this.response.projectid).subscribe((res: any) => {
//   this.listData=res.data
 
// });
  
      

    // this.initializeFormControls();
    this.getlist();
  }

  getlist(){
    // this.dataService.getData("projectteam").subscribe((res: any) => {
    //    this.listData=res.data
      
    // });
      
  }
  
  
  onSelectionChanged(params: any) {
    debugger
    let rowSelected = this.gridApi.getSelectedRows();
    console.log("hiiii", rowSelected)

    // localStorage.setItem("project", JSON.stringify(rowSelected))
  }
  onCellValueChanged(params: any) {
    debugger
    let fieldName = params.colDef.field;
    this.valueChanged = params.value;
    // let data: any = {};
    // data[fieldName] = params.value;
    // this.dataService.updateModules(data,"entities/modules",params.data._id ).subscribe((res: any) => {
    //   this.rowData = res.data;
      
    // });
  }

  /**gridReady for ag grid */
  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }



  onAddButonClick(ctrl:any) {
    this.dialogService.openDialog(this.editViewPopup, "89%", '850px', {});
    this.httpclient.get("assets/jsons/projectteam-form.json").subscribe(async (config: any) => {
    
      this.formAction='Add' 
      this.config = config
      this.fields = config.form.fields
      this.pageHeading = config.pageHeading;
      ctrl.config = config
      ctrl.collectionName = config.form.collectionName
      ctrl.formAction = 'Add';
      ctrl.butText = 'Save';   
      if (ctrl.formAction == 'Edit' && ctrl.config.mode == 'page') {
        ctrl.fields = config.form.fields
      }
      else if (ctrl.formAction == 'Edit' && ctrl.mode == 'popup') {
        ctrl.model['isEdit'] = true
        ctrl.model['isshow'] = true
        ctrl.model['ishide'] = true
        ctrl.isFormDataLoaded = true
        ctrl.formAction = ctrl.config.formAction || 'Edit';
        ctrl.isEditMode = true;
      }
      this.fields = config.form.fields
     })
    
  } 
  saveForm(data: any) {
    debugger
    
    this.formservice.saveFormData(this).then((res: any) => {
      // if (res) {
      //   console.log("Added Successfully");
      // }
      if (res != undefined) {
        this.dialogService.closeModal()
        this.ngOnInit()
        // this.goBack(res)
        this.selectedModel={}
        this.form.reset()
        this.model={}
      }
    })
   // this.getTreeData
  }
  // initializeFormControls() {
  //   this.fields.forEach((field) => {
  //     if (typeof field.key === 'string' && field.key) {
  //       this.form.addControl(field.key, new FormControl(null));
  //     }
  //   });

  // }

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
    this.selectedModel = {}
    this.formAction = this.model.id ? 'Edit' : 'Add'
    this.butText = this.model.id ? 'Update' : 'Save';

  }



}



