import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {
  ColDef,
  ColGroupDef,
  ColumnApi,
  FirstDataRenderedEvent,
  GetContextMenuItemsParams,
  GetDataPath,
  GridApi,
  GridOptions,
  GridReadyEvent,
  ICellEditorParams,
  IRichCellEditorParams,
  MenuItemDef,
  RichSelectParams,
  RowDataTransaction,
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
import { HelperService } from 'src/app/services/helper.service';
import { Location } from '@angular/common';
import { isEmpty } from 'lodash';
import { MatSidenav } from '@angular/material/sidenav';

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
  selectedRows: any
  components: any;
  @ViewChild("drawer") drawer!: MatSidenav;

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

    //   field: 'Action',
    //   width: 40,
    //   cellRenderer: 'buttonRenderer'

    // },
  ]
  formAction: any;
  formName: any;
  doAction: any;
  valueChanged: any;
  // rowData: any;
  collectionName: any;
  butText = 'Save'
  onClose: any;
  addbutton:boolean=false
   

  constructor(public httpclient: HttpClient,  
    public dialogService: DialogService, public route: ActivatedRoute,public _location:Location,   public router: Router,private helperServices:HelperService,
    public dataService: DataService, public formservice: FormService,public formBuilder: FormBuilder) {
    this.components = {
      buttonRenderer: ButtonComponent
    }
    this.context = { componentParent: this };
    
  } 
datefunction(date:any){
  return moment(date).format("DD-MM-YYYY  ")
}
reassignemployee:any
reassign(employeeID:any){
  let filer:any={
    start:0,end:1000,filter:[{
      clause: "AND",
        conditions: [
          {column: "employee_id",operator: "NOTEQUAL",type: "string",value: employeeID},
        ],
      
    }]
  }
  this.dataService.getDataByFilter("employee",filer).subscribe((res:any) =>{
      if(isEmpty(res.data[0].response)){
        this.dialogService.openSnackBar("There Were No Employee To be Found","OK")
        return
      }
      console.log(res);
      
      this.reassignemployee=res.data[0].response
  //   res.data[0].response.forEach((each:any)=>{
  //   // this.ValueToCompareRequriementSprint.push({label:each.name,value:each.id})
  //   // this.OnlyValueRequriementSprint.push(each.id)

  // })
  // return data  
})
}
  ngOnInit() {
    debugger
    
    // this.getmodules()  
    this.route.params.subscribe(params => {
this.addbutton=false;
console.log(params);
      this.formName=params['component']
let collection:any
      if(this.formName == "module"){
this.pageHeading= "Module"
collection="project"
      }else if(this.formName=="Requirement"){
        this.pageHeading= "Requirement"
        collection="project"

      }else if(this.formName=="projectteam"){
        this.pageHeading= "Team Member"
        collection="project"

      }else if(this.formName=="test_result"){
collection="regression"
this.addbutton=true;
      }

      this.loadConfig(this.formName)
      this.id = params['id'];
      this.dataService.getDataById(collection, this.id).subscribe((res: any) => {
        this.response = res.data[0]
        if(this?.response?.startdate){
          this.response.startdate=moment(this.response?.startdate).format('D/M/ YYYY')
        }
        if(this?.response?.enddate){
          this.response.enddate=moment(this.response?.enddate).format("D/M/ YYYY")
        }
        if(this.formName=="Requirement"){
          this.sprintCellEditorParams('')
          this.ValueToCompareRequriementModules == undefined || isEmpty(this.ValueToCompareRequriementModules) ? this.moduleCellEditorParams(true) : this.ValueToCompareRequriementModules;            
        }
        // sessionStorage.setItem("projectname", this.response.projectname)
        
        // if(this.formName=="projectteam"){
        //   this.getList()
        // }else{
          this.getTreeData()
        // }
      
       
      })
    });
    // console.log(this.route.snapshot.routeConfig?.path);
  
  }
// gridChange:any=false

loadConfig(formName:any){

  if(formName=="module"){
    this.gridOptions.autoGroupColumnDef={
        headerName: "Parent Modules",
        minWidth: 200,
        cellRendererParams: { suppressCount: true },
        sortable: false,
    resizable: true,
    filter: false
  }
  this.gridOptions.treeData=true
  this.gridOptions.groupDefaultExpanded=-1
  this.columnDefs.push(  
  //   {
  //   headerName: 'Parent Module Name',
  //   field: 'parentmodulename',
  //   width: 40,
  //   filter: 'agTextColumnFilter',
  //   editable: true,
  //   hide: true
  // },
  // {
  //   headerName: 'Requirement Name',
  //   field: 'requirement_id', //! TO Change into requirement_name
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
    editable: false,
    filter: 'agDateColumnFilter',
    valueFormatter: function (params) {
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
    valueFormatter: function (params) {
      if(params.value){

        return moment(params.value).format('D/M/ YYYY');
      }
      return ''  
      },
  },
  {

    field: 'Action',
    width: 40,
    sortable:false,
    filter:false,
    cellRenderer: 'buttonRenderer'

  })
  }else if(formName=="Requirement"){
   

this.gridOptions.treeData=true
this.gridOptions.groupDefaultExpanded=-1
   
    this.gridOptions.autoGroupColumnDef={
      headerName: "Parent Requriement",
      field:"index",
      minWidth: 200,
      cellRendererParams: { suppressCount: true },
      sortable: false,
      resizable: true,
      filter: false
}
    const Sprintvalue:any=this.sprintCellEditorParams
    const modelvalue:any=this.moduleCellEditorParams
    this.columnDefs.push(  
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
      field: 'requirement_name',
      width: 40,
      filter: 'agTextColumnFilter',
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
      width: 40,
      editable: false,
      filter: 'agNumberColumnFilter',
    }, {
      headerName: 'Task Count',
      field: 'number_of_Task_count',
      width: 40,
      editable: false,
      filter: 'agNumberColumnFilter',
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
      sortable:false,
      filter:false,
      cellRenderer: 'buttonRenderer'
  
    }
    
    )
  }else if(formName=="projectteam"){
    // this.gridChange=true;

this.gridOptions.treeData=true
this.gridOptions.groupDefaultExpanded=-1
    this.gridOptions.autoGroupColumnDef={
      headerName: "Team Specification Name",
      field:"name",
      // minWidth: 200,
      cellRendererParams: { suppressCount: true },
      sortable: false,
      resizable: true,
      filter: false
}
    this.columnDefs.push(	
				
		{ 
			"headerName": "Employee Name", "field": "user_id" 
		},
	  { 
		"headerName": "Project Role", "field": "role_id" 
	},
  {
    headerName: 'Start Date',
    field: 'scheduled_start_date',
    width: 40,
    editable: false,
    filter: 'agDateColumnFilter',
    valueFormatter: function (params) {
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
    valueFormatter: function (params) {
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
      width: 40,
      sortable:false,
      filter:false,
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
      )
  }else if(this.formName=="test_result"){
    this.gridOptions.groupDefaultExpanded=-1
    this.autoGroupColumnDef={
      headerName: "test case",
      field:"requriment.parentmodulename",
      minWidth: 200,
      cellRendererParams: { suppressCount: true },
      sortable: false,
      resizable: true,
      filter: false
}
    this.columnDefs.push(  
      {
        headerName: 'Requirement Name',
        field: 'requriment.module_id',
        width: 40,rowGroup:true,showRowGroup:false,
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
      field: 'requriment.requirement_name',
      width: 40,
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
  
      field: 'Action',
      width: 40,
      sortable:false,
      filter:false,
      cellRenderer: 'buttonRenderer'
  
    }
    
    )
  }


}

ValueToCompareRequriementSprint:any[]=[] 
OnlyValueRequriementSprint:any[]=[]

ValueToCompareRequriementModules:any[]=[]
OnlyValueRequriementModules:any[]=[]
sprintCellEditorParams = (params: any) => {
    if(params==true || !isEmpty(this.OnlyValueRequriementSprint)){
    console.warn("Data Exist")
    
    return this.OnlyValueRequriementSprint
  }else{
  let filer:any={
    start:0,end:1000,filter:[{
      clause: "AND",
        conditions: [
          {column: "project_id",operator: "EQUALS",type: "string",value: this.response.project_id},
        ],
      
    }]
  }
  this.dataService.getDataByFilter("sprint",filer).subscribe((res:any) =>{
      if(isEmpty(res.data[0].response)){
        this.dialogService.openSnackBar("There Were No Sprint To be Found","OK")
        return
      }
    res.data[0].response.forEach((each:any)=>{
    // this.ValueToCompareRequriementSprint.push({label:each.name,value:each.id})
    this.OnlyValueRequriementSprint.push(each.id)
  })  
})
    return this.OnlyValueRequriementSprint
}};



  
moduleCellEditorParams =  (params: any)  => {
  if(!isEmpty(this.OnlyValueRequriementModules)){
  console.warn("Data Exists")
  
  return this.OnlyValueRequriementModules
}else{
  console.log('data');
  
let filer:any={
  start:0,end:1000,filter:[{
    clause: "AND",
      conditions: [
        {column: "project_id",operator: "EQUALS",type: "string",value: this.response.project_id},
      ],
    
  }]
}
this.dataService.getDataByFilter("modules",filer).subscribe((res:any) =>{
    if(isEmpty(res.data[0].response)){
      this.dialogService.openSnackBar("There Were No Modules To be Found","OK")
      return
    }
  res.data[0].response.forEach((each:any)=>{

  // Check if each.modulename is not already in OnlyValueRequriementModules
if (!this.OnlyValueRequriementModules.includes(each.modulename)) {
  this.ValueToCompareRequriementModules.push({ label: each.modulename, value: each.moduleid });
  this.OnlyValueRequriementModules.push(each.modulename);
}

})  
})
if(params==true){
  return this.ValueToCompareRequriementModules
}
  return this.OnlyValueRequriementModules
}};









  getTreeData() {
    debugger
// ! UNDO

if(this.formName=="module"){
    this.dataService.getModuleFilter("modules", this.response.project_id).subscribe((res: any) => {
      this.listData = []
      for (let idx = 0; idx < res.data.length; idx++) {
        const row = res.data[idx];
        if (row.parentmoduleid == "" || !row.parentmoduleid) {
          row.treePath = [row.module_id];
        } else {
          var parentNode = this.listData.find((d) => d.module_id == row.parentmoduleid);
          if (
            parentNode &&
            parentNode.treePath &&
            !parentNode.treePath.includes(row.module_id)
          ) {
            row.treePath = [...parentNode.treePath];
            row.treePath.push(row.module_id);
          }
        }
        this.listData.push(row);
        // this.getmodules()
      }
    });
  }else if(this.formName=="Requirement"){
    
   
      // this.dataService.getDataByFilter("requirement",filer)
      this.dataService.lookupTreeData("requriment",this.response.project_id).subscribe((res:any) =>{
        let data:any[]= []     
        this.listData = []
        
        for (let idx = 0; idx < res.data.response.length; idx++) {
          const row = res.data.response[idx];
            if(row && row?.module_id){
              // Check if Data is Empty (it call function and return)
              let datafound = this.ValueToCompareRequriementModules == undefined || isEmpty(this.ValueToCompareRequriementModules) ? this.moduleCellEditorParams(true) : this.ValueToCompareRequriementModules;          
              let findValue:any=datafound.find((val:any)=>val.value==row.module_id)
              row.module_id = findValue?.label;
            }
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
        
        let parentTreeData: any[] = [];
        let childIndex: { [key: string]: number } = {};
        let childArr: any[] = [];
        
        data.forEach((res: any) => {
          const arrLength = res.treePath ? res.treePath.length : 0;
          if (arrLength === 1) {
                res.index = parentTreeData.length + 1;
                res.parentIndex=res.index
                res.index=res.index + " "+res.requirement_name
                childIndex = {};
                parentTreeData.push(res);
          } else if (arrLength > 1) {
              const parentKey = res.treePath.slice(0, -1).join('.');
              const parentRequirementName = res.treePath[arrLength - 2];
              const parent = data.find((d) => d.requirement_name === parentRequirementName);        
                  if (parent) {
                    if (!childIndex[parentKey]) {
                      childIndex[parentKey] = 1;
                    }
                      console.log(parent.index,'parent.index');
                      let CheckIndex = parent.parentIndex + '.' + childIndex[parentKey]++;
                      const childIndexable = childArr.find((d) => {        
                        d.parentIndex == CheckIndex
                      });
                      res.parentIndex=parseFloat(CheckIndex)
                      if(childIndexable===undefined){
                            res.index=CheckIndex +" "+ res.requirement_name
                           }else{
                            let index=childIndex[parentKey]++ +1
                            res.index = parent.parentIndex + '.' + index;
                          }
                    childArr.push(res);
                  }
          }
        });
        // childArr.forEach((value:any)=>{
          
        // })
        this.listData = [...parentTreeData, ...childArr];
        
   
      })
  }else if(this.formName=="projectteam"){
     let Projectfiler:any={
      start:0,end:1000,filter:[{
        
          clause: "AND",
          conditions: [
            {column: "project_id",operator: "EQUALS",type: "string",value: this.response.project_id},
          ],
        
      }]
    }
    this.dataService.getDataByFilter("team_specification", Projectfiler).subscribe((res: any) => {
      this.listData = []
      console.log(res);
      
      for (let idx = 0; idx < res.data[0].response.length; idx++) {
        const row = res.data[0].response[idx];
        if (row.parentmodulename == "" || !row.parentmodulename) {
          row.treePath = [row.team_id];
        } else {
          var parentNode = this.listData.find((d) => d.team_id == row.parentmodulename);
          if (
            parentNode &&
            parentNode.treePath &&
            !parentNode.treePath.includes(row.team_id)
          ) {
            row.treePath = [...parentNode.treePath];
            row.treePath.push(row.user_id);
          }
        }
        console.log(row);
        
        this.listData.push(row);
      }
    });
  }else if(this.formName=="test_result"){
this.dataService.lookupTreeData("regression",this.response._id).subscribe((res:any)=>{
  console.log(res);

  // this.listData=res.data.response

  let overalldata:any[]=[]
  res.data.response.forEach((vals:any,index:any)=>{
    // overalldata.push(vals.requriment)
    console.log(vals);
let testcase:any[]=[]
testcase= res.data.response[index].testcase
testcase.forEach((data:any)=>{
      let datas:any
      datas=vals.requriment.find((d:any)=>{
  console.log(d);
  d._id==data.requirement_id
})
console.log(datas);

      overalldata.push(data)
    })

  })
  this.listData=overalldata

  // console.log(overalldata);
  
  // let data:any[]= []     
  // this.listData = []
  
  // for (let idx = 0; idx < overalldata.length; idx++) {
  //   const row = overalldata[idx];
  //     if (row.parentmodulename == "" || !row.parentmodulename) {
  //       row.treePath = [row.requirement_name];
  //     } else {
  //       const parentNode = data.find((d) => d.requirement_name == row.parentmodulename);
  //           if (parentNode && parentNode.treePath && !parentNode.treePath.includes(row.requirement_name)) {
  //             row.treePath = [...parentNode.treePath];
  //             row.treePath.push(row.requirement_name);
  //           }
  //     }
  //   data.push(row);
  // }

  // childArr.forEach((value:any)=>{
    
  // })
  

})
  }

}


  public autoGroupColumnDef: ColDef = {};

  public defaultColDef: ColDef = {
    flex: 1,
    minWidth: 100,
    sortable: true,
    resizable: true,
    filter: true,
  };
public gridOptions: GridOptions = {
  getDataPath:(data: any) => { 
    return data.treePath;
  },

animateRows:true,paginationPageSize:10
}
  /** treepath  for ag grid */
  public getTreePath: GetDataPath = (data: any) => {
    return data.treePath;
  };
  cellClicked:any
  onCellClicked(event: any){
let clickCell:any=event.column.getColId()
    if(clickCell== 'number_of_TestCase_count'||clickCell=="number_of_Task_count"){
      console.log(event.data);
      this.cellClicked=clickCell
      this.drawer.toggle()
    }

  }
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
    console.log(params);
    
    this.selectedRows= this.gridApi.getSelectedRows()[0];

    console.log("hiiii",this.selectedRows)
  }
  onCellValueChanged(params: any) {
    debugger
    console.log(params);
    
    let fieldName = params.colDef.field;
    this.valueChanged = params.value;
    let data: any = {};
    data[fieldName] = params.value;
// ! UNDO
if(fieldName=="module_id"){
  let findValue:any=this.ValueToCompareRequriementModules.find(val=>val.label==params.value)
  console.log(findValue);
  
  data[fieldName] = findValue.value;

}
    this.dataService.update("requirement",params.data._id,data ).subscribe((res: any) => {
      // this.rowData = res.data;
      console.log(res);
      
    });
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

    this.dialogService.openDialog(this.editViewPopup, null, null, {});
      
     


    })
  
  } 
 
  saveChild() { 
    if (!this.form.valid) {
    const invalidLabels:any = this.helperServices.getDataValidatoion(this.form.controls);
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
    // this.router.navigate(['list/project'])
    this._location.back();
  }



}


 




// getContextMenuItems(
//   params: GetContextMenuItemsParams
// ): (string | MenuItemDef)[] {
//   debugger
//   var result: (string | MenuItemDef)[] = [
//     // 'autoSizeAll',
//     // 'resetColumns',
//     // 'expandAll',
//     // 'contractAll',
//     'copy',
//     'copyWithHeaders',
//     'separator',
//     // 'paste',
//     {
//       name: 'Changes Applicable to ',
//       subMenu: [
//         {
//           name: 'Selected Data Only ',
//           action: () => {
//             if (params.context.componentParent.gridApi.getSelectedRows().length !== 0) {
//               const columnApi = params.column?.getColId()
//               params.context.componentParent.SelectedDataOnly(columnApi)
//             } else {
//               window.alert('No data Selected');
//             }

//           }
//         }, {
//           name: 'Apply All',
//           action: () => {
//             const columnApi = params.column?.getColId()
//             params.context.componentParent.AllDAta(columnApi)
//           }
//         }]
//     }
//   ];
//   return result;
// }

// SelectedDataOnly(columnKey: string) {
//   debugger
//   let value: any[] = []
//   let total: any[] = this.gridApi.getSelectedRows()
  
//   for (const row of total) {
//     console.log(row);
    
  
//     value.push(row)

//     // const transaction: RowDataTransaction = {
//     //   update:
//     //     [
//     //       row
//     //     ],
//     // };
//     // const result = this.gridApi.applyTransaction(transaction);
//     // console.log(transaction, result)

//   }
//   console.log(value);
//   // this.gridApi.setDataValue('sdadsa',[] )
//   // this.gridApi.setRowData(value)
//   this.gridApi.deselectAll()
//   value.forEach((data: any) => {
//   console.log(data);
  
//     // this.dataService.updateById("rate_card", data._id, row).subscribe((res: any) => {
//     //   console.log(res);
//     // })
//   })
// }
// AllDAta(columnKey: string) {
//   debugger
//   let value: any[] = []
//   this.gridApi.forEachLeafNode((node: any) => {
//     console.log(node);
  
//     node.data.isEnabled = true
//     // const transaction: RowDataTransaction = {
//     //   update:
//     //     [
//     //       node.data
//     //     ],
//     // };
//     // const result = this.gridApi.applyTransaction(transaction);
//     // console.log(transaction, result)
//     value.push(node.data)
//   })
//   this.gridApi.deselectAll()
//   value.forEach((data: any) => {
//     let row: any = {}
    
//     // this.dataService.updateById("rate_card", data._id, row).subscribe((res: any) => {
//     //   console.log(res);
//     // })
//   })
//   // this.gridApi.selectAll()
// }