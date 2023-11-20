import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ColDef, GridApi, IDetailCellRendererParams } from 'ag-grid-community';
import { Icon } from 'leaflet';
import { DashboardService } from 'src/app/services/dashboard';
import { DataService } from 'src/app/services/data.service';
import { DialogService } from 'src/app/services/dialog.service';
import { FormService } from 'src/app/services/form.service';

@Component({
  selector: 'app-nestedtables',
  templateUrl: './nestedtables.component.html',
  styleUrls: ['./nestedtables.component.css']
})
export class NestedtablesComponent {
  components:any
  context: any;
  defaultColDef:any
  rowData: any
  gridApi!:GridApi
    public columnDefs: ColDef[] = [
    // group cell renderer needed for expand / collapse icons
    { 
      headerName: "Facility Name",field: '_id', cellRenderer: 'agGroupCellRenderer' },
    { 
      headerName: "Facility Type",field: 'facility_type' },
  ];
  // public defaultColDef2: ColDef = {
  //   flex: 1,
  // };
  public detailCellRendererParams: any = {
    detailGridOptions: {
      columnDefs: [
        { 
          headerName: "Device Name",field: 'device_name' },
        { 
          headerName: "Installed on",field: 'installed_on' },
        {
          headerName: "Status", field: 'status', minWidth: 150 },
          {headerName: "Device Health",field: 'last_ping',cellRenderer: Icon}
      ],
      defaultColDef: {
        flex: 1,
      },
    },
    getDetailRowData: (params:any) => {
      params.successCallback(params.data.device);
    },
  } as IDetailCellRendererParams<any>;
constructor(
    private dialogService: DialogService,
    private route: ActivatedRoute,
    private dataService: DataService,
    private formservice: FormService,
    private jwtService: JwtHelperService,
    private router: Router
  ) {
    this.components = {
      // buttonRenderer: ButtonComponent
    };
    this.context = { componentParent: this };

  }
  onGridReady(params: any) {
    this.gridApi = params.api;
    // this.gridColumnApi = params.columnApi;
    this.gridApi.sizeColumnsToFit();
  }

  onSelectionChanged(params: any) {
    debugger
    console.log(params);
    
     let selectedRows= this.gridApi.getSelectedRows()[0];

    console.log("hiiii",selectedRows)
  }
}
