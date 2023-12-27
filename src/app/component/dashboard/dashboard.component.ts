import { HttpClient } from '@angular/common/http';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { GridApi, ColumnApi, ColDef, ColGroupDef, GetDataPath, GridReadyEvent, FirstDataRenderedEvent, IDetailCellRendererParams } from 'ag-grid-community';
import * as moment from 'moment';
import { DashboardService } from 'src/app/services/dashboard';
import { DataService } from 'src/app/services/data.service';
import { DialogService } from 'src/app/services/dialog.service';
import { FormService } from 'src/app/services/form.service';
import "ag-grid-enterprise";
import { Icon } from './icon';
import { Color, id, ScaleType } from "@swimlane/ngx-charts";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  // form = new FormGroup({});
  // gridApi!: GridApi<any>;
  // private gridColumnApi!: ColumnApi;
  // rowSelected: any[] = [];
  // selectedModel: any = {};
  // public listData: any[] = [];
  // public rowData: any[] = [];
  // groupDefaultExpanded = -1;
  // data: any[] = [];
  // selectedRows: any[] = [];
  // components: any;
  // context: any;
  // fields: any;
  // config: any;
  // @ViewChild("editViewPopup", { static: true })
  // editViewPopup!: TemplateRef<any>;
  // pageHeading: any;
  // id: any;
  view: any = [1865, 200];
  colorScheme = {
    domain: ["#F79554", "#F34526", "#57DE21", "#76B3FE"],
    name: "myScheme",
    selectable: false,
    group: ScaleType.Ordinal,
  };
  cardColor: string = "black";
  cardData: any[] = []
  // // columnDefs: (ColDef | ColGroupDef)[] = [
  // //   {
  // //     headerName: "Facilty Name",
  // //     field: "facility_id",
  // //     width: 40,
  // //     filter: "agTextColumnFilter",
  // //     hide: true,
  // //   },
  // //   {
  // //     headerName: "device Name",
  // //     field: "device_name",
  // //     width: 40,
  // //     filter: "agTextColumnFilter",
  // //     rowGroup: true,
  // //     hide: true,
  // //   },
  // //   {
  // //     headerName: "status",
  // //     field: "status",
  // //     width: 40,
  // //     filter: "agTextColumnFilter",
  // //     hide: true,
  // //   },
  // // ];
  // // //! row group
  // // columnDef1: (ColDef | ColGroupDef)[] = [
  // //   {
  // //     headerName: "Facility Name",
  // //     field: "_id",
  // //     width: 40,
  // //     filter: "agTextColumnFilter",
  // //     rowGroup: true,
  // //   },
  // //   {
  // //     headerName: "Facility Name",
  // //     field: "facility_id",
  // //     width: 40,
  // //     filter: "agTextColumnFilter",
  // //     rowGroup: true, 
  // //   },
  // //   {
  // //     headerName: "status Name",
  // //     field: "status",
  // //     width: 40,
  // //     filter: "agTextColumnFilter",
  // //   },
  // // ];

  // public columnDefs: ColDef[] = [
  //   // group cell renderer needed for expand / collapse icons
  //   { 
  //     headerName: "Facility Name",field: '_id', cellRenderer: 'agGroupCellRenderer' },
  //   { 
  //     headerName: "Facility Type",field: 'facility_type' },
  // ];
  // // public defaultColDef2: ColDef = {
  // //   flex: 1,
  // // };
  // public detailCellRendererParams: any = {
  //   detailGridOptions: {
  //     columnDefs: [
  //       { 
  //         headerName: "Device Name",field: 'device_name' },
  //       { 
  //         headerName: "Installed on",field: 'installed_on' },
  //       {
  //         headerName: "Status", field: 'status', minWidth: 150 },
  //         {headerName: "Device Health",field: 'last_ping',cellRenderer: Icon}
  //     ],
  //     defaultColDef: {
  //       flex: 1,
  //     },
  //   },
  //   getDetailRowData: (params:any) => {
  //     params.successCallback(params.data.device);
  //   },
  // } as IDetailCellRendererParams<any>;

  constructor(
    private httpclient: HttpClient,
    private dialogService: DialogService,
    private route: ActivatedRoute,
    private dataService: DataService,
    private formservice: FormService,
    public dashboardService: DashboardService,
    private jwtService: JwtHelperService,
    private router: Router
  ) {}
DashboardType:any
id:any
  data: any[] = []
  ngOnInit() {
    this.route.params.subscribe((params:any)=>{
      console.log(params['Type']);
      this.DashboardType=params['Type']
      this.id=params['id'] 
    })
    this.data = [
      {
        count: "8",
        text: "Task Count",
        icon: "folder",
        type: "icon",
        iconColor: "",
        altText: "altText",
        height: "300",
        width: "auto",
        backgroundColor: "transparent",
      },
      {
        count: "5",
        text: "Test Case Count",
        icon: "cloud_upload",
        iconColor: "",
        altText: "altText",
        height: "300",
        width: "auto",
        backgroundColor: "transparent",
      },
      {
        count: "55",
        text: "Bug List",
        icon: "bug_report",
        iconColor: "black",
        altText: "altText",
        height: "300",
        width: "auto",
        backgroundColor: "transparent",
      },
      {
        count: "44",
        text: "Requriement Count",
        icon: "developer_board",
        iconColor: "",
        altText: "altText",
        height: "300",
        width: "auto",
        backgroundColor: "transparent",
      },
      {
        count: "44",
        text: "Task Count",
        icon: "headset_mic",
        iconColor: "",
        altText: "altText",
        height: "300",
        width: "auto",
        backgroundColor: "transparent",
      },
      // { count: '', text: "", icon: '', iconColor: '', altText: 'altText', height: '', width: '', backgroundColor: '' },
    ];
    // this.route.params.subscribe((params) => {
    //   this.id = params["id"];
    // });
    //! row group
    // this.dataService.getData("device").subscribe((data:any)=>{
    //   console.log(data);
    //   let dataas:any=data.data
    // this.dataService.getData('facility').subscribe((data1:any)=>{
    //   console.log(data1);
    //   let facility=data1.datay
    //   this.rowData=[...dataas,...facility]
    // })  
    // })

    // let orgid:any=this.dataService.getdetails().
    // let org_id:any = this.dataService.getdetails().profile.org_id
    // this.dataService.lookup('').subscribe((xyz:any)=>{
    //   if(xyz.data!=null)
    //   {
    //     let totalDevicesCount:any=0

    //     for (let dataIndex = 0; dataIndex < xyz.data.length; dataIndex++) {
    //     const element = xyz.data[dataIndex].device;
    //     totalDevicesCount=totalDevicesCount+element.length
    //   }
    //   this.cardData=[
    //     {
    //     id: "Requeriement",
    //     name: "Requeriement",
    //     value: xyz.data.length,
    //     },
    //     {
    //     id: "Test Case Postive",
    //     name: "Test Case",
    //     value: totalDevicesCount,
    //     },
    //     {
    //     id: "Test Result",
    //     name: "Test Result",
    //     value: "4",
    //     },
    //     {
    //     id: "Test Case",
    //     name: "Test Case",
    //     value: totalDevicesCount,
    //     },
    //     {
    //     id: "Test Result",
    //     name: "Test Result",
    //     value: "4",
    //     },
    //     {
    //     id: "Test Case",
    //     name: "Test Case",
    //     value: totalDevicesCount,
    //     },
    //     {
    //     id: "Test Result",
    //     name: "Test Result",
    //     value: "4",
    //     }
    //     ];
    //   // this.rowData=xyz.data
    //   //! this.getTreeData(xyz.data) // treedata
    // }else{
    //   this.cardData=[
    //     {
    //     id: "Facility",
    //     name: "Facility",
    //     value: 0,
    //     },
    //     {
    //     id: "Devices",
    //     name: "Devices",
    //     value: 0,
    //     },
    //     {
    //     id: "Employee Health",
    //     name: "Employee Health",
    //     value: 0,
    //     }
    //     ];
    // }
    // })
  }

  // // public autoGroupColumnDef: ColDef = {
  // //   headerName: "Facility Name",
  // //   minWidth: 200,
  // // };

  // public defaultColDef: ColDef = {
  //   flex: 1,
  //   minWidth: 100,
  //   sortable: true,
  //   resizable: true,
  //   filter: true,
  // };


  // //! ** treepath  for ag grid */
  // // public getTreePath: GetDataPath = (data: any) => {
  // //   console.log(data);

  // //   return data.treePath;
  // // };

  // // getTreeData(res: any) {
  // //   this.listData = [];
  // //   let array = res;
  // //   for (let index = 0; index < array.length; index++) {
  // //     let val: any[] = [array[index]._id];

  // //     let facility: any[] = array[index]._id;
  // //     this.listData.push(val);

  // //     let device: any = array[index].device;

  // //     if (Array.isArray(device)) {
  // //       if (device.length != 0) {
  // //         for (let index1 = 0; index1 < device.length; index1++) {
  // //           let devicedata: any = device[index1];
  // //           if (index1 == 0) {
  // //             let valas: any[] = [facility, "Devices"];
  // //             this.listData.push(valas);
  // //           }
  // //           devicedata.treePath = [facility, "Devices", devicedata.device_name];
  // //           this.listData.push(devicedata);
  // //         }
  // //       } 
  // //     }
  // //   }
  // //   console.log(this.listData);

  // // }

  onSelectionChanged(params: any) {

    if (params.name == "Facility") {
      let data: any = this.dataService.getdetails().profile.org_id

      this.router.navigate([`data/edit/facility/` + data]);

    } else if (params.name == "Devices") {
      this.router.navigate([`list/device`]);

    } else {
      // this.router.navigate([`data/edit/facility/SA`]);

    }

  }

  // /**gridReady for ag grid */
  // onGridReady(params: GridReadyEvent) {
  //   this.gridApi = params.api;
  //   this.gridColumnApi = params.columnApi;
  //   this.gridApi.sizeColumnsToFit();
  // }



  // // onAddButonClick(ctrl: any) {
  // //   ;
  // //   this.dialogService.openDialog(this.editViewPopup, "50%", null, {});
  // //   this.httpclient
  // //     .get("assets/jsons/modules-form.json")
  // //     .subscribe(async (config: any) => {
  // //       this.config = config;
  // //       this.fields = config.form.fields;
  // //       this.pageHeading = config.pageHeading;
  // //       ctrl.config = config;
  // //       ctrl.collectionName = config.form.collectionName;
  // //       ctrl.formAction = "Add";
  // //       ctrl.butText = "Save"; //buttons based on the id

  // //       if (ctrl.formAction == "Edit" && ctrl.config.mode == "page") {
  // //         ctrl.fields = config.form.fields;
  // //       } else if (ctrl.formAction == "Edit" && ctrl.mode == "popup") {
  // //         ctrl.model["isEdit"] = true;
  // //         ctrl.model["isshow"] = true;
  // //         ctrl.model["ishide"] = true;
  // //         ctrl.isFormDataLoaded = true;
  // //         ctrl.formAction = ctrl.config.formAction || "Edit";
  // //         ctrl.isEditMode = true;
  // //       }
  // //       this.fields = config.form.fields;
  // //     });
  // // }

  // // getUserPermission() {
  // //   let token = sessionStorage.getItem("token") || "";
  // //   let jwtParseToken = this.jwtService.decodeToken(token);
  // //   // this.userPermissions = jwtParseToken?.role;
  // // }


}
