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
  dateform!:FormGroup
  private gridColumnApi!: ColumnApi;
  groupDefaultExpanded = -1;
  rowData: any[] = [];
  gridApiUnschedule!: GridApi<any>;
  id: any
  valueChanged: any
  ctrl: any
  selectedRow: any
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

  /**gridReady for ag TimeSheet grid */
  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    // this.gridApi.sizeColumnsToFit();
  }
      /**gridReady for ag Unsheduled TimeSheet grid */


  onGridReadys(params: GridReadyEvent) {
    this.gridApiUnschedule = params.api;
    this.gridColumnApi = params.columnApi;
    // this.gridApi.sizeColumnsToFit();
  }
   groupDisplayType:RowGroupingDisplayType = 'groupRows'
  public columnDefs: ColDef[] = [
    {
      headerName: "Project Name",
      field: "project_name",
      editable: false,
      rowGroup: true,
    },
    {
      headerName: "Task Id",
      field: "task_id",
      editable: false,
      width: 96,
      maxWidth:96,
    },
    {
      headerName: "Task Name",
      field: "task_name",
      editable: false,

    },
    {
      headerName: "Start Date",
      field: "scheduled_start_date",
      width: 120,
      maxWidth:120,
      valueFormatter: function (params) {
        let data:any=moment(params.value).startOf('day')
        data.subtract(1,'days')
        
        return moment(data).format('DD/MM/ YYYY')
      },
      
    },
    {
      headerName: "End Date",
      field: "scheduled_end_date",
      editable: false,
      width: 120,
      maxWidth:120,
      valueFormatter: function (params) {
        let data:any=moment(params.value).startOf('day')
        data.subtract(1,'days')
        
        return moment(data).format('DD/MM/ YYYY')
        // console.log( moment(params.value).startOf('day').format('DD/MM/ YYYY'));
        
        // return moment(params.value).startOf('day').format('DD/MM/ YYYY');
      },
     
    },
    {
      headerName: "Allocated Hours",
      field: "allocated_hours",
      editable: false,
    },
    {
      headerName: "Today Worked Hours",
      field: "workedhours",
      
      editable: function (params) {
         
        return params.data["approval_Status"] !== "Approved"  && params.data["status"] !== "Completed";
    }, 
      cellDataType: 'number',
      cellEditor: 'agNumberCellEditor',
      cellEditorParams: {
        min: 1,
        max: 10,
        precision: 0,
      },
      cellStyle: (params) => {
      let timeSheetWorkedHours =parseInt( params.data.totalworkedhours )
      let timeSheetAllocatedHours = params.data.allocated_hours;
      if (!(timeSheetAllocatedHours >= timeSheetWorkedHours)) {
        return { color: 'red' };
      }
      return 
    },
    suppressColumnsToolPanel: true
  },
  

    {
      headerName: "Status",
      field: "status",
      
      
      cellEditor: "agRichSelectCellEditor",
      cellEditorParams: {
        values: ['In Progress', 'Completed', 'Hold', 'Closed'],
      },
      
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
      cellStyle: (params) => {
        if (params.data["approval_Status"] === "Approved") {
          return { color: 'green' };
        } else if (params.data["approval_Status"] === "Rejected") {
          return { color: 'red' };
        }
        return null; // Default styling for other cases
      },
      suppressColumnsToolPanel: true
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
      this.route.routeReuseStrategy.shouldReuseRoute = () => false;
    }



    employee_id:any

 
  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.employee_id = this.helperServices.getEmp_id();
      let role_id: any = this.helperServices.getRole();
      this.calendarDate = params['date']
      this.userPermissions=role_id
      this.dateform = this.fb.group({
       datepicker: this.calendarDate
      });
    });
    this.redefineColdef()
    this.getData();
    this.getUnScheduleData();
     
   
     
      this.maxDate = new Date();
     
  }

  search() {
    debugger
    this.date = this.dateform.value.datepicker._d;
    this.formatedDate = moment(this.date).format('YYYY-MM-DDT00:00:00.000+00:00');
    this.calendarDate = this.formatedDate
    //     // ! UNDO

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
    
    //             if (element.task_id == arr.task_id) {
    //               console.log(arr, 'asdsdasdasda');
    //               console.log(element.result, 'result');
    //               arr.workedhours = element?.result?.workedhours || 0;
    //               arr.status = element?.result?.status;
    //               arr['approval_Status'] = element['approval_Status'];
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
    
    //             if (element.task_id == arr.task_id) {
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
this.route.navigate(['timesheet',this.formatedDate])
// this.getData()
    
   
  //  this.getsearch()
    //this.getUnScheduleData()
    //this.getDataUnschedule();
    // this.redefineColdef()
    // this.OpenPopup();
  }

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
        editable: false,
        headerCheckboxSelection: true,
        checkboxSelection: true,      
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
   data['assigned_to'] = this.selectedRow1[i].assigned_to

   data['ref_id'] = this.selectedRow1[i].id
data['approval_Status'] =  "Approved"


  
if(this.date = this.dateform.value.datepicker?._d){
  // this.date = this.form.value.datepicker?._d

let formatedDate: any = moment(this.formatedDate).add(10, 'minutes').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
Object.assign(data, { formatedDate: formatedDate}) 
}
else{

let formatedDate: any = moment(this.calendarDate).add(10, 'minutes').format('YYYY-MM-DDTHH:mm:ss.SSSZ');

Object.assign(data, { formatedDate: formatedDate }) 
}


    // ! UNDO

this.dataService.savetimesheet(data).subscribe((res: any) => {
  this.rowData = res.data;
this.getData()

});

   } 
  //  this.selectedRow1
  }

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



      debugger
      let fieldName = params.colDef.field;
      this.valueChanged = params.value;
      let data: any = {};
      data['assigned_to'] = params.data.assigned_to;
        data['task_id'] = params.data.task_id;
        data['ref_id'] = params.data.id;
        // data['created_on'] = date
        data[fieldName] = params.value;
     
        if (fieldName === "workedhours") {
          let timeSheetWorkedHours =parseInt( params.data.totalworkedhours )+ params.value;
          let timeSheetAllocatedHours = params.data.allocated_hours;
          
          // this.gridApi.forEachNodeAfterFilterAndSort(function (rowNode, index) {
          //   // only do first 2
          //   if (index >= 2) {
          //     return;
          //   }
          //   const data = rowNode.data;
          //   data.price = Math.floor(Math.random() * 20000 + 20000);
          //   itemsToUpdate.push(data);
          // });
          // const res = this.gridApi.applyTransaction({ update: itemsToUpdate })!;
          // ! To Check the total Wored Hours is Lesser than the Allocated Hours
      
          if (!(timeSheetAllocatedHours >= timeSheetWorkedHours)) {
            let maxTime:any=timeSheetAllocatedHours-timeSheetWorkedHours
            this.dialogService.openSnackBar(`The Time You Enter Is More than Allocated Hours${maxTime} `,"OK")
            let alldata:any=params.data
            alldata["workedhours"]=params.oldValue
            let data:RowDataTransaction={
             addIndex:params.node.rowIndex,
             update:[alldata]
            }
            this.gridApi.applyTransaction(data)
            return;
          }
          
        
        }
      if(this.date == this.dateform.value.datepicker?._d){      
  let formatedDate: any = moment(this.formatedDate).add(10, 'minutes').format('YYYY-MM-DDTHH:mm:ss.SSSZ');

Object.assign(data, { formatedDate: formatedDate}) 
      }
      else{
      
     let formatedDate: any = moment(this.calendarDate).add(10, 'minutes').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
   Object.assign(data, { formatedDate: formatedDate }) 
      }
     

      if (fieldName == "approval_Status" ){

      data[fieldName] = params.value;
      if (params.newValue === "Approved") {
       
        this.columnDefs.forEach((column: any) => {
          if (column.field === 'workedhours' || column.field === 'status') {
            column.editable = false;
          }
        });
      }
    }
    if(fieldName=="workedhours"&& params.data["status"]=="Closed"){
      data.status="In Progress"
      
    }

    // ! UNDO

      this.dataService.savetimesheet(data).subscribe((res: any) => {
        this.rowData = res.data;


        if (params.colDef.field === "approval_Status" && params.newValue === "Rejected") {
          this.OpenPopup(data)
        }
        this.getData()
      });


    // } else {
    //   this.dialogService.openSnackBar("You Can not Able to do Time Sheet ", 'ok')
    // }
   
   
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

    if (this.userPermissions === 'SA' || this.userPermissions === 'team lead') {
    
    this.dataService.getTimesheetdatabyadmin(this.calendarDate).subscribe((res: any) => {
      let rowData:any = res.data
      
      this.dataService.workhours(this.calendarDate).subscribe((val:any)=>{
        let data:any=val.data
        if(!isEmpty(data)){
          rowData.forEach((arr:any)=>{
            for (let index = 0; index < data.length; index++) {
              const element = data[index];
              if(element.task_id==arr.task_id){
                arr.workedhours=element?.result?.workedhours || 0;
                arr.status=element?.result?.status;
                arr['approval_Status']=element['approval_Status']
                arr.remarks=element.result.remarks
              }
             }}
          )
 this.rowData=rowData
this.gridApi.sizeColumnsToFit()

        }else{
          this.rowData=rowData
          this.gridApi.sizeColumnsToFit()

        }

         // console.log(val,'datasssssss');
        
      }
    )}
    
   ) 
      
  // this.getsuperadmin();
    
  }else{

    this.activatedRoute.params.subscribe(params => {
      this.calendarDate = params['date'];
    });
    
    
    this.dataService.getTimesheetdata(this.employee_id, this.calendarDate).subscribe((res: any) => {
      let rowData:any = res.data
      this.dataService.getworkhours(this.employee_id,this.calendarDate).subscribe((val:any)=>{
        let data:any=val.data
          rowData.forEach((arr:any)=>{
            
            // console.log('scheduled_start_date',arr.scheduled_start_date);
            // console.log('scheduled_end_date',arr.scheduled_end_date);
            // console.log("this.calendarDate",this.calendarDate);
            // console.log(0>=(moment(this.calendarDate).diff(arr.scheduled_start_date,'days')));
            // // console.log(0<=(moment(this.calendarDate).diff(arr.scheduled_end_date,'days')));
            // console.log(0>=(moment(this.calendarDate).diff(arr.scheduled_end_date,'days')));
            // if(!(0>=(moment(this.calendarDate).diff(arr.scheduled_end_date,'days')))){
            //   arr.task_status="Not Completed"
            // }else{
            //   arr.task_status="On Going"
            // }

            // else if( )

        if(!isEmpty(data)){
            
            for (let index = 0; index < data.length; index++) {
              const element = data[index];
              
              if(element.task_id==arr.task_id){
                arr.workedhours=element?.result?.workedhours || 0;
                arr.status=element?.result?.status;
                arr['approval_Status']=element['approval_Status']
                arr.remarks=element?.result?.remarks
              }
            }
             }}
          )
 this.rowData=rowData
this.gridApi.sizeColumnsToFit()
        // }else{
        //   this.rowData=rowData
        //   this.gridApi.sizeColumnsToFit()

        // }
         // console.log(val,'datasssssss');
        
      }
    )}
    
   ) }
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
    if(this.date = this.dateform.value.datepicker?._d){
      // this.date = this.form.value.datepicker?._d
    
let formatedDate: any = moment(this.formatedDate).add(10, 'minutes').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
Object.assign(data, { formatedDate: formatedDate}) 
    }
    else{
    
   let formatedDate: any = moment(this.calendarDate).add(10, 'minutes').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
 Object.assign(data, { formatedDate: formatedDate }) 
    }
    Object.assign(data, { assigned_to: name })
        // ! UNDO

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
    this.activatedRoute.params.subscribe(params => {
      let date = params['date'];
          // ! UNDO

      // this.dataService.getunschedule(name,date).subscribe((res:any)=>{
      //   this.listData=res.data;
      //   console.log('ii', this.listData)
      // })
    });
     
  }


// getsearch(){
//   let data: any = localStorage.getItem('auth');
 
//   let emp = JSON.parse(data).profile.assigned_to
  

//   this.date = this.dateform.value.datepicker._d
//   let formatedDate = moment(this.date).format('YYYY-MM-DDT00:00:00.000+00:00');
//  console.log("search",formatedDate)

//     // ! UNDO

//   // this.dataService.getunschedule(emp, formatedDate).subscribe((res: any) => {
//   //   this.listData = res.data
//   //   console.log('yyy', this.listData);
//   // }
//   // )
// }


 

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