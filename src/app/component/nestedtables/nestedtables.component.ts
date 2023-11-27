import { GridReadyEvent } from "@ag-grid-community/core/dist/cjs/es5/events";
import { HttpClient } from "@angular/common/http";
import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { JwtHelperService } from "@auth0/angular-jwt";
import {
  ColDef,
  FirstDataRenderedEvent,
  GetRowIdFunc,
  GetRowIdParams,
  GridApi,
  IDetailCellRendererParams,
  RowGroupingDisplayType,
} from "ag-grid-community";
import { concat, isEmpty } from "lodash";
import { DashboardService } from "src/app/services/dashboard";
import { DataService } from "src/app/services/data.service";
import { DialogService } from "src/app/services/dialog.service";
import { FormService } from "src/app/services/form.service";
import "ag-grid-enterprise";
import * as moment from "moment";
import { v4 as uuidv4 } from "uuid";
import { ButtonComponent } from "../aggrid-tree/button";

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

  // public columnDefs: ColDef[] = [
  //   {
  //     headerName: "Requirement Name",
  //     field: "requirement_name",
  //     width: 40,
  //     filter: "agTextColumnFilter",
  //     cellRenderer: "agGroupCellRenderer",
  //   },
  //   {
  //     headerName: "Sprint Id",
  //     field: "sprint_id",
  //     width: 40,
  //     // editable: true,
  //     filter: "agNumberColumnFilter",
  //     cellEditor: "agRichSelectCellEditor",
  //     // cellEditorParams: {
  //     //   values: this.Sprintvalue,
  //     // },
  //   },
  //   {
  //     headerName: "Module Id",
  //     field: "module_id",
  //     width: 40,
  //     // editable: true,
  //     filter: "agTextColumnFilter",
  //     cellEditor: "agRichSelectCellEditor",
  //     // cellEditorParams: {
  //     //   values: this.modelvalue,
  //     // },
  //   },
  // ];

  // public detailCellRendererParams: any = {
  //   detailGridOptions: {
  //     columnDefs: [
  //       {
  //         headerName: "Task Id",
  //         cellDataType: "number",
  //         field: "_id",
  //         editable: false,
  //         sortable: true,
  //       },
  //       {
  //         headerName: "Group Name",
  //         cellDataType: "text",
  //         field: "group_name",
  //         editable: true,
  //       },
  //       {
  //         headerName: "Days",
  //         field: "days",
  //         editable: true,
  //         cellDataType: "number",
  //         cellEditor: "agNumberCellEditor",
  //         cellEditorParams: {
  //           min: 0,
  //           max: 100,
  //           precision: 2,
  //         },
  //       },
  //       {
  //         headerName: "Start Date",
  //         cellDataType: "date",
  //         field: "start_date",
  //         editable: true,
  //         cellEditor: "agDateCellEditor",
  //         // cellEditorParams: {
  //         //     min: moment
  //         //  }
  //         valueFormatter: function (params: any) {
  //           if (params.value) {
  //             console.log(params.value);

  //             return params.value.format("DD-MM-YYYY");
  //           }
  //         },
  //       },
  //       {
  //         headerName: "End Date",
  //         cellDataType: "date",
  //         field: "end_date",
  //         editable: true,
  //         valueFormatter: function (params: any) {
  //           if (params.value) {
  //             return params.value.format("DD-MM-YYYY");
  //           }
  //         },
  //       },
  //       {
  //         headerName: "Depend Task",
  //         cellDataType: "text",
  //         field: "depend_task",
  //         editable: true,
  //       },
  //       {
  //         headerName: "Assigned to ",
  //         field: "employee_id",
  //         cellDataType: "text",
  //         editable: true,
  //       },
  //     ],
  //     defaultColDef: {
  //       flex: 1,
  //     },
  //     onCellValueChanged: function (params: any) {
  //       params.context.componentParent.onCellValueChanged(params);
  //     },
  //     onSelectionChanged: function (params: any) {
  //       params.context.componentParent.onSelectionChanged(params);
  //     },
  //     getRowId: function (params: any) {
  //       return params.data["_id"];
  //     },
  //   },
  //   getDetailRowData: (params: any) => {
  //     console.log(params);

  //     if (isEmpty(params.data.task)) {
  //       let array: any[] = [];
  //       array.push({
  //         _id: params.node.rowIndex,
  //         group_name: "a",
  //         depend_task: "",
  //         employee_id: "",
  //       });
  //       params.successCallback(array);
  //     } else {
  //       params.successCallback(params.data.task);
  //     }
  //   },
  // } as IDetailCellRendererParams<any>;
  constructor(
    private dialogService: DialogService,
    private route: ActivatedRoute,
    private dataService: DataService,
    private router: Router
  ) {
    this.components = {
      buttonRenderer: ButtonComponent
    }
    this.context = { componentParent: this };
    // this.detailCellRendererParams.detailGridOptions.context = this.context;
  }
  public RowgetRowId: GetRowIdFunc = (params: GetRowIdParams) =>
    `${params.data["_id"]}`;

  RowonGridReady(params: any) {
    this.RowGoupFridApi = params.api;
    this.RowGoupFridApi.sizeColumnsToFit();
  }
  RowGoupFridApi!: GridApi;
  listdata: any[] = [];
  public autoGroupColumnDef: ColDef = {};
  public groupDisplayType: RowGroupingDisplayType = "groupRows";
  public groupDefs: ColDef[] = [
    {
      headerName: "Requirement Name",
      field: "requirement_name",
      width: 40,
      filter: "agTextColumnFilter",
      cellRenderer: "agGroupCellRenderer",
      rowGroup: true,
      showRowGroup: false,
      hide: true,
    },
    {
      headerName: "Task Id",
      field: "task_id",
      cellDataType: "number",

      valueFormatter: function (parms:any){
        return parms?.node?.index
      },
      editable: false,
      sortable: true,
    },
    {
      headerName: "Group Name",
      cellDataType: "text",
      field: "group_name",
      editable: true,
    },
    {
      headerName: "Days",
      field: "days",
      editable: true,
      cellDataType: "number",
      cellEditor: "agNumberCellEditor",
      cellEditorParams: {
        min: 0,
        max: 100,
        precision: 2,
      },
    },
    {
      headerName: "Start Date",
      cellDataType: "date",
      field: "start_date",
      editable: true,
      cellEditor: "agDateCellEditor",
      // cellEditorParams: {
      //     min: moment
      //  }
      valueFormatter: function (params: any) {
        if (params.value) {
          console.log(params.value);

          return params.value.format("DD-MM-YYYY");
        }
      },
    },
    {
      headerName: "End Date",
      cellDataType: "date",
      field: "end_date",
      editable: true,
      valueFormatter: function (params: any) {
        if (params.value) {
          return params.value.format("DD-MM-YYYY");
        }
      },
    },
    {
      headerName: "Depend Task",
      cellDataType: "text",
      field: "depend_task",
      editable: true,
    },
    {
      headerName: "Assigned to ",
      field: "employee_id",
      cellDataType: "text",
      editable: true,
    },{

      field: 'Action',
      width: 40,
      sortable:false,
      filter:false,
      cellRenderer: 'buttonRenderer'
  
    }
  ];
  ngOnInit() {
    this.route.params.subscribe((params) => {
      console.log(params);
      this.dataService
        .getDataById("project", "6554bb7e052126c9587741a5")
        .subscribe((data: any) => {
          console.log(data);
          this.dataService
            .lookupTreeData("task_requriment", "testclientID-R1")
            .subscribe((res: any) => {
              console.log(res);
              this.rowData = res.data.response;
              // this.GroupRow(res.data.response);
            });
          
        });
    });
  }

  GroupRow(data: any) {
    let taskValue: any[] = [];
    let parentvalue: any[] = [];
    data.map((res: any, index: any) => {
      parentvalue.push(res);
      if (!isEmpty(res.task)) {
        taskValue.push(res.task);
      }
      delete parentvalue[index].task;
    });
    this.listdata = concat(parentvalue, taskValue);
  }

  onSelectionChanged(params: any) {
    debugger;

    let selectedRows = this.gridApi.getSelectedRows()[0];
  }
  onCellClicked(event: any) {
    let clickCell: any = event.column.getColId();
    console.log(clickCell);
    clickCell;
  }
  onCellValueChanged(params: any) {
    debugger;
    console.log(params);

    let fieldName = params.colDef.field;
    console.log(params.value);

    let data: any = {};
    data[fieldName] = params.value;
    if (fieldName == "days") {
      console.log(data);
      params.data["start_date"] = moment();
      params.data["end_date"] = moment().add(params.value, "day");
      console.log(params.data);
      const result = params.api.applyTransaction({ update: [params.data] });
      console.log(result);
      this.TaskIdChange()
    }
  }

  
  addOneColumnBelow(params:any){

  }

TaskIdChange(params?: any) {
this.gridApi.forEachLeafNode((res:any)=>{
  console.log(res);
  
  console.log(res.data);
  
})
}
  rowonSelectionChanged(params: any) {
    debugger;

    let selectedRows = this.RowGoupFridApi.getSelectedRows()[0];
    console.log(selectedRows);
    
  }
  rowonCellClicked(event: any) {
    let clickCell: any = event.column.getColId();
    console.log(clickCell);
    clickCell;
  }
  
  rowonCellValueChanged(params: any) {
    debugger;
    console.log(params);

    let fieldName = params.colDef.field;
    console.log(params.value);

    let data: any = {};
    data[fieldName] = params.value;
    if (fieldName == "days") {
      console.log(data);
      params.data["start_date"] = moment();
      params.data["end_date"] = moment().add(params.value, "day");
      console.log(params.data);
      const result = params.api.applyTransaction({ update: [params.data] });
      console.log(result);
      this.TaskIdChange()
    }
  }
}
