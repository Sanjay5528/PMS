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
import { ButtonComponent } from './button';
import { FormlyFieldConfig } from '@ngx-formly/core';

@Component({
  selector: 'app-aggrid-tree',
  templateUrl: './aggrid-tree.component.html',
  styleUrls: ['./aggrid-tree.component.css']
})
export class AggridTreeComponent {
  form = new FormGroup({});
  gridApi!: GridApi<any>;
  public gridColumnApi!: ColumnApi;
  rowSelected: any[] = []
  selectedModel: any = {}
  public listData: any[] = []
  groupDefaultExpanded = -1;
  data: any[] = [];
  selectedRows: any[] = []
  components: any;
  
  context: any
  fields: FormlyFieldConfig[] = [];
  config: any
  tasklist: any
  @ViewChild("editViewPopup", { static: true }) editViewPopup!: TemplateRef<any>;
  @Input('model') model: any = {}
  pageHeading: any
  id: any
  response: any
public  columnDefs: (ColDef | ColGroupDef)[] = [
    // {
    //   headerName: 'Parent Module Name',
    //   field: 'parentmodulename',
    //   width: 40,
    //   filter: 'agTextColumnFilter',
    //   rowGroup: true,
    //   editable: true,
    //   hide: true
    // },
    // // {
    // //   headerName: 'Module Name',
    // //   field: 'modulename',
    // //   width: 40,
    // //   filter: 'agTextColumnFilter',
    // // },
    // {
    //   headerName: 'Task Name',
    //   field: 'task_name',
    //   width: 40,
    //   editable: true,
    //   filter: 'agTextColumnFilter',
    // },
    // {
    //   headerName: 'Start Date',
    //   field: 'startdate',
    //   width: 40,
    //   editable: true,
    //   filter: 'agTextColumnFilter',
    //   cellEditor: 'datetime-input',
    //   // cellRenderer: (data: { modified: any }) => {
    //   //   return moment(data.modified).format("M/d/yyyy, h:mm ");
    //   // },
    //   valueFormatter: function (params) {
    //     return moment(params.value).format('D/M/ YYYY');
    //   },

    // },
    // {
    //   headerName: 'End Date',
    //   field: 'enddate',
    //   width: 40,
    //   editable: true,
    //   filter: 'agTextColumnFilter',
    //   cellEditor: 'datetime-input',
    //   // cellRenderer: (data: { modified: any }) => {
    //   //   return moment(data.modified).format("M/d/yyyy, h:mm ");
    //   // },
    //   valueFormatter: function (params) {
    //     return moment(params.value).format('D/M/ YYYY');
    //   },
    // },
    // {

    //   field: 'Action',
    //   width: 40,
    //   cellRenderer: 'buttonRenderer'

    // },
  ]
  selectedRow: any;
  formAction: any;
  formName: any;
  doAction: any;
  valueChanged: any;
  rowData: any;
  collectionName: any;
  butText = 'Save'
  onClose: any;
  
   

  constructor(public httpclient: HttpClient,  
    public dialogService: DialogService, public route: ActivatedRoute,   public router: Router,
    public dataService: DataService, public formservice: FormService,public formBuilder: FormBuilder) {
    this.components = {
      buttonRenderer: ButtonComponent
    }

    
  } 


  ngOnInit() {
    debugger
    
    // this.getmodules()  
    this.route.params.subscribe(params => {
      console.log(params);
      this.formName=params['component']

      this.id = params['id'];
      this.loadConfig(this.formName)
      this.dataService.getDataById("project", this.id).subscribe((res: any) => {
        this.response = res.data[0]
        // sessionStorage.setItem("projectname", this.response.projectname)
  
        this.getTreeData()
      
       
      })
    });
    // console.log(this.route.snapshot.routeConfig?.path);
  
  }

loadConfig(formName:any){

  if(formName=="module"){
    this.autoGroupColumnDef={
        headerName: "Parent Modules",
        minWidth: 200,
        cellRendererParams: { suppressCount: true },
  }
  this.columnDefs.push(  
    {
    headerName: 'Parent Module Name',
    field: 'parentmodulename',
    width: 40,
    filter: 'agTextColumnFilter',
    rowGroup: true,
    editable: true,
    hide: true
  },
  // {
  //   headerName: 'Module Name',
  //   field: 'modulename',
  //   width: 40,
  //   filter: 'agTextColumnFilter',
  // },
  {
    headerName: 'Task Name',
    field: 'task_name',
    width: 40,
    editable: true,
    filter: 'agTextColumnFilter',
  },
  {
    headerName: 'Start Date',
    field: 'startdate',
    width: 40,
    editable: true,
    filter: 'agTextColumnFilter',
    cellEditor: 'datetime-input',
    // cellRenderer: (data: { modified: any }) => {
    //   return moment(data.modified).format("M/d/yyyy, h:mm ");
    // },
    valueFormatter: function (params) {
      return moment(params.value).format('D/M/ YYYY');
    },

  },
  {
    headerName: 'End Date',
    field: 'enddate',
    width: 40,
    editable: true,
    filter: 'agTextColumnFilter',
    cellEditor: 'datetime-input',
    // cellRenderer: (data: { modified: any }) => {
    //   return moment(data.modified).format("M/d/yyyy, h:mm ");
    // },
    valueFormatter: function (params) {
      return moment(params.value).format('D/M/ YYYY');
    },
  },
  {

    field: 'Action',
    width: 40,
    cellRenderer: 'buttonRenderer'

  })
  }else if(formName=="Requirement"){
    this.autoGroupColumnDef={
      headerName: "Parent Requriement",
      field:"index",
      minWidth: 200,
      cellRendererParams: { suppressCount: true },

}
    this.columnDefs.push(  
      {
      headerName: 'Parent Requirement ID',
      field: 'parentmodulename',
      width: 40,
      filter: 'agTextColumnFilter',
      rowGroup: true,
      editable: true,
      hide: true
    },  
     {
      headerName: 'Requirement Name',
      field: 'requirement_name',
      width: 40,
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'Sprint Id',
      field: 'sprint_id',
      width: 40,
      // editable: true,
      filter: 'agTextColumnFilter',
    }, {
      headerName: 'Module Id',
      field: 'module_id',
      width: 40,
      // editable: true,
      filter: 'agTextColumnFilter',
    },
    // {
    //   headerName: 'Start Date',
    //   field: 'startdate',
    //   width: 40,
    //   editable: true,
    //   filter: 'agTextColumnFilter',
    //   cellEditor: 'datetime-input',
    //   // cellRenderer: (data: { modified: any }) => {
    //   //   return moment(data.modified).format("M/d/yyyy, h:mm ");
    //   // },
    //   valueFormatter: function (params) {
    //     return moment(params.value).format('D/M/ YYYY');
    //   },
  
    // },
    // {
    //   headerName: 'End Date',
    //   field: 'enddate',
    //   width: 40,
    //   editable: true,
    //   filter: 'agTextColumnFilter',
    //   cellEditor: 'datetime-input',
    //   // cellRenderer: (data: { modified: any }) => {
    //   //   return moment(data.modified).format("M/d/yyyy, h:mm ");
    //   // },
    //   valueFormatter: function (params) {
    //     return moment(params.value).format('D/M/ YYYY');
    //   },
    // },
    {
  
      field: 'Action',
      width: 40,
      cellRenderer: 'buttonRenderer'
  
    }
    
    )
  }

}
  getTreeData() {
    debugger
// ! UNDO

console.log(this.response.project_id);
if(this.formName=="module"){
    this.dataService.getModuleFilter("modules", this.response.project_id).subscribe((res: any) => {
      this.listData = []
      for (let idx = 0; idx < res.data.length; idx++) {
        const row = res.data[idx];
        if (row.parentmodulename == "" || !row.parentmodulename) {
          row.treePath = [row.modulename];
        } else {
          var parentNode = this.listData.find((d) => d.modulename == row.parentmodulename);
          if (
            parentNode &&
            parentNode.treePath &&
            !parentNode.treePath.includes(row.modulename)
          ) {
            row.treePath = [...parentNode.treePath];
            row.treePath.push(row.modulename);
          }
        }
        this.listData.push(row);
        // this.getmodules()
      }
    });
  }else{
      this.dataService.getDataByFilter("requirement",{}).subscribe((res:any) =>{
        let data:any[]= []     
        this.listData = []

      for (let idx = 0; idx < res.data[0].response.length; idx++) {
        const row = res.data[0].response[idx];
      
        if (row.parentmodulename == "" || !row.parentmodulename) {
          row.treePath = [row.requirement_name];
        } else {
          const parentNode = data.find((d) => d.requirement_name == row.parentmodulename);
          if (parentNode && parentNode.treePath && !parentNode.treePath.includes(row.requirement_name)) {
            row.treePath = [...parentNode.treePath];
            row.treePath.push(row.requirement_name);
          }
        }
      
        data.push(row);
      }
      
      let normalized: any[] = [];
      let childIndex: { [key: string]: number } = {};
      
      data.forEach((res: any) => {
        const arrLength = res.treePath ? res.treePath.length : 0;
      
        if (arrLength === 1) {
          res.index = normalized.length + 1;
          childIndex = {};
          normalized.push(res);
        } else if (arrLength > 1) {
          const parentKey = res.treePath.slice(0, -1).join('.');
      let parentrequrienmentName:any=res.treePath[arrLength-2]
      let parentIndex:any=0
        data.map((res:any)=>{
if(res?.treePath?.includes(parentrequrienmentName)){
  if(parentIndex==0){
parentIndex=res.index
  }
}
      })
          if (!childIndex[parentKey]) {
            childIndex[parentKey] = 1;
          }
      
          res.index = parentIndex + '.' + childIndex[parentKey]++;
          normalized.push(res);
        }
      });      
      this.listData=normalized;
      })
  }
}


  public autoGroupColumnDef: ColDef = {};

  public defaultColDef: ColDef = {
    flex: 1,
    minWidth: 100,
    sortable: true,
    resizable: true,
    filter: true
  };

  /** treepath  for ag grid */
  public getTreePath: GetDataPath = (data: any) => {
    return data.treePath;
  };

  close(event: any) {
    this.dialogService.closeModal();
    this.gridApi.deselectAll();
    // this.ngOnInit()

    if (event) {
      // Ensure 'event' contains the expected properties before proceeding
      // if (event.action === "Add" && event.data) {
      // const transaction: ServerSideTransaction = {
      //   add: 
      //   [event.data ],
      // };
      // const result = this.gridApi.applyServerSideTransaction(transaction);
      // console.log(transaction, result)
      // }else{
      //   const transaction: ServerSideTransaction = {
      //         update:  [event.data ]
      //        };
      //       const result = this.gridApi.applyServerSideTransaction(transaction);
      //   console.log(transaction, result)

    // }
    }
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
    let data: any = {};
    data[fieldName] = params.value;
// ! UNDO

    // this.dataService.updateModules(data,"entities/modules",params.data._id ).subscribe((res: any) => {
    //   this.rowData = res.data;
      
    // });
  }

  /**gridReady for ag grid */
  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.sizeColumnsToFit();
  }

  onAddButonClick(ctrl: any) {
    debugger
    console.log(this.formName);
    
    this.dataService.loadConfig(this.formName.toLowerCase()).subscribe(async (config: any) => {
      console.log(config);
      
      this.formAction='Add' 
      this.config = config
      this.fields = config.form.fields
      this.pageHeading = config.pageHeading;
      this.collectionName = config.form.collectionName
      this.formAction = 'Add';
      this.butText = 'Save';   //buttons based on the id

    this.dialogService.openDialog(this.editViewPopup, "50%", '530px', {});
      
     


    })
  
  } 
 
  saveChild() { 
    if (!this.form.valid) {
      
      function collectInvalidLabels(controls: any, invalidLabels: string = ''): string {
        for (const key in controls) {
            if (controls.hasOwnProperty(key)) {
                const control = controls[key];
        
                if (control instanceof FormGroup) {
                    invalidLabels += collectInvalidLabels(control.controls);
                } else if (control instanceof FormControl && control.status === 'INVALID') {
                    // Access the label property assuming it exists in the control
                    invalidLabels +=controls[key]._fields[0].props.label + ",";
                }
            }
        }
        return invalidLabels;
    }
    const invalidLabels:any = collectInvalidLabels(this.form.controls);
      this.dialogService.openSnackBar("Error in " + invalidLabels, "OK");
     this.form.markAllAsTouched();
      return ;
    }
  let values:any=this.form.value
  values.client_name= this.response?.client_name
  values.project_id= this.response?.project_id
  // values.project_name= this.response?.project_name

  values.parentmodulename= ""
  this.dataService.save(this.config.form.collectionName,values).subscribe((data:any)=>{
    console.log(data);
    this.dialogService.closeModal();
  })
  this.ngOnInit()
  }
  



  resetBtn(data?: any) {
    debugger
    this.selectedModel = {}
    this.formAction = this.model.id ? 'Edit' : 'Add'
    this.butText = this.model.id ? 'Update' : 'Save';

  }
  goBack(){
    this.router.navigate(['list/project'])
  }



}


 



