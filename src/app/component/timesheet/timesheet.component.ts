import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ColDef, GetContextMenuItemsParams, GridApi, GridReadyEvent, IGroupCellRendererParams, MenuItemDef, RowDataTransaction } from 'ag-grid-community';
import "ag-grid-enterprise";
import { concat, isEmpty } from 'lodash';
import * as moment from 'moment';
import { DataService } from 'src/app/services/data.service';
import { DialogService } from 'src/app/services/dialog.service';
import { HelperService } from 'src/app/services/helper.service';
import { TimeSheetActionButtonComponent } from './button';
@Component({
  selector: 'app-timesheet',
  templateUrl: './timesheet.component.html',
  styleUrls: ['./timesheet.component.css']
})
export class TimesheetComponent implements OnInit {
  gridApi!: GridApi<any>;
  form!: FormGroup
  dateform !: FormGroup 
  public context: any = {
    parentComponent:this
  };
  groupDefaultExpanded = -1;
  rowData: any[] = [];
  gridApiUnschedule!: GridApi<any>; 
  selectedRow: any
  listData: any[] = []
  
  public defaultColDef: ColDef = {


    resizable: true,
  };  
  fields: any;
  pageHeading: any;
  @ViewChild("editViewPopup", { static: true }) editViewPopup!: TemplateRef<any>;
  @Input('model') model: any = {}
  selectInfo: any;
  getTimesheetdata: any;
  formatedDate: any;
  formattedDate: any;
  userPermissions: any
  maxDate!: Date;
  calendarDate: any;
  butText = 'Save'
  onClose: any;
  formAction: any;
  selectedModel: any = {}
  editedRow: any;
  editedCols: any;
  selectedRows: any;
  onGridReady(params: GridReadyEvent) {
    console.log(params);
    
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }
  getContextMenuItems(
    params: GetContextMenuItemsParams
    ): (string | MenuItemDef)[] {
    var result: (string | MenuItemDef)[] = [
      {
        name: 'Approval Stauts',
        subMenu: [
        // {
        // name: 'Excel',
        // subMenu: [
        {
        name: 'Selected Data Only',
        subMenu:[
       
            {
            name: 'Approved',
            action: () => {
            if(params.context.parentComponent.gridApi.getSelectedRows().length!==0){
            params.context.parentComponent.approval("Approved")
            }else{
            window.alert('No data Selected');
            }
            }
            },{
            name: 'Rejected',
            action: () => {
              console.log(params);
              
              if(params.context.parentComponent.gridApi.getSelectedRows().length!==0){
                params.context.parentComponent.approval("Rejected")
                }else{
                window.alert('No data Selected');
                }
               }
            }
             
        ],
        },{
        name: 'All Data',
        subMenu:[
       
          {
          name: 'Approved',
          action: () => {
          // if(params.context.componentParent.gridApi.getSelectedRows().length!==0){
          params.context.parentComponent.approvalAll("Approved")
          // }else{
          // window.alert('No data Selected');
          // }
          }
          },{
          name: 'Rejected',
          action: () => {
          params.context.parentComponent.approvalAll("Rejected")
          }
          }
           
      ]
        }
        ]
        },
        // {
        //   // custom item
        //   name: 'Group ',
        //   action: () => {
        //     // params.api.row
        //     window.alert('Alerting about ' + params.value);
        //   },
        //   cssClasses: ['red', 'bold'],
        // },
        'separator',

    'autoSizeAll',
    'resetColumns',
    'expandAll',
  
    ];
    
    return result;
    
    }

   public getRowClass:any =(params: any) => {
     if (  (params.data!== undefined || !isEmpty(params.data) ) && params?.data?.Not_Completed_task == true) {
      console.log("INSIDEs Not_Completed_task");
      return 'not_completed';
     }
     if (  (params.data!== undefined || !isEmpty(params.data) ) && params?.data?.approval_Status == "Rejected") {
      return 'rejected';
     }
     if (  (params.data!== undefined || !isEmpty(params.data) ) && params?.data?.approval_Status == "Approved") {
      return 'approved';
     }

     return ' '
   };
   getContextMenuSchedule(
    params: GetContextMenuItemsParams
    ): (string | MenuItemDef)[] {
    var result: (string | MenuItemDef)[] = [
 
       
          {
            name: 'Delete',
            action: () => {
          if(params.context.componentParent.gridApi.getSelectedRows().length!==0){
          params.context.parentComponent.approvalAll("Approved")
          }else{
          window.alert('No data Selected');
          }
          }
          }, 
         
        'separator',

    'autoSizeAll',
    'resetColumns',
    'expandAll',
  
    ];
    
    return result;
    
    }
   
    Delete(){
     const data=  this.gridApiUnschedule.getSelectedRows()[0]
      if(data.Approval_Status != "Approved"){
        if (confirm("Do you wish to delete this record?")) {
          this.dataService.deleteDataById(
           "unschedule",
            data._id
          ).subscribe((res: any) => {
            this.dialogService.openSnackBar("Data Has been deleted Succfully","OK")
            const result = this.gridApiUnschedule.applyTransaction( {
              remove: [data],
            });
            console.log(result);
          return

          });
        }
      //   this.dataService.deleteDataById("unschedule",data._id).subscribe((res:any)=>{
      //     console.log(res);
      //     this.dialogService.openSnackBar("Data Has been deleted Succfully","OK")
      // })
      }
      this.dialogService.openSnackBar("The Approved Data Can Not able deleted Succfully","OK")
      
    }

  public columnDefs: ColDef[] = []

  public colDefs: ColDef[] = [
  {
    headerName: "#",
    width: 80,
    maxWidth: 80,
    menuTabs:[],
    checkboxSelection:true,
    valueFormatter: function (params:any) {
      // if(params.value){
        return params.node.rowIndex + 1
      // }
      // return ''        
    },
  },
    {
      headerName: "Activities",
      field: "activities",
      editable: function (params) {
        return params?.data["Approval_Status"] !== "Approved" ;
      },      flex: 1,
      cellEditor: "agRichSelectCellEditor",
      cellEditorParams: {
        values: ['Floor Meet', 'Permissions', 'Meeting', 'Client Call', 'Events', "Reading"],
      }
    },
    {
      headerName: "Hours",
      field: "hours",
      editable: function (params) {
        return params?.data["Approval_Status"] !== "Approved" ;
      },      flex: 1,
      cellDataType: 'number',
      cellEditor: 'agNumberCellEditor',
      cellEditorParams: {
        min: 1,
        max: 8,
        precision: 1,
      }
    },
    {
      headerName: "Remarks",
      field: "remarks",
      editable: function (params) {
        return params?.data["Approval_Status"] !== "Approved" ;
       },      flex: 1,
      cellEditor: 'agLargeTextCellEditor',
      cellEditorPopup: true,
      cellEditorParams: {
        rows: 10,
        cols: 50
      }
    },  {
      headerName: "Approval Status",
      field: "Approval_Status",
     editable:false,
    },
    //  {
  
    //   field: 'Action',
    //   maxWidth:85,sortable:false,filter: false,
    //  menuTabs: [],
    //  lockPosition: 'right',
    //  lockPinned: true,
    //   pinned:'right',
    //   cellRenderer: 'buttonRenderer'
  
    // }
  ]
  
  components:any
  constructor(private dataService: DataService, private helperServices: HelperService, private activatedRoute: ActivatedRoute, private route: Router, private dialogService: DialogService, private fb: FormBuilder) {
    this.route.routeReuseStrategy.shouldReuseRoute = () => false;
    
      this.components = {
        buttonRenderer: TimeSheetActionButtonComponent
      }
       
  }


  employee_id: any
  FormName:any

  ngOnInit() {
     this.activatedRoute.params.subscribe((params:any)=>{
      console.log(params['component']);
      this.maxDate = new Date();

      if(params['component']=='timesheet'){
      this.dateform=  this.fb.group({
          datepicker: [moment()]
        });

        let TodayDate = moment()
        this.employee_id = this.helperServices.getEmp_id();
        this.calendarDate = TodayDate.format('YYYY-MM-DDT00:00:00.000+00:00');
        this.getData(this.calendarDate);
          this.getDataUnschedule()
        this.dateform.get("datepicker")?.valueChanges.subscribe((changeDate: any) => {
          // console.log(changeDate._d);
          let date = moment(changeDate).format('YYYY-MM-DDT00:00:00.000+00:00');
          this.getData(date)
          this.getDataUnschedule()
        })
      }else if(params['component']=='approval'){
        let start:any=moment().startOf('month')
        let end:any=moment().endOf('month')
        this.dateform=  this.fb.group({
          start: [moment(start)],
          end: [moment(end)]
          });
          start=start.format('YYYY-MM-DDT00:00:00.000+00:00')
          end=end.format('YYYY-MM-DDT00:00:00.000+00:00')

          this.getapprovalData(start,end)

          this.dateform.get("start")?.valueChanges.subscribe((startDate: any) => {
            let start_date = moment(startDate).format('YYYY-MM-DDT00:00:00.000+00:00');
          let end_date=this.dateform.value.end.format('YYYY-MM-DDT00:00:00.000+00:00') || moment().format('YYYY-MM-DDT00:00:00.000+00:00')
            this.getapprovalData(start_date,end_date)
          })
          this.dateform.get("end")?.valueChanges.subscribe((endDate: any) => {
            let end_date = moment(endDate).format('YYYY-MM-DDT00:00:00.000+00:00');
            let start_date=this.dateform.value.start.format('YYYY-MM-DDT00:00:00.000+00:00') || moment().format('YYYY-MM-DDT00:00:00.000+00:00').toString()

            this.getapprovalData(start_date,end_date)
          })
        }

      this.FormName=params['component']
      this.redefineColdef(params['component'])
    })
    
  
  }
 
 
  public groupRowRendererParams:IGroupCellRendererParams = {
     checkbox: true,
    suppressCount: true,
     
 };
  redefineColdef(paramsType: any) {
    if(paramsType=="timesheet"){
      this.columnDefs.push( {
        headerName: "Project Name",
        field: "project_name",
        editable: false,
        rowGroup: true, hide: true,
      },
      {
        headerName: "Task Id",
        field: "_id",
        editable: false,
        sortable: false,
        width: 250,
        maxWidth: 320,
      },
      {
        headerName: "Task Name",
        field: "task_name",
        editable: false,
        sortable: false
      },
  
      {
        headerName: "Start Date",
        field: "scheduled_start_date",
        width: 120,
        maxWidth: 120,
        cellDataType:'text',
        valueFormatter: function (params) {
          if(params.value){
  
            return moment(params.value).format('DD/MM/YYYY')
          }
          return ''        },
  
      },
      {
        headerName: "End Date",
        field: "scheduled_end_date",
        editable: false,
        sortable: false,
        width: 120,cellDataType:'text',
        maxWidth: 120,
        valueFormatter: function (params) {
          if(params.value){
  
            return moment(params.value).format('DD/MM/YYYY')
          }
          return ''        },
  
      },
      {
        headerName: "Entry Date",
        field: "entry_date",
        width: 120,cellDataType:'text',
        maxWidth:120,
        valueFormatter: function (params) { 
          if(params.value){
  
            return moment(params.value).format('DD/MM/YYYY')
          }
          return ''
        },
  
      }, 
      {
        headerName: "Completed Date",
        field: "task_Completed_On",
        width: 120,cellDataType:'text',
        maxWidth:120,
        valueFormatter: function (params) { 
          if(params.value){
  
            return moment(params.value).format('DD/MM/YYYY')
          }
          return ''
        },
  
      },
      {
        headerName: "Allocated Hours",
        field: "allocated_hours",
        editable: false,
        sortable: false
      }, {
        headerName: "Remaning Hours",
        field: "remaing_hrs",
        editable: false,
        sortable: false
      },
      // {
      //   headerName: "Total Hours - Today Hours ",
      //   field: "today_totalworkedhours",
      //   editable: false,
      //   sortable:false
      // },{
      //   headerName: "Total Worked Hours",
      //   field: "totalworkedhours",
      //   editable: false,
      //   sortable:false
      // },
      {
        headerName: "Today Worked Hours",
        field: "workedhours",
        editable: function (params) {
          return params?.data["approval_Status"] !== "Approved" ;
          // || params?.data["status"] !== "Approved"
        },
        cellDataType: 'number',
        cellEditor: 'agNumberCellEditor',
        // cellEditorParams: {
        //   min: 1,
        //   max: function (params: any) {
        //     console.warn(params, "params");
        //     return params.data["allocated_hours"]
        //   },
        //   precision: 1,
        // } 
        cellEditorParams:(params:any)=> {
         let data :any={}
         data.min= 1
         data.max=params.data.remaing_hrs
        //  data.max=params.data.remaing_hrs!=0? params.data.remaing_hrs : 1 
         data.precision= 1
         return data
        } 
      },
  
  
      {
        headerName: "Status",
        field: "status",
        cellEditor: "agRichSelectCellEditor",
        cellEditorParams: {
          values: ['In Progress', 'Completed', 'Hold', 'Closed'],
        },
        enableRowGroup: true,
        editable: function (params) {
          return params.data["approval_Status"] !== "Approved" ;
          // || params?.data["status"] !== "Approved"
        }
        // ,valueFormatter: (params: any) => {
        //   console.log(params,"data vvalueformater ");
  
        //   return params.data['status'].replace(/_/g, ' ')
        // }
      },
      // {
      //   headerName: "Remarks",
      //   field: "remarks",
      //   width: 200,
      //   editable: true,
  
      // },
      {
  
        field: "approval_Status",
        // cellEditor: "agRichSelectCellEditor",
        // cellEditorParams: {
        //   values: ['Approved', 'Rejected', 'Hold'],
        // },
  
    editable:false,
        // ,
        // cellStyle: (params) => {
        //   if (params?.data["approval_Status"] === "Approved") {
        //     return { color: 'green' };
        //   } else if (params?.data["approval_Status"] === "Rejected") {
        //     return { color: 'red' };
        //   }
        //   return null; // Default styling for other cases
        // },
        // suppressColumnsToolPanel: true
      },
      {
        headerName: "Remarks",
        field: "remarks",
        editable: false,
        suppressColumnsToolPanel: true
      })
      
    }else if(paramsType =="approval"){
      this.columnDefs.push( {
        headerName: "Project Name",
        field: "project_name",
        resizable:true,
        editable: false,enableRowGroup: true,
        rowGroup: true, 
        // hide: true,
      },{
        headerName: "Employee Name",
        field: "User_name",
        editable: false,
        resizable:true,
        enableRowGroup: true,
        checkboxSelection: true,

      },
      {
        headerName: "Task Id",
        field: "task._id",
        editable: false,
        sortable: false,
        resizable:true,
        width: 250,
        maxWidth: 320,
      },
      {
        headerName: "Task Name",
        field: "task.task_name",
        editable: false,
        resizable:true,    
            filter: 'agTextColumnFilter',

        sortable: false
      },
      {
        headerName: "Task Type",
        field: "task.task_type",
        editable: false,       
         filter: 'agTextColumnFilter',

        resizable:true,
        sortable: false
      },
      {
        headerName: "Start Date",
        field: "task.scheduled_start_date",
        width: 120,
        filter: 'agDateColumnFilter',
        resizable:true,
        maxWidth: 120,
        valueFormatter: function (params) {
          if(params.value){

            return moment(params.value).format('DD/MM/ YYYY')
          }
          return ''
        },
      },
      {
        headerName: "End Date",
        field: "task.scheduled_end_date",
        editable: false,
        sortable: false,
        width: 120,
        filter: 'agDateColumnFilter',
        maxWidth: 120,
        resizable:true,
        valueFormatter: function (params) {
          if(params.value){

            return moment(params.value).format('DD/MM/ YYYY')
          }
          return ''
        },
      }, {
        headerName: "Completed Date",
        field: "Completed_On",
        editable: false,
        filter: 'agDateColumnFilter',
        sortable: false,
        width: 160,
        minWidth:160,
        maxWidth: 160,
        resizable:true,
        valueFormatter: function (params) {
          if(params.value){

            return moment(params.value).format('DD/MM/ YYYY')
          }
          return ''
        },
  
      }, 
      {
        headerName: "Allocated Hours",
        field: "task.allocated_hours",
        editable: false,   
             filter: 'agNumberColumnFilter',

        resizable:true,
        sortable: false
      },  
      {
        headerName: "Total Worked Hours",
        field: "totalworkedhours",
        filter: 'agNumberColumnFilter',
        editable: false,
        resizable:true,
        sortable:false
      }, 
      {
        headerName: "Task Status",
        field: "task.status",
        resizable:true,        
        filter: 'agSetColumnFilter',
         editable:false 
      },   {
        headerName: "TimeSheet Remarks",
        field: "timesheet_remark",
        resizable:true,        
        wrapText:true
      }, 
      {
        headerName: "Approval Status",
  
        field: "Approval_Status",      
          filter: 'agSetColumnFilter',
          "maxWidth":190,
          "lockPosition": "right",
          "lockPinned": true,
           "pinned":"right",
        cellEditor: "agRichSelectCellEditor",
        resizable:true,
        cellEditorParams: {
          values: ['Approved', 'Rejected', 'Hold'],
        },
        editable:function (params:any){
          return params.data.Approval_Status != "Approved" 
        }
      },
      {
        headerName: "Remarks",
        field: "remarks",
        editable: true,
        
        resizable:true,
          cellEditor: 'agLargeTextCellEditor',
          cellEditorPopup: true,
          cellEditorParams: {
              maxLength: 100
          }
            
        }
        )
    }
    // If the user is 'superadmin' or 'team lead', make the specific columns editable
    // this.columnDefs.push({
    //   headerName: "Task Status",
    //   field: "task_status",
    //   editable: false, 
    //   rowGroup: true,
    //   showRowGroup: true,
    //   lockVisible: true,
    //   hide:true,
    // })
    // if (this.userPermissions === 'SA' || this.userPermissions === 'team lead') {
    //   this.columnDefs.push(
    //     //   {
    //     //   headerName: "Task Status",
    //     //   field: "task_status",
    //     //   editable: false, 
    //     //   rowGroup: true,
    //     //   showRowGroup: true,
    //     //   lockVisible: true,
    //     //   hide:true,
    //     // }
    //     {
    //       headerName: "Employee Name",
    //       field: "assigned_to",
    //       type: "hide",
    //       editable: false,
    //       headerCheckboxSelection: true,
    //       checkboxSelection: true, enableRowGroup: true,
    //     },
    //   )
    //   this.columnDefs.forEach((column: any) => {
    //     if (column.field === 'approval_Status') {
    //       column.editable = true;

    //     }
    //     else if (column.field === 'workedhours' || column.field === 'status') {
    //       column.editable = false;
    //     } else
    //       if (column.field === 'assigned_to' || column.field === 'approval_Status' || column.field === 'remarks') {
    //         column.hide = this.userPermissions !== 'SA';
    //       }

    //   })
    // }
  }





  OnValuesChanged(params: any) { 
    if (params.value == '' || params.value == null) {
      let field: any = params.colDef.field.toUpperCase()
      this.dialogService.openSnackBar(`${field} Field Should be not be empty`, "OK")
      let data: any = { ...params.data }
      data[params.colDef.field] = params.oldValue
      const result: any = this.gridApi.applyTransaction({
        update: [data]
      })
      console.warn(result);

      return
    }
    let fieldName = params.colDef.field;
    let data:any={}
    data[fieldName] = params.value
    data["approved_by"] = this.helperServices.getEmp_id()

    // if( params.data && params.data.task_type!=="unschedule"){

    // }
    // let id =params.data.task._id
    let id = params.data.primaryKey
    let updateCollectionName=params.data.task_type
    this.dataService.update(updateCollectionName,id,data).subscribe((res:any)=>{
      console.log(res);
      
    })
  }


  onSelectionChanged(event: any) {
    this.selectedRow = event.api.getSelectedRows()[0];
    console.log(this.gridApi.getSelectedRows());
  }
  //   approveButton(){
  //     debugger
  //    for(let i=0; this.selectedRow1.length>i;i++){

  //     this.selectedRow1[i]
  //     let data: any = {};
  //    data['task_id'] = this.selectedRow1[i].task_id
  //    data['assigned_to'] = this.selectedRow1[i].assigned_to

  //    data['ref_id'] = this.selectedRow1[i].id
  // data['approval_Status'] =  "Approved"



  // // if(this.date = this.dateform.value.datepicker?._d){
  // //   // this.date = this.form.value.datepicker?._d

  // // let formatedDate: any = moment(this.formatedDate).add(10, 'minutes').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
  // // Object.assign(data, { formatedDate: formatedDate}) 
  // // }
  // // else{

  // // let formatedDate: any = moment(this.calendarDate).add(10, 'minutes').format('YYYY-MM-DDTHH:mm:ss.SSSZ');

  // // Object.assign(data, { formatedDate: formatedDate }) 
  // // }


  //     // ! UNDO

  // this.dataService.savetimesheet(data).subscribe((res: any) => {
  //   this.rowData = res.data;
  // this.getData()

  // });

  //    } 
  //   //  this.selectedRow1
  //   }

  public getRowId: any = (params: any) => `${params.data._id}`;
  // public getRowIdApproval: any = (params: any) => `${params.data.task._id}`;
  public getRowIdApproval: any = (params: any) => `${params.data.primaryKey}`;


  /**get supplier by view in the data */
  onCellValueChanged(params: any) {
    if (params.value == '' || params.value == null) {
      let field: any = params.colDef.field.toUpperCase()
      this.dialogService.openSnackBar(`${field} Field Should be not be empty`, "OK")
      let data: any = { ...params.data }
      data[params.colDef.field] = params.oldValue
      const result: any = this.gridApi.applyTransaction({
        update: [data]
      })
      console.warn(result);

      return
    }
    
    if (params.data && (params.data.Completed_On !== undefined && params.data.Completed_On !== null)) {
    let Completed_On:any=moment(params?.data?.Completed_On).format('DD/MM/ YYYY')
    let currentDate:any=moment(this.calendarDate).format('DD/MM/ YYYY')
    if ( moment(params.data.Completed_On).isValid()  && ! (  moment(Completed_On).isSame(currentDate) || Completed_On == currentDate )) {
      let Completed_formet=moment(params.data.Completed_On).format('DD/MM/ YYYY')
      let field: any = params.colDef.field.toUpperCase()
      this.dialogService.openSnackBar(` Just Go to This Data ${Completed_formet} And Change The Status To  In Progress You Cannot Change This Field ${field}`, "OK")
      let data: any = { ...params.data }
      data[params.colDef.field] = params.oldValue
      const result: any = this.gridApi.applyTransaction({
        update: [data]
      })
      console.warn(result);
      return
    }
    }
    let fieldName = params.colDef.field;
    let data: any = {
      assigned_to: this.helperServices.getEmp_id(), //? Not need
      task_id: params.data._id,
      ref_id: params.data.id,
      entry_Date: moment(this.dateform.value.datepicker).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
      [fieldName]: params.value,
      status : (params.data.status === "Open" ||params.data.status === "Completed") ? "In Progress" : params.data.status
    };
     params.data.status=(params.data.status === "Open" ||params.data.status === "Completed") ? "In Progress" : params.data.status

    if (fieldName === "workedhours") {
      // ?Old Values to Sub  Bec  Worked Hours added
      if(params && params.data && params.data.workedhours){
        params.data.totalworkedhours =params?.data?.totalworkedhours -params.oldValue
      }
      let timeSheetWorkedHours = parseInt(params?.data?.totalworkedhours || 0) + params.value;
      let timeSheetAllocatedHours = params.data.allocated_hours;
      if (!(timeSheetAllocatedHours >= timeSheetWorkedHours)) {
        let maxTime: any = timeSheetAllocatedHours - timeSheetWorkedHours
        this.dialogService.openSnackBar(`The Time You Enter Is More than Allocated Hours${maxTime} `, "OK")
        let alldata: any = params.data
        alldata["workedhours"] = params.oldValue
        let data: RowDataTransaction = {
          update: [alldata]
        }
        this.gridApi.applyTransaction(data)
        return;
      }


    }
    
    if (params?.data?.timesheet_id) {
      this.dataService.update("timesheet", params.data.timesheet_id, data).subscribe((res: any) => {
        let alldata: any = params.data
        alldata[fieldName] = params.value
        if (fieldName === "workedhours") {
          let change_hrs: any = Number(params.oldValue) - Number(params.value);
          if (isNaN(change_hrs)) {
            console.error("Invalid input for change_hrs:", params.oldValue, params.value);
            change_hrs = 0;
          }
          alldata["remaing_hrs"] = (alldata?.allocated_hours || 0) - (alldata?.today_totalworkedhours + params.value)
        }
        alldata.status=    alldata.status == "Open" ? "In Progress" : alldata.status

        let data: RowDataTransaction = {
          update: [alldata]
        }
        this.gridApi.applyTransaction(data)
        this.updateTask(alldata, res)
        // this.getData(this.calendarDate)
      });
      return
    }

    this.dataService.save("timesheet", data).subscribe((res: any) => {
      params.data[fieldName] = params.value
      if(params.data && params.data.workedhours && fieldName=='workedhours'){
        // if(fieldName=='workedhours'){
          params.data.totalworkedhours=  (isNaN(params.data.totalworkedhours) ?  0 :parseInt( params.data.totalworkedhours))+ params.value
        // }

        params.data.timesheet_id = res.data["insert ID"];
        params.data.entry_date = this.calendarDate //? Not Need
        params.data.today_totalworkedhours = params.data.totalworkedhours - params.data.workedhours;
  
        params.data.remaing_hrs = (params.data?.allocated_hours || 0) - (params.data?.today_totalworkedhours + params.value);
      }
      params.data.remaing_hrs = isNaN(params.data.remaing_hrs) ? params.data.allocated_hours :parseInt( params.data.remaing_hrs);
      params.data.status=  params.data.status == "Open" ? "In Progress" : params.data.status

      let data: RowDataTransaction = {
        update: [params.data]
      }
      console.log(params.data);
      
      const dats = this.gridApi.applyTransaction(data)
      console.log(dats);
      
      this.updateTask(params.data, res);
      // this.getData(this.calendarDate)
    });



  }

  updateTask(rowData: any, res: any) {
    let taskData: any = {}
    taskData["status"] = rowData.status == "Open" ? "In Progress" : rowData.status
    this.dataService.update('task', rowData._id, taskData).subscribe((res: any) => {
      console.log(res);

    })
  }









  saveForm(data: any) {


    data.remarks = this.selectedModel.remarks
    // ! UNDO

    //    this.dataService.savetimesheet(data).subscribe((res: any) => {
    //   console.log(res);
    //   this.ngOnInit()
    //   this.dialogService.closeModal()
    //   this.selectedModel={}
    //     this.form.reset()
    //     this.model={}
    // })
  }







  resetBtn(data?: any) {
    debugger
    this.selectedModel = {}
    this.formAction = this.model.id ? 'Edit' : 'Add'
    this.butText = this.model.id ? 'Update' : 'Save';

  }
getapprovalData(start_Date:any, end_Date:any){
this.dataService.getTimesheetforApproval(this.employee_id,start_Date,end_Date).subscribe((response:any)=>{
// this.dataService.getTimesheetforApproval("E0001",start_Date,end_Date).subscribe((response:any)=>{

  console.log(response);
  // let rowData:any[]=[]
  this.rowData=[]
// this.rowData=
let unscheduleData:any=[]
response.data.forEach((element:any)=> {
  console.log(element.unschedule);
  element.primaryKey=element.task._id
  element.task_type="task"
  element.Approval_Status=element.task.Approval_Status

  if(!isEmpty(element.unschedule)){
    element.unschedule.forEach((unschedule:any)=>{
    //  let datafound:any= unscheduleData.some((res:any)=>{res._id==unschedule._id})
    let datafound: any = unscheduleData.some((res: any) => res._id === unschedule._id);
console.log(datafound);

      if(datafound==false){
        unschedule.User_name=element.User_name
        unschedule.project_name="UnSchedule"
        unschedule.task_type="unschedule"
        unschedule.primaryKey=unschedule._id
        unschedule.task={}
        unschedule.task.task_name=unschedule.activities 
        unschedule.totalworkedhours=unschedule.hours
        unschedule.Completed_On=unschedule.entry_Date
        unschedule.timesheet_remark=unschedule.remarks
        unschedule.Approval_Status= unschedule.Approval_Status || ''
        delete unschedule.remarks
        unscheduleData.push(unschedule)
      }
    })
  }
});
this.rowData=concat(unscheduleData,response.data)
//   let start_date: any = moment(start_Date).format('YYYY-MM-DDT00:00:00.000+00:00');
//   let end_date: any = moment(end_Date).format('YYYY-MM-DDT23:59:59.999+00:00');

//   var filterCondition1 ={
//     start:0,end:100,
// filter: [
// {
// clause: "AND",
// conditions: [
//  { column:"entry_by" ,operator: "EQUALS",value:this.helperServices.getEmp_id(),type: "string"},
//  { column:"entry_Date" ,operator: "GREATERTHANOREQUAL",value:start_date,type: "date"},
//  { column:"entry_Date" ,operator: "LESSTHANOREQUAL",value:end_date,type: "date"},


// ]
// }
// ]}
    // this.dataService.getDataByFilter('unschedule',filterCondition1).subscribe((res:any)=>{
    //   res.data[0].response.forEach((element:any)=> {
    //     element.project_name="UnSchedule"
    //     element.task.type="unschedule"
    //   });
      // rowData=;
// console.log(res.data[0].response);


      // })
})
}

approvalAll(Type:any){
  this.gridApi.forEachLeafNode((res:any)=>{
// let update_id=res.task._id
    let updateValue:any={}
    console.log(res.data);
    
    updateValue["Approval_Status"]= Type
    console.log(res.data.Approval_Status != "Approved",res.data.task_type);
    
if(res.data.Approval_Status != "Approved"){
  let update_id = res.data.primaryKey
  let updateCollectionName=res.data.task_type
  this.dataService.update(updateCollectionName,update_id,updateValue).subscribe((response:any)=>{
    console.log(response );
    // let loopvalue:any =res.data
    res.data["Approval_Status"]= Type
    this.gridApi.applyTransaction({
      update:[res.data]
    })
  })
}

})
  }
  
approval(Type:any){
let allData:any = this.gridApi.getSelectedRows()
    let updateValue:any={}
    updateValue["Approval_Status"]= Type

allData.forEach((element:any) => {
// let update_id=element.task._id
if(element.Approval_Status != "Approved"){
  let update_id = element.primaryKey
  let updateCollectionName=element.task_type
  this.dataService.update(updateCollectionName,update_id,updateValue).subscribe((response:any)=>{
    // console.log(response );
    // let loopvalue:any ={...element}
    element["Approval_Status"]= Type
    this.gridApi.applyTransaction({
      update:[element]
    })
  
  })
}
});
}
  getData(date?: any) {
    debugger
    this.calendarDate = date
    if(!isEmpty(this.rowData)){
      console.log(this.rowData);
      
    const DataChangeStatus:any= this.gridApi.applyTransaction({
      remove:[...this.rowData]
    })
    console.log(DataChangeStatus);
  }
    
    this.dataService.getTimesheetdata(this.employee_id, this.calendarDate).subscribe((res: any) => {
      if (res && res.data == null) {
        this.rowData = []
        return
      }
//      let allData :any[]=res.data
    
//       let start_date: any = moment(this.calendarDate).startOf('day').add(0,'hour').add(0,'minutes').add(0,'milliseconds').utc();
// let end_date: any = moment(this.calendarDate).endOf('day').add(23,'hour').add(59,'minutes').add(999,'milliseconds').utc();

// let filteredData = allData 
//   .map((element:any) => {
//     element["Not_Completed_task"] = moment(element.scheduled_end_date)?.isBefore(this.calendarDate);
//     element.project_name = element?.Project_name;
//     if (!isEmpty(element?.timesheet)) {

//       for (let index = 0; index < element?.timesheet.length; index++) {

// let timesheet = element?.timesheet[index]; 
// console.log(moment(timesheet.entry_Date)?.isBetween(start_date, end_date));
// console.log(timesheet.entry_Date,start_date, end_date);

//         if(moment(timesheet.entry_Date)?.isBetween(start_date, end_date)){
//           element.workedhours = timesheet.workedhours;
//           element.timesheet_id = timesheet._id;
//           element.entry_date = moment(timesheet.entry_Date);
//           element.today_totalworkedhours = element.totalworkedhours - timesheet.workedhours;
//         break ;
          
//         }
//         // if (!moment(element.entry_date)?.isBetween(start_date, end_date,'hour')) {
//         //   console.log("delete", element.timesheet);
//         //   delete element.workedhours;
//         //   delete element.timesheet_id;
//         //   delete element.entry_date;
//         //   delete element.today_totalworkedhours;
//         //   // delete element.timesheet;
//         // }
//       }
    
//     }
//     element.remaing_hrs = (element?.allocated_hours || 0) - element?.totalworkedhours;
//     element.remaing_hrs = isNaN(element.remaing_hrs) ? element.allocated_hours : element.remaing_hrs;
//     // if(!filteredData.includes(element._id)){
//       return element;
//     // }
//   });

// let filteredData= allData.map((element: any) => {
//   element["Not_Completed_task"] = moment(element.scheduled_end_date)?.isBefore(this.calendarDate);
//   element.project_name = element?.Project_name;

//   if (!isEmpty(element?.timesheet)) {
//     for (let index = 0; index < element.timesheet.length; index++) {
//       let timesheet = element.timesheet[index];
//       console.log(moment(timesheet.entry_Date)?.isBetween(start_date, end_date));
//       console.log(timesheet.entry_Date, start_date, end_date,timesheet._id);

//       if (moment(timesheet.entry_Date).utc()?.isBetween(start_date, end_date)) {
//         element.workedhours = timesheet.workedhours;
//         element.timesheet_id = timesheet._id;
//         element.entry_date = moment(timesheet.entry_Date).format('YYYY-MM-DDTHH:mm:ss.SSSZ')
//         element.today_totalworkedhours = element.totalworkedhours - timesheet.workedhours;
//         console.log(timesheet);
        
//         break;
//       }
//     }
//   }

//   element.remaing_hrs = (element?.allocated_hours || 0) - element?.totalworkedhours;
//   element.remaing_hrs = isNaN(element.remaing_hrs) ? element.allocated_hours : element.remaing_hrs;

//   return element;
// });

// console.log(filteredData);

// // this.rowData = filteredData;







// let start_date: any = moment(this.calendarDate).startOf('day').utc();
// let end_date: any = moment(this.calendarDate).endOf('day').utc().add(23,'hour').add(59,'minutes').add(999,'milliseconds');
// let allData :any[]=res.data

// let filteredData = allData
//   .filter((record) => {
//     if (!isEmpty(record?.timesheet)  ) {
//       if ( moment(record.timesheet.entry_Date)?.isBetween(start_date, end_date) ){
//         return true
//       }else{
//         return true
//       }
//     } else {
//       return true;  
//     }
//   })
//   .map((element:any) => {
//     element["Not_Completed_task"] = moment(element.scheduled_end_date)?.isBefore(this.calendarDate);
//     element.project_name = element?.Project_name;
     
//     if (!isEmpty(element?.timesheet)) {

//       for (let index = 0; index < element?.timesheet.length; index++) {
 
// let timesheet = element?.timesheet[index];
// console.log(!moment(timesheet.entry_Date).isBetween(start_date, end_date,'hour'),"hour",timesheet.entry_Date);
// console.log(moment(timesheet.entry_Date)?.isBetween(start_date, end_date),"normal",timesheet.entry_Date);
// console.log(!moment(timesheet.entry_Date).isBetween(start_date, end_date,'day'),"day",timesheet.entry_Date);
// console.log(moment(timesheet.entry_Date)?.isBetween(start_date, end_date,'date'),"date",timesheet.entry_Date);
//         if(moment(timesheet.entry_Date)?.isBetween(start_date, end_date)){
//            element.workedhours = timesheet.workedhours;
//           element.timesheet_id = timesheet._id;
//           element.entry_date = moment(timesheet.entry_Date).utc();
//           element.today_totalworkedhours = element.totalworkedhours - timesheet.workedhours;
        
         
//         console.log(element.entry_date);
//         console.log(start_date);
//         console.log(end_date);
        
//         console.log(!moment(element.entry_date).isBetween(start_date, end_date,'hour'));
//         console.log(moment(element.entry_date)?.isBetween(start_date, end_date,'hour'));
//         break ;
          
//         } 
//       }
    
//     }
//     element.remaing_hrs = (element?.allocated_hours || 0) - element?.totalworkedhours;
//     element.remaing_hrs = isNaN(element.remaing_hrs) ? element.allocated_hours : element.remaing_hrs;
//     // if(!filteredData.includes(element._id)){
//       return element;
//     // }
//   });
// console.log(filteredData);

// this.rowData = filteredData;





// let start_date: any = moment(this.calendarDate).startOf('day') 
// let end_date: any = moment(this.calendarDate).endOf('day').add(23, 'hours').add(59, 'minutes').add(999, 'milliseconds');
let date= moment(this.calendarDate).format('DD/MM/YYYY')
let allData: any[] = res.data;

let filteredData = allData .map((element: any) => {
    element["Not_Completed_task"] = moment(element.scheduled_end_date)?.isBefore(this.calendarDate);
    element.project_name = element?.Project_name;

    if (!isEmpty(element?.timesheet)) {
      for (let index = 0; index < element?.timesheet.length; index++) {
        let timesheet = element?.timesheet[index];
        if(timesheet.status=="Completed"){
        element.task_Completed_On=  timesheet.entry_Date
        }
        let checkDate=moment(timesheet.entry_Date).format('DD/MM/YYYY') 
        if (moment(checkDate).isSame(date) || checkDate== date) {
          element.workedhours = timesheet.workedhours;
          element.timesheet_id = timesheet._id;
          element.entry_date = timesheet.entry_Date
          element.today_totalworkedhours = element.totalworkedhours - timesheet.workedhours;
 
          break;
        }
      }
    }

    element.remaing_hrs = (element?.allocated_hours || 0) - element?.totalworkedhours;
    element.remaing_hrs = isNaN(element.remaing_hrs) ? element.allocated_hours : element.remaing_hrs;

    return element;
  });

console.log(filteredData);
this.rowData = filteredData;
















































// ! Normal Object
// let rowData :any[]=res.data
//       rowData.forEach((element: any) => {
        
//         element["Not_Completed_task"] = moment(element.scheduled_end_date).isBefore(this.calendarDate)
//         // console.log(moment(element.scheduled_end_date).isBefore());
        
//         element.project_name = element?.Project_name
//         if (!isEmpty(element?.timesheet)) {

//           // element.workedhours = element.timesheet.workedhours
//           // element.timesheet_id = element.timesheet._id
//           // element.entry_date = moment(element.timesheet.entry_Date).utc()
//           // // ? today total wrd hr used for calc 
//           // element.today_totalworkedhours = element.totalworkedhours - element.timesheet.workedhours

//           element.workedhours = element?.timesheet.workedhours;
//                     element.timesheet_id = element?.timesheet._id;
//                     // element.entry_date = moment(element?.timesheet.entry_Date).utc();
//                     element.today_totalworkedhours = element.totalworkedhours - element?.timesheet.workedhours;
//         }
//         element.remaing_hrs = (element?.allocated_hours || 0) - element?.totalworkedhours;
//     element.remaing_hrs = isNaN(element.remaing_hrs) ? element.allocated_hours : element.remaing_hrs;

//         // if (element.remaing_hrs == "NaN") {
//         //   element.remaing_hrs = element.allocated_hours
//         // }

//       });
//       this.rowData = rowData

    }
    )
  }
  onGridReadys(params: any) {
    this.gridApiUnschedule = params.api;
    this.gridApiUnschedule.sizeColumnsToFit();

  }

  addRow() {
    this.gridApiUnschedule.applyTransaction({
      add: [
        {
          activities: "",
          hour: "",
          remarks: ""
        },
      ],

    });
    // ! UNDO

  }

  getDataUnschedule() { 
    let start_date: any = moment(this.calendarDate).format('YYYY-MM-DDT00:00:00.000+00:00');
    let end_date: any = moment(this.calendarDate).format('YYYY-MM-DDT23:59:59.999+00:00');

    var filterCondition1 ={
      start:0,end:100,
 filter: [
 {
  clause: "AND",
  conditions: [
   { column:"entry_by" ,operator: "EQUALS",value:this.helperServices.getEmp_id(),type: "string"},
   { column:"entry_Date" ,operator: "GREATERTHANOREQUAL",value:start_date,type: "date"},
   { column:"entry_Date" ,operator: "LESSTHANOREQUAL",value:end_date,type: "date"},


  ]
 }
 ]}
      this.dataService.getDataByFilter('unschedule',filterCondition1).subscribe((res:any)=>{
        this.listData=res.data[0].response;
// console.log(res.data[0].response);


        })
 
  }
  public getRowIdschedule: any = (params: any) => `${params.data._id}`;

  onUnscheduleValueChanged(params: any) {
    let fieldName = params.colDef.field;
    // this.valueChanged = params.value;
    let data: any = {};
    params.data[fieldName]=params.value
    if (fieldName == "hours") {
      data[fieldName] = parseInt(params.value);
    } else {
      data[fieldName] = params.value;
    }

    data[fieldName] = params.value; 
    data['entry_Date']= moment(this.calendarDate).add(10, 'hours').add(10, 'minutes').format('YYYY-MM-DDTHH:mm:ss.SSSZ');``
     data["entry_by"] = this.helperServices.getEmp_id()
    if (params.data._id) {
      this.dataService.update("unschedule",params.data._id,data).subscribe((res: any) => {
        // this.listData = res.data["insert ID"];
        this.gridApiUnschedule.applyTransaction({
          update:[params.data]
        })
      })
    } else {
      debugger
      //  const assigned_to = sessionStorage.getItem('assigned_to');
      //  Object.assign(data, { assigned_to: assigned_to });

      this.dataService.save("unschedule",data).subscribe((res: any) => {
        // this.listData = res.data;
        data["_id"]=res.data["insert ID"];
        params.data["_id"]=res.data["insert ID"];

        this.gridApiUnschedule.applyTransaction({
          update:[params.data]
        })
        // this.getDataUnschedule();

      });
    }

  }

  /**get the data in  rowdata */
  


} 
 