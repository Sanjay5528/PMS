import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RowGroupingDisplayType, ColDef, ColGroupDef, GridApi, GridReadyEvent, FirstDataRenderedEvent } from 'ag-grid-community';

import { DialogService } from 'src/app/services/dialog.service';
import { HelperService } from 'src/app/services/helper.service';
// import { CellComponent } from '../accessright/radiobutton';
import { DataService } from 'src/app/services/data.service';
import { isEmpty } from 'lodash';
import { viewCellComponent } from './view-button';
import { CellComponent } from '../accessright/radiobutton';

@Component({
  selector: 'app-individual-access',
  templateUrl: './individual-access.component.html',
  styleUrls: ['./individual-access.component.css']
})
export class IndividualAccessComponent {
  Viewdata: any;
  context: any;
  components: any;
  groupDisplayType: RowGroupingDisplayType = 'groupRows';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private DataService: DataService,
    public dialogService: DialogService,
    private helperService: HelperService
  ) {
    this.context = { componentParent: this };
    this.components = {
      buttonRenderer: CellComponent,
    };
  }

  columnDefs: (ColDef | ColGroupDef)[] = [
    {
      headerName: 'Model Name',
      field: 'model_name',
      width: 40,
      filter: 'agTextColumnFilter',
      rowGroup: true,
      hide: true,
    },
    {
      headerName: 'Field Name',
      field: 'column_name',
      width: 40,
    },
    {
      headerName: 'ACL',
      field: 'acl',
      cellRenderer: CellComponent,
    },
  ];

  defaultColDef: ColDef = {
    flex: 1,
    minWidth: 100,
    sortable: true,
    resizable: true,
    filter: true,
  };

  gridApi!: GridApi;
  rowData: any[] = [];

  ngOnInit() {
    this.route.params.subscribe((params: any) => {
      this.DataService.getDataById('organisation', params.id).subscribe((res: any) => {   
        console.log(res);
             
        this.Viewdata = res.data[0];
        const filterCondition1 = {filter:[{
          clause: 'AND',
          conditions: [
            // { column: 'acl', operator: 'NOTEQUAL', value: 'N' },
            // { column: 'org_type', operator: 'EQUALS', value: res.data[0].org_type },
            { column: 'org_id', operator: 'EQUALS', type:'string',value: res.data[0]._id }
            
          ]
        }]};
        this.DataService.getDataByFilter('org_data_acl', filterCondition1).subscribe((xyz: any) => {
          console.log(xyz.data);
          // const filterCondition = [{
          //   clause: 'AND',
          //   conditions: [
          //     { column: 'acl', operator: 'NOTEQUAL', value: 'N' },
          //     { column: 'org_type', operator: 'EQUALS', value: res.data[0].org_type }
              
          //   ]
          // }];
          // const filteredData: any[] = xyz.data;
          this.rowData=xyz.data[0].response
          // if (isEmpty(filteredData)) {
            
          //   for (let index = 0; index < filteredData.length; index++) {
          //     const vals = filteredData[index];
          //     if (element._id === vals.model_ref_id) {
          //       let data: any = {
          //         model_ref_id: vals._id,
          //         column_name: vals.column_name,
          //         model_name: vals.model_name,
          //         acl: vals.acl,
          //       };
          //       filteredModelData.push(data);
          //       matchFound = true;
          //       break;
          //     }
          //   }
            
          // }
          // this.DataService.getData('org_type_data_acl')
          // this.DataService.getDataByFilter('org_type_data_acl', filterCondition).subscribe((res1: any) => {
          // console.log(res1.data);

          //   const modelData: any[] = res1.data;
          //   const filteredModelData: any[] = [];

          //   modelData.forEach((element: any) => {
          //     let matchFound = false;

          //     if (isEmpty(filteredData)) {
          //       if (element.column_name && element.model_name) {
          //         let data: any = {
          //           model_ref_id: element._id,
          //           column_name: element.column_name,
          //           model_name: element.model_name,
          //           acl: null,
          //         };
          //         filteredModelData.push(data);
          //       }
          //     } else {
          //       for (let index = 0; index < filteredData.length; index++) {
          //         const vals = filteredData[index];
          //         if (element._id === vals.model_ref_id) {
          //           let data: any = {
          //             model_ref_id: vals._id,
          //             column_name: vals.column_name,
          //             model_name: vals.model_name,
          //             acl: vals.acl,
          //           };
          //           filteredModelData.push(data);
          //           matchFound = true;
          //           break;
          //         }
          //       }
          //       if (!matchFound) {
          //         if (element.column_name && element.model_name) {
          //           let data: any = {
          //             model_ref_id: element._id,
          //             column_name: element.column_name,
          //             model_name: element.model_name,
          //             acl: null,
          //           };
          //           filteredModelData.push(data);
          //         }
          //       }
          //     }
          //   });

          //   this.rowData = filteredModelData;
          // });
        });
      });
    });
  }

  onGridReady(params: GridReadyEvent<any>) {
    this.gridApi = params.api;
  }

  onFirstDataRendered(params: FirstDataRenderedEvent) {
    params.api.sizeColumnsToFit();
  }

  onSelectionChanged(params: any) {
    let selectedRows = this.gridApi.getSelectedRows();
    // this.router.navigate([`details/${selectedRows[0]._id}`]);
  }

  onActionButtonClick(item: any, rowDatas: any) {
    let data: any = {
      model_ref_id: rowDatas.model_ref_id,
      column_name: rowDatas.column_name,
      model_name: rowDatas.model_name,
      org_type: this.Viewdata.org_type,
      org_id:this.Viewdata._id,
      acl: item,
      role:'AD'
    };

    this.DataService.acl_update('org_data_acl', data).subscribe((res: any) => {
      console.log(res);
    });
  }

  back() {
    this.router.navigate(['list/role']);
  }

}
