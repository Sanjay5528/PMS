import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import {  CellClassParams,  ColDef,  ColGroupDef,   GridApi,  GridOptions,  GridReadyEvent, } from "ag-grid-community";
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
import { BreadcrumbsService } from 'src/app/breadcrums.service';

@Component({
  selector: 'app-aggrid-tree',
  templateUrl: './aggrid-tree.component.html',
  styleUrls: ['./aggrid-tree.component.css'],
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
//! this.cfg.detectChanges() Undo

  // public autoGroupColumnDef: ColDef = {};

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
  cellClicked:any 

  constructor(public httpclient: HttpClient,  
    public dialogService: DialogService, 
    public route: ActivatedRoute,
    public _location:Location,
    public router: Router,
    public breadCrums: BreadcrumbsService,
    private helperServices:HelperService,
    public dataService: DataService,
    public formservice: FormService,
    // public cfg:ChangeDetectorRef,
    public formBuilder: FormBuilder) 
    {
    this.components = {
      buttonRenderer: ButtonComponent
    }
    this.context = { componentParent: this };
    // this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  } 
parms:any
breadcrumsShow:boolean=true
  ngOnInit() { 
      console.warn("Component Loaded" , "Agtree"); 
      this.ComponentInit()
    this.helperServices.getProjectObservable().subscribe((res:any)=>{
      console.warn("Project Nav Result" , res); 
      this.breadcrumsShow=!res
      console.log(res);
    })
    }

    ComponentInit(){
    
         this.route.params.subscribe(params => {
           this.addbutton=false;
           this.id = params['id'];
           this.parms=params['id']
           this.formName=params['Action']
           let collection:any ;
            if(this?.gridApi != null || this?.gridApi != undefined){
            // console.log("Before Change old Column def",this.gridApi.getColumnDefs());
            // const data =this.gridApi.setGridOption("columnDefs",[])
            // console.log("After Change old Column def",this.gridApi.getColumnDefs());
            // this.gridApi.setSideBarVisible(false);
           this.reloadGrid()
    
           }
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
           
                  //  collection="regression"
                   collection="project"
                   this.addbutton=true;
                  //  this.id=sessionStorage.getItem("project_id")
                 } else if(this.formName=="team_member"){
                   this.pageHeading="Task Assign"
                   collection="project"
                   this.addbutton=true;
                 }else if(this.formName=="sprint"){
                   this.pageHeading="Sprint List"
           
                   collection="project"
                   this.addbutton=false; 
                 } else if(this.formName=="release"){
                   this.pageHeading="Release"
                   collection="project"
                   this.addbutton=false;
                 } else if(this.formName=="functionaltesting"){
                  this.pageHeading="Functional Testing"
                  collection="project"
                  this.addbutton=false;
                }
               // this.routing(component.route._futureSnapshot._routerState.url, display_Name)
           
               //  let breadCrums:any =  this.breadCrums.routing(this,this.pageHeading)
               //  console.log(breadCrums);
                
             //  this.breadCrums.routing(this, this.pageHeading).then((breadCrumbs:any) => {
             //   console.log(breadCrumbs);
             // });
                 this.columnDefs=[];
                 this.listData=[]; 
                 this.loadScreen(this.formName)
                if(this.formName=="regression" || this.formName=="test_result"){
                // if(this.formName=="regression"){

                  this.dataService.getDataById("regression",this.id).subscribe((res:any)=>{
                    console.log(res);
                    
                    let Projectfiler:any={
                      start:0,end:1000,
                      "filter":[{"clause":"AND","conditions":[{"column":"project_id","operator":"EQUALS","value": res.data[0].project_id}]}]
                    }
                    this.dataService.getDataByFilter("project", Projectfiler).subscribe((res:any)=>{
                      console.log(res);
                      if(res && res.data[0].response[0]){
                      this.response = res.data[0].response[0];
                      if(this?.response?.startdate){
                        this.response.startdate=moment(this.response?.startdate).format('DD/MM/YYYY')
                      }
                      if(this?.response?.enddate){
                        this.response.enddate=moment(this.response?.enddate).format("DD/MM/YYYY")
                      }
                      this.getTreeData()
                    }
                    
                   })
                  })
                  return
                }
                 this.dataService.getDataById(collection, this.id).subscribe((res: any) => {
                   this.response = res?.data[0]
                   if(this?.response?.startdate){
                     this.response.startdate=moment(this.response?.startdate).format('D/M/ YYYY')
                   }
                   if(this?.response?.enddate){
                     this.response.enddate=moment(this.response?.enddate).format("D/M/ YYYY")
                   }
                   if(this.formName=="Requirement"){
                     this.sprintCellEditorParams('')
                     this.moduleCellEditorParams('')
                     this.ValueToCompareRequriementSprint == undefined || isEmpty(this.ValueToCompareRequriementSprint) ? this.sprintCellEditorParams(true) : this.ValueToCompareRequriementSprint;            
           
                     this.ValueToCompareRequriementModules == undefined || isEmpty(this.ValueToCompareRequriementModules) ? this.moduleCellEditorParams(true) : this.ValueToCompareRequriementModules;            
                   }
                   if(this.formName=="team_member"){
                     // this.sprintCellEditorParams('')
                     this.ValueToCompareEmployee == undefined || isEmpty(this.ValueToCompareEmployee) ? this.AssignTOCellEditorParams(true) : this.ValueToCompareEmployee;            
           
                     // this.ValueToCompareRequriementModules == undefined || isEmpty(this.ValueToCompareRequriementModules) ? this.moduleCellEditorParams(true) : this.ValueToCompareRequriementModules;            
                   }
                   sessionStorage.setItem("project_id", this.response.project_id)
           
                   // if(this.formName=="projectteam"){
                   //   this.getList()
                   // }else{
                    // this.formservice.LoadDefaultTreeComponent(this)
                     
                     this.getTreeData()
                   // }
                 
                  
                 })
                 //  // this.cfg.detectChanges()
           
               });
    }



 

  formlyformdata(data:any){
  console.log('work');
  this.form = new FormGroup ({})
  this.fields=[]
  this.bugNotUpdate=true
  this.config=''
  if(data==true){
    this.dataService.loadConfig("task").subscribe((res:any)=>{
      console.log(res);
      // let config:any=res
   this.config=res;
      this.fields=res.form.fields;

  this.selectedModel={
    "project_id": this.selectedRows.task.project_id,
    "requirement_id": this.selectedRows.task.requirement_id, 
      "task_name": this.selectedRows.task.task_name,
    "task_type": this.selectedRows.task.task_type,
   }

    })

  }else if(data==false){
    this.fields=[{
      "type": "html-input",
      "key": "not_bug_justification",
      "className": "flex-8",
      "props": {
        "label": "Why It Not a Bug Justification",
        required:true
         }  
    }]
    this.selectedModel={}
  }
 } 

loadScreen(formName:any){
this.columnDefs=[]
  if(formName=="module"){
    this.gridOptions.autoGroupColumnDef={
        headerName: "Parent Modules",
        minWidth: 200,
        cellRendererParams: { suppressCount: true },
        sortable: false,
    resizable: true,
    filter: false 
  }

//   this.autoGroupColumnDef={
//     headerName: "Parent Modules",
//     minWidth: 200,
//     cellRendererParams: { suppressCount: true },
//     sortable: false,
// resizable: true,
// filter: false 
// }
this.gridOptions.pagination=true
this.gridOptions.paginationPageSize=100
this.gridOptions.getRowId=function (params:any) { return params.data._id }
this.gridOptions.treeData=true
this.gridOptions.getDataPath=(data: any) => { return data.treePath };
this.gridOptions.groupDefaultExpanded=-1


  this.columnDefs=
  // this.columnDefs.push(  
 [ 
  {
    headerName: 'Start Date',
    field: 'startdate',
    width: 40,
    editable: false,
    filter: 'agDateColumnFilter',
    valueFormatter: function (params:any) {
      if(params.value){

        return moment(params.value).format('DD/MM/YYYY')
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
    valueFormatter: function (params:any) {
      if(params.value){

        return moment(params.value).format('DD/MM/YYYY')
      }
      return ''  
      },
  },
  {
  
    field: 'Action',
    maxWidth:85,
    sortable:false,filter: false,
   menuTabs: [],
   lockPosition: 'right',
   lockPinned: true,
    pinned:'right',
    cellRenderer: 'buttonRenderer'

  }
]
this.gridOptions.columnDefs=this.columnDefs
  // )
  
  // ? Undo
//    if(this.gridaldreadyloaded==true &&  this?.gridApi != null && this?.gridApi != undefined ){
// // this.gridApi.setGridOption('autoGroupColumnDef',this.gridOptions.autoGroupColumnDef)
// this.gridApi.setAutoGroupColumnDef(this.gridOptions.autoGroupColumnDef)
//   this.gridApi.setGetRowId(this.gridOptions.getRowId)
//   this.gridApi.setColumnDefs(this.columnDefs)   
//   delete this.gridOptions.autoGroupColumnDef;
//   delete this.gridOptions.getRowId;
// this.gridApi.setGridOption('treeData',true)
// this.gridApi.setGridOption('getDataPath',this.gridOptions.getDataPath)

//     this.gridApi.updateGridOptions(this.gridOptions)
//   this.gridApi.setSideBarVisible(false);

// }


  }else if(formName=="Requirement"){
 

    this.gridOptions.treeData=true
    this.gridOptions.getDataPath=(data: any) => { return data.treePath };

this.gridOptions.groupDefaultExpanded=-1
  this.gridOptions.getRowId=function (params:any) { return params.data._id }
  this.gridOptions.excludeChildrenWhenTreeDataFiltering=true; 
    this.gridOptions.autoGroupColumnDef={
      headerName: "Parent Requriement",
      field:"CheckIndex",
      minWidth: 200,
      cellRendererParams: { suppressCount: true },
      sortable: false,
      resizable: true,
      filter: false
}
// this.autoGroupColumnDef={
//   headerName: "Parent Requriement",
//   field:"CheckIndex",
//   minWidth: 200,
//   cellRendererParams: { suppressCount: true },
//   sortable: false,
//   resizable: true,
//   filter: false
// }
    const Sprintvalue:any=this.sprintCellEditorParams
    const modelvalue:any=this.moduleCellEditorParams
   
    this.columnDefs=
    // .push(  
      [
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
      field:"CheckIndex",
      width: 40,
      filter: 'agTextColumnFilter',
      initialHide:true
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
      maxWidth: 160,
      editable: false,
      filter: 'agNumberColumnFilter',
    }, {
      headerName: 'Task Count',
      field: 'number_of_Task_count',
      maxWidth: 160,
      editable: false,
      filter: 'agNumberColumnFilter',
    },
    {
  
      field: 'Action',
      maxWidth:85,sortable:false,filter: false,
     menuTabs: [],
     lockPosition: 'right',
     lockPinned: true,
      pinned:'right',
      cellRenderer: 'buttonRenderer'
  
    }
  ] 
  this.gridOptions.columnDefs=this.columnDefs
 // ? Undo
//   if(this.gridaldreadyloaded==true &&  this?.gridApi != null && this?.gridApi != undefined ){
//     this.gridApi.setAutoGroupColumnDef(this.gridOptions.autoGroupColumnDef)
//   this.gridApi.setColumnDefs(this.columnDefs)   
//   this.gridApi.setGetRowId(this.gridOptions.getRowId)
//   delete this.gridOptions.autoGroupColumnDef;
//   delete this.gridOptions.getRowId;
// this.gridApi.setGridOption('treeData',true)
// this.gridApi.setGridOption('getDataPath',this.gridOptions.getDataPath)

//     this.gridApi.updateGridOptions(this.gridOptions)
//     this.gridApi.setSideBarVisible(false);
//   }

  }else if(formName=="projectteam"){
this.gridOptions.treeData=true
this.gridOptions.getDataPath=(data: any) => { return data.treePath };
this.gridOptions.getRowId=function (params:any) { return params.data._id }
this.gridOptions.pagination=true
this.gridOptions.paginationPageSize=100
this.gridOptions.groupDefaultExpanded=-1
    this.gridOptions.autoGroupColumnDef={
      headerName: "Team  Name",
      field:"name",
      // minWidth: 200,
      cellRendererParams: { suppressCount: true },
      sortable: false,
      resizable: true,
      filter: false
}
// this.autoGroupColumnDef={
//   headerName: "Team Specification Name",
//   field:"name",
//   // minWidth: 200,
//   cellRendererParams: { suppressCount: true },
//   sortable: false,
//   resizable: true,
//   filter: false
// }
    this.columnDefs=[
    // .push(	
				
		{ 
			"headerName": "Employee Name", "field": "employe_name" 
		},
	  { 
		"headerName": "Project Role", "field": "role_id" 
	},  { 
		"headerName": "Reporting Person", "field": "approved_by_name" 
	},
  {
    headerName: 'Start Date',
    field: 'scheduled_start_date',
    width: 45,
    editable: false,
    filter: 'agDateColumnFilter',
    valueFormatter: function (params:any) {
      if(params.value){

        return moment(params.value).format('DD/MM/YYYY');
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
    valueFormatter: function (params:any) {
      if(params.value){

        return moment(params.value).format('DD/MM/YYYY');
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
    maxWidth:85,sortable:false,filter: false,
   menuTabs: [],
   lockPosition: 'right',
   lockPinned: true,
    pinned:'right',
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
      // )
]
// this.cfg.detectChanges()
this.gridOptions.columnDefs=this.columnDefs
// ? Undo
// if(this.gridaldreadyloaded==true &&  this?.gridApi != null && this?.gridApi != undefined ){
//   this.gridApi.setAutoGroupColumnDef(this.gridOptions.autoGroupColumnDef)
  
//   this.gridApi.setGetRowId(this.gridOptions.getRowId)
//   delete this.gridOptions.autoGroupColumnDef;
//   delete this.gridOptions.getRowId;
//   this.gridApi.setGridOption('treeData',true)
//   this.gridApi.setGridOption('getDataPath',this.gridOptions.getDataPath)
  
//   this.gridApi.setColumnDefs(this.columnDefs)   
// this.gridApi.setGridOption('columnDefs',this.columnDefs)
//   this.gridApi.updateGridOptions(this.gridOptions)
//   this.gridApi.setSideBarVisible(false);
// }

  }else if(this.formName=="test_result"){
    this.gridOptions.groupDefaultExpanded=-1
this.gridOptions.groupAllowUnbalanced=true;
this.gridOptions.pagination=true;
this.gridOptions.getRowId=function (params:any) { return params.data.unique }

this.gridOptions.paginationPageSize=100
    this.gridOptions.autoGroupColumnDef={
      headerName: "Requirement Name",
      field:"requirement_name",
      sortable: false,
      resizable: true,
      filter: false
}
this.gridOptions.treeData=false;
// this.autoGroupColumnDef={
//   headerName: "Requirement Name",
//   field:"requirement_name",
//   maxWidth: 280,
//   cellRendererParams: { suppressCount: true },
//   sortable: false,
//   resizable: true,
//   filter: false
// }
    this.columnDefs=[
    // .push(  
      // ? "required"
      // {
      //   headerName: 'Module id',
      //   field: 'module_id',
      //   width: 40,
      //   enableRowGroup:true,
      //   showRowGroup:false,
      //   hide:true,
      //   filter: 'agTextColumnFilter'
      // },

    //  {
    //     headerName: 'Requirement Id',
    //     field: 'requriment._id',
    //     width: 40,rowGroup:true,showRowGroup:false,
    //     filter: 'agTextColumnFilter',
    //   }, 
      {
      headerName: 'Requirement Name',
      field: 'requirement_name',
      width: 40,       
      showRowGroup:false,
      resizable:true, 
      rowGroup:true,
      rowGroupIndex:0,
      hide:true,
      enableRowGroup:true,
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
    enableRowGroup:true, 
      editable: false,
      filter: 'agTextColumnFilter', 
       cellRenderer: (params:any) => {
        let svg :any 
//         if( params.value == "P"){
// svg=`<svg >
//           <circle cx="52" cy="27" r="11"  stroke-width="2" fill="green" />
//           Sorry, your browser does not support inline SVG.
//        </svg> ` 
//         }else if( params.value == "N"){
//           svg=`<svg>
//           <circle cx="52" cy="27" r="11"  stroke-width="2" fill="red" />
//           Sorry, your browser does not support inline SVG.
//        </svg> `
//         }
if (params.value === "P") {
  svg = `
    <svg style="display: block; margin: auto;">
      <circle cx="52" cy="27" r="11" stroke-width="2" fill="green" />
    </svg>
  `;
} else if (params.value === "N") {
  svg = `
    <svg style="display: block; margin: auto;">
      <circle cx="52" cy="27" r="11" stroke-width="2" fill="red" />
    </svg>
  `;
}
  
        return svg
    },
    //  tooltipValueGetter: (params: any) => {
    //   console.log(params);
    //   if(params.value ! = undefined && params.value !== null){
    //   return params.value.toUpperCase()
    // }
    // return ''
    // },
    }, 
    {
      headerName: 'Total Test Result ',
      field: 'test_cases_length',
      width: 40,
      editable: false,
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'Over All Test Result Stauts',
      field: 'test_result_stauts',
      width: 40,
      editable: false,
      enableRowGroup:true, 
      filter: 'agTextColumnFilter',
      cellRenderer: (params:any) => {
        let maticon :any 
//      
if (params.value == "Pass") {
  maticon = ` <i class="fa-solid fa-square-check fa-2xl"></i>`;
} else if (params.value == "Fail") {
  maticon = `<i class="fa-solid fa-square-xmark fa-2xl"></i>`
}
  return maticon
    },tooltipField:"test_result_stauts"
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
      maxWidth:85,sortable:false,filter: false,
     menuTabs: [],
     lockPosition: 'right',
     lockPinned: true,
      pinned:'right',
      cellRenderer: 'buttonRenderer'
  
    }
  ]
    // )
// this.cfg.detectChanges()
this.gridOptions.columnDefs=this.columnDefs
// ? Undo
// if(this.gridaldreadyloaded==true &&  this?.gridApi != null && this?.gridApi != undefined ){
//   this.gridApi.setAutoGroupColumnDef(this.gridOptions.autoGroupColumnDef)
//   this.gridApi.setGetRowId(this.gridOptions.getRowId)
//   delete this.gridOptions.autoGroupColumnDef;
//   delete this.gridOptions.getRowId;
// this.gridApi.setGridOption('treeData',false)
// // this.gridApi.setGridOption('getDataPath',this.gridOptions.getDataPath)
//   this.gridApi.updateGridOptions(this.gridOptions);
//   this.gridApi.setSideBarVisible(false);
// }

  }else if(this.formName=="bug_list"||this.formName=="regression"){
    this.pageHeading="Bug List"
    this.gridOptions.treeData=false
    // this.autoGroupColumnDef={}
this.gridOptions.sideBar= {
  toolPanels: [
      {
          id: 'columns',
          labelDefault: 'Columns',
          labelKey: 'columns',
          iconKey: 'columns',
          toolPanel: 'agColumnsToolPanel',
          minWidth: 225,
          maxWidth: 225,
          width: 225
      },
      {
          id: 'filters',
          labelDefault: 'Filters',
          labelKey: 'filters',
          iconKey: 'filter',
          toolPanel: 'agFiltersToolPanel',
          minWidth: 180,
          maxWidth: 400,
          width: 250
      }
  ],
  position: 'right',
   
  // defaultToolPanel: 'filters',
};
this.gridOptions.pagination=true
this.gridOptions.paginationPageSize=100
this.gridOptions.pivotMode=false
this.gridOptions.enableCellExpressions=true 
this.defaultColDef.enablePivot=true;
this.defaultColDef.enableRowGroup=true;
this.gridOptions.getRowId=function (params:any) { return params.data._id }

this.gridOptions.suppressAggFuncInHeader=true
this.defaultColDef.sortable=true;
this.defaultColDef.editable=false;
this.defaultColDef.enableValue=true;
this.defaultColDef.pivot=true;
// this.gridOptions.tool=true;
// this.gridOptions.columnTypes= {
//   valueColumn: {
//     editable: true,
//     aggFunc: 'sum',
//     valueParser: 'Number(newValue)',
//     cellClass: 'number-cell',
//     cellRenderer: 'agAnimateShowChangeCellRenderer',
//     filter: 'agNumberColumnFilter',
//   },
//   totalColumn: {
//     cellRenderer: 'agAnimateShowChangeCellRenderer',
//     cellClass: 'number-cell',
//   },
// };  [tooltipInteraction]="true"
 this.gridOptions.tooltipInteraction=true
this.defaultColDef.menuTabs=['generalMenuTab','filterMenuTab','columnsMenuTab'];
// this.defaultColDef.menuTabs.push('')
    this.columnDefs=[
    // .push(  
      // {
      //   headerName: 'Total',
      //   type: 'totalColumn',
      //   // we use getValue() instead of data.a so that it gets the aggregated values at the group level
      //   valueGetter:
      //     'getValue("a")',
      // }, { field: 'a', type: 'valueColumn',valueFormatter:(params:any)=>{
      //    return params.node.rowIndex
      // } },
        {
        headerName: 'Issue ID',
        field: 'test_case_id',
        width: 40,
        // rowGroup:true,
        // showRowGroup:false,
        // hide:true,
        enableValue: true,
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
      width: 40,        enableValue: true,
      editable: false,
      filter: 'agTextColumnFilter',
    }, 
     {
      headerName: 'Test Case Type',
      field: 'testcase.test_case_scenario',
      width: 40,
      editable: false,        enableValue: true,

      filter: 'agTextColumnFilter',
    }, 
    {
      headerName: 'Issue Type',
      field: 'test_result.error_type',
      width: 40,
      editable: false,        enableValue: true,

      filter: 'agTextColumnFilter',
      valueFormatter:function(parse:any){
        if(parse?.value){
          return  parse.value.toUpperCase().replaceAll("_",' ')
        }
      },
      enableRowGroup:true,
    },
    {
      headerName: 'Issue Priority', 
      // headerName: 'Issue Severity',
      field: 'test_result.error_priority',
      width: 40,     
      maxWidth:150,
        tooltipField: 'test_result.error_priority',
        enableValue: true,
      editable: false,
      valueFormatter:function(parse:any){
        if(parse?.value){
          let data:any =' '
          return data
        // return parse.value.toUpperCase().replaceAll("_",' ')
      } 
    },cellStyle :(params: CellClassParams) =>{ 
      let style: string;

if (params.value === "high") {
  style = '#FF5733';
} else if (params.value === "low") {
  style = '#EFECCA';
} else if (params.value === "medium") {
  style = '#A7DBD8';
} else if (params.value === "show stoper") {
  style = '#900C3F';
} else {
  style = ''; 
}

    return {'background-color': style}
  },
      enableRowGroup:true,
      filter: 'agTextColumnFilter',
    }, {
      headerName: 'Raised By',
      field: 'bugemploye_name',
      width: 40,        enableValue: true,

      editable: false,
      
      enableRowGroup:true,
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'assign to',
      field: 'taskemploye_name',
      width: 40,
      editable: false,        enableValue: true,

      
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
      width: 40,        enableValue: true,

      editable: false,
      filter: 'agTextColumnFilter',
    } 
  ] 
this.gridOptions.columnDefs=this.columnDefs
// ? Undo
    // if(this.gridaldreadyloaded==true &&  this?.gridApi != null && this?.gridApi != undefined ){
    //   this.gridApi.setGetRowId(this.gridOptions.getRowId)
    //   delete this.gridOptions.autoGroupColumnDef;
    //   delete this.gridOptions.getRowId;
    //   this.gridApi.setColumnDefs(this.columnDefs)   
    // this.gridApi.setGridOption('columnDefs',this.columnDefs)
      
    // this.gridApi.setGridOption('treeData',false);
    // this.gridApi.updateGridOptions(this.gridOptions)
    // }

  }else if(this.formName=="team_member"){
    // this.pageHeading="Team Member"
    const Assigned:any=this.AssignTOCellEditorParams
this.gridOptions.getRowId=function (params:any) { return params.data._id }

    this.gridOptions.treeData=true
    this.gridOptions.getDataPath=(data: any) => { return data.treePath };

this.gridOptions.pagination=true
this.gridOptions.paginationPageSize=50
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
// this.autoGroupColumnDef={
//   headerName: "Requriement Name",
//   field:"requirement_name",
//   minWidth: 200,
//   cellRendererParams: { suppressCount: true },
//   sortable: false,
//   resizable: true,
//   filter: false,
// }

this.gridOptions.rowSelection='single'
this.gridOptions.groupSuppressBlankHeader=true;
this.gridOptions.groupDefaultExpanded=-1
this.gridOptions.getRowId=function(rowData:any){return rowData.data['_id']}
    this.columnDefs =[
    // .push(  
    
      {
        headerName: "Task Id",
        field: "task_id",
        cellDataType: "text",
        editable: false,
        sortable: true,
      },
      {
        headerName: "Task Type",
        cellDataType: "text",
        field: "task_type",
        editable: function(parms:any) {
          return parms.data.taskeditable
        },cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
          values:["UI/UX","API","Testing","UI Development"]
        },
      },{
        headerName: "Task Name",
        cellDataType: "text",
        field: "task_name",
        editable: function(parms:any) {
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
        editable: function(parms:any) {
          return parms.data.taskeditable
        } ,cellEditor: "agNumberCellEditor",
        cellEditorParams: {
          min: 0,
          max: 40,
          precision: 0,
        },
      },
      {
        headerName: "Start Date",
        cellDataType: "date",
        field: "scheduled_start_date",
        cellEditor: "agDateCellEditor",
        // cellEditorParams: {
        //     min: moment
        //  }
        valueFormatter: function (params: any) {
          if (params.value) {
            let data=params.value
            return moment(data).format("DD-MM-YYYY");
          }
          return '' 
        },
        editable: function(parms:any) {
          return parms.data.taskeditable
        }
      },
      {
        headerName: "End Date",
        cellDataType: "date",
        field: "scheduled_end_date",
        valueFormatter: function (params: any) {
          if (params.value) {
            let data=params.value
            return moment(data).format("DD-MM-YYYY");
          }
          return '' 
        },
        editable: function(parms:any) {
          return parms.data.taskeditable
        }
      },
     
      {
        headerName: "Depend Task",
        cellDataType: "text",
        field: "depend_task",

        editable: function(parms:any) {
          return parms.data.taskeditable
        }      },
      {
        headerName: "Assigned to ",
        field: "assigned_to",
        cellDataType: "text",

        editable: function(parms:any) {
          return parms.data.taskeditable
        } ,     cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
          values:Assigned
        },
      },
      {
  
        field: 'Action',
        maxWidth:85,sortable:false,filter: false,
       menuTabs: [],
       lockPosition: 'right',
       lockPinned: true,
        pinned:'right',
        cellRenderer: 'buttonRenderer'
    
      }
  
    ] 
this.gridOptions.columnDefs=this.columnDefs
// ? Undo
    // if(this.gridaldreadyloaded==true &&  this?.gridApi != null && this?.gridApi != undefined ){
    //   this.gridApi.setAutoGroupColumnDef(this.gridOptions.autoGroupColumnDef)
    //   this.gridApi.setGetRowId(this.gridOptions.getRowId)
    //   delete this.gridOptions.autoGroupColumnDef;
    //   this.gridApi.setColumnDefs(this.columnDefs)   
    //   this.gridApi.setGridOption('columnDefs',this.columnDefs)
        
    //   delete this.gridOptions.getRowId;
    // this.gridApi.setGridOption('treeData',this.gridOptions.treeData)
    // this.gridApi.updateGridOptions(this.gridOptions)
    //   this.gridApi.setSideBarVisible(false);
    // }

  }else if(this.formName=="release"){
    // this.pageHeading="Team Member"
    // const Assigned:any=this.AssignTOCellEditorParams
// this.gridOptions.getRowId=function (params:any) { return params.data._id }

    this.gridOptions.treeData=false

this.gridOptions.pagination=true
this.gridOptions.paginationPageSize=50 
this.gridOptions.rowSelection='single'
this.gridOptions.groupSuppressBlankHeader=true; 
this.gridOptions.getRowId=function(rowData:any){return rowData.data['_id']}
    this.columnDefs =[ 
              {
            "headerName": "Id",
            "field": "_id",
            "filter": "agTextColumnFilter",
            "sortable": true
        },
        {
            "headerName": "Name",
            "field": "name",
            "filter": "agTextColumnFilter",
            "sortable": true
        },            {
            "headerName": "Sprint",
            "field": "sprint_ids",			  
            "filter":false,
        },

        {
          "headerName": "Start Date",
          "field": "start_date",
          "width": 40,
          "sortable": true,
          "filter": "agDateColumnFilter",
          valueFormatter: function (params:any) {
            if(params.value){
      
              return moment(params.value).format('DD/MM/YYYY')
            }
            return ''    
          },
        },
        {
          "headerName": "End Date",
          "field": "end_date",
          "width": 40,
          "editable": true,
          "filter": "agDateColumnFilter" ,
          valueFormatter: function (params:any) {
            if(params.value){
      
              return moment(params.value).format('DD/MM/YYYY')
            }
            return ''    
          },
        },  {
                "headerName": "Status",
                "field": "status",   "maxWidth":100,
                "filter": "agTextColumnFilter",
                "sortable": true
            }, 
  {
    "type": "rightAligned",
    "headerName": "Actions",
            "menuTabs": [],    "maxWidth":85,

            "lockPosition": "right",
            "lockPinned": true,
             "pinned":"right",
    "cellRenderer": "buttonRenderer",
    "cellRendererParams": {
      "onClick": "this.onBtnClick1.bind(this)",
      "label": "Click 1"
    },
    "filter":false,"sortable":false
  }
  
    ]
    // )
// this.cfg.detectChanges()
this.gridOptions.columnDefs=this.columnDefs
// ? Undo
    // if(this.gridaldreadyloaded==true &&  this?.gridApi != null && this?.gridApi != undefined ){
    //   this.gridApi.setAutoGroupColumnDef({})
    //   this.gridApi.setGetRowId(this.gridOptions.getRowId)
    //   delete this.gridOptions.autoGroupColumnDef;
    //   delete this.gridOptions.getRowId;
    //   this.gridApi.setColumnDefs(this.columnDefs)   
    // this.gridApi.setGridOption('columnDefs',this.columnDefs)
      
    // this.gridApi.setGridOption('treeData',this.gridOptions.treeData)

    //   this.gridApi.updateGridOptions(this.gridOptions)
    //   this.gridApi.setSideBarVisible(false);
    // }
  }else if(this.formName=="sprint"){
  this.gridOptions.treeData=false
this.gridOptions.pagination=true
this.gridOptions.paginationPageSize= 50 
this.gridOptions.rowSelection='single'
this.gridOptions.groupSuppressBlankHeader=true; 
this.gridOptions.getRowId=function(rowData:any){return rowData.data['_id']}
  this.columnDefs=[
    {
        "headerName": "Id",
        "field": "_id",
        "filter": "agTextColumnFilter",
        "sortable": true
    },
    {
        "headerName": "Name",
        "field": "name",
        "filter": "agTextColumnFilter",
        "sortable": true
    },
    {
        "headerName": "Release Version",
        "field": "release_id",
        "filter": "agTextColumnFilter",
        "sortable": true
    },
    {
        "headerName": "Start Data",
        "field": "start_date",
"sortable": true,
"filter": "agDateColumnFilter",
valueFormatter: function (params:any) {
  if(params.value){

    return moment(params.value).format('DD/MM/YYYY')
  }
  return ''    
},
    },
    {
        "headerName": "End Data",
        "field": "end_date",
"sortable": true,
"filter": "agDateColumnFilter",

    valueFormatter: function (params:any) {
      if(params.value){

        return moment(params.value).format('DD/MM/YYYY')
      }
      return ''    
    },    },
{
        "headerName": "Status",
        "field": "status",   "maxWidth":100,
        "filter": "agTextColumnFilter",
        "sortable": true
    }, 
{
    "type": "rightAligned",
    "headerName": "Actions",
    "menuTabs": [],    "maxWidth":85,

    "lockPosition": "right",
    "lockPinned": true,
     "pinned":"right",
    "cellRenderer": "buttonRenderer",
    "cellRendererParams": {
        "onClick": "this.onBtnClick1.bind(this)",
        "label": "Click 1"
    },
    "filter":false,"sortable":false
}
]

this.gridOptions.columnDefs=this.columnDefs
// ? Undo
    // if(this.gridaldreadyloaded==true &&  this?.gridApi != null && this?.gridApi != undefined ){
    //   this.gridApi.setAutoGroupColumnDef({})
    //   this.gridApi.setGetRowId(this.gridOptions.getRowId)
    //   delete this.gridOptions.autoGroupColumnDef;
    //   delete this.gridOptions.getRowId;
    //   this.gridApi.setColumnDefs(this.columnDefs)   
    //   this.gridApi.setGridOption('columnDefs',this.columnDefs)
        
    // this.gridApi.setGridOption('treeData',false)
    // this.gridApi.updateGridOptions(this.gridOptions)
    //   this.gridApi.setSideBarVisible(false);
    // }

  }else if(this.formName=="functionaltesting"){
    // this.pageHeading="Team Member"
 
    this.gridOptions.treeData=false
 
this.gridOptions.pagination=true
this.gridOptions.paginationPageSize= 50 

this.gridOptions.rowSelection='single'
this.gridOptions.groupSuppressBlankHeader=true; 

this.gridOptions.getRowId=function(rowData:any){return rowData.data['_id']}
  this.columnDefs= [
		{
		  "headerName": "Regression Id",
		  "field": "regression_id",
		  "sortable": true,
		  "filter": "agTextColumnFilter"
		},
		{
		  "headerName": "Sprint Id",
		  "field": "sprint_id",
		  "sortable": true,
		  "filter": "agTextColumnFilter"
		},
  
		 
		{
		  "headerName": "Test Case Count",
		  "field": "ResultCount",
		  "sortable": true,
		  "filter": "agTextColumnFilter"
		},
		{
		  "headerName": "Test Case Positive",
		  "field": "ResultPassCount",
		  "sortable": true,
		  "filter": "agTextColumnFilter"
		},
		{
		  "headerName": "Test Case Negative",
		  "field": "ResultFailCount",
		  "sortable": true,
		  "filter": "agTextColumnFilter"
		},
		{
            "headerName": "Status",
            "field": "status",   "maxWidth":100,
            "filter": "agTextColumnFilter",
            "sortable": true
          }, 
          {
          "type": "rightAligned",
          "headerName": "Actions",
          "menuTabs": [],    "maxWidth":85,
          
          "lockPosition": "right",
          "lockPinned": true,
          "pinned":"right",
          "cellRenderer": "buttonRenderer",
          "cellRendererParams": {
          "onClick": "this.onBtnClick1.bind(this)",
          "label": "Click 1"
          },
          "filter":false,"sortable":false
          }
	  ]

this.gridOptions.columnDefs=this.columnDefs
    // ? Undo
// if(this.gridaldreadyloaded==true &&  this?.gridApi != null && this?.gridApi != undefined ){
        //   this.gridApi.setAutoGroupColumnDef({})
        //   this.gridApi.setGetRowId(this.gridOptions.getRowId)
        //   delete this.gridOptions.autoGroupColumnDef;
        //   this.gridApi.setColumnDefs(this.columnDefs)   
        // this.gridApi.setGridOption('columnDefs',this.columnDefs)
          
        //   delete this.gridOptions.getRowId;
        // this.gridApi.setGridOption('treeData',false);
        // this.gridApi.updateGridOptions(this.gridOptions)
        //   this.gridApi.setSideBarVisible(false);
        // }

  }
 
}

imageFile:any[]=[]
ValueToCompareRequriementSprint:any[]=[] 
OnlyValueRequriementSprint:any[]=[]

ValueToCompareRequriementModules:any[]=[]
OnlyValueRequriementModules:any[]=[]

poupimage(data:any){
this.imageFile=data; 
console.log(data);

this.dialogService.openDialog(this.imagepoup,null,null,null)
}

sprintCellEditorParams = (params: any) => {
    if(params==true || !isEmpty(this.OnlyValueRequriementSprint)){
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
        return
      }
    res.data[0].response.forEach((each:any)=>{
    this.OnlyValueRequriementSprint.push(each._id)
  })  
})
    return this.OnlyValueRequriementSprint
}};


OnlyValueEmployee:any[]=[]  
ValueToCompareEmployee:any[]=[]

AssignTOCellEditorParams =  (params: any) => {
  if (!isEmpty(this.OnlyValueEmployee)) {
    return this.OnlyValueEmployee;
  } else {
   this.dataService.lookupTreeData("team_specification", this.response.project_id).subscribe((res: any) => {
      if (isEmpty(res.data.response)) {
        return;
      } 
      res.data.response.forEach((each: any) => {
        if (!this.OnlyValueEmployee.includes(each.employe_name)) {
          this.ValueToCompareEmployee.push({ label: each.employe_name, value: each.user_id });
          this.OnlyValueEmployee.push(each.employe_name);
        }
      });
      return this.OnlyValueEmployee
    });
    if (params == true) {
        return this.ValueToCompareEmployee ;
      }
    return this.OnlyValueEmployee;
  }
};
 
moduleCellEditorParams =  (params: any)  => {
  if(!isEmpty(this.OnlyValueRequriementModules)){
  return this.OnlyValueRequriementModules
}else{ 
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
  this.ValueToCompareRequriementModules.push({ label: each.modulename, value: each._id });
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
// ! UNDO
debugger
if (this.gridApi) { this.gridApi.updateGridOptions({rowData:[]}) }

if(this.formName=="module"){
this.fetchModuleData()
  }else if(this.formName=="Requirement"){
     this.fetchRequirementData()
  }else if(this.formName=="projectteam"){
  this.fetchProjectTeamData()
   }else if(this.formName=="test_result"){
    this.fetchTestResultData()
  }else if(this.formName=="bug_list"){
    
    this.dataService.lookUpBug(this.response.project_id,'').subscribe((res:any)=>{
// this.cfg.detectChanges()
// this.listData=res.data.response
if(res.data.response!=null){
  let data:any[]=[]
  res.data.response.forEach((element:any) => {
    element.unique=uuidv4()
    data.push(element)
  });
  this.listData=data
//   if (this.gridApi) {
// console.log("Grid Load Alderady",this.listData);
// this.gridApi.setGridOption('rowData',this.listData)
// // this.gridApi.redrawRows()    
// this.gridApi.updateGridOptions({rowData:this.listData})
//     this.gridApi.refreshClientSideRowModel();
//     this.gridDataPatch()
//   }
// this.reloadGrid()

} 
    })
   }else if(this.formName=="regression"){
        this.dataService.getDataById("regression",this.id).subscribe((res:any)=>{
          
          this.dataService.lookUpBug(this.response.project_id,res.data[0].regression_id).subscribe((res:any)=>{
// this.cfg.detectChanges()
if(res.data.response!=null){
  let data:any=res.data.response
  this.listData=data
  // this.reloadGrid()
//   if (this.gridApi) {
// console.log("Grid Load Alderady",this.listData);

// // this.gridApi.redrawRows()    
// this.gridApi.updateGridOptions({rowData:this.listData});
//     this.gridApi.refreshClientSideRowModel()
//     this.gridDataPatch()
//   }
}
            // this.updateGrid()
            // this.gridApi.applyTransaction({add:[this.listData]})
          })
        })
      }     else if(this.formName=="team_member"){ 
          this.dataService.lookupTreeData("task_requriment", this.response.project_id).subscribe((res: any) => {
              if(res.data.response!=null){
                this.GroupRow(res.data.response);
              }
            }); 
    }  else if(this.formName=="sprint"){
      // this.dataService
      // .getDataById("project", "6554bb7e052126c9587741a5")
      // .subscribe((data: any) => {
      //   console.log(data);
      let Projectfiler:any={
        start:0,end:1000,
        "filter":[{"clause":"AND","conditions":[{"column":"project_id","operator":"EQUALS","value": this.response.project_id}]}]
      }
        this.dataService.getDataByFilter("sprint", Projectfiler).subscribe((res: any) => {
            if(res && res.data[0].response){
            this.listData = res.data[0].response;
// this.reloadGrid()

            // if (this.gridApi) {
            //     console.log("Grid Load Alderady",this.listData);
            //     this.gridApi.setGridOption('rowData',this.listData)
            //     // this.gridApi.redrawRows()              
            //     this.gridApi.updateGridOptions({rowData:this.listData})
            //   this.gridApi.refreshClientSideRowModel()
            //   this.gridDataPatch()
            // }
          } 
        }); 
  }  else if(this.formName=="release"){
      this.dataService
        .lookupTreeData("RealseSpirntList", this.response.project_id)
        .subscribe((res: any) => {
          console.log(res);
          if(res && res.data.response){
            this.listData=res.data.response
// this.reloadGrid()
//             if (this.gridApi) {
// console.log("Grid Load Alderady",this.listData);
// this.gridApi.setGridOption('rowData',this.listData)
// // this.gridApi.redrawRows()              
// this.gridApi.updateGridOptions({rowData:this.listData})
//               this.gridApi.refreshClientSideRowModel()
//               this.gridDataPatch()
//             }
          } 
        });
  } else if(this.formName=="functionaltesting"){
    this.dataService.lookupTreeData("testing", this.response.project_id).subscribe((res: any) => {
        if(res && res.data.response){
          this.listData=res.data.response
            // this.reloadGrid()

          // if (this.gridApi) {
          //       console.log("Grid Load Alderady",this.listData);
          //       this.gridApi.setGridOption('rowData',this.listData)
          //       // this.gridApi.redrawRows()            
          //       this.gridApi.updateGridOptions({rowData:this.listData})
          //   this.gridApi.refreshClientSideRowModel()
            // this.gridDataPatch()
          // }
        } 
      });
}
    }

 fetchModuleData() {
  let Projectfiler:any={
    start:0,end:1000,filter:[{
      
        clause: "AND",
        conditions: [
          {column: "project_id",operator: "EQUALS",type: "string",value: this.response.project_id},
        ],
      
    }]
  }
  let listData:any[]=[]
    this.dataService.getDataByFilter("modules", Projectfiler).subscribe((res: any) => {
      this.listData = [] 
      let data:any=res.data[0].response
      for (let idx = 0; idx < data.length; idx++) {
        const row = data[idx];
        if (row.parentmodulename == "" || !row.parentmodulename) {
          row.treePath = [row.modulename];
        } else {
          var parentNode = listData.find((d) => d.modulename == row.parentmodulename);
          if (
            parentNode &&
            parentNode.treePath &&
            !parentNode.treePath.includes(row.modulename)
          ) {
            row.treePath = [...parentNode.treePath];
            row.treePath.push(row.modulename);
          }
          // ? Time Purpose
          else{
            row.treePath= [row.modulename];
          }
        }
        listData.push(row);
// this.cfg.detectChanges()
console.log(listData);

        // this.getmodules()
      }
      this.listData=listData

//       if (this.gridApi) {
//         // this.gridApi.applyTransaction({add:[this.listData]})
// console.log("Grid Load Alderady",this.listData);
// // this.gridApi.setGridOption('rowData',this.listData)
// // this.gridApi.redrawRows()        
// this.gridApi.updateGridOptions({rowData:this.listData})
//         // this.gridApi.setGridOption("rowData",this.listData)

//         this.gridDataPatch()
//         this.gridApi.refreshClientSideRowModel()
//       }
// this.reloadGrid()

      // this.cfg.detectChanges()
    });
    // this.updateGrid();
    
}
// ! 0
 fetchRequirementData() {
  // let listData:any[]=[]
  this.dataService.lookupTreeData("requriment",this.response.project_id).subscribe((res:any) =>{
    const data = res.data.response; 
    if(data !=null){
      // let ParentValue:any []=data.filter((row:any)=>{ return row.parentmodulename == "" || !row.parentmodulename }) 
    let parentTreeData: any[] = [];
    let childIndex: { [key: string]: number } = {};
    let parentIndex: number = 1; // Initialize parentIndex
    if(!isEmpty(data)){
      data.forEach((row: any) => {
        if (row && row.module_id) {
          let datafound = this.ValueToCompareRequriementModules == undefined || isEmpty(this.ValueToCompareRequriementModules) ? this.moduleCellEditorParams(true) : this.ValueToCompareRequriementModules;
          let findValue: any = datafound.find((val: any) => val.value == row.module_id);
          row.module_id = findValue?.label;
        }
      
        if (row.parentmodulename == "" || !row.parentmodulename) {
          row.treePath = [row.requirement_name];
          row.index = parentIndex.toString();
          row.CheckIndex=row.index+' ' +row.requirement_name
          row.parentIndex = null;   
          parentTreeData.push(row);
        } else {
          const parent = parentTreeData.find((d) => d._id === row.parentmodulename);
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
    // if (this.gridApi) {
    //     // this.gridApi.applyTransaction({add:[this.listData]})
    //     console.log("Grid Load Alderady",this.listData);
    //     // this.gridApi.setGridOption('rowData',this.listData)
    //     // this.gridApi.redrawRows()        
    //     this.gridApi.updateGridOptions({rowData:this.listData})
    //     // this.gridApi.setGridOption("rowData",this.listData)
    //     this.gridApi.refreshClientSideRowModel()
    //     this.gridDataPatch()
    //   }
// this.reloadGrid()

      // this.cfg.detectChanges()
    }
    
      
    }
    
          })
}
// convertToHierarchicalData(data: any[]): any[] {
//   let parentTreeData: any[] = [];
//   let childIndex: { [key: string]: number } = {};
//   let parentIndex: number = 1; // Initialize parentIndex
//   let parentNotFound: any[] = [];
 
//   if (!isEmpty(data)) {
//      data.forEach((row: any) => {
//        if (row && row.module_id) {
//          let datafound = this.ValueToCompareRequriementModules == undefined || isEmpty(this.ValueToCompareRequriementModules) ? this.moduleCellEditorParams(true) : this.ValueToCompareRequriementModules;
//          let findValue: any = datafound.find((val: any) => val.value == row.module_id);
//          row.module_id = findValue?.label;
//        }
 
//        if (row.parentmodulename == "" || !row.parentmodulename) {
//          row.treePath = [row.requirement_name];
//          row.index = parentIndex.toString();
//          row.CheckIndex = row.index + ' ' + row.requirement_name;
//          row.parentIndex = null; // Use null for top-level elements
//          parentTreeData.push(row);
//        } else {
//          const parent = parentTreeData.find((d) => d._id === row.parentmodulename);
//          if (parent) {
//            childIndex[row.parentmodulename] = (childIndex[row.parentmodulename] || 0) + 1;
//            row.treePath = [...parent.treePath, row.requirement_name];
//            row.parentIndex = parent.index;
//            row.index = `${row.parentIndex}.${childIndex[row.parentmodulename]}`;
//            row.CheckIndex = row.index + ' ' + row.requirement_name;
//            parentTreeData.push(row);
//          } else {
//            parentNotFound.push(row);
//          }
//        }
 
//        if (!row.parentmodulename) {
//          parentIndex++;
//        }
//      });
 
//      parentNotFound.forEach((res: any) => {
//        if (res && res.module_id) {
//          let datafound = this.ValueToCompareRequriementModules == undefined || isEmpty(this.ValueToCompareRequriementModules) ? this.moduleCellEditorParams(true) : this.ValueToCompareRequriementModules;
//          let findValue: any = datafound.find((val: any) => val.value == res.module_id);
//          res.module_id = findValue?.label;
//        }
 
//        if (res.parentmodulename == "" || !res.parentmodulename) {
//          res.treePath = [res.requirement_name];
//          res.index = parentIndex.toString();
//          res.CheckIndex = res.index + ' ' + res.requirement_name;
//          res.parentIndex = null; // Use null for top-level elements
//          parentTreeData.push(res);
//        } else {
//          const parent = parentTreeData.find((d) => d._id === res.parentmodulename);
//          if (parent) {
//            childIndex[res.parentmodulename] = (childIndex[res.parentmodulename] || 0) + 1;
//            res.treePath = [...parent.treePath, res.requirement_name];
//            res.parentIndex = parent.index;
//            res.index = `${res.parentIndex}.${childIndex[res.parentmodulename]}`;
//            res.CheckIndex = res.index + ' ' + res.requirement_name;
//            parentTreeData.push(res);
//          } else {
//            parentNotFound.push(res);
//          }
//        }
 
//        if (!res.parentmodulename) {
//          parentIndex++;
//        }
//      });
//   }
 
//   return parentTreeData;
//  }

// ! 1
// fetchRequirementData() {
// this.dataService.lookupTreeData("requriment", this.response.project_id).subscribe((res: any) => {
//   const data = res.data.response;
//   if (data != null) {
//     function getRequirement(data: any,ctrl:any):any {
//       console.log("Inside","GetRequirement");
      
//       let requrimentdata :any[]= ctrl.hirecalData(data);
//       console.log(requrimentdata.length==data.length,requrimentdata.length,data.length);
      
//       if(requrimentdata.length==data.length){
//         console.log("Data Length Match");
        
//           return requrimentdata
//       }else{
//         console.warn("Data Length Miss Match");

//       return getRequirement(data,ctrl)
//       }
//     }
//      this.listData=getRequirement(data,this)
//     console.log(this.listData);
    
//      if (this.gridApi) {
//        this.gridApi.updateGridOptions({ rowData: this.listData });
//        this.gridApi.refreshClientSideRowModel();
//      }
//   }
//  });
// }
//   hirecalData(data:any){
//     debugger
//     if (data != null) {
//       let parentTreeData: any[] = [];
//       let childIndex: { [key: string]: number } = {};
//       let parentIndex: number = 1;
//       let parentNotFound: any[] = [];
    
//       const processRow = (row: any) => {
//         if (row && row.module_id) {
//           let datafound = this.ValueToCompareRequriementModules == undefined || isEmpty(this.ValueToCompareRequriementModules) ? this.moduleCellEditorParams(true) : this.ValueToCompareRequriementModules;
//           let findValue: any = datafound.find((val: any) => val.value == row.module_id);
//           row.module_id = findValue?.label;
//         }
    
//         if (row.parentmodulename == "" || !row.parentmodulename) {
//           row.treePath = [row.requirement_name];
//           row.index = parentIndex.toString();
//           row.CheckIndex = row.index + ' ' + row.requirement_name;
//           row.parentIndex = null;
//           parentTreeData.push(row);
//         } else {
//           const parent = parentTreeData.find((d) => d._id === row.parentmodulename);
//           if (parent) {
//             childIndex[row.parentmodulename] = (childIndex[row.parentmodulename] || 0) + 1;
//             row.treePath = [...parent.treePath, row.requirement_name];
//             row.parentIndex = parent.index;
//             row.index = `${row.parentIndex}.${childIndex[row.parentmodulename]}`;
//             row.CheckIndex = row.index + ' ' + row.requirement_name;
//             parentTreeData.push(row);
//           } else {
//             parentNotFound.push(row);
//           }
//         }
    
//         if (!row.parentmodulename) {
//           parentIndex++;
//         }
//       };
    
//       if (!isEmpty(data)) {
//         data.forEach(processRow);
//       }

//       if (!isEmpty(parentNotFound)) {
//         parentNotFound.forEach(processRow);
//       }
    
//       return parentTreeData
//     }
//     return []
    
//   }

 // ! 2
//  fetchRequirementData() {
//   this.dataService.lookupTreeData("requriment", this.response.project_id).subscribe((res: any) => {
//     const data = res.data.response;
//     if (data != null) {
//       this.listData = this.getRequirement(data);
//       console.log(this.listData);

//       if (this.gridApi) {
//         this.gridApi.updateGridOptions({ rowData: this.listData });
//         this.gridApi.refreshClientSideRowModel();
//       }
//     }
//   });
// }

// getRequirement(data: any): any[] {
//   console.log("Inside", "GetRequirement");
//   let requirementData: any[] = this.hirecalData(data);
  
//   while (requirementData.length !== data.length) {
//     console.warn("Data Length Mismatch. Retrying...");
//     requirementData = this.hirecalData(data);
//   }

//   console.log("Data Length Match");
//   return requirementData;
// }

// hirecalData(data: any): any[] {
//   if (!data) {
//     return [];
//   }

//   const datafound = this.ValueToCompareRequriementModules === undefined || isEmpty(this.ValueToCompareRequriementModules) ? this.moduleCellEditorParams(true) : this.ValueToCompareRequriementModules;

//   let parentTreeData: any[] = [];
//   let childIndex: { [key: string]: number } = {};
//   let parentIndex: number = 1;

//   const processRow = (row: any) => {
//     if (row && row.module_id) {
//       const findValue: any = datafound.find((val: any) => val.value == row.module_id);
//       row.module_id = findValue?.label;
//     }

//     if (!row.parentmodulename) {
//       row.treePath = [row.requirement_name];
//       row.index = parentIndex.toString();
//       row.CheckIndex = `${row.index} ${row.requirement_name}`;
//       row.parentIndex = null;
//       parentTreeData.push(row);
//       parentIndex++;
//     } else {
//       const parent = parentTreeData.find((d) => d._id === row.parentmodulename);
//       if (parent) {
//         childIndex[row.parentmodulename] = (childIndex[row.parentmodulename] || 0) + 1;
//         row.treePath = [...parent.treePath, row.requirement_name];
//         row.parentIndex = parent.index;
//         row.index = `${row.parentIndex}.${childIndex[row.parentmodulename]}`;
//         row.CheckIndex = `${row.index} ${row.requirement_name}`;
//         parentTreeData.push(row);
//       }
//     }
//   };

//   data.forEach(processRow);

//   return parentTreeData;
// }

 
 fetchProjectTeamData() {
  let Projectfiler:any={
    start:0,end:1000,filter:[{
      
        clause: "AND",
        conditions: [
          {column: "project_id",operator: "EQUALS",type: "string",value:this.response.project_id },
        ],
      
    }]
  }
  let allvalues:any[]=[]
  // this.dataService.getDataByFilter("team_specificationList",Projectfiler )
  this.dataService.lookupTreeData("team_specificationList",this.response.project_id ).subscribe((res: any) => {
    this.listData = [] 
    // for (let idx = 0; idx < res.data.response.length; idx++) {
    //   const row = res.data.response[idx];
    if(res != null ){

      for (let idx = 0; idx < res.length; idx++) {
        const row = res[idx];
        if (row.parentmodulename == "" || !row.parentmodulename) {
          row.treePath = [row._id];
        } else {
          var parentNode = allvalues.find((d:any) => d._id == row.parentmodulename);
          if (
            parentNode &&
            parentNode.treePath &&
            !parentNode.treePath.includes(row._id)
          ) {
            row.treePath = [...parentNode.treePath];
            row.treePath.push(row.user_id);
          }
        } 
        // allvalues.push(res);
        
        allvalues.push(row);
    }
// this.updateGrid()
this.listData=allvalues
// if (this.gridApi) {
//   // this.gridApi.applyTransaction({add:[this.listData]})
// console.log("Grid Load Alderady",this.listData);
// // this.gridApi.setGridOption('rowData',this.listData)
// // this.gridApi.redrawRows()  
// this.gridApi.updateGridOptions({rowData:this.listData})
//   // this.gridApi.setGridOption("rowData",this.listData)

//   this.gridApi.refreshClientSideRowModel()
//   this.gridDataPatch()
// }
// this.reloadGrid()

// this.cfg.detectChanges()
    }
  });
  // console.log(allvalues);
}

 fetchTestResultData() {
  this.dataService.lookupTreeData("regression",this.id).subscribe((res:any)=>{
    if(res.data.response != null ){
      let test_Case_Details:any[]=[]
      res.data.response.forEach((xyz:any)=>{
        if(!isEmpty(xyz.test_result)){
    
          test_Case_Details.push(...xyz.test_result)
        }
      }) 
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
        combinedData.unique=uuidv4()
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
      combinedData.unique=uuidv4()
        overalldata.push(combinedData);
    }
      });
  // this.cfg.detectChanges()
  
    this.listData = overalldata;
    // this.updateGrid()
//     if (this.gridApi) {
//       // this.gridApi.applyTransaction({add:[this.listData]})
// console.log("Grid Load Alderady",this.listData);
// // this.gridApi.setGridOption('rowData',this.listData)
// // this.gridApi.redrawRows()      
// this.gridApi.updateGridOptions({rowData:this.listData})
//   // this.gridApi.setGridOption("rowData",this.listData)

//   this.gridDataPatch()
//       // this.cfg.detectChanges()
//     }
// this.reloadGrid()

    }
  })
} 
public isVisible = true;
reloadGrid() {
  this.isVisible = false;
  if(this.gridApi){
    this.gridApi.destroy();
  }
  setTimeout(() => (this.isVisible = true), 0.1);
}
// gridDataPatch(){
//     this.gridApi.setColumnDefs(this.columnDefs)   
//     this.gridApi.setGridOption('columnDefs',this.columnDefs)
//     this.gridApi.setGridOption('rowData',this.listData)
//     this.gridApi.updateGridOptions({rowData:this.listData})
//     this.gridApi.setRowData(this.listData)
//     this.gridApi.refreshClientSideRowModel()
//         }


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
          
      let findValue: any = datafound.find((val: any) => val.value == task.assigned_to);
  
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

 
let parentTreeData: any[] = [];

for (let idx = 0; idx < plainRequirements.length; idx++) {
  const row = plainRequirements[idx];

  if (row.parentmodulename == "" || !row.parentmodulename) {
    // If the element doesn't have a task_id, treat it as a root node
    row.treePath = [row.requirement_name];
    row.taskeditable = false;
    parentTreeData.push(row);
  } else {
    const parent = parentTreeData.find((d) => d._id === row.parentmodulename);

    if (parent) {
      row.treePath = [...parent.treePath, row.requirement_name];
      row.taskeditable = false;
      parentTreeData.push(row);
    }
  }
}


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
// if (this.gridApi) {
//   // this.gridApi.applyTransaction({add:[this.listData]})
// console.log("Grid Load Alderady",this.listData);
// // this.gridApi.setGridOption('rowData',this.listData)
// // this.gridApi.redrawRows()  
// this.gridApi.updateGridOptions({rowData:this.listData})
//   this.gridApi.refreshClientSideRowModel()
//   this.gridDataPatch()
// }   
// this.reloadGrid()

// this.cfg.detectChanges()
// this.updateGrid()


}

  onCellClicked(event: any){
let clickCell:any=event.column.getColId()
document.documentElement.style.setProperty('--width', '80%');


if(this.formName=="Requirement"){
  this.drawer.close() 
  if(clickCell== 'number_of_TestCase_count'||clickCell=="number_of_Task_count"){
    if ( event && event.data[clickCell] > 0) {
       this.cellClicked = clickCell;
      this.drawer.open();
    }
    

    }
  }else if(this.formName=="test_result"){
    this.drawer.close()
    
    if(clickCell== 'test_cases_length'||clickCell=="bug_count"){
      
      if ( event && event?.data[clickCell] > 0) {
     
        this.cellClicked = clickCell;
        this.drawer.open();
      }
      
    }
  }
    else if(this.formName=="bug_list"||this.formName=="regression"){
      // console.log(event.data);
      // this.cellClicked=clickCell

      // document.documentElement.style.setProperty('--width', '8%');

      // this.drawer.open()
      // if (event.data[clickCell] > 0) {
        console.log(event.data.status);
        if((event.data.hasOwnProperty('reftask_id')||event.data.hasOwnProperty('not_bug_justification'))||(event.status=="Not Accepeted"||event.status=="Accepeted")){
          this.bugNotUpdate=false
        }
        this.bugNotUpdate
        this.cellClicked = clickCell;
        this.drawer.open();
      // }
      
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
    this.selectedRows= this.gridApi.getSelectedRows()[0];

    console.log("onSelectionChanged",this.selectedRows)
    // this.gridApi.deselectAll()
  }


  onCellValueChanged(params: any) {
     let fieldName = params.colDef.field;
    // this.valueChanged = params.value;
    let data: any = {};
    data[fieldName] = params.value;
// ! UNDO
    if(fieldName=="module_id"){
      let findValue:any=this.ValueToCompareRequriementModules.find(val=>val.label==params.value)
      
      data[fieldName] = findValue.value;

    }
if(this.formName=="Requirement"){

  this.dataService.update("requirement",params.data._id,data ).subscribe((res: any) => {
    // this.rowData = res.data;
    console.log(res);
    
  });
return

}

 if(this.formName=="team_member"){
let update:any={}
let value:any=[]
let findValue:any={}
update[fieldName] = params.value;
if(fieldName=="assigned_to"){
  findValue=this.ValueToCompareEmployee.find(val=>val.label==params.value)
 data[fieldName] = findValue.label;
  update[fieldName] = findValue.value;
}
  if (fieldName == "allocated_hours") { 
  let hrsFlag= params.value>=8? true : false
  
  let hrsconvertedDay=hrsFlag==true? Math.ceil(params.value/8) : 1 

  if(params.data.hasOwnProperty("scheduled_start_date")){

    update["scheduled_start_date"] = moment(params.data["scheduled_start_date"]);
  }else{
    update["scheduled_start_date"] = moment();

  }
  if(params.data.hasOwnProperty("scheduled_end_date")){
    update["scheduled_end_date"] = moment(params.data["scheduled_start_date"]).add(hrsconvertedDay, "day");
  }else{
    update["scheduled_end_date"] = moment().add(hrsconvertedDay, "day");

  }
  }
if(fieldName=="depend_task"){
  // ? Depend Task Written in anther F it emit Only bitest date 
  // ? the biggest date is start date
  update["scheduled_start_date"] =  this.depend_task(params.value,params)
  update["scheduled_end_date"] = moment(update["scheduled_start_date"])
   if (params.data.hasOwnProperty("allocated_hours")) {
    // console.log(data);
    // !todo
    let hrsFlag= params.data.allocated_hours>=8? true : false
    
    let hrsconvertedDay=hrsFlag==true? Math.ceil(params.data.allocated_hours/8) : 1
    console.log(hrsconvertedDay);
    update["scheduled_end_date"] = moment(update["scheduled_end_date"]).add(hrsconvertedDay, "day");
    }
    params.data["scheduled_start_date"] =  update["scheduled_start_date"]
    params.data["scheduled_end_date"] = update["scheduled_end_date"]
}
if(params.data.hasOwnProperty("scheduled_start_date")){

  update["scheduled_start_date"] = moment(params.data["scheduled_start_date"]).add(2,'hours').add(59,'minutes').add(999,'milliseconds');
} 
if(params.data.hasOwnProperty("scheduled_end_date")){
  update["scheduled_end_date"] = moment(params.data["scheduled_end_date"]).add(2,'hours').add(59,'minutes').add(999,'milliseconds');
}  

update.status="Open"
this.dataService.update("task",params.data._id,update).subscribe((res:any)=>{
  // console.log();
  
  value={...params.data,...update}

  // value["treePath"]=[...params.data.treePath,res.data["insert ID"]]
value["taskeditable"]=true
if(fieldName=="assigned_to"){

  value[fieldName] = findValue.label;
} 
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
  let bigdate:any 
  // let pastDate:any
  if(valuesMatchTaskId.length==1){
    return valuesMatchTaskId[0].scheduled_end_date
  }
  valuesMatchTaskId.forEach((xyz:any,index:any)=>{
  //  let  nextdate=valuesMatchTaskId[index+1].scheduled_end_date
   if(index==0){
    bigdate=valuesMatchTaskId[0].scheduled_end_date
   }
    bigdate = getHigherDate(bigdate,xyz.scheduled_end_date);
    console.log(bigdate);
    
  })
    return bigdate
  }
  

  gridaldreadyloaded:boolean=false


  /**gridReady for ag grid */
  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
    if(this.formName=="bug_list"){this.gridApi.setSideBarVisible(true)}
    console.warn("Grid Loaded");
    this.gridaldreadyloaded=true
  }

  onAddButonClick(ctrl: any) { 
    let addformName= this.formName.toLowerCase()
    if(addformName=="release"){
      addformName='realse'
    }
    this.dataService.loadConfig(addformName).subscribe(async (config: any) => {
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
  bugNotUpdate:boolean=true
  savebugTask(){
    if (!this.form.valid) {
      const invalidLabels:any = this.helperServices.getDataValidatoion(this.form.controls);
        this.dialogService.openSnackBar("Error in " + invalidLabels, "OK");
       this.form.markAllAsTouched();
        return ;  
      }
      if(this.is_bug==true){
        let values:any=this.form.value
        values.status= "Open"
        values.Bug_ID=this.selectedRows._id
        values.project_id=this.selectedRows.task.project_id
        values._id=`SEQ|${this.selectedRows.task.project_id}`
        this.dataService.save(this.config.form.collectionName,values).subscribe((data:any)=>{
          // console.log(data.data["insert ID"]);
          let id =this.selectedRows._id
          let reftask_id:any={reftask_id:data.data["insert ID"] , status:"Accepeted"}
        
          this.dataService.update('bug',id,reftask_id).subscribe((res:any)=>{
            console.log(res);
            this.form.reset()
            this.bugNotUpdate=false
          })  
        })
      } else if(this.is_bug==false){
        let id =this.selectedRows._id
        let values:any=this.form.value
      values.status="Not Accepeted"
        this.dataService.update('bug',id,values).subscribe((data:any)=>{
          console.log(data);
          this.bugNotUpdate=false
          this.form.reset()
        })
      } 
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

if(values._id==undefined|| values._id ==null){
  values._id=`SEQ|${values.project_id}`

}
values.status='A'

  values.parentmodulename= ""
  if(this.formName=="release"||this.formName=="sprint"){
    delete values.parentmodulename
  }
  if(this.formName=="sprint"){
    // values.release_id=prefix          
    values._id=values.release_id+"-"+values._id
  }
  values.status='A'
  this.dataService.save(this.config.form.collectionName,values).subscribe((data:any)=>{
    console.log(data);
    this.form.reset()
    this.dialogService.closeModal();
  })
  this.ngOnInit()
  } 

  is_bug:any

  resetBtn(data?: any) {
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

  reassigndata(employeeID?:any,index?:any){
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
         this.dialogService.openSnackBar("Task updated successfully","OK")
        this.reassignemployee[index]=null
      })
  }
   
  goBack(){ 
    this._location.back();
  }

  ngOnDestroy(): void { 
    console.warn("Component Destory");
    
  }
}


 




// getContextMenuItems(
//   params: GetContextMenuItemsParams
// ): (string | MenuItemDef)[] {
//
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
//
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
//
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