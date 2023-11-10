import { HttpClient } from '@angular/common/http';
import { Component, OnChanges,Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ColDef, Column, ColumnApi, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import "ag-grid-enterprise";
import { isEmpty, truncate } from 'lodash';
import * as moment from 'moment';
import { DataService } from 'src/app/services/data.service';
import { DialogService } from 'src/app/services/dialog.service';
import { FormService } from 'src/app/services/form.service';
@Component({
  selector: 'app-timesheet',
  templateUrl: './timesheet.component.html',
  styleUrls: ['./timesheet.component.css']
})
export class TimesheetComponent implements OnInit {
  gridApi!: GridApi<any>;
  form!: FormGroup
  dateform!:FormGroup
  private gridColumnApi!: ColumnApi;
  groupDefaultExpanded = -1;
  rowData: any[] = [];
  gridApiUnschedule!: GridApi<any>;
  id: any
  valueChanged: any
  ctrl: any
  selectedRow: any
 SelectedDate :any
  listData: any
  public gridOptions!: GridOptions
  date: any
  public defaultColDef: ColDef = {
   
    resizable: true,
  };
  config: any;
  fields: any;
  pageHeading: any;
  @ViewChild("editViewPopup", { static: true }) editViewPopup!: TemplateRef<any>;
  @Input('model') model: any = {}
  pageForm!: FormGroup
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
  selectedRow1:any

  /**gridReady for ag grid */
  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    // this.gridApi.sizeColumnsToFit();
  }
  onGridReadys(params: GridReadyEvent) {
    this.gridApiUnschedule = params.api;
    this.gridColumnApi = params.columnApi;
    // this.gridApi.sizeColumnsToFit();
  }

  public columnDefs: ColDef[] = [
    {
      headerName: "Employee Name",
      field: "assignedto",
      width: 100,
      editable: false,
      headerCheckboxSelection: true,
      checkboxSelection: true,
      suppressColumnsToolPanel: true
      

    },
    {
      headerName: "Project Name",
      field: "projectname",
      width: 120,
      editable: false,

    },
    {
      headerName: "Task Id",
      field: "task_id",
      width: 90,
      editable: false,

    },
    {
      headerName: "Task Name",
      field: "taskname",
      width: 120,
      editable: false,

    },
    {
      headerName: "Start Date",
      field: "scheduled_start_date",
      width: 80,
      editable: false,
      
      valueFormatter: function (params) {
        return moment(params.value).format('D/M/ YYYY');
      },
      
    },
    {
      headerName: "End Date",
      field: "scheduled_end_date",
      width: 80,
      editable: false,

      valueFormatter: function (params) {
        return moment(params.value).format('D/M/ YYYY');
      },
     
    },
    {
      headerName: "Allocated Hours",
      field: "allocatedhours",
      width: 120,
      editable: false,
    },
    // {
    //   headerName: "Total Worked Hours",
    //   field: "totalworkedhours",
    //   width: 90,
    //   editable:false
    // },
    {
      headerName: "Today Worked Hours",
      field: "workedhours",
      width: 90,
      
      editable: function (params) {
         
        return params.data["Approval Status"] !== "Approved"  && params.data["status"] !== "Completed";
    }},
  

    {
      headerName: "Status",
      field: "status",
      width: 90,
     
      
      
      cellEditor: "agRichSelectCellEditor",
      cellEditorParams: {
        values: ['In Progress', 'Completed', 'Hold', 'Closed'],
      },
      
      editable: function (params) {
        
        return params.data["Approval Status"] !== "Approved"  && params.data["status"] !== "Completed";
    
    }},
    // {
    //   headerName: "Remarks",
    //   field: "remarks",
    //   width: 200,
    //   editable: true,

    // },
    {

      field: "Approval Status",
      width: 100,
      cellEditor: "agRichSelectCellEditor",
      cellEditorParams: {
        values: ['Approved', 'Rejected', 'Hold'],
      },
      cellStyle: (params) => {
        if (params.data["Approval Status"] === "Approved") {
          return { color: 'green' };
        } else if (params.data["Approval Status"] === "Rejected") {
          return { color: 'red' };
        }
        return null; // Default styling for other cases
      },
      suppressColumnsToolPanel: true
    },
    {
      headerName: "Remarks",
      field: "remarks",
      width: 100,
      editable: false,
      suppressColumnsToolPanel: true
    },
  ]
  colDefs: any[] = [
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
   
    constructor(private dataService: DataService, private activatedRoute: ActivatedRoute, private route: Router, private dialogService: DialogService, private httpclient: HttpClient, private fb: FormBuilder, public jwtService: JwtHelperService,private formservice: FormService) {
    this.createFormControl()
    let data: any = localStorage.getItem('auth');
    // let name = JSON.parse(data).profile.employeeid;
     //this.valueGEt(name);
    

  }



  

 
  ngOnInit() {
    debugger
    let data: any = localStorage.getItem('auth');
    // let name = JSON.parse(data).profile.employeeid
    this.activatedRoute.params.subscribe(params => {
      this.calendarDate = params['date'];
      const today =moment()
      console.log(today);
      
    console.log(moment(this.calendarDate).diff(today)); // if value is leesser than 0 < -infity api call 2 // ? else normal condition api 2
    console.log(moment(this.calendarDate).diff(new Date,'day'));
    console.log(moment(this.calendarDate).diff(new Date,'d'));

    });
    

    this.SelectedDate = this.calendarDate 
     console.log(this.calendarDate );
     
      
    //  this.valueGEt(name);  
    console.log(this.rowData,'final');

    this.getUserRole()
    this.getTimesheet()
    this.getData();
    this.getUnScheduleData();
     
    this.dateform = this.fb.group({
      // datepicker: new FormControl(null, Validators.required)
 
  
   datepicker: this.SelectedDate

   
    });

     
      this.maxDate = new Date(); 
      
      // const superadminColumnDef = this.columnDefs.find((colDef) => colDef.field === 'assignedto'||colDef.field ==='Approval Status'||colDef.field==='remarks');
      // if (superadminColumnDef) {
      //   // Modify column visibility based on the user's role
      //   superadminColumnDef.hide = this.userPermissions !== 'SA';
      // }
      
      this.columnDefs.forEach((colDef) => {
        if (colDef.field === 'assignedto' || colDef.field === 'Approval Status' || colDef.field === 'remarks') {
          colDef.hide = this.userPermissions !== 'SA';
        }
      });

      // if (this.userPermissions === 'SA') {
      //   this.columnDefs.find((colDef:any) => colDef.field === 'superadminField').hide = false;
      //   // this.columnDefs.find((colDef:any)=>{
      //   //   colDef.field === 'assignedto',
      //   //   colDef.hide=false
      //   // })
      // } else {
      //   // this.columnDefs.find((colDef:any) => {colDef.field === 'assignedto',
      //   // colDef.hide=true});
      // }
     
    

  }

  valueGEt(name:any){
    const format_date={
      "date":this.formattedDate
    }
    // ! UNDO
    // this.dataService.getTimesheetdata(name, this.calendarDate).subscribe(async(res: any) => {
    //   this.rowData = res.data
    // }
    //   )
  
  }



  cancel() {
    this.route.navigate([`timesheet/`]);
  }
  search() {
    debugger
    let data: any = localStorage.getItem('auth');
    let name = JSON.parse(data).profile.employeeid;
    this.date = this.dateform.value.datepicker._d;
    this.formatedDate = moment(this.date).format('YYYY-MM-DDT00:00:00.000+00:00');
        // ! UNDO

    // if (this.userPermissions === 'SA' || this.userPermissions === 'team lead') {
    //   // Execute this block of code when userPermissions is 'SA' or 'team lead'
    //   this.dataService.getTimesheetdatabyadmin(this.formatedDate).subscribe((res: any) => {
    //     let rowData: any = res.data;
    //     console.log(res, 'res');
    
    //     this.dataService.workhours(this.formatedDate).subscribe((val: any) => {
    //       let data: any = val.data;
    //       console.log(val, 'val');
    //       console.log(val.data);
    
    //       if (!isEmpty(data)) {
    //         rowData.forEach((arr: any) => {
    //           for (let index = 0; index < data.length; index++) {
    //             const element = data[index];
    //             console.log(element);
    
    //             if (element.taskid == arr.task_id) {
    //               console.log(arr, 'asdsdasdasda');
    //               console.log(element.result, 'result');
    //               arr.workedhours = element?.result?.workedhours || 0;
    //               arr.status = element?.result?.status;
    //               arr['Approval Status'] = element['Approval Status'];
    //               arr.remarks = element.result.remarks;
    //               console.log(arr);
    //             }
    //           }
    //         });
    //         console.log(this.rowData);
    //         this.rowData = rowData;
    //       } else {
    //         this.rowData = rowData;
    //       }
    //       console.log(this.rowData);
    //     });
    //   });
    // } else {
    //   // Execute this block of code when userPermissions is neither 'SA' nor 'team lead'
    //   this.dataService.getTimesheetdata(name, this.formatedDate).subscribe((res: any) => {
    //     let rowData: any = res.data;
    
    //     // Fetch data from the second service (getworkhours)
    //     this.dataService.getworkhours(name, this.formatedDate).subscribe((val: any) => {
    //       let data: any = val.data;
    //       console.log(val.data);
    
    //       if (!isEmpty(data)) {
    //         rowData.forEach((arr: any) => {
    //           for (let index = 0; index < data.length; index++) {
    //             const element = data[index];
    //             console.log(element);
    
    //             if (element.taskid == arr.task_id) {
    //               arr.workedhours = element.result.workedhours;
    //               arr.status = element.result.status;
    //             }
    //           }
    //         });
    
    //         console.log(this.rowData);
    
    //         this.rowData = rowData;
    //       } else {
    //         this.rowData = rowData;
    //       }
    //     });
    //   });
    // }

    
   
   this.getsearch()
    //this.getUnScheduleData()
    //this.getDataUnschedule();
    // this.getTimesheet()
    // this.OpenPopup();
  }
  getUserRole() {
    let token = localStorage.getItem("token") || ""; 
    let jwtParseToken = this.jwtService.decodeToken(token);
     this.userPermissions = jwtParseToken?.role;
     console.log(this.userPermissions ,"hoiii");
     
  }

  getTimesheet() {
    debugger
    // If the user is 'superadmin' or 'team lead', make the specific columns editable
   
    if (this.userPermissions === 'SA' || this.userPermissions === 'team lead') {
      this.columnDefs.forEach((column: any) => {
        if (column.field === 'Approval Status') {
          column.editable = true;
        }
        else if (column.field === 'workedhours' || column.field === 'status') {
          column.editable = false;
        }
      }) 
    } 
    }
      
  

 
    
  
  createFormControl() {
    this.pageForm = this.fb.group({
      description: ["", Validators.required]
    })
  }

  onSelectionChanged($event: any) {
    this.selectedRow = $event.api.getSelectedRows()[0];
    console.log(this.selectedRow);
  }
  onSelectionChanged1($event: any) {
    this.selectedRow1 = $event.api.getSelectedRows();
    console.log(this.selectedRow1);
  }

  approveButton(){
    debugger
   for(let i=0; this.selectedRow1.length>i;i++){

    this.selectedRow1[i]
    let data: any = {};
   data['task_id'] = this.selectedRow1[i].task_id
   data['employeeid'] = this.selectedRow1[i].employeeid

   data['ref_id'] = this.selectedRow1[i].id
data['Approval Status'] =  "Approved"


  
if(this.date = this.dateform.value.datepicker?._d){
  // this.date = this.form.value.datepicker?._d

let formatedDate: any = moment(this.formatedDate).add(10, 'minutes').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
console.log(formatedDate,'formatedDate');
console.log(data,'data');

Object.assign(data, { formatedDate: formatedDate}) 
}
else{

let formatedDate: any = moment(this.calendarDate).add(10, 'minutes').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
console.log(formatedDate,'formatedDate');
console.log(data,'data');

Object.assign(data, { formatedDate: formatedDate }) 
 console.log(data,'data');
}


    // ! UNDO

// this.dataService.savetimesheet(data).subscribe((res: any) => {
//   this.rowData = res.data;
// this.getData()

// });

   } 
  //  this.selectedRow1
  }

 
  
  /**get supplier by view in the data */
  onCellValueChanged(params: any) {

    // this.editedRow = params;
    // this.editedCols[params.colDef.field] = 1;
    // this.dataService
    //   .savedata(this.editedRow.data._id, this.editedRow.data)
    //   .then((res: any) => {
    //     this.data = res.data;
    //   });
    // if (
    //   this.editedRow.data.status == "Open" ||
    //   this.editedRow.data.status == "Due"
    // ) {
    //   this.dataService
    //     .updateCost(this.editedRow.data._id, { status: "Pending" })
    //     .then((res: any) => {
    //       this.data2 = res.data;
    //     });
    //   this.dataService.showChart = false;
    // }


 debugger
     
     
    console.log(params);
    let scheduledenddate = new Date(params.data.scheduledenddate);
    let date = new Date();
    date.setHours(0, 0, 0, 0); // Set time to midnight for accurate date comparison s
    console.log(scheduledenddate);

    console.log(scheduledenddate >= date);
    if (!(scheduledenddate <= date)) {

      let fieldName = params.colDef.field;
      this.valueChanged = params.value;
      let data: any = {};
      data['employeeid'] = params.data.employeeid;
        data['task_id'] = params.data.task_id;
        data['ref_id'] = params.data.id;
        // data['created_on'] = date
        data[fieldName] = params.value;
       
    let task: any = {};


      

// if (fieldName == "Approval Status" ) {
//  data['updated_on'] = date
  
//   task[fieldName] = params.value;

//   this.dataService.updateTimesheet(data, params.data.id, 'timesheet').subscribe((res: any) => {
    
//     this.rowData = res.data;
    
//     if (params.newValue === "Approved") {
       
//       this.columnDefs.forEach((column: any) => {
//         if (column.field === 'workedhours' || column.field === 'status') {
//           column.editable = false;
//         }
//       });
//     }
//   }

  // else if(params.newValue != "Approved"){
    //   this.columnDefs.forEach((column: any) => {
    //     if (column.field === 'workedhours' || column.field === 'status') {
    //       column.editable = true;
    //     }
    //   });
    // }
      

 // this.date = this.form.value.datepicker?._d
      
  // this.date = this.form.value.datepicker?._d
      
  // let formatedDate: any = moment(this.formatedDate).add(10, 'minutes').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
  // console.log(formatedDate,'formatedDate');
  // console.log(data,'data');
  
  // Object.assign(data, { formatedDate: formatedDate}) 
  //   console.log(data,'data');

  //   this.dataService.updateTimesheet(data, params.data.id, 'timesheet').subscribe((res: any) => {
  //     this.rowData = res.data;
  //     console.log(res);

  //     if (params.colDef.field === "Approval Status" && params.newValue === "Rejected") {
  //       this.OpenPopup()
  //     }
  //   });
    
  // );




  
  
 
     

console.log(params,'params');

       
      if(this.date = this.dateform.value.datepicker?._d){
        // this.date = this.form.value.datepicker?._d
      
  let formatedDate: any = moment(this.formatedDate).add(10, 'minutes').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
  console.log(formatedDate,'formatedDate');
  console.log(data,'data');

Object.assign(data, { formatedDate: formatedDate}) 
      }
      else{
      
     let formatedDate: any = moment(this.calendarDate).add(10, 'minutes').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
console.log(formatedDate,'formatedDate');
console.log(data,'data');

   Object.assign(data, { formatedDate: formatedDate }) 
       console.log(data,'data');
      }
     

      if (fieldName == "Approval Status" ){

      data[fieldName] = params.value;
      if (params.newValue === "Approved") {
       
        this.columnDefs.forEach((column: any) => {
          if (column.field === 'workedhours' || column.field === 'status') {
            column.editable = false;
          }
        });
      }
    }
    // ! UNDO

      // this.dataService.savetimesheet(data).subscribe((res: any) => {
      //   this.rowData = res.data;
      //   console.log(res);



      //   if (params.colDef.field === "Approval Status" && params.newValue === "Rejected") {
      //     this.OpenPopup(data)
      //   }
      //   this.getData()
      // });


    } else {
      this.dialogService.openSnackBar("You Can not Able to do Time Sheet ", 'ok')
    }
   
   
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
      this.ctrl.butText = 'Save';   //buttons based on the id

      // if (this.ctrl.formAction == 'Edit' && this.ctrl.config.mode == 'page') {
      //   this.ctrl.fields = config.form.fields
      // }
      // else if (this.ctrl.formAction == 'Edit' && this.ctrl.mode == 'popup') {
      //   this.ctrl.model['isEdit'] = true
      //   this.ctrl.model['isshow'] = true
      //   this.ctrl.model['ishide'] = true
      //   this.ctrl.isFormDataLoaded = true
      //   this.ctrl.formAction = this.ctrl.config.formAction || 'Edit';
      //   this.ctrl.isEditMode = true;
      // }
      // this.fields = config.form.fields
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
  
 getData() {
    debugger
     
    console.log(this.userPermissions);
        // ! UNDO

//     if (this.userPermissions === 'SA' || this.userPermissions === 'team lead') {
    
//     this.dataService.getTimesheetdatabyadmin(this.calendarDate).subscribe((res: any) => {
//       let rowData:any = res.data
//       console.log(res,'res');
      
//       this.dataService.workhours(this.calendarDate).subscribe((val:any)=>{
//         let data:any=val.data
//         console.log(val,'val');
        
//         console.log(val.data);
//         if(!isEmpty(data)){
//           rowData.forEach((arr:any)=>{
//             for (let index = 0; index < data.length; index++) {
//               const element = data[index];
//               console.log(element);
              
//               if(element.taskid==arr.task_id){
//                console.log(arr,'asdsdasdasda');
//                 console.log(element.result,'result');
//                 arr.workedhours=element?.result?.workedhours || 0;
//                 arr.status=element?.result?.status;
//                 arr['Approval Status']=element['Approval Status']
//                 arr.remarks=element.result.remarks
//                 console.log(arr);
                
//               }
       
//              }}
//           )
//           console.log(this.rowData);
//  this.rowData=rowData
//         }else{
//           this.rowData=rowData

//         }
//         console.log(this.rowData);

//          // console.log(val,'datasssssss');
        
//       }
//     )}
    
//    ) 
      
//   // this.getsuperadmin();
    
//   }else{
//     let data: any = localStorage.getItem('auth');
//     let name = JSON.parse(data).profile.employeeid
//     this.activatedRoute.params.subscribe(params => {
//       this.calendarDate = params['date'];
//     });
    
    
//     this.dataService.getTimesheetdata(name, this.calendarDate).subscribe((res: any) => {
//       let rowData:any = res.data
//       console.log(res);

//       this.dataService.getworkhours(name,this.calendarDate).subscribe((val:any)=>{
//         console.log(val);
//         let data:any=val.data
//         if(!isEmpty(data)){
//           rowData.forEach((arr:any)=>{
//             for (let index = 0; index < data.length; index++) {
//               const element = data[index];
//               console.log(element);
//               console.log(element.taskid==arr.task_id);
              
//               if(element.taskid==arr.task_id){
//                 arr.workedhours=element?.result?.workedhours || 0;
//                 arr.status=element?.result?.status;
//                 arr['Approval Status']=element['Approval Status']
//                 arr.remarks=element?.result?.remarks
//               }
       
//              }}
//           )
//           console.log(this.rowData);
//  this.rowData=rowData
//  console.log(this.rowData);

//         }else{
//           this.rowData=rowData
//           console.log(this.rowData);

//         }
//          // console.log(val,'datasssssss');
        
//       }
//     )}
    
//    ) }
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
    let name = JSON.parse(data).profile.employeeid
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

    let name = JSON.parse(data1).profile.employeeid
    if(this.date = this.dateform.value.datepicker?._d){
      // this.date = this.form.value.datepicker?._d
    
let formatedDate: any = moment(this.formatedDate).add(10, 'minutes').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
console.log(formatedDate,'formatedDate');
console.log(data,'data');

Object.assign(data, { formatedDate: formatedDate}) 
    }
    else{
    
   let formatedDate: any = moment(this.calendarDate).add(10, 'minutes').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
console.log(formatedDate,'formatedDate');
console.log(data,'data');

 Object.assign(data, { formatedDate: formatedDate }) 
     console.log(data,'data');
    }
    Object.assign(data, { employeeid: name })
        // ! UNDO

    // if (params.data._id) {
    //   this.dataService.updateUnschedule(data, params.data._id).subscribe((res: any) => {
    //     this.listData = res.data;
    //   })
    // } else {
    //   debugger
    //   //  const employeeId = sessionStorage.getItem('employeeid');
    //   //  Object.assign(data, { employeeid: employeeId });

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
    let data: any = localStorage.getItem('auth');
    let name = JSON.parse(data).profile.employeeid
    this.activatedRoute.params.subscribe(params => {
      let date = params['date'];
          // ! UNDO

      // this.dataService.getunschedule(name,date).subscribe((res:any)=>{
      //   this.listData=res.data;
      //   console.log('ii', this.listData)
      // })
    });
     
  }


getsearch(){
  let data: any = localStorage.getItem('auth');
 
  let emp = JSON.parse(data).profile.employeeid
  

  this.date = this.dateform.value.datepicker._d
  let formatedDate = moment(this.date).format('YYYY-MM-DDT00:00:00.000+00:00');
 console.log("search",formatedDate)

    // ! UNDO

  // this.dataService.getunschedule(emp, formatedDate).subscribe((res: any) => {
  //   this.listData = res.data
  //   console.log('yyy', this.listData);
  // }
  // )
}


 

};










































//date picker take 

// this.date = this.form.value.datepicker?._d
      
// let formatedDate: any = moment(this.formatedDate).add(10, 'minutes').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
// console.log(formatedDate,'formatedDate');
// console.log(data,'data');

// Object.assign(data, { formatedDate: formatedDate}) 

// else if(date=this.formatedDate) {
//   this.date = this.form.value.datepicker?._d

//   let formatedDate: any = moment(this.formatedDate).add(10, 'minutes').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
//   console.log(formatedDate,'formatedDate');
// console.log(data,'data');
  
//   Object.assign(data, { formatedDate: formatedDate}) 
// }

// this.date = this.form.value.datepicker?._d
      
// let SelectedDate: any = moment(this.SelectedDate).add(10, 'minutes').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
// console.log(SelectedDate,'formatedDate');
// console.log(data,'data');

// Object.assign(data, { formatedDate: SelectedDate})
// console.log(data,'data');
//////////////////
  
// this.date = this.form.value.datepicker?._d
      
// let SelectedDate: any = moment(this.SelectedDate).add(10, 'minutes').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
// console.log(SelectedDate,'formatedDate');
// console.log(data,'data');

// Object.assign(data, { formatedDate: SelectedDate}) 
//   console.log(data,'data');