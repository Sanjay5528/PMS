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
      field: 'taskname',
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
    this.form = new FormGroup({});
  
  } 


  ngOnInit() {
    debugger
    
    // this.getmodules()  
    this.route.params.subscribe(params => {
      this.id = params['id'];
    });

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

  getTreeData() {
    debugger
// ! UNDO
//     this.dataService.getModuleFilter("modules", this.response.projectid).subscribe((res: any) => {
//       this.listData = []
//       console.log(this.listData, "hide");
// console.log(res.data,'1');

//       for (let idx = 0; idx < res.data.length; idx++) {
//         const row = res.data[idx];
//         if (row.parentmodulename == "" || !row.parentmodulename) {
//           row.treePath = [row.modulename];
//         } else {
//           var parentNode = this.listData.find((d) => d.modulename == row.parentmodulename);
//           if (
//             parentNode &&
//             parentNode.treePath &&
//             !parentNode.treePath.includes(row.modulename)
//           ) {
//             row.treePath = [...parentNode.treePath];
//             row.treePath.push(row.modulename);
//           }
//         }
//         this.listData.push(row);
//         // this.getmodules()
//       }
//     });
}


  public autoGroupColumnDef: ColDef = {
    headerName: "Parent Modules",
    minWidth: 200
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
    
    this.dialogService.openDialog(this.editViewPopup, "50%", '530px', {});
    this.dataService.loadConfig("module").subscribe(async (config: any) => {
      this.formAction='Add' 
      this.config = config
      this.fields = config.form.fields
      this.pageHeading = config.pageHeading;
      ctrl.config = config
      ctrl.collectionName = config.form.collectionName
      ctrl.formAction = 'Add';
      ctrl.butText = 'Save';   //buttons based on the id

      // if (ctrl.formAction == 'Edit' && ctrl.config.mode == 'page') {
      //   ctrl.fields = config.form.fields
      // }
      // else if (ctrl.formAction == 'Edit' && ctrl.mode == 'popup') {
      //   ctrl.model['isEdit'] = true
      //   ctrl.model['isshow'] = true
      //   ctrl.model['ishide'] = true
      //   ctrl.isFormDataLoaded = true
      //   ctrl.formAction = ctrl.config.formAction || 'Edit';
      //   ctrl.isEditMode = true;
      // }
      //this.fields = config.form.fields
     


    })
  
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

  saveForm(data: any,event:any) {
    debugger
    this.formservice.saveFormData(this).then((res: any) => {
      // if (res) {
      //   console.log("Added Successfully");
      // }
      if (res != undefined) {
        this.ngOnInit()
        //this.goBack(res)
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

  





  resetBtn(data?: any) {
    debugger
    this.selectedModel = {}
    this.formAction = this.model.id ? 'Edit' : 'Add'
    this.butText = this.model.id ? 'Update' : 'Save';

  }



}


 



