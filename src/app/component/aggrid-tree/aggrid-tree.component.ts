import { HttpClient } from '@angular/common/http';
import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import {
  ColDef,
  ColGroupDef,
  ColumnApi,
  GetDataPath,
  GridApi,
  GridOptions,
  GridReadyEvent,
  SideBarDef,
} from "ag-grid-community";
import { v4 as uuidv4 } from "uuid";

import { DialogService } from 'src/app/services/dialog.service';
import { ActivatedRoute,Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import * as moment from 'moment';
import { FormService } from 'src/app/services/form.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import "ag-grid-enterprise";
import { ButtonComponent } from './button';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { HelperService } from 'src/app/services/helper.service';
import { Location } from '@angular/common';
import { concat, isEmpty, values } from 'lodash';
import { MatSidenav } from '@angular/material/sidenav';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-aggrid-tree',
  templateUrl: './aggrid-tree.component.html',
  styleUrls: ['./aggrid-tree.component.css']
})
export class AggridTreeComponent {
  form = new FormGroup({});
  gridApi!: GridApi<any>;
  selectedModel: any = {}
  public listData: any[] = []
  data: any[] = [];
  selectedRows: any
  components: any;
  @ViewChild("drawer") drawer!: MatSidenav;
  
  @ViewChild("imagepoup", { static: true }) imagepoup!: TemplateRef<any>;

  context: any
  fields: FormlyFieldConfig[] = [];
  config: any
  @ViewChild("editViewPopup", { static: true }) editViewPopup!: TemplateRef<any>;
  @Input('model') model: any = {}
  pageHeading: any
  id: any 
  response: any
  imageurl: string=environment?.ImageBaseUrl
public  columnDefs: (ColDef | ColGroupDef)[] = []
  formAction: any;
  formName: any;
  valueChanged: any;
  collectionName: any;
  butText = 'Save'
  addbutton:boolean=false
  reassignemployee:any[]=[]


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

  constructor(public httpclient: HttpClient,  
    public dialogService: DialogService, public route: ActivatedRoute,public _location:Location,   public router: Router,private helperServices:HelperService,
    public dataService: DataService, public formservice: FormService,public formBuilder: FormBuilder) {
    this.components = {
      buttonRenderer: ButtonComponent
    }
    this.context = { componentParent: this };
    
  } 
parms:any
  ngOnInit() {
    this.route.params.subscribe(params => {
this.addbutton=false;
console.log(params);
this.id = params['id'];
this.parms=params['id']

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
        this.pageHeading="Test Result"

        collection="regression"
        this.addbutton=true;
      }else if(this.formName=="bug_list"){
        this.pageHeading="Bug List"

        collection="project"
        this.addbutton=true;
      } else if(this.formName=="regression"){
        this.pageHeading="Bug List"

        collection="project"
        this.addbutton=true;
        this.id=sessionStorage.getItem("project_id")
      } else if(this.formName=="team_member"){
        this.pageHeading="Task Assign"
        collection="project"
        this.addbutton=true;
      }
      this.loadConfig(this.formName)
      this.dataService.getDataById(collection, this.id).subscribe((res: any) => {
        this.response = res.data[0]
        if(this?.response?.startdate){
          this.response.startdate=moment(this.response?.startdate).format('D/M/ YYYY')
        }
        if(this?.response?.enddate){
          this.response.enddate=moment(this.response?.enddate).format("D/M/ YYYY")
        }
        if(this.formName=="Requirement"){
          // this.sprintCellEditorParams('')
          this.ValueToCompareRequriementSprint == undefined || isEmpty(this.ValueToCompareRequriementSprint) ? this.sprintCellEditorParams(true) : this.ValueToCompareRequriementSprint;            

          this.ValueToCompareRequriementModules == undefined || isEmpty(this.ValueToCompareRequriementModules) ? this.moduleCellEditorParams(true) : this.ValueToCompareRequriementModules;            
        }
        if(this.formName=="team_member"){
          // this.sprintCellEditorParams('')
          this.ValueToCompareEmployee == undefined || isEmpty(this.ValueToCompareEmployee) ? this.AssignTOCellEditorParams(true) : this.ValueToCompareEmployee;            

          // this.ValueToCompareRequriementModules == undefined || isEmpty(this.ValueToCompareRequriementModules) ? this.moduleCellEditorParams(true) : this.ValueToCompareRequriementModules;            
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
public sideBar: SideBarDef | string | string[] | boolean | null = 'columns';

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

this.gridOptions.pagination=true
this.gridOptions.paginationPageSize=100
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
    filter: 'agTextColumnFilter',hide:true
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
  
this.gridOptions.pagination=true
this.gridOptions.paginationPageSize=100
    this.gridOptions.autoGroupColumnDef={
      headerName: "Parent Requriement",
      field:"CheckIndex",
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
this.gridOptions.pagination=true
this.gridOptions.paginationPageSize=100
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

this.gridOptions.pagination=true
this.gridOptions.paginationPageSize=100
    this.gridOptions.autoGroupColumnDef={
      headerName: "Requirement Name",
      field:"requirement_name",
      maxWidth: 280,
      cellRendererParams: { suppressCount: true },
      sortable: false,
      resizable: true,
      filter: false
}
    this.columnDefs.push(  
      {
        headerName: 'Module id',
        field: 'module_id',
        width: 40,
        rowGroup:true,
        showRowGroup:false,
        hide:true,
        filter: 'agTextColumnFilter',
      },
    //  {
    //     headerName: 'Requirement Id',
    //     field: 'requriment._id',
    //     width: 40,rowGroup:true,showRowGroup:false,
    //     filter: 'agTextColumnFilter',
    //   }, 
    //   {
    //   headerName: 'Requirement Name',
    //   field: 'requirement_name',
    //   width: 40,
    //   filter: 'agTextColumnFilter',
    // },
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
      headerName: 'Total Test Result ',
      field: 'test_cases_length',
      width: 40,
      editable: false,
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'Test Result Stauts',
      field: 'test_result_stauts',
      width: 40,
      editable: false,
      filter: 'agTextColumnFilter',
    },{
      headerName: 'Bug Count',
      field: 'bug_count',
      width: 40,
      editable: false,
      filter: 'agTextColumnFilter',
    },
    // Need Separate
    // {
    //   field: 'test_data',
    //   editable: true,
    //   cellEditor: 'agLargeTextCellEditor',
    //   cellEditorPopup: true,
    //   cellEditorPopupPosition:'under',
    //   cellEditorParams: {
    //     component:function(parms:any){
    //       console.error(parms);
    //       return "<p [innerHTML]={{parms.data}}></p>"
    //     }
    //     ,
    //     maxLength: '300',
    //     cols: '50',
    //     rows: '6',
    //   },
    // }, 
      {
  
      field: 'Action',
      // width: 40,
      sortable:false,
      filter:false,
      resizable:false,
      maxWidth: 110,

      cellRenderer: 'buttonRenderer'
  
    }
    
    )
  }else if(this.formName=="bug_list"||this.formName=="regression"){
    this.pageHeading="Bug List"
    // this.gridOptions.groupDefaultExpanded=-1
this.gridOptions.sideBar=this.sideBar
this.gridOptions.pagination=true
this.gridOptions.paginationPageSize=100
this.gridOptions.pivotMode=false
//     this.gridOptions.autoGroupColumnDef={
//       headerName: "Requirement Name",
//       field:"requirement.requirement_name",
//       maxWidth: 280,
//       cellRendererParams: { suppressCount: true },
//       sortable: false,
//       resizable: true,
//       filter: false
// }
this.defaultColDef.enablePivot=true;
this.defaultColDef.sortable=true;
this.defaultColDef.editable=false;
// this.defaultColDef.enablePivot: true 
    this.columnDefs.push(  
      {
        headerName: 'Issue ID',
        field: 'test_case_id',
        width: 40,
        // rowGroup:true,
        // showRowGroup:false,
        // hide:true,
        
        filter: 'agTextColumnFilter',
      },
  //  {
  //     headerName: 'Test Result Status',
  //     field: 'testcase.test_case_name',
  //     width: 40,
  //     editable: false,
  //     filter: 'agTextColumnFilter',
  //   },
   
   {
      headerName: 'Test Case Name',
      field: 'testcase.test_case_name',
      width: 40,
      editable: false,
      filter: 'agTextColumnFilter',
    }, 
     {
      headerName: 'Test Case Type',
      field: 'testcase.test_case_scenario',
      width: 40,
      editable: false,
      filter: 'agTextColumnFilter',
    }, 
    {
      headerName: 'Issue Type',
      field: 'test_result.error_type',
      width: 40,
      editable: false,
      filter: 'agTextColumnFilter',
      valueFormatter:function(parse:any){
        if(parse?.value){
          return parse.value.toUpperCase().replaceAll("_",' ')
        }
      },
      enableRowGroup:true,
    },
    {
      headerName: 'Issue Priority',
      field: 'test_result.error_priority',
      width: 40,
      editable: false,
      valueFormatter:function(parse:any){
        if(parse?.value){
        return parse.value.toUpperCase().replaceAll("_",' ')
      }
              },
      enableRowGroup:true,
      filter: 'agTextColumnFilter',
    }, {
      headerName: 'Raised By',
      field: 'bugemploye_name',
      width: 40,
      editable: false,
      
      enableRowGroup:true,
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'assign to',
      field: 'taskemploye_name',
      width: 40,
      editable: false,
      
      enableRowGroup:true,
      filter: 'agTextColumnFilter',
    },
    // {
    //   headerName: 'Done By',
    //   field: 'bug_count',
    //   width: 40,
    //   editable: false,
    //   filter: 'agTextColumnFilter',
    // },
    {
      headerName: 'Status',
      field: 'devops_Status',
      width: 40,
      editable: false,
      filter: 'agTextColumnFilter',
    }
    // ,
    //   {
  
    //   field: 'Action',
    //   sortable:false,
    //   filter:false,
    //   resizable:false,
    //   maxWidth: 110,
    //   cellRenderer: 'buttonRenderer'
  
    // }
    
    )
  }else if(this.formName=="team_member"){
    this.pageHeading="Team Member"
    const Assigned:any=this.AssignTOCellEditorParams
this.gridOptions.treeData=true
this.gridOptions.pagination=true
this.gridOptions.paginationPageSize=100
    this.gridOptions.autoGroupColumnDef={
      headerName: "Requriement Name",
      field:"requirement_name",
      minWidth: 200,
      cellRendererParams: { suppressCount: true },
      sortable: false,
      resizable: true,
      filter: false,
      // refData:
}
// this.gridOptions.groupDisplayType='groupRows'
this.gridOptions.rowSelection='single'
this.gridOptions.groupSuppressBlankHeader=true;
this.gridOptions.groupDefaultExpanded=-1
this.gridOptions.getRowId=function(rowData:any){
  return rowData.data['_id']
}
    this.columnDefs.push(  
    
      {
        headerName: "Task Id",
        field: "task_id",
        cellDataType: "text",
        editable: false,
        sortable: true,
      },
      {
        headerName: "Team Name",
        cellDataType: "text",
        field: "team_name",
        editable: function(parms) {
          return parms.data.taskeditable
        }
      },
      // {
      //   headerName: "Days",
      //   field: "days",

      //   editable: function(parms) {
      //     return parms.data.taskeditable
      //   },
      //   cellDataType: "number",
      //   cellEditor: "agNumberCellEditor",
      //   cellEditorParams: {
      //     min: 0,
      //     max: 100,
      //     precision: 2,
      //   },
      // }, 
      {
        headerName: "Allocated Hours",
        cellDataType: "number",
        field: "allocated_hours",
        editable: function(parms) {
          return parms.data.taskeditable
        } ,cellEditor: "agNumberCellEditor",
        cellEditorParams: {
          min: 0,
          max: 100,
          precision: 0,
        },
      },
      {
        headerName: "Start Date",
        cellDataType: "date",
        field: "start_date",
        cellEditor: "agDateCellEditor",
        // cellEditorParams: {
        //     min: moment
        //  }
        valueFormatter: function (params: any) {
          if (params.value) {
            console.log(params.value);
            let data=params.value
            return moment(data).format("DD-MM-YYYY");
          }
          return '' 
        },
        editable: function(parms) {
          return parms.data.taskeditable
        }
      },
      {
        headerName: "End Date",
        cellDataType: "date",
        field: "end_date",
        valueFormatter: function (params: any) {
          if (params.value) {
            console.log(params.value);
            let data=params.value
            return moment(data).format("DD-MM-YYYY");
          }
          return '' 
        },
        editable: function(parms) {
          return parms.data.taskeditable
        }
      },
     
      {
        headerName: "Depend Task",
        cellDataType: "text",
        field: "depend_task",

        editable: function(parms) {
          return parms.data.taskeditable
        }      },
      {
        headerName: "Assigned to ",
        field: "assigned_to",
        cellDataType: "text",

        editable: function(parms) {
          return parms.data.taskeditable
        } ,     cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
          values:Assigned
        },
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
imageFile:any[]=[]
ValueToCompareRequriementSprint:any[]=[] 
OnlyValueRequriementSprint:any[]=[]

ValueToCompareRequriementModules:any[]=[]
OnlyValueRequriementModules:any[]=[]

poupimage(data:any){
this.imageFile=data;
this.dialogService.openDialog(this.imagepoup)
}
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
        // this.dialogService.openSnackBar("There Were No Sprint To be Found","OK")
        return
      }
    res.data[0].response.forEach((each:any)=>{
    // this.ValueToCompareRequriementSprint.push({label:each.name,value:each.id})
    this.OnlyValueRequriementSprint.push(each.id)
  })  
})
    return this.OnlyValueRequriementSprint
}};


// Changethetask(taskData:any,selectedData:any,index:any){
//   let data:any={}
//   data['assigned_to']=selectedData.employee_id
//   data['previous_assigned_to']=taskData.assigned_to
//   this.dataService.update("task",taskData._id,data).subscribe((xyz:any)=>{
//     console.log(xyz);
//     this.dialogService.openSnackBar("Task updated successfully","OK")
//     this.reassignemployee[index]=null
//   })
// }

OnlyValueEmployee:any[]=[]  
ValueToCompareEmployee:any[]=[]
AssignTOCellEditorParams =  (params: any) => {
  if (!isEmpty(this.OnlyValueEmployee)) {
    console.warn("Data Exist");
    return this.OnlyValueEmployee;
  } else {
   this.dataService.lookupTreeData("team_specification", this.response.project_id).subscribe((res: any) => {
      if (isEmpty(res.data.response)) {
        // Handle the case when there is no response data
        // this.dialogService.openSnackBar("There Were No Sprint To be Found","OK");
        return;
      }

      console.log(res);

      res.data.response.forEach((each: any) => {
        if (!this.OnlyValueEmployee.includes(each.employe_name)) {
          this.ValueToCompareEmployee.push({ label: each.employe_name, value: each.user_id });
          this.OnlyValueEmployee.push(each.employe_name);
        }
      });
      return this.OnlyValueEmployee
    });
    if (params == true) {
    //   if(isEmpty(this.ValueToCompareEmployee)){
    //     this.ValueToCompareEmployee=this.AssignTOCellEditorParams('');

    //   }else{

        return this.ValueToCompareEmployee ;
      }
    // }

    // If params is true, return ValueToCompareEmployee, otherwise return OnlyValueEmployee
    return this.OnlyValueEmployee;
  }
};

// AssignTOCellEditorParams = (params: any): Promise<any[]> => {
//   if (!isEmpty(this.OnlyValueEmployee)) {
//     console.warn("Data Exist");
//     return Promise.resolve(this.OnlyValueEmployee);
//   } else {
//     return new Promise((resolve, reject) => {
//       this.dataService.lookupTreeData("team_specification", this.response.project_id)
//         .subscribe((res: any) => {
//           if (isEmpty(res.data.response)) {
//             // Handle the case when there is no response data
//             // this.dialogService.openSnackBar("There Were No Sprint To be Found","OK");
//             reject("No response data");
//             return;
//           }

//           console.log(res);

//           res.data.response.forEach((each: any) => {
//             if (!this.OnlyValueEmployee.includes(each.employe_name)) {
//               this.ValueToCompareEmployee.push({ label: each.employe_name, value: each.user_id });
//               this.OnlyValueEmployee.push(each.employe_name);
//             }
//           });

//           // If params is true, resolve with ValueToCompareEmployee, otherwise continue recursion
//           if (params == true) {
//             resolve(this.ValueToCompareEmployee);
//           } else {
//             // Continue recursion (you might want to add a base case to prevent infinite recursion)
//             this.AssignTOCellEditorParams(params).then(resolve).catch(reject);
//           }
//         });
//     });
//   }
// };

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
      // this.dialogService.openSnackBar("There Were No Modules To be Found","OK")
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
//   let Projectfiler:any={
//     start:0,end:1000,filter:[{
      
//         clause: "AND",
//         conditions: [
//           {column: "project_id",operator: "EQUALS",type: "string",value: this.response.project_id},
//         ],
      
//     }]
//   }
// this.response.project_id
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
  }else if(this.formName=="Requirement"){
      this.dataService.lookupTreeData("requriment",this.response.project_id).subscribe((res:any) =>{
//         let data:any[]= []     
//         this.listData = []
        
//         for (let idx = 0; idx < res.data.response.length; idx++) {
//           const row = res.data.response[idx];
//             if(row && row?.module_id){
// // Check if Data is Empty (it call function and return)
//               let datafound = this.ValueToCompareRequriementModules == undefined || isEmpty(this.ValueToCompareRequriementModules) ? this.moduleCellEditorParams(true) : this.ValueToCompareRequriementModules;          
//               let findValue:any=datafound.find((val:any)=>val.value==row.module_id)
//               row.module_id = findValue?.label;
//             }
//             if (row.parentmodulename == "" || !row.parentmodulename) {
//               row.treePath = [row.requirement_name];
//             } else {
//               const parentNode = data.find((d) => d.requirement_name == row.parentmodulename);
//               if (parentNode && parentNode.treePath && !parentNode.treePath.includes(row.requirement_name)) {
//                               row.treePath = [...parentNode.treePath];
//                 row.treePath.push(row.requirement_name);
//               }
//                         }
//           data.push(row);
//         }
                
        // let parentTreeData: any[] = [];
        // let childIndex: { [key: string]: number } = {};
        // let childArr: any[] = [];

        // data.forEach((res: any) => {
        //   const arrLength = res.treePath ? res.treePath.length : 0;
        //   if (arrLength === 1) {
        //         res.index = parentTreeData.length + 1;
        //         res.parentIndex=res.index
        //         res.index=res.index + " "+res.requirement_name
        //         childIndex = {};
        //         parentTreeData.push(res);
        //   } else if (arrLength > 1) {
        //       const parentKey = res.treePath.slice(0, -1).join('.');
        //       const parentRequirementName = res.treePath[arrLength - 2];
        //       const parent = data.find((d) => d.requirement_name === parentRequirementName);        
        //           if (parent) {
        //             if (!childIndex[parentKey]) {
        //               childIndex[parentKey] = 1;
        //             }
        //               console.log(parent.index,'parent.index');
        //               let CheckIndex = parent.parentIndex + '.' + childIndex[parentKey]++;
        //               const childIndexable = childArr.find((d) => {        
        //                 d.parentIndex == CheckIndex
        //               });
        //               res.parentIndex=parseFloat(CheckIndex)
        //               if(childIndexable===undefined){
        //                     res.index=CheckIndex +" "+ res.requirement_name
        //                    }else{
        //                     let index=childIndex[parentKey]++ +1
        //                     res.index = parent.parentIndex + '.' + index;
        //                   }
        //             childArr.push(res);
        //           }
        //   }
        // });
// childArr.forEach((value:any)=>{
  // const data = res.data.response;
  // let parentTreeData: any[] = [];
  // let childIndex: { [key: string]: number } = {};
  // let childArr: any[] = [];
  
  // for (let idx = 0; idx < data.length; idx++) {
  //   const row = data[idx];
  
  //   if (row && row.module_id) {
  //     let datafound = this.ValueToCompareRequriementModules == undefined || isEmpty(this.ValueToCompareRequriementModules) ? this.moduleCellEditorParams(true) : this.ValueToCompareRequriementModules;
  //     let findValue: any = datafound.find((val: any) => val.value == row.module_id);
  //     row.module_id = findValue?.label;
  //   }
  
  //   if (row.parentmodulename == "" || !row.parentmodulename) {
  //     row.treePath = [row.requirement_name];
  //     row.index = idx + 1 + " " + row.requirement_name;
  //     row.parentIndex = idx + 1;
  //     parentTreeData.push(row);
  //   } else {
  //     const parent = data.find((d:any) => d.requirement_name === row.parentmodulename);
  //     if (parent) {
  //       if (!childIndex[row.parentmodulename]) {
  //         childIndex[row.parentmodulename] = 1;
  //       }
  //       console.log(childIndex[row.parentmodulename]++);
        
  //       row.treePath = [...parent.treePath, row.requirement_name];
  //       row.parentIndex = parent.parentIndex;
  //       let CheckIndex = row.parentIndex + '.' + childIndex[row.parentmodulename]++;
  //       row.index = CheckIndex + " " + row.requirement_name;
  //       childArr.push(row);
  //     }
  //   }
  // }
  
  // const finalData = parentTreeData.concat(childArr);
  
  // // Log the final data for debugging or further analysis.
  // console.log(finalData);
  
  //       // })
  //       this.listData = [...parentTreeData, ...childArr];
  //       console.log(this.listData);
        
  // const data = res.data.response;
  // let parentTreeData: any[] = [];
  // let childIndex: { [key: string]: number } = {};
  // let parentindex:any
  // data.forEach((row: any, idx: number) => {
  //   if (row && row.module_id) {
  //     // Check if Data is Empty (it calls a function and returns)
  //     let datafound = this.ValueToCompareRequriementModules == undefined || isEmpty(this.ValueToCompareRequriementModules) ? this.moduleCellEditorParams(true) : this.ValueToCompareRequriementModules;
  //     let findValue: any = datafound.find((val: any) => val.value == row.module_id);
  //     row.module_id = findValue?.label;
  //   }
  
  //   if (row.parentmodulename == "" || !row.parentmodulename) {
  //     row.treePath = [row.requirement_name];
  //     // row.parentindex=
  //     row.index = (idx + 1).toString();
  //     row.parentIndex = null; // Use null for top-level elements
  //     parentTreeData.push(row);
  //   } else {
  //     const parent = data.find((d:any) => d.requirement_name === row.parentmodulename);
  //     if (parent) {
  //       childIndex[row.parentmodulename] = (childIndex[row.parentmodulename] || 0) + 1;
  //       row.treePath = [...parent.treePath, row.requirement_name];
  //       row.parentIndex = parent.index;
  //       row.index = `${row.parentIndex}.${childIndex[row.parentmodulename]}`;
  //       parentTreeData.push(row);
  //     }
  //   }
  // });
  
  // // Log the final data for debugging or further analysis.
  // console.log(parentTreeData);
  
  // // Set the final data to your listData variable
  // this.listData = parentTreeData;
//   const data = res.data.response;
//   console.log(data);
  
// let parentTreeData: any[] = [];
// let childIndex: { [key: string]: number } = {};
// let parentIndex: number = 1; // Initialize parentIndex

// data.forEach((row: any, idx: number) => {
//   if (row && row.module_id) {
//     // Check if Data is Empty (it calls a function and returns)
//     let datafound = this.ValueToCompareRequriementModules == undefined || isEmpty(this.ValueToCompareRequriementModules) ? this.moduleCellEditorParams(true) : this.ValueToCompareRequriementModules;
//     let findValue: any = datafound.find((val: any) => val.value == row.module_id);
//     row.module_id = findValue?.label;
//   }

//   if (row.parentmodulename == "" || !row.parentmodulename) {
//     row.treePath = [row.requirement_name];
//     row.index = parentIndex.toString();
//     row.parentIndex = null;
//     row.CheckIndex=row.index+' ' +row.requirement_name

//     parentTreeData.push(row);
//   } else {
//     const parent = data.find((d:any) => d.requirement_name === row.parentmodulename);
//     console.log(parent);
    
//     if (parent) {
//       childIndex[row.parentmodulename] = (childIndex[row.parentmodulename] || 0) + 1;
//       console.log(parent.treePath);
//       if (
//         parent &&
//         parent.treePath &&
//         !parent.treePath.includes(row.requirement_name)
//       ) {

//         row.treePath = [...parent?.treePath, row.requirement_name];
//       }
//       row.parentIndex = parent.index;
//       row.index = `${row.parentIndex}.${childIndex[row.parentmodulename]}`;
//       row.CheckIndex=row.index+' ' +row.requirement_name
//       parentTreeData.push(row);
//     }
//   }

//   if (!row.parentmodulename) {
//     parentIndex++;
//   }
// });
// console.log(parentTreeData);
// this.listData = parentTreeData;
const data = res.data.response;
let parentTreeData: any[] = [];
let childIndex: { [key: string]: number } = {};
let parentIndex: number = 1; // Initialize parentIndex
if(!isEmpty(data)){
  data.forEach((row: any, idx: number) => {
    if (row && row.module_id) {
      let datafound = this.ValueToCompareRequriementModules == undefined || isEmpty(this.ValueToCompareRequriementModules) ? this.moduleCellEditorParams(true) : this.ValueToCompareRequriementModules;
      let findValue: any = datafound.find((val: any) => val.value == row.module_id);
      row.module_id = findValue?.label;
    }
  
    if (row.parentmodulename == "" || !row.parentmodulename) {
      row.treePath = [row.requirement_name];
      row.index = parentIndex.toString();
      row.CheckIndex=row.index+' ' +row.requirement_name
      row.parentIndex = null; // Use null for top-level elements
      parentTreeData.push(row);
    } else {
      const parent = parentTreeData.find((d) => d.requirement_name === row.parentmodulename);
      if (parent) {
        childIndex[row.parentmodulename] = (childIndex[row.parentmodulename] || 0) + 1;
        row.treePath = [...parent.treePath, row.requirement_name];
        row.parentIndex = parent.index;
        row.index = `${row.parentIndex}.${childIndex[row.parentmodulename]}`;
        row.CheckIndex=row.index+' ' +row.requirement_name
        parentTreeData.push(row);
      }
    }
  
    if (!row.parentmodulename) {
      parentIndex++;
    }
  });
  this.listData = parentTreeData;
  
}

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
          row.treePath = [row._id];
        } else {
          var parentNode = this.listData.find((d) => d._id == row.parentmodulename);
          if (
            parentNode &&
            parentNode.treePath &&
            !parentNode.treePath.includes(row._id)
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
  let test_Case_Details:any[]=[]
  res.data.response.forEach((xyz:any)=>{
    if(!isEmpty(xyz.test_result)){

      test_Case_Details.push(...xyz.test_result)
    }
  })
console.log(test_Case_Details);

let overalldata: any[] = [];
let virtualDAta:any=res.data.response
virtualDAta.forEach((vals: any) => {
  vals.testcase.forEach((data: any) => {
    let testcase_id=data._id
    let combinedData = {
        ...data,
        ...vals.requirement,
    };
    combinedData["requriment_id"] = vals.requirement._id
    combinedData["test_case_id"] = testcase_id
    const refFound: any[] = test_Case_Details.filter((d: any) => {return d.testCase_id == combinedData.test_case_id});
    if(!isEmpty(refFound)){
      const hasFailures: boolean = refFound.some((d: any) => {return d.result_status === "F"});

      const failList: any = refFound.filter((d: any) => {return d.result_status === "F" });

      const resultStatus = hasFailures ? "Fail" : "Pass";
      combinedData['bug_list']=failList

    combinedData['test_result_stauts']=resultStatus      

    combinedData['bug_count']=failList.length
    
    combinedData['test_cases']=refFound
    combinedData['test_cases_length']=refFound.length

    }

    overalldata.push(combinedData);
});
if (vals?.requirement?.module_id==undefined) {
  vals.requirement['module_id'] = "No Module Id Present";
}
if (vals.testcase.length === 0) {
  let combinedData = {
    ...vals.requirement,
};
  combinedData["requriment_id"] = vals.requirement._id

    overalldata.push(combinedData);
}
 
  });

this.listData = overalldata;
})
  }else if(this.formName=="bug_list"){
    
    this.dataService.lookUpBug(this.response.project_id,'').subscribe((res:any)=>{
      console.log(res);
      let data:any=res.data.response
      this.listData=data
    })
   }else if(this.formName=="regression"){
        this.dataService.getDataById("regression",this.parms ).subscribe((res:any)=>{
          
          this.dataService.lookUpBug(this.response.project_id,res.data[0].regression_id).subscribe((res:any)=>{
            console.log(res);
            let data:any=res.data.response
            this.listData=data
          })
        })
      }
      
      else if(this.formName=="team_member"){
        // this.dataService
        // .getDataById("project", "6554bb7e052126c9587741a5")
        // .subscribe((data: any) => {
        //   console.log(data);
          this.dataService
            .lookupTreeData("task_requriment", this.response.project_id)
            .subscribe((res: any) => {
              console.log(res);
              // this.listData = res.data.response;
              this.GroupRow(res.data.response);
            });
          
        // });
    }

}
taskdount:any=1

GroupRow(data: any) {
this.listData = [];
let plainRequirements: any[] = [];
let existTasks: any[] = [];
data.forEach((element: any) => {
  if (!isEmpty(element.task)) {
 
        element.task.forEach((task:any) => {
        //   if (task && task.assigned_to) {
        //     // Check if this.ValueToCompareEmployee is undefined or empty
        //     let datafound = this.ValueToCompareEmployee === undefined || isEmpty(this.ValueToCompareEmployee)
        //         ? this.AssignTOCellEditorParams(true)
        //         : this.ValueToCompareEmployee;
        
        //     // Find the matching value in datafound
        //     let findValue: any = datafound.find((val: any) => val.value == task.assigned_to);
        
        //     // If a matching value is found, update task.assigned_to
        //     if (findValue !== undefined) {
        //         task.assigned_to = findValue.label;
        //     }
        // }
        // valueFormatter:function(parms) {
          let datafound :any= isEmpty(this.ValueToCompareEmployee)?this.AssignTOCellEditorParams(true) : this.ValueToCompareEmployee
          console.log(datafound);
          
      let findValue: any = datafound.find((val: any) => val.value == task.assigned_to);
  console.warn(findValue);
  
      // If a matching value is found, update task.assigned_to
      if (findValue !== undefined) {
          task.assigned_to = findValue.label;
      }
          // return findValue.label
        // },
      existTasks.push(task);
});
let Value: any = {};
Object.assign(Value, element);
delete Value.task;
plainRequirements.push(Value);
  } else {
    let Value: any = {};
    Object.assign(Value, element);
    delete Value.task;
    plainRequirements.push(Value);
  }
});

console.warn(existTasks, 'ChildData');
console.error(plainRequirements, 'plainRequirements');
let parentTreeData: any[] = [];

for (let idx = 0; idx < plainRequirements.length; idx++) {
  const row = plainRequirements[idx];
  console.log(idx);

  if (row.parentmodulename == "" || !row.parentmodulename) {
    // If the element doesn't have a task_id, treat it as a root node
    row.treePath = [row.requirement_name];
    row.taskeditable = false;
    parentTreeData.push(row);
  } else {
    const parent = parentTreeData.find((d) => d.requirement_name === row.parentmodulename);
    console.log(parent);

    if (parent) {
      row.treePath = [...parent.treePath, row.requirement_name];
      row.taskeditable = false;
      parentTreeData.push(row);
    }
  }
}

console.log(parentTreeData);

let taskData: any[] = [];
existTasks.forEach((element: any) => {
  const parent = parentTreeData.find((d) => d._id === element.requirement_id);
 if (parent!==undefined) {
    element.taskeditable = true;
    element.task_id=element._id
    element.treePath = [...parent.treePath, element._id];
    taskData.push(element);
  }
});
this.listData = concat(parentTreeData,taskData);

}

  onCellClicked(event: any){
let clickCell:any=event.column.getColId()
if(this.formName=="Requirement"){
  this.drawer.close() 
  if(clickCell== 'number_of_TestCase_count'||clickCell=="number_of_Task_count"){
      console.log(event.data);
      this.cellClicked=clickCell
      this.drawer.open()
    }
  }else if(this.formName=="test_result"){
    this.drawer.close()
    if(clickCell== 'test_cases_length'||clickCell=="bug_count"){
      console.log(event.data);
      this.cellClicked=clickCell
      this.drawer.open()
    }}
    else if(this.formName=="bug_list"){
      // console.log(event.data);
      this.cellClicked=clickCell
      
      this.drawer.open()
    }
    else {
    this.drawer.close()
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
    // this.valueChanged = params.value;
    let data: any = {};
    data[fieldName] = params.value;
// ! UNDO
if(fieldName=="module_id"){
  let findValue:any=this.ValueToCompareRequriementModules.find(val=>val.label==params.value)
  console.log(findValue);
  
  data[fieldName] = findValue.value;

}
if(this.formName=="Requirement"){
  this.dataService.update("requirement",params.data._id,data ).subscribe((res: any) => {
    // this.rowData = res.data;
    console.log(res);
    
  });

}
 if(this.formName=="team_member"){
let update:any={}
let value:any=[]
let findValue:any={}
update[fieldName] = params.value;
if(fieldName=="assigned_to"){
  findValue=this.ValueToCompareEmployee.find(val=>val.label==params.value)
  console.log(findValue);
  
  data[fieldName] = findValue.label;
  update[fieldName] = findValue.value;
}
  if (fieldName == "allocated_hours") {
  console.log(data);
  // !todo
  let hrsFlag= params.value>=8? true : false
  
  let hrsconvertedDay=hrsFlag==true? Math.ceil(params.value/8) : 1
  console.log(hrsconvertedDay);
  
  update["start_date"] = moment();
  update["end_date"] = moment().add(hrsconvertedDay, "day");
  }
if(fieldName=="depend_task"){
  // 
  update["end_date"] =  this.depend_task(params.value,params)
}
this.dataService.update("task",params.data._id,update).subscribe((res:any)=>{
  // console.log();
  
  value={...params.data,...update}

  // value["treePath"]=[...params.data.treePath,res.data["insert ID"]]
value["taskeditable"]=true
if(fieldName=="assigned_to"){

  value[fieldName] = findValue.label;
}
console.log(value);

  const result = params.api.applyTransaction({ update: [value] });
  console.log(result);
  // params.context.componentParent.TaskIdChange()
  
})
}

  }

  depend_task(id: string,params:any) {
    // Split the input string into an array
    const separatedArray: string[] = id.split(',');
    console.log(separatedArray);
    if (separatedArray.includes(params.data.task_id.toString())) {
      // valuesMatchTaskId.push(node.data);
      this.dialogService.openSnackBar("The Present Task Cannot Be Depended Task ","OK")
      return
    }

    // Array to store values matching task_id
    let valuesMatchTaskId: any[] = [];
  
    // Iterate through grid nodes
    this.gridApi.forEachNode((node: any) => {
      if (node.data && node.data.task_id) {
        // Check if the task_id matches any value in the separatedArray
        if (separatedArray.includes(node.data.task_id.toString())) {
          valuesMatchTaskId.push(node.data);
        }
      }
    });
  if(isEmpty(valuesMatchTaskId)){
    this.dialogService.openSnackBar("No tasks were found ","OK")
    return
  }
  function getHigherDate(dateString1:any, dateString2?:any) {
    
    const momentDate1 = moment(dateString1);
    const momentDate2 = moment(dateString2);
  
    if (momentDate1.isAfter(momentDate2)) {
      return momentDate1;
    } else if (momentDate1.isBefore(momentDate2)) {
      return momentDate2;
    } else {
      return null; // or handle the case when both dates are equal
    }
  }
  let bigdate:any =moment()
  valuesMatchTaskId.forEach((xyz:any)=>{
    bigdate = getHigherDate(bigdate,xyz.end_date);
    console.log(bigdate);
    
  })
    return bigdate
  }
  
  /**gridReady for ag grid */
  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
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
if(this.formName=="projectteam"){
  values._id=`SEQ|${values.project_id}`
}
  values.parentmodulename= ""
  this.dataService.save(this.config.form.collectionName,values).subscribe((data:any)=>{
    console.log(data);
    this.form.reset()
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


  datefunction(date:any){
    let dates:any= moment(date).format("DD-MM-YYYY")
    if(dates=="Invalid date to Invalid date"){
      return' '
    }else{
      return dates
    }
  }

  reassigndata(employeeID:any,index:any){
   this.reassignemployee[index]=[]
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
        this.reassignemployee[index]=res.data[0].response
  })
  }

  reassigntask(taskData:any,selectedData:any,index:any){
      let data:any={}
      data['assigned_to']=selectedData.employee_id
      data['previous_assigned_to']=taskData.assigned_to
      this.dataService.update("task",taskData._id,data).subscribe((xyz:any)=>{
        console.log(xyz);
        this.dialogService.openSnackBar("Task updated successfully","OK")
        this.reassignemployee[index]=null
      })
  }
  
  addOneColumnBelow(params:any){

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