// import { Component } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
// import { GridReadyEvent, ColDef, FirstDataRenderedEvent, GridApi, ColGroupDef, RowGroupingDisplayType } from 'ag-grid-community';
// import { DataService } from 'src/app/services/data.service';
// import { DialogService } from 'src/app/services/dialog.service';
// import { HelperService } from 'src/app/services/helper.service';
// import { IDetailCellRendererParams } from '@ag-grid-community/core/dist/cjs/es5/interfaces/masterDetail';
// import { CellComponent } from './radiobutton';
// import { isEmpty } from 'lodash';

// @Component({
//   selector: 'app-accessright',
//   templateUrl: './accessright.component.html',
//   styleUrls: ['./accessright.component.css']
// })
// export class AccessrightComponent {
//   // params:any
//   Viewdata:any
//   context:any
//   components:any
//   // listdata:any[]=[]
  
//   public groupDisplayType: RowGroupingDisplayType ='groupRows' // avaid in group rows

  
//   constructor(
//     private route: ActivatedRoute,
//     private router: Router,
//     // private httpclient: HttpClient,
//     private DataService: DataService,
//     public dialogService: DialogService,
//     private helperService: HelperService
//   ) {
    
//     this.context = { componentParent: this };
//     this.components = {
//       buttonRenderer: CellComponent,
//     };
   
//   }
//   columnDef1: (ColDef | ColGroupDef)[] = [
//       {
//         headerName: "Model Name",
//         field: "model_name",
//         width: 40,
//         filter: "agTextColumnFilter",
//         rowGroup: true,hide:true
//       },
//       {
//         headerName: "Field Name",
//         field: "column_name",
//         width: 40
//       },{
//         headerName:"ACL",
//       field: "acl",
//       cellRenderer: CellComponent
//       }
//     ];

    
//   public defaultColDef: ColDef = {
//     flex: 1,
//     minWidth: 100,
//     sortable: true,
//     resizable: true,
//     filter: true,
//   };

//   gridApi!:GridApi
//   ngOnInit() {
//     this.route.params.subscribe((params:any) => {
//       //! To do  Change the routing and make the data from another function 
//       //? Change the function and the respose from the data make patch work is same 
//       // ? add All type for the first type screen save in type-data-acl
//       // ? add then add separete for each  type entiters (cc ,pr, ss,aa) type-data-acl
//       // ? add  data and get the date from and save in some other collection
//       // ? add set in give to system user to show the data
      
      
      
//       this.DataService.getDataById('org_type',params.Role).subscribe((res:any)=>{

// this.Viewdata=res.data[0]

// var filterCondition1 =[{
//   clause: "AND",
//   conditions: [
//    { column: 'role', operator: "EQUALS", value: this.Viewdata._id },
//   ]}]
// this.DataService.getDataByFilter('org_type_data_acl', filterCondition1)
//   .subscribe((xyz: any) => {
//     const filteredData: any[] = xyz.data;

//     this.DataService.getData("data_model").subscribe((res1: any) => {
//       const modelData: any[] = res1.data;

//       const filteredModelData: any[] = [];

//       modelData.forEach((element: any) => {
//         let matchFound = false;
// if(isEmpty(filteredData)){
//   //! Remove 
//   // if((element.column_name!=null&&element.column_name!=undefined&&element.column_name!='')&&(element.model_name != undefined||element.model_name!=null)){

//     let data: any = {
//       model_ref_id: element._id,
//       column_name: element.column_name,
//       model_name: element.model_name,
//       acl: null
//     };
//     console.log(data,'main if');
    
//     filteredModelData.push(data);
//   // }
// }else{
//   for (let index = 0; index < filteredData.length; index++) {
//     const vals = filteredData[index];

//     if (element._id === vals.model_ref_id) {
//       let data: any = {
//         model_ref_id: vals._id,
//         column_name: vals.column_name,
//         model_name: vals.model_name,
//         acl: vals.acl
//       };
// console.log(element,'else ',vals);

//       filteredModelData.push(data);
//       matchFound = true;
//       break;
//     }
//   }

//   if (!matchFound) {
//     if((element.column_name!=null||element.column_name!=' ')&&(element.model_name != ''||element.model_name!=null)){
//       console.log(element);

//       let data: any = {
//         model_ref_id: element._id,
//         column_name: element.column_name,
//         model_name: element.model_name,
//         acl: null
//       };
//       console.log(data,'last if',element);
      
//       filteredModelData.push(data);
//     }
//   }
// }
       
//       });

//       // console.log(filteredModelData);
//       this.rowData = filteredModelData;
//     });
//   });

//       })
//     });
    
//   }

//   rowData:any[]=[]
//   onGridReady(params: GridReadyEvent<any>) {
//     this.gridApi = params.api;
//   }

//   onFirstDataRendered(params: FirstDataRenderedEvent) {
//     params.api.sizeColumnsToFit();
//   }
//   onSelectionChanged(params: any) {
//     ;
//     // console.log(params);
    
//     let selectedRows = this.gridApi.getSelectedRows();
//     // this.router.navigate([`details/${selectedRows[0]._id}`]);
//   }

//   onActionButtonClick(item: any, rowDatas: any) {
// console.log(item,rowDatas);
// let data:any={
//   model_ref_id:rowDatas.model_ref_id,
//   column_name:rowDatas.column_name,
//   model_name:rowDatas.model_name,
//   org_type:this.Viewdata._id,
//   acl:item
// }
// console.log(data);
// this.DataService.update('org_type_data_acl',data).subscribe((res:any)=>{
//   console.log(res);
  
// })
//   }

//   back(){
//     this.router.navigate(['list/role'])
//   }


// }
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GridReadyEvent, ColDef, ColGroupDef, RowGroupingDisplayType, GridApi, FirstDataRenderedEvent } from 'ag-grid-community';
import { DataService } from 'src/app/services/data.service';
import { DialogService } from 'src/app/services/dialog.service';
import { HelperService } from 'src/app/services/helper.service';
import { isEmpty } from 'lodash';
import { CellComponent } from './radiobutton';

@Component({
  selector: 'app-accessright',
  templateUrl: './accessright.component.html',
  styleUrls: ['./accessright.component.css']
})
export class AccessrightComponent implements OnInit {
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
      this.DataService.getDataById('org_type', params.Role).subscribe((res: any) => {
        console.log(res);
        
        this.Viewdata = res.data[0];
        const filterCondition1 = {filter:[{
          clause: 'AND',
          conditions: [
            { column: 'org_type', operator: 'EQUALS',type:'string', value: this.Viewdata._id },
          ]
        }]};

        this.DataService.getDataByFilter('org_type_data_acl', filterCondition1).subscribe((xyz: any) => {
          const filteredData: any[] = xyz.data[0].response;

          this.DataService.getDataByFilter('data_model',{}).subscribe((res1: any) => {
            const modelData: any[] = res1.data[0].response;
            const filteredModelData: any[] = [];

            modelData.forEach((element: any) => {
              let matchFound = false;

              if (isEmpty(filteredData)) {
                if (element.column_name && element.model_name) {
                  let data: any = {
                    model_ref_id: element._id,
                    column_name: element.column_name,
                    model_name: element.model_name,
                    acl: null,
                  };
                  filteredModelData.push(data);
                }
              } else {
                for (let index = 0; index < filteredData.length; index++) {
                  const vals = filteredData[index];
                  if (element._id === vals.model_ref_id) {
                    let data: any = {
                      model_ref_id: vals._id,
                      column_name: vals.column_name,
                      model_name: vals.model_name,
                      acl: vals.acl,
                    };
                    filteredModelData.push(data);
                    matchFound = true;
                    break;
                  }
                }
                if (!matchFound) {
                  if (element.column_name && element.model_name) {
                    let data: any = {
                      model_ref_id: element._id,
                      column_name: element.column_name,
                      model_name: element.model_name,
                      acl: null,
                    };
                    filteredModelData.push(data);
                  }
                }
              }
            });

            this.rowData = filteredModelData;
          });
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

  // onSelectionChanged(params: any) {
  //   let selectedRows = this.gridApi.getSelectedRows();
  //   // this.router.navigate([`details/${selectedRows[0]._id}`]);
  // }

  onActionButtonClick(item: any, rowDatas: any) {
    let data: any = {
      model_ref_id: rowDatas.model_ref_id,
      column_name: rowDatas.column_name,
      model_name: rowDatas.model_name,
      org_type: this.Viewdata._id,
      acl: item,
      // role:'AD'
    };

    this.DataService.acl_update('org_type_data_acl', data).subscribe((res: any) => {
      console.log(res);
    });
  }

  back() {
    this.router.navigate(['list/org_type']);
  }
}
