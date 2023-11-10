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
  columnDefs: (ColDef | ColGroupDef)[] = [
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

    },
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
      this.id = params['id'];
    });
    console.log(this.route.snapshot.routeConfig?.path);
    this.formName='module'

    this.dataService.getDataById("project", this.id).subscribe((res: any) => {
      this.response = res.data[0]
      // sessionStorage.setItem("projectname", this.response.projectname)

      this.getTreeData()
    
     
    })
    // this.initializeFormControls();
  }


  // getmodules() {

  //   this.dataService.getDataByIdProject("project", this.response.projectid).subscribe((res: any) => {
  //     this.tasklist = res.data[0];
  //     console.log(this.tasklist, "sdh");

  //   })

  // }

  getTreeData(data?:any) {
    debugger
// ! UNDO
console.log(this.response.project_id);

    this.dataService.getModuleFilter("modules", this.response.project_id).subscribe((res: any) => {
    console.log(res);
    
      this.listData = []
      console.log(this.listData, "hide");
console.log(res.data,'1');

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
}


  public autoGroupColumnDef: ColDef = {
    headerName: "Parent Modules",
    minWidth: 200
    // ,
    // cellRendererParams: {
    //   suppressCount: true,
    // },
  };

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

  // public getDataPath: GetDataPath = (data: any) => {
  //   return data.parentmodulename;
  // };

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
    
    this.dataService.loadConfig("module").subscribe(async (config: any) => {
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
  values.project_name= this.response?.project_name

  values.parentmodulename= ""
  this.dataService.save(this.config.form.collectionName,values).subscribe((data:any)=>{
    console.log(data);
    this.dialogService.closeModal();
  })
  this.ngOnInit()
  }
// try(res:any){
//   let array= res.data
//   console.log(array);
//   debugger
//   for (let index = 0; index < array.length; index++) {
//     console.log(array[index]);
//     let val :any[]=[array[index].modulename]
//     let colany:any[]=array[index].modulename
//     // colany.treePath= array[index].colonyname
//     this.listData.push(val);


//     let block :any=array[index].block

//     if(Array.isArray(block)){
//       if(block.length!=0){
// for (let index1 = 0; index1 < block.length; index1++) {
// let blockdata:any =block[index1]
// let element:any  = block[index1].gate;
// console.log(element,'block');
// blockdata.treePath=[colany,blockdata.blockname];
// this.listData.push(blockdata)
// if(Array.isArray(element)){
// if(element.length!=0){
// for (let index2 = 0; index2 < element.length; index2++) {
// const element1:any = element[index2];
// element1.treePath=[colany,blockdata.blockname,element1.gatename];
// console.log(element1,'gate');
// this.listData.push(element1);
// console.log(this.listData);

// }
// }else{
//   console.log(element);
  
// }
// }

// }
//       }else{
//         console.log(block);
//         if(Array.isArray(block)){
//           if(block.length!=0){
// for (let index1 = 0; index1 < block.length; index1++) {
//   const element = block[index1];
//   console.log(element);
  
  
// }
//           }else{
//             console.log(block);
            
//           }
//         }
        
//       }
//     }

//   }



// }



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


 



