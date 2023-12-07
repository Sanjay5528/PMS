import { RowClassRules } from '@ag-grid-community/core';
import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ColDef, ColumnApi, GridApi, GridOptions, GridReadyEvent, RowDataTransaction } from 'ag-grid-community';
import "ag-grid-enterprise";
import { isEmpty } from 'lodash';
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
  dateform: FormGroup = this.fb.group({
    datepicker: [moment()]
  });
  groupDefaultExpanded = -1;
  rowData: any[] = [];
  gridApiUnschedule!: GridApi<any>;
  // id: any
  // valueChanged: any
  // ctrl: any
  selectedRow: any
  listData: any[] = []
  public gridOptions: GridOptions = {
    autoGroupColumnDef: {
      headerName: "Parent Name",
      field: "project_Name",
      minWidth: 200,
      cellRendererParams: { suppressCount: true },
      sortable: false,
      resizable: true,
      filter: false
    },
    // groupDisplayType:'groupRows',
   
  }
  // date: any
  public defaultColDef: ColDef = {

    resizable: true,
  };  
  
  
  // public rowClassRules: any = {
  //   // row style function
  //   'sick-days-warning': (params:any) => {
  //     var numSickDays = params.data.sickDays;
  //     return numSickDays > 5 && numSickDays <= 7;
  //   },
  //   // row style expression
  //   'sick-days-breach': 'data.sickDays >= 8',
  // };
  fields: any;
  pageHeading: any;
  @ViewChild("editViewPopup", { static: true }) editViewPopup!: TemplateRef<any>;
  @Input('model') model: any = {}
  selectInfo: any;
  getTimesheetdata: any;
  formatedDate: any;
  formattedDate: any;
  userPermissions: any
  //minDate!: Date;
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
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }
   public getRowClass:any =(params: any) => {
    
     if (  (params.data!== undefined || !isEmpty(params.data) ) && params?.data?.Not_Completed_task == true) {
      console.log("INSIDEs Not_Completed_task");
    console.log(params);
      
      return 'not_completed';
     }
     if (  (params.data!== undefined || !isEmpty(params.data) ) && params?.data?.approval_Status == "Rejected") {
      console.log("INSIDEs approval_Status");
    console.log(params);
      
      return 'rejected';
     }
     return ' '
   };
 

  public columnDefs: ColDef[] = [
    {
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
      valueFormatter: function (params) {
        return moment(params.value).format('DD/MM/ YYYY')
      },

    },
    {
      headerName: "End Date",
      field: "scheduled_end_date",
      editable: false,
      sortable: false,
      width: 120,
      maxWidth: 120,
      valueFormatter: function (params) {
        return moment(params.value).format('DD/MM/ YYYY')
      },

    },
    // {
    //   headerName: "Entry Date",
    //   field: "entry_date",
    //   width: 120,
    //   maxWidth:120,
    //   valueFormatter: function (params) { 
    //     if(params.value){

    //       return moment(params.value).format('DD/MM/ YYYY')
    //     }
    //     return ''
    //   },

    // },
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
      // pinned:'right',
      editable: function (params) {

        return params?.data["approval_Status"] !== "Approved" && params?.data["status"] !== "Approved";
      },
      cellDataType: 'number',
      cellEditor: 'agNumberCellEditor',
      cellEditorParams: {
        min: 1,
        max: function (params: any) {
          console.warn(params, "params");
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

        return params.data["approval_Status"] !== "Approved" && params.data["status"] !== "Completed";

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

      editable: function (params: any) {
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
      editable: true,
      flex: 1,
      cellEditor: "agRichSelectCellEditor",
      cellEditorParams: {
        values: ['Floor Meet', 'Permissions', 'Meeting', 'Client Call', 'Events', "Reading"],
      }
    },
    {
      headerName: "Hours",
      field: "hours",
      editable: true,
      flex: 1,
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
      editable: true,
      flex: 1,
      cellEditor: 'agLargeTextCellEditor',
      cellEditorPopup: true,
      cellEditorParams: {
        rows: 10,
        cols: 50
      }
    }
  ]

  public rowSelection: 'single' | 'multiple' = 'multiple';
  constructor(private dataService: DataService, private helperServices: HelperService, private activatedRoute: ActivatedRoute, private route: Router, private dialogService: DialogService, private fb: FormBuilder) {
    this.route.routeReuseStrategy.shouldReuseRoute = () => false;
  }



  employee_id: any


  ngOnInit() {
    let TodayDate = moment()
    this.employee_id = this.helperServices.getEmp_id();
    this.calendarDate = TodayDate.format('YYYY-MM-DDT00:00:00.000+00:00');
    this.userPermissions = ""
    this.redefineColdef()
    this.getData(this.calendarDate);
    this.getUnScheduleData();
    this.dateform.get("datepicker")?.valueChanges.subscribe((changeDate: any) => {
      console.log(changeDate._d);
      let date = moment(changeDate).format('YYYY-MM-DDT00:00:00.000+00:00');
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
          type: "hide",
          editable: false,
          headerCheckboxSelection: true,
          checkboxSelection: true, enableRowGroup: true,
        },
      )
      this.columnDefs.forEach((column: any) => {
        if (column.field === 'approval_Status') {
          column.editable = true;

        }
        else if (column.field === 'workedhours' || column.field === 'status') {
          column.editable = false;
        } else
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

  public getRowId: any = (params: any) => `${params.data._id}`;


  /**get supplier by view in the data */
  onCellValueChanged(params: any) {
    if (params.value == '' || params.value == null) {
      let field: any = params.colDef.field.toUpperCase()
      this.dialogService.openSnackBar(`${field} Field Should be not be empty`, "CLEAR")
      let data: any = { ...params.data }
      data[params.colDef.field] = params.oldValue
      const result: any = this.gridApi.applyTransaction({
        update: [data]
      })
      console.warn(result);

      return
    }

    debugger
    let fieldName = params.colDef.field;
    // this.valueChanged = params.value;
    let data: any = {};
    data['assigned_to'] = this.helperServices.getEmp_id();
    data['task_id'] = params.data._id;
    data['ref_id'] = params.data.id;
    data['entry_Date'] = moment(this.dateform.value.datepicker?._d).utc()
    data[fieldName] = params.value;

    if (fieldName === "workedhours") {
      let timeSheetWorkedHours = parseInt(params?.data?.today_totalworkedhours || 0) + params.value;
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
        alldata.status == "Open" ? "In Progress" : alldata.status
        let data: RowDataTransaction = {
          update: [alldata]
        }
        this.gridApi.applyTransaction(data)
        this.updateTask(alldata, res)
      });
      return
    }

    this.dataService.save("timesheet", data).subscribe((res: any) => {
      params.data[fieldName] = params.value
      params.data.remaing_hrs = (params.data?.allocated_hours || 0) - (params.data?.today_totalworkedhours + params.value);
      params.data.status == "Open" ? "In Progress" : params.data.status
      params.data.remaing_hrs = isNaN(params.data.remaing_hrs) ? params.data.allocated_hours :parseInt( params.data.remaing_hrs);

      let data: RowDataTransaction = {
        update: [params.data]
      }
      const dats = this.gridApi.applyTransaction(data)
      this.updateTask(params.data, res);
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
     let allData :any[]=res.data
     let rowData: any = []
      // allData.forEach((record:any)=>{
      //   let start_date:any =moment().startOf('day')
      //   let end_date:any =moment().endOf('day')
      //   if (!isEmpty(record?.timesheet)) { 
      //     if(moment(record.timesheet.entry_Date).isBetween(start_date,end_date) && rowData.includes(record?._id)){
      //       rowData.push(record)
      //     }
      //   }else{
      //     rowData.push(record)

      //   }
      
      // })
      let start_date: any = moment(this.calendarDate).startOf('day').utc();
let end_date: any = moment(this.calendarDate).endOf('day').utc().add(23,'hour').add(59,'minutes').add(999,'milliseconds');

// let filteredData = allData
//   .filter((record) => {
//     return (
//       (!isEmpty(record?.timesheet) &&
//         moment(record.timesheet.entry_Date)?.isBetween(start_date, end_date) &&
//         ! rowData.includes(record?._id)) ||
//       true // This will ensure that all records are included, as in the original code
//     );
//   })
//   .map((element) => {
//     element["Not_Completed_task"] = moment(element.scheduled_end_date)?.isBefore(this.calendarDate);
//     element.project_name = element?.project_name;

//     if (!isEmpty(element?.timesheet)) {
//       let timesheet = element.timesheet;
//       element.workedhours = timesheet.workedhours;
//       element.timesheet_id = timesheet._id;
//       element.entry_date = moment(timesheet.entry_Date).utc();

//       // ? today total wrd hr used for calc
//       element.today_totalworkedhours = element.totalworkedhours - timesheet.workedhours;
//     }

//     element.remaing_hrs = (element?.allocated_hours || 0) - element?.totalworkedhours;
//     element.remaing_hrs = isNaN(element.remaing_hrs) ? element.allocated_hours : element.remaing_hrs;

//     return element;
//   });

// this.rowData = filteredData; 
let filteredData = allData
  .filter((record) => {
    if (!isEmpty(record?.timesheet)  ) {
      if ( moment(record.timesheet.entry_Date)?.isBetween(start_date, end_date) ){
        return true
      }else{
        return true
      }
    } else {
      return true;  
    }
  })
  .map((element:any) => {
    element["Not_Completed_task"] = moment(element.scheduled_end_date)?.isBefore(this.calendarDate);
    element.project_name = element?.project_name;
    // if (!isEmpty(element?.timesheet )  ) {
    //   let timesheet = element.timesheet;
    //   element.workedhours = timesheet.workedhours;
    //   element.timesheet_id = timesheet._id;
    //   element.entry_date = moment(timesheet.entry_Date).utc();
    //   element.today_totalworkedhours = element.totalworkedhours - timesheet.workedhours;
    // }
    // element.remaing_hrs = (element?.allocated_hours || 0) - element?.totalworkedhours;
    // element.remaing_hrs = isNaN(element.remaing_hrs) ? element.allocated_hours : element.remaing_hrs;
    
    // if (! moment(element.timesheet?.entry_Date)?.isBetween(start_date, end_date) && !isEmpty(element?.timesheet) ) {
    //   console.log("delete", element.timesheet);  
    //   delete   element.workedhours 
    //   delete   element.timesheet_id
    //   delete  element.entry_date 
    //   delete  element.today_totalworkedhours
    // delete element.timesheet;
    // }
    if (!isEmpty(element?.timesheet)) {

      for (let index = 0; index < element?.timesheet.length; index++) {
// console.log(moment(element.entry_date)?.isBetween(start_date, end_date,'hour'));

let timesheet = element?.timesheet[index];
console.log(!moment(timesheet.entry_Date).isBetween(start_date, end_date,'hour'),"hour",timesheet.entry_Date);
console.log(moment(timesheet.entry_Date)?.isBetween(start_date, end_date),"normal",timesheet.entry_Date);
console.log(!moment(timesheet.entry_Date).isBetween(start_date, end_date,'day'),"day",timesheet.entry_Date);
console.log(moment(timesheet.entry_Date)?.isBetween(start_date, end_date,'date'),"date",timesheet.entry_Date);
        if(moment(timesheet.entry_Date)?.isBetween(start_date, end_date)){
          // const elements = element?.timesheet[index];
          element.workedhours = timesheet.workedhours;
          element.timesheet_id = timesheet._id;
          element.entry_date = moment(timesheet.entry_Date).utc();
          element.today_totalworkedhours = element.totalworkedhours - timesheet.workedhours;
        
         
        console.log(element.entry_date);
        console.log(start_date);
        console.log(end_date);
        
        console.log(!moment(element.entry_date).isBetween(start_date, end_date,'hour'));
        console.log(moment(element.entry_date)?.isBetween(start_date, end_date,'hour'));
        break ;
          
        }
        // if (!moment(element.entry_date)?.isBetween(start_date, end_date,'hour')) {
        //   console.log("delete", element.timesheet);
        //   delete element.workedhours;
        //   delete element.timesheet_id;
        //   delete element.entry_date;
        //   delete element.today_totalworkedhours;
        //   // delete element.timesheet;
        // }
      }
    
    }
    element.remaing_hrs = (element?.allocated_hours || 0) - element?.totalworkedhours;
    element.remaing_hrs = isNaN(element.remaing_hrs) ? element.allocated_hours : element.remaing_hrs;
    // if(!filteredData.includes(element._id)){
      return element;
    // }
  });
console.log(filteredData);

this.rowData = filteredData;

      // rowData.forEach((element: any) => {
        
      //   element["Not_Completed_task"] = moment(element.scheduled_end_date).isBefore(this.calendarDate)
      //   // console.log(moment(element.scheduled_end_date).isBefore());
        
      //   element.project_name = element?.project_name
      //   if (!isEmpty(element?.timesheet)) {
      //     element.workedhours = element.timesheet.workedhours
      //     element.timesheet_id = element.timesheet._id
      //     element.entry_date = moment(element.timesheet.entry_Date).utc()
      //     // ? today total wrd hr used for calc 
      //     element.today_totalworkedhours = element.totalworkedhours - element.timesheet.workedhours
      //   }
      //   element.remaing_hrs = (element?.allocated_hours || 0) - element?.totalworkedhours
      //   if (element.remaing_hrs == "NaN") {
      //     element.remaing_hrs = element.allocated_hours
      //   }
      // });
      // this.rowData = rowData

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
    let fieldName = params.colDef.field;
    // this.valueChanged = params.value;
    let data: any = {};
    if (fieldName == "hours") {
      data[fieldName] = parseInt(params.value);
    } else {
      data[fieldName] = params.value;
    }

    //data[fieldName] = params.value;
    // let data1: any = localStorage.getItem('auth');

    // let name = JSON.parse(data1).profile.assigned_to
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