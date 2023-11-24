import { GridReadyEvent } from "@ag-grid-community/core/dist/cjs/es5/events";
import { HttpClient } from "@angular/common/http";
import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { JwtHelperService } from "@auth0/angular-jwt";
import { ColDef, FirstDataRenderedEvent, GetRowIdFunc, GetRowIdParams, GridApi, IDetailCellRendererParams } from "ag-grid-community";
import { isEmpty } from "lodash";
import { DashboardService } from "src/app/services/dashboard";
import { DataService } from "src/app/services/data.service";
import { DialogService } from "src/app/services/dialog.service";
import { FormService } from "src/app/services/form.service";
import "ag-grid-enterprise";
import * as moment from "moment";

@Component({
  selector: "app-nestedtables",
  templateUrl: "./nestedtables.component.html",
  styleUrls: ["./nestedtables.component.css"],
})
export class NestedtablesComponent {
  components: any;
  context: any;
  defaultColDef: any;
  rowData: any;
  gridApi!: GridApi;
  OnlyValueRequriementModules: any[] = [];
  ValueToCompareRequriementModules: any[] = [];
  OnlyValueRequriementSprint: any[] = [];
  response: any;
  // sprintCellEditorParams = (params: any) => {
  //   if (params == true || !isEmpty(this.OnlyValueRequriementSprint)) {
  //     console.warn("Data Exist");

  //     return this.OnlyValueRequriementSprint;
  //   } else {
  //     let filer: any = {
  //       start: 0,
  //       end: 1000,
  //       filter: [
  //         {
  //           clause: "AND",
  //           conditions: [
  //             {
  //               column: "project_id",
  //               operator: "EQUALS",
  //               type: "string",
  //               value: this.response.project_id,
  //             },
  //           ],
  //         },
  //       ],
  //     };
  //     this.dataService
  //       .getDataByFilter("sprint", filer)
  //       .subscribe((res: any) => {
  //         if (isEmpty(res.data[0].response)) {
  //           // this.dialogService.openSnackBar("There Were No Sprint To be Found","OK")
  //           return;
  //         }
  //         res.data[0].response.forEach((each: any) => {
  //           // this.ValueToCompareRequriementSprint.push({label:each.name,value:each.id})
  //           this.OnlyValueRequriementSprint.push(each.id);
  //         });
  //       });
  //     return this.OnlyValueRequriementSprint;
  //   }
  // };

  // moduleCellEditorParams = (params: any) => {
  //   if (!isEmpty(this.OnlyValueRequriementModules)) {
  //     console.warn("Data Exists");

  //     return this.OnlyValueRequriementModules;
  //   } else {
  //     console.log("data");

  //     let filer: any = {
  //       start: 0,
  //       end: 1000,
  //       filter: [
  //         {
  //           clause: "AND",
  //           conditions: [
  //             {
  //               column: "project_id",
  //               operator: "EQUALS",
  //               type: "string",
  //               value: this.response.project_id,
  //             },
  //           ],
  //         },
  //       ],
  //     };
  //     this.dataService
  //       .getDataByFilter("modules", filer)
  //       .subscribe((res: any) => {
  //         if (isEmpty(res.data[0].response)) {
  //           this.dialogService.openSnackBar(
  //             "There Were No Modules To be Found",
  //             "OK"
  //           );
  //           return;
  //         }
  //         res.data[0].response.forEach((each: any) => {
  //           // Check if each.modulename is not already in OnlyValueRequriementModules
  //           if (!this.OnlyValueRequriementModules.includes(each.modulename)) {
  //             this.ValueToCompareRequriementModules.push({
  //               label: each.modulename,
  //               value: each.moduleid,
  //             });
  //             this.OnlyValueRequriementModules.push(each.modulename);
  //           }
  //         });
  //       });
  //     if (params == true) {
  //       return this.ValueToCompareRequriementModules;
  //     }
  //     return this.OnlyValueRequriementModules;
  //   }
  // };

  // Sprintvalue: any = this.sprintCellEditorParams;
  // modelvalue: any = this.moduleCellEditorParams;
  public columnDefs: ColDef[] = [
    {
      headerName: "Requirement Name",
      field: "requirement_name",
      width: 40,
      filter: "agTextColumnFilter",
      cellRenderer: 'agGroupCellRenderer'
    },
    {
      headerName: "Sprint Id",
      field: "sprint_id",
      width: 40,
      // editable: true,
      filter: "agNumberColumnFilter",
      cellEditor: "agRichSelectCellEditor",
      // cellEditorParams: {
      //   values: this.Sprintvalue,
      // },
    },
    {
      headerName: "Module Id",
      field: "module_id",
      width: 40,
      // editable: true,
      filter: "agTextColumnFilter",
      cellEditor: "agRichSelectCellEditor",
      // cellEditorParams: {
      //   values: this.modelvalue,
      // },
    },
  ];
  sampleDatatoPush:any={
    group_name:'',
    days:'',
    start_date:'',
    end_date:'',
    depend_task:'',
    employee_id:''
  }
  public detailCellRendererParams: any = {
    detailGridOptions: {
      columnDefs: [
        { headerName: "Group Name", field: "group_name", editable: true },
        {
          headerName: "Days",
          field: "days",
          editable: true,
          cellEditor: "agNumberCellEditor",
          cellEditorParams: {
            min: 0,
            max: 100,
            precision: 2,
          },
        },
        { headerName: "Start Date", field: "start_date", editable: true ,  cellEditor: 'agDateCellEditor',
        cellEditorParams: {
            min: new Date
         }
        },
        { headerName: "End Date", field: "end_date", editable: true },
        { headerName: "Depend Task", field: "depend_task", editable: true },
        { headerName: "Assigned to ", field: "employee_id", editable: true },
      ],
      defaultColDef: {
        flex: 1,
      },
      onCellValueChanged:function(params:any){
        params.context.componentParent.onCellValueChanged(params)
      },
      onSelectionChanged:function(params:any){
        params.context.componentParent.onSelectionChanged(params)
        
      },
      getRowId:function(params:any){
        return params.data[ "_id"]
      }
    },
    getDetailRowData: (params: any) => {
      if(isEmpty(params.data.task)){
        let array:any[]=[]
        array.push(this.sampleDatatoPush)
        params.successCallback(array);

      }else{
      params.successCallback(params.data.task);
    }
    },
  } as IDetailCellRendererParams<any>;
  constructor(
    private dialogService: DialogService,
    private route: ActivatedRoute,
    private dataService: DataService,
    private router: Router
  ) {
    this.components = {
      // buttonRenderer: ButtonComponent
    };
    this.context = { componentParent: this };
    this.detailCellRendererParams.detailGridOptions.context=this.context

  }

  public getRowId: GetRowIdFunc = (params: GetRowIdParams) => `${params.data[ "_id"]}`;

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }



  ngOnInit() {
    this.route.params.subscribe(params => {
      console.log(params);
      this.dataService.getDataById("project",'6554bb7e052126c9587741a5').subscribe((data:any)=>{
        console.log(data);
        this.dataService.lookupTreeData("task_requriment",'testclientID-R1').subscribe((res:any) => {
        console.log(res);
            this.rowData=res.data.response
        })  
      })
      
    })      
  }
  InsideGridApi!:GridApi
  // (selectionChanged)="onSelectionChanged($event)"
  // (cellClicked)='onCellClicked($event)'
  onSelectionChanged(params: any) {
    debugger;
    console.log(params);

    let selectedRows = this.gridApi.getSelectedRows()[0];
  }
  onCellClicked(event: any){
    let clickCell:any=event.column.getColId()
    console.log(clickCell);
  clickCell
    
      }
      onCellValueChanged(params: any) {
        debugger
        console.log(params);
        
        let fieldName = params.colDef.field;
      console.log(params.value);
      
        let data: any = {};
        data[fieldName] = params.value;
        if(fieldName=="days"){
          console.log(data);
          let valueInsertedd:any={}
          valueInsertedd['start_date']= moment().format('DD-MM-YYYY');
          valueInsertedd['end_date']= moment().add(params.value).format('DD-MM-YYYY');

        }
}
}