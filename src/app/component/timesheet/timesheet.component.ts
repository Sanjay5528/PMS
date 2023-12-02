import { RowGroupingDisplayType } from '@ag-grid-community/core';
import { HttpClient } from '@angular/common/http';
import { Component, OnChanges,Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ColDef, Column, ColumnApi, GetRowIdFunc, GetRowIdParams, GridApi, GridOptions, GridReadyEvent, RowDataTransaction } from 'ag-grid-community';
import "ag-grid-enterprise";
import { isEmpty, truncate } from 'lodash';
import * as moment from 'moment';
import { DataService } from 'src/app/services/data.service';
import { DialogService } from 'src/app/services/dialog.service';
import { FormService } from 'src/app/services/form.service';
import { HelperService } from 'src/app/services/helper.service';
@Component({
  selector: 'app-timesheet',
  templateUrl: './timesheet.component.html',
  styleUrls: ['./timesheet.component.css']
})
export class TimesheetComponent implements OnInit {
  gridApi!: GridApi<any>;
  form!: FormGroup
  dateform:FormGroup= this.fb.group({
    datepicker: [moment()]
   });
  private gridColumnApi!: ColumnApi;
  groupDefaultExpanded = -1;
  rowData: any[] = [];
  gridApiUnschedule!: GridApi<any>;
  id: any
  valueChanged: any
  ctrl: any
  selectedRow: any
  listData: any[]=[]
  public gridOptions: GridOptions={
  autoGroupColumnDef:{
      headerName: "Parent Name",
      field:"project_Name",
    minWidth: 200,
    cellRendererParams: { suppressCount: true },
    sortable: false,
resizable: true,
filter: false}
  }
  // date: any
  public defaultColDef: ColDef = {
   
    resizable: true,
  };
  config: any;
  fields: any;
  pageHeading: any;
  @ViewChild("editViewPopup", { static: true }) editViewPopup!: TemplateRef<any>;
  @Input('model') model: any = {}
  selectInfo: any;
  getTimesheetdata: any;
  formatedDate: any;
  formattedDate: any;
  userPermissions:any
  //minDate!: Date;
  maxDate!: Date;
  calendarDate: any;
  router: any;
  butText = 'Save'
  onClose: any;
  formAction: any;
  selectedModel: any = {}
  editedRow: any;
  editedCols: any;
  selectedRows: any;

  /**gridReady for ag TimeSheet grid */
  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    // this.gridApi.sizeColumnsToFit();
  }
      /**gridReady for ag Unsheduled TimeSheet grid */
  //  groupDisplayType:RowGroupingDisplayType = 'groupRows'
   context:any
  //  
  public columnDefs: ColDef[] = [
    {
      headerName: "Project Name",
      field: "project_name",
      editable: false,
      rowGroup: true,hide:true,
    },
    {
      headerName: "Task Id",
      field: "_id",
      editable: false,
      sortable:false,
      width: 250,
      maxWidth: 320,
    },
    {
      headerName: "Task Name",
      field: "task_name",
      editable: false,
      sortable:false
    }, 
   
    {
      headerName: "Start Date",
      field: "scheduled_start_date",
      width: 120,
      maxWidth:120,
      valueFormatter: function (params) {
        // let data:any=moment(params.value).startOf('day')
        // data.subtract(1,'days')
        
        return moment(params.value).format('DD/MM/ YYYY')
      },
      
    },
    {
      headerName: "End Date",
      field: "scheduled_end_date",
      editable: false,
      sortable:false,
      width: 120,
      maxWidth:120,
      valueFormatter: function (params) {
        // let data:any=moment(params?.value).startOf('day')
        // data.subtract(1,'days')
        
        return moment(params.value).format('DD/MM/ YYYY')
        // console.log( moment(params.value).startOf('day').format('DD/MM/ YYYY'));
        
        // return moment(params.value).startOf('day').format('DD/MM/ YYYY');
      },
     
    },
    {
      headerName: "Allocated Hours",
      field: "allocated_hours",
      editable: false,
      sortable:false
    }, {
      headerName: "Remaning Hours",
      field: "remaing_hrs",
      editable: false,
      sortable:false
    },
    {
      headerName: "Today Worked Hours",
      field: "workedhours",
      
      editable: function (params) {
         
        return params?.data["approval_Status"] !== "Approved"  && params?.data["status"] !== "Approved";
    }, 
      cellDataType: 'number',
      cellEditor: 'agNumberCellEditor',
      cellEditorParams: {
        min: 1,
        max: function(params:any){
          console.warn(params,"params");
          return params.data["allocated_hours"]
        },
        precision: 1,
      }
      
      
      
    //   ,
    //   cellStyle: (params) => {
    //   let timeSheetWorkedHours =parseInt( params.data.totalworkedhours )
    //   let timeSheetAllocatedHours = params.data.allocated_hours;
    //   if (!(timeSheetAllocatedHours >= timeSheetWorkedHours)) {
    //     return { color: 'red' };
    //   }
    //   return 
    // },
    // suppressColumnsToolPanel: true
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
        
        return params.data["approval_Status"] !== "Approved"  && params.data["status"] !== "Completed";
    
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
      cellEditor: "agRichSelectCellEditor",
      cellEditorParams: {
        values: ['Approved', 'Rejected', 'Hold'],
      },
      
      editable:function(params:any){
        console.log(params);
        
        
        return false

      } 
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
    },
  ]
  public colDefs: any[] = [
    {
      headerName: "Activities",
      field: "activities",
      width: 320,
      editable: true,

      cellEditor: "agRichSelectCellEditor",
      cellEditorParams: {
        values: ['Floor Meet', 'Permissions', 'Client Call', 'Events'],
      }
    },
    {
      headerName: "Hours",
      field: "hours",
      width: 250,
      editable: true,

    },
    {
      headerName: "Remarks",
      field: "remarks",
      width: 350,
      editable: true, 

    }
  ]

  popup: any = [
    {
      headerName: "Remarks",
      field: "remarks",
      width: 300
      

    }
  ]
  
  public rowSelection: 'single' | 'multiple' = 'multiple';
   
    constructor(private dataService: DataService, private helperServices:HelperService, private activatedRoute: ActivatedRoute, private route: Router, private dialogService: DialogService, private httpclient: HttpClient, private fb: FormBuilder, public jwtService: JwtHelperService,private formservice: FormService) 
    {
      this.context = { componentParent: this };
      // this.route.routeReuseStrategy.shouldReuseRoute = () => false;
    }



    employee_id:any

 
  ngOnInit() {
    let TodayDate=moment()
    // this.dateform.get("datepicker")?.setValue(TodayDate)
    // this.activatedRoute.params.subscribe(params => {
      this.employee_id = this.helperServices.getEmp_id();
      let role_id: any = this.helperServices.getRole();
      this.calendarDate = TodayDate.format('YYYY-MM-DDT00:00:00.000+00:00');
      this.userPermissions=""
    
    this.redefineColdef()
    this.getData(this.calendarDate);
    this.getUnScheduleData();
    this.dateform.get("datepicker")?.valueChanges.subscribe((changeDate:any)=>{
      console.log(changeDate._d);
      let date=moment(changeDate).format('YYYY-MM-DDT00:00:00.000+00:00');
      this.getData(date)
    })
      this.maxDate = new Date();
  }

//   search() {
//     debugger
//     // this.date = this.dateform.value.datepicker._d;
//     this.formatedDate = moment(this.dateform.value.datepicker._d).format('YYYY-MM-DDT00:00:00.000+00:00');
//     this.calendarDate = this.formatedDate
//     //     // ! UNDO

//     // if (this.userPermissions === 'SA' || this.userPermissions === 'team lead') {
//     //   // Execute this block of code when userPermissions is 'SA' or 'team lead'
//     //   this.dataService.getTimesheetdatabyadmin(this.formatedDate).subscribe((res: any) => {
//     //     let rowData: any = res.data;
//     //     console.log(res, 'res');
    
//     //     this.dataService.workhours(this.formatedDate).subscribe((val: any) => {
//     //       let data: any = val.data;
//     //       console.log(val, 'val');
//     //       console.log(val.data);
    
//     //       if (!isEmpty(data)) {
//     //         rowData.forEach((arr: any) => {
//     //           for (let index = 0; index < data.length; index++) {
//     //             const element = data[index];
//     //             console.log(element);
    
//     //             if (element.task_id == arr.task_id) {
//     //               console.log(arr, 'asdsdasdasda');
//     //               console.log(element.result, 'result');
//     //               arr.workedhours = element?.result?.workedhours || 0;
//     //               arr.status = element?.result?.status;
//     //               arr['approval_Status'] = element['approval_Status'];
//     //               arr.remarks = element.result.remarks;
//     //               console.log(arr);
//     //             }
//     //           }
//     //         });
//     //         console.log(this.rowData);
//     //         this.rowData = rowData;
//     //       } else {
//     //         this.rowData = rowData;
//     //       }
//     //       console.log(this.rowData);
//     //     });
//     //   });
//     // } else {
//     //   // Execute this block of code when userPermissions is neither 'SA' nor 'team lead'
//     //   this.dataService.getTimesheetdata(name, this.formatedDate).subscribe((res: any) => {
//     //     let rowData: any = res.data;
    
//     //     // Fetch data from the second service (getworkhours)
//     //     this.dataService.getworkhours(name, this.formatedDate).subscribe((val: any) => {
//     //       let data: any = val.data;
//     //       console.log(val.data);
    
//     //       if (!isEmpty(data)) {
//     //         rowData.forEach((arr: any) => {
//     //           for (let index = 0; index < data.length; index++) {
//     //             const element = data[index];
//     //             console.log(element);
    
//     //             if (element.task_id == arr.task_id) {
//     //               arr.workedhours = element.result.workedhours;
//     //               arr.status = element.result.status;
//     //             }
//     //           }
//     //         });
    
//     //         console.log(this.rowData);
    
//     //         this.rowData = rowData;
//     //       } else {
//     //         this.rowData = rowData;
//     //       }
//     //     });
//     //   });
//     // }
// this.route.navigate(['timesheet',this.formatedDate])
// // this.getData()
    
   
//   //  this.getsearch()
//     //this.getUnScheduleData()
//     //this.getDataUnschedule();
//     // this.redefineColdef()
//     // this.OpenPopup();
//   }

  redefineColdef() {
    debugger
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
    if (this.userPermissions === 'SA' || this.userPermissions === 'team lead') {
      this.columnDefs.push(
      //   {
      //   headerName: "Task Status",
      //   field: "task_status",
      //   editable: false, 
      //   rowGroup: true,
      //   showRowGroup: true,
      //   lockVisible: true,
      //   hide:true,
      // }
      {
        headerName: "Employee Name",
        field: "assigned_to",
        type:"hide",
        editable: false,
        headerCheckboxSelection: true,
        checkboxSelection: true,      enableRowGroup: true,
      },
      )
      this.columnDefs.forEach((column: any) => {
        if (column.field === 'approval_Status') {
          column.editable = true;

        }
        else if (column.field === 'workedhours' || column.field === 'status') {
          column.editable = false;
        }else 
        if (column.field === 'assigned_to' || column.field === 'approval_Status' || column.field === 'remarks') {
          column.hide = this.userPermissions !== 'SA';
        }
        
      }) 
    } 
    }
      
  

 
    
  
  

  onSelectionChanged($event: any) {
    this.selectedRow = $event.api.getSelectedRows()[0];
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

  public getRowId: GetRowIdFunc = (params: GetRowIdParams) => `${params.data[ "id"]}`;

  
  /**get supplier by view in the data */
  onCellValueChanged(params: any) {

  


 debugger
     
     
    // let scheduled_end_date = new Date(params.data.scheduled_end_date);
    // let date = new Date(); 
    // // Set time to midnight for accurate date comparison s
    // date.setHours(0, 0, 0, 0);
    // console.log(scheduled_end_date <= date);
    
    // if (!(scheduled_end_date <= date)) {
      console.log(params.value);
      // (params.value)
if(params.value==''||params.value==null){
  let field:any=params.colDef.field.toUpperCase()
  this.dialogService.openSnackBar(`${field} Field Should be not be empty`,"CLEAR")
  let data:any={...params.data}
  data[field]=params.oldValue
  const result :any=this.gridApi.applyTransaction({
    
    update:[data]
  })
  console.warn(result);
  
  return
}

      debugger
      let fieldName = params.colDef.field;
      this.valueChanged = params.value;
      let data: any = {};
      data['assigned_to'] = params.data.assigned_to;
        data['task_id'] = params.data._id;
        data['ref_id'] = params.data.id;
        data['entry_Date'] = this.dateform.value.datepicker?._d
        data[fieldName] = params.value;
     
        if (fieldName === "workedhours") {
          let timeSheetWorkedHours =parseInt( params?.data?.totalworkedhours || 0 )+ params.value;
          let timeSheetAllocatedHours = params.data.allocated_hours;
          if (!(timeSheetAllocatedHours >= timeSheetWorkedHours)) {
            let maxTime:any=timeSheetAllocatedHours-timeSheetWorkedHours
            this.dialogService.openSnackBar(`The Time You Enter Is More than Allocated Hours${maxTime} `,"OK")
            let alldata:any=params.data
            alldata["workedhours"]=params.oldValue
            let data:RowDataTransaction={
             update:[alldata]
            }
            this.gridApi.applyTransaction(data)
            return;
          }
          
        
        } 
    if(params?.data?.timesheet_id){
      this.dataService.update("timesheet",params.data.timesheet_id,data).subscribe((res: any) => {
         
console.log(res);
      });
      return 
    }

      this.dataService.save("timesheet",data).subscribe((res: any) => {
        // this.rowData = res.data
        console.log(res);
        
        this.getData(this.calendarDate)
      });

 
   
  }
 










  OpenPopup(data:any) {
    this.dialogService.openDialog(this.editViewPopup, "50%", '530px', data);
    this.httpclient.get("assets/jsons/rejected-form.json").subscribe(async (config: any) => {

      this.config = config
      this.fields = config.form.fields
      this.pageHeading = config.pageHeading;
      this.ctrl.config = config
      this.ctrl.collectionName = config.form.collectionName
      this.ctrl.formAction = 'Add';
      this.ctrl.butText = 'Save';  
    })
  }

  saveForm(data: any) {
    

    data.remarks=this.selectedModel.remarks
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
  
 getData(date?:any) {
    debugger
  console.log(moment(date).isValid());
  
this.calendarDate=date
//     if (this.userPermissions === 'SA' || this.userPermissions === 'team lead') {
    
//     this.dataService.getTimesheetdatabyadmin(this.calendarDate).subscribe((res: any) => {
//   this.rowData = res.data
      
// //       this.dataService.workhours(this.calendarDate).subscribe((val:any)=>{
// //         let data:any=val.data
// //         if(!isEmpty(data)){
// //           rowData.forEach((arr:any)=>{
// //             for (let index = 0; index < data.length; index++) {
// //               const element = data[index];
// //               if(element.task_id==arr.task_id){
// //                 arr.workedhours=element?.result?.workedhours || 0;
// //                 arr.status=element?.result?.status;
// //                 arr['approval_Status']=element['approval_Status']
// //                 arr.remarks=element.result.remarks
// //               }
// //              }}
// //           )
// //  this.rowData=rowData
// // this.gridApi.sizeColumnsToFit()

// //         }else{
// //           this.rowData=rowData
// //           this.gridApi.sizeColumnsToFit()

// //         }

// //          // console.log(val,'datasssssss');
        
// //       }
// //     )}
//     }
//    ) 
      
//   // this.getsuperadmin();
    
//   }else{

 
    
    
    this.dataService.getTimesheetdata( this.employee_id,this.calendarDate).subscribe((res: any) => {
     
      let rowData:any =res.data  
       rowData.forEach((element:any) => {
        element.project_name=element?.project_name[0]
        element._id=element?._id?.task_id
let yyy=element?.timesheet
        if(!isEmpty(element?.timesheet)){
          console.log();
          
          element?.timesheet.forEach((Sheet:any) => {
            console.warn(Sheet,moment(Sheet.entry_Date).isSame(this.calendarDate,'day'));
            if(moment(Sheet.entry_Date).isSame(this.calendarDate,'day'))
            {
            element.timesheet_id=element?.timesheet[0]?._id
            element.workedhours=element?.timesheet[0]?.workedhours
          }
            
          });
          let TimeSheetDAta:any= yyy.find((obj:any) => moment(obj?.entry_Date).isSame(this?.calendarDate, 'day'));
console.log(TimeSheetDAta);

        }
        element.remaing_hrs=(element?.allocated_hours|| 0) - element?.total_work_hours 
if(element.remaing_hrs=="NaN"){
  element.remaing_hrs=element.allocated_hours
}
      });
      this.rowData=rowData
      console.log(rowData);
      
//       this.dataService.getworkhours(this.employee_id,this.calendarDate).subscribe((val:any)=>{
//         let data:any=val.data
//           rowData.forEach((arr:any)=>{
            
//             // console.log('scheduled_start_date',arr.scheduled_start_date);
//             // console.log('scheduled_end_date',arr.scheduled_end_date);
//             // console.log("this.calendarDate",this.calendarDate);
//             // console.log(0>=(moment(this.calendarDate).diff(arr.scheduled_start_date,'days')));
//             // // console.log(0<=(moment(this.calendarDate).diff(arr.scheduled_end_date,'days')));
//             // console.log(0>=(moment(this.calendarDate).diff(arr.scheduled_end_date,'days')));
//             // if(!(0>=(moment(this.calendarDate).diff(arr.scheduled_end_date,'days')))){
//             //   arr.task_status="Not Completed"
//             // }else{
//             //   arr.task_status="On Going"
//             // }

//             // else if( )

//         if(!isEmpty(data)){
            
//             for (let index = 0; index < data.length; index++) {
//               const element = data[index];
              
//               if(element.task_id==arr.task_id){
//                 arr.workedhours=element?.result?.workedhours || 0;
//                 arr.status=element?.result?.status;
//                 arr['approval_Status']=element['approval_Status']
//                 arr.remarks=element?.result?.remarks
//               }
//             }
//              }}
//           )
//  this.rowData=rowData
// this.gridApi.sizeColumnsToFit()
//         // }else{
//         //   this.rowData=rowData
//         //   this.gridApi.sizeColumnsToFit()

//         // }
//          // console.log(val,'datasssssss');
        
//       }
//     )}
    
     }
     )
    //  }
  }
  onGridReadys(params:any){
    this.gridApiUnschedule = params.api;
    // this.gridColumnApi = params.columnApi;
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

    // this.listData.push(add);
  }

  getDataUnschedule() {
    // this.dataService.getData("unschedule").subscribe((res: any) => {
    //   this.listData = res.data;

    // });
    let data: any = localStorage.getItem('auth');
    let name = JSON.parse(data).profile.assigned_to
    this.activatedRoute.params.subscribe(params => {
      let date = params['date'];
          // ! UNDO

      // this.dataService.getunschedule(name,date).subscribe((res:any)=>{
      //   this.listData=res.data;

    
      //   })

     
    })
  }
  onUnscheduleValueChanged(params: any) {
    debugger

    let fieldName = params.colDef.field;
    this.valueChanged = params.value;
    let data: any = {};
    if (fieldName == "hours") {
      data['hours'] = parseInt(params.value);
    } else {
      data[fieldName] = params.value;
    }
    //data[fieldName] = params.value;
    let data1: any = localStorage.getItem('auth');

    let name = JSON.parse(data1).profile.assigned_to
//     if(this.date = this.dateform.value.datepicker?._d){
//       // this.date = this.form.value.datepicker?._d
    
// let formatedDate: any = moment(this.formatedDate).add(10, 'minutes').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
// Object.assign(data, { formatedDate: formatedDate}) 
//     }
//     else{
    
//    let formatedDate: any = moment(this.calendarDate).add(10, 'minutes').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
//  Object.assign(data, { formatedDate: formatedDate }) 
//     }
//     Object.assign(data, { assigned_to: name })
//         // ! UNDO

    // if (params.data._id) {
    //   this.dataService.updateUnschedule(data, params.data._id).subscribe((res: any) => {
    //     this.listData = res.data;
    //   })
    // } else {
    //   debugger
    //   //  const assigned_to = sessionStorage.getItem('assigned_to');
    //   //  Object.assign(data, { assigned_to: assigned_to });

    //   this.dataService.AddUnScheduleTimesheet(data).subscribe((res: any) => {
    //     this.listData = res.data;
    //     this.getDataUnschedule();

    //   });
    // }

  }

  /**get the data in  rowdata */
  getUnScheduleData() {
    debugger
    // this.dataService.getdata("unschedule").subscribe((res: any) => {
    //   this.listData = res.data;
    //   console.log('ii', this.listData)
    // })
    // let data: any = localStorage.getItem('auth');
    // let name = JSON.parse(data).profile.assigned_to
    // this.activatedRoute.params.subscribe(params => {
    //   let date = params['date'];
    //       // ! UNDO

    //   // this.dataService.getunschedule(name,date).subscribe((res:any)=>{
    //   //   this.listData=res.data;
    //   //   console.log('ii', this.listData)
    //   // })
    // });
     
  }
 

};