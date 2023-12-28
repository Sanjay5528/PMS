import { HttpClient } from "@angular/common/http";
import {
  Component,
  TemplateRef,
  ViewChild,
  OnInit,
  EventEmitter,
  Output,
  Input,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { DataService } from "../../services/data.service";
import {
  ColDef,
  ExcelExportParams,
  FirstDataRenderedEvent,
  GetContextMenuItemsParams,
  GetRowIdFunc,
  GetRowIdParams,
  GridApi,
  GridReadyEvent,
  IDatasource,
  IGetRowsParams,
  IServerSideDatasource,
  IServerSideGetRowsParams,
  KeyCreatorParams,
  MenuItemDef,
  ProcessGroupHeaderForExportParams,
  ProcessHeaderForExportParams,
  RowModelType,
  ServerSideTransaction,
} from "ag-grid-community";
import * as moment from "moment";
import { DialogService } from "../../services/dialog.service";
import { ActionButtonComponent } from "./button";
import * as _ from "lodash";
import { MyLinkRendererComponent } from "./cellstyle";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { ExcelService } from "src/app/services/excel.service";
import { HelperService } from "src/app/services/helper.service";
import { ArrayToStringPipe } from "src/app/pipe/arraytostring";
import { GridOptions } from "@ag-grid-community/core";
import { async } from "rxjs";
import { environment } from "src/environments/environment";
import { FormArray, FormGroup, FormControl, Validators } from "@angular/forms";

@Component({
  selector: "app-datatable",
  templateUrl: "./datatable.component.html",
  styleUrls: ["./datatable.component.css"],
})
export class DatatableComponent implements OnInit {
  collectionName!: string;
  listName!: string;
  config: any;
  pageHeading: any;
  columnDefs: any;
  filterOptions: any;
  listData: any;
  screenEditMode: string = "popup";
  fields: any;
  loading: boolean = false;
  id: any;
  gridApi!: GridApi;
  components: any;
  context: any;
  formAction: string = "add";
  selectedModel: any = {};
  showbutton!: boolean;
  dataExist = true;
  @ViewChild("editViewPopup", { static: true })
  editViewPopup!: TemplateRef<any>;
  @ViewChild("Popup", { static: true }) Popup!: TemplateRef<any>;
  formName!: string;
  model: any;
  user_id: any;
  fieldss!: FormlyFieldConfig[];
  models: any = {};
  template_id: any | undefined;
  filterCollectionName: any;
  filterQuery: any;
  allFilter:any

  @Output("onClose") onClose = new EventEmitter<any>(); //UNDO
  @Input("mode") mode: string = "page";
  public gridOptions: any = {
    flex: 1,
    cacheBlockSize: environment?.cacheBlockSize,
    paginationPageSize: environment?.paginationPageSize,
    rowModelType: environment?.rowModelType,
  };
  overlayNoRowsTemplate =
    '<span style="padding: 10px; background:white ;">No Data Found</span>"';
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private DataService: DataService,
    public dialogService: DialogService,
    private excelservice: ExcelService,
    private arraytostring: ArrayToStringPipe,
    private helperService: HelperService
  ) {
    // this.router.routeReuseStrategy.shouldReuseRoute = () => false;

    this.context = { componentParent: this };
    this.components = {
      buttonRenderer: ActionButtonComponent,
      linkRenderer: MyLinkRendererComponent,
    };
  }

  ngOnInit() {
    // this.getFilter(this.filterQuery)
    //! Chaged TO NEW
    this.route.params.subscribe((params) => {
      if (params["form"]) {
        this.listName = params["form"];
        this.formName = this.listName;
        this.loadConfig();
      }
    });
  }

   public defaultColDef: ColDef = {
    resizable: true,
    // suppressMovable:true,
  //   filterParams: {
  //     closeOnApply:true,
  //     buttons: ['reset', 'apply'],
  // },
  };

  filterValue(event: any) {
    let val = event.toLowerCase().trim();
    this.listData = this.helperService.getFilteredValue(val, this.listData, []);
  }

  onGridReady(params: GridReadyEvent) {

    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    this.gridApi.sizeColumnsToFit();
    this.getList()

  }

  onFirstDataRendered(params: FirstDataRenderedEvent) {
    params.api.sizeColumnsToFit();
  }

  showdefaultFilter: boolean = true;

  isConfigLoaded: boolean = false;

  public getRowId: GetRowIdFunc = (params: GetRowIdParams) => `${params.data[this.config.keyField ? this.config.keyField  : "_id"]}`;

  loadConfig() {
    this.DataService.loadListConfigJson(this.listName).subscribe(
      (config: any) => {
        let org_type_id: any;
        let role_type: any;
        var role_filter: any;
        if (config?.rolebased) { // config . role == true  
          role_type = this.DataService.getdetails().LoginResponse.role;
          org_type_id = this.DataService.getdetails().LoginResponse.org_id;
          if (role_type !== "SA") {

            role_filter = {
              clause: "AND",
              conditions: [
                {column: "org_id",operator: "EQUALS",type: "string",value: org_type_id,},
              ],
            };
          }

        }if (config?.individaulAccess) { // config . role == true  
          let decodeToken:any=this.helperService.getdecodeToken()
          if (role_type !== "SA") {
// to use
            role_filter = {
              clause: "AND",
              conditions: [
                {column: config?.individaulAccessColumn,operator: "EQUALS",type: "string",value: decodeToken[config.valueColumnName]},
              ],
            };
          }

        }
        this.config = config;
        this.showbutton = config.showbutton; // show button used to show add button it should done in json
        let filter = this.DataService.getFilterQuery(config, this);
        //! define it has the role in
        console.log(config?.rolebased && role_type !== "SA");

        if (config?.rolebased && role_type !== "SA") {
          this.filterQuery = [role_filter];

          if (filter != undefined) {
            this.filterQuery = [filter, role_filter];
          } 

        } else {
          this.filterQuery = filter;
        }
        this.collectionName = config.collectionName; // collectionName used to show add button it should done in json
        this.filterOptions = config.filterOptions;
        this.filterCollectionName = config.filtercollectionName || "";
        this.showdefaultFilter = config.showdefaultFilter;
        this.pageHeading = config.pageHeading;
        this.screenEditMode = config.screenEditMode || "popup"; // screenEditMode is type used for POP up And PAge Screen
        this.fields = [];
        this.columnDefs = this.config.columnDefs; // Thus  for AG Grid columnDefs
        this.columnDefs.forEach((e: any) => {
          if (e.type == "datetime" || e.type == "date") {
            e.valueGetter = (params: any) => {
              if (params.data && params.data[e.field]) {
                return moment(params.data[e.field]).format(
                  e.format || "DD-MM-YYYY "
                );
              }
              return moment().format(e.format || "DD-MM-YYYY "); //? set curent date
            };
          }
          if(e.type == "name" ){
            e.valueGetter = (params: any) => {
              return  params.data["first_name"]+" "+params.data["last_name"]
            }
          }
          if(e.type=="role"){
            // ! know lock is Done
            console.log(e.value!==this.helperService.getRole());
            
            if(e.value!==this.helperService.getRole()){
              e.lockVisible=true
              // lockVisible: true,
              e.hide=true

              // hide:true
            }
          }
          if (e.type == "color") {
            e.cellStyle = (params: any) => {
              return { color: "blue" };
            };
          }
          if (e.type == "arraytostring") {
            e["valueFormatter"] = (params: any) =>
              this.arraytostring.transform(params.value, e.value);
          }
          if (e.width) {
            e["width"] = e.width;
          }
          if (e.type == "set_Filter" && e.filter == "agSetColumnFilter") {
            if (e.Diffkey == true) {
              e.filterParams = {
                values: (params: any) => {
                  let filter:any={
                    start: 0,
                    end: 1000,
                    filter: this.filterQuery,
                  }
                  if(this.allFilter!==undefined){
                  filter=this.allFilter;
                  }
                  this.DataService.getDataByFilter(this.collectionName, filter).subscribe((xyz: any) => {
                    const apidata = xyz.data[0].response;
                    const uniqueArray = Array.from(
                      new Map( apidata.map((obj: any) => [obj[e.field], obj])).values()
                    );
                    params.success(uniqueArray);
                  });
                },
                keyCreator: (params: KeyCreatorParams) => {
                  return [params.value[e.keyCreator], e.keyCreator, true];
                },
                valueFormatter: (params: any) => {
                  return params.value[e.field];
                },
              };
            } else {
              e.filterParams = {
                values: (params: any) => {
                  let filter:any={
                    start: 0,
                    end: 1000,
                    filter: this.filterQuery,
                  }
                  if(this.allFilter!==undefined){
                  filter=this.allFilter;
                  }
                  this.DataService.getDataByFilter(this.collectionName,filter).subscribe((xyz: any) => {
                    const apidata = xyz.data[0].response
                      .map((result: any) => {
                        let val = result[e.field];
                        if (val !== undefined) {
                          return val;
                        }
                      })
                      .filter((val: any) => val !== undefined); // Filter out undefined values
                    params.success(apidata);
                  });
                },
              };
            }
          }
          //if the object in nested array
          if (e.type == "set_Filter" && e.filter == "agSetColumnFilter" &&e.object_type == "nested_array") {
            debugger;
            e.filterParams = {
              values: (params: any) => {
                let filter:any={
                  start: 0,
                  end: 1000,
                  filter: this.filterQuery,
                }
                if(this.allFilter!==undefined){
                filter=this.allFilter;
                }
                this.DataService.getDataByFilter(this.collectionName,filter).subscribe((xyz: any) => {
                  const apidata = xyz.data[0].response
                    .map((result: any) => {
                      //let val = result[e.field];
                      let val = e.field
                        .split(".")
                        .reduce((o: any, i: any) => o[i], result);
                      if (val !== undefined) {
                        return val;
                      }
                    })
                    .filter((val: any) => val !== undefined); // Filter out undefined values
                  params.success(apidata);
                });
              },
            };
          }
        });

        this.isConfigLoaded = true;

        this.getList(this.filterQuery, config.sort);
      }
    );
  }

  /**
   * This method Get All Data by Passing collectionName  in grid
   */
  getList(filterQuery?: any, sort?: any) {
    //! DEfenie this for GridAPi Should not be undefined
    if (this.gridApi !== undefined) {
      const datasource:IServerSideDatasource = {
        getRows: async (params: IServerSideGetRowsParams) => {
          let obj: any = {
            start: params.request.startRow,
            end: params.request.endRow,
            filter: params.request.filterModel,
            sort: params.request.sortModel,
          };

          this.DataService.makeFiltersConditions(obj).then((filtercondition: any) => {
              let filter = filtercondition.filter;
              filtercondition.filter = [];
              if (this.filterQuery !== undefined && filterQuery !== undefined) {
                if (this.filterQuery == filterQuery) {
                  filtercondition.filter = [...this.filterQuery, ...filter];
                } else {
                  filtercondition.filter = [
                    ...this.filterQuery,
                    ...filter,
                    ...filterQuery,
                  ];
                }
              } else if (this.filterQuery !== undefined) {
                filtercondition.filter = [...this.filterQuery, ...filter];
              } else if (filterQuery !== undefined) {
                filtercondition.filter = [...filter, ...filterQuery];
              } else {
                filtercondition.filter = [...filter];
              }
              if (sort != undefined) {
                filtercondition.sort = sort;
              }
             this.allFilter=filtercondition
              this.DataService.getDataByFilter(this.collectionName ,filtercondition).subscribe(async (xyz: any) => {
                console.log(xyz);
                this.gridApi.sizeColumnsToFit();
                if (await xyz) {
                  if (xyz?.data[0]?.pagination[0]?.totalDocs !== undefined) {
                    this.gridApi.hideOverlay()
                    this.listData = xyz.data[0].response;
                    let data:any={
                      rowData:xyz.data[0].response ,
                      rowCount:xyz.data[0].pagination[0].totalDocs
                    }
                    params.success(
                      data
                    );
                  } else {
                    this.gridApi.showNoRowsOverlay();
                    params.success(
                      {
                        rowData:[],
                        rowCount:0
                      })
                   }
                } else {
                  this.gridApi.showNoRowsOverlay();
                  params.success(
                    {
                      rowData:[],
                      rowCount:0
                    })
                }
              });
            }
          );
        },
      };
      this.gridApi.setServerSideDatasource(datasource);
    }
  }
  /**
   * This method Get Trigged When the Table is Touched
   * From event we  get Data 
   @example event.api.getSelectedRows()
   */
  onSelectionChanged(event: any) {

    this.selectedModel = event.api.getSelectedRows()[0];
    console.log("Datatable","Selected",this.selectedModel);
    console.log(this.config);
    
    if (this.config.onSelect == true) {
      this.router.navigate([this.config.route]);
    } else if (this.config.screenEditMode == "popup") {
      this.formName = this.listName;
      this.formAction = "Edit";
      this.dialogService.openDialog(
        this.editViewPopup,
        this.config["screenWidth"],
        null,
        this.selectedModel
      );
      
    } 
//     else if (this.config.screenEditMode == "projectdashboard") {
      
//       let filer:any={
//         start:0,end:1000,filter:[{
          
//             clause: "AND",
//             conditions: [
//               {column: "client_id",operator: "EQUALS",type: "string",value: this.selectedModel.client_id},
//             ],
          
//         }]
//       }
//        this.DataService.getDataByFilter('client',filer).subscribe((res:any)=>{
//         console.log(res);
//         let data={
//           logo:res.data[0].response[0].logo.storage_name,
//           client_name:res.data[0].response[0].client_name,
// name: this.selectedModel.project_name,
// _id: this.selectedModel._id
//         }
//         this.helperService.getProjectmenu(data)
//         console.log("final Data",data);
        
//        })
//     } 
    else {
      return;
    }
  }
//!  
  // Method for add form
  onAddButonClick(event:any) {
    this.selectedModel = {};
    // let user_type:any =sessionStorage.getItem("org_type");
    if (this?.config?.role_based==true) {
      this.selectedModel.org_id = this.DataService.getdetails().profile.org_id;
      this.selectedModel.org_type =
        this.DataService.getdetails().profile.user_type;
    }
    this.formAction = "add";
    this.doAction(this.selectedModel);
  }

  // Method for action buttons
  onActionButtonClick(item: any, data: any) {
    this.formAction = item.formAction? item.formAction: item.label.toLowerCase() ;
    this.formName = item.formName;
    let id = this.config.keyField;
    console.log(data, item);
    if (this.formAction == "add") {
      this.doAction();
    } else if (this.formAction == "edit") {
      this.selectedModel = data;
      this.doAction(data, data[id]);
    } else if (this.formAction == "components") {
      // console.log(this);
      if (item.route == "ACL") {
        this.router.navigate([`${item.route}` + "/" + data._id]);
      }  else if (item.route_type == "CustomRoute") {
        // ! item.Custom_Route To another Component
        if(item.Custom_Key_filed&&item.Custom_Route)
        // todo if this filed is missing it should take the _id
        // let field = data[item.Custom_Key_filed] ? data[item.Custom_Key_filed] : data[_id];
       
        this.router.navigate([
          `${item.Custom_Route}`,
          data[item.Custom_Key_filed],
        ]);
      } else if (item.route == "role/acl/") {
        this.router.navigate([`${item.route}` + data.org_id + "/" + data._id]);
      } else if(item.route_type=="project"){
        let route=item.first+data[item.Custom_Key_filed]+item.last 
        this.router.navigate([route])  
      }else {
        let type: any = this.route.snapshot.params["form"];
        this.router.navigate([`${item.route}` + "/" + type + "/" + data._id]);
      }
      //! TO DO Changes
      // this.router.navigate([`${item.route}` + "/" + data[this.config.keyField]])
    } else if (this.formAction == "route") {
      this.router.navigate([
        `${this.config.addRoute}`,
        data[this.config.keyField],
      ]);

      //this.router.navigate([`${this.config.addRoute}`])
    } else if (this.formAction == "list") {
      if (item.storage == true) {
        let modelname: any = data._id;
        sessionStorage.setItem("model_name", modelname);
      }
      if (item.type == "masterdetailsform") {
        this.router.navigate([`${item.route}` + "/" + data._id]);
      } else {
        this.router.navigate([`${item.route}`]);
      }
    } else if (this.formName == "route") {
      this.router.navigate([
        `${this.config.addRoute}`,
        data[this.config.keyField],
      ]);
      //this.router.navigate([`${this.config.addRoute}`])
    } else if (this.formAction == "view") {
      //FROM Assert
      // this.httpclient
      //   .get("assets/jsons/" + this.formName + "-" + "view" + ".json")

      // From DAtabase

      this.DataService.loadViewConfigJson(this.formAction).subscribe(
        (frmConfig: any) => {
          this.config = frmConfig;
          this.fields = frmConfig.form.fields;
          this.pageHeading = frmConfig.pageHeading;
          this.doAction(data, data[id]);
        }
      );
    } else if (this.formAction == "delete") {
      // Chnages Start
      if (this.collectionName === "model_config") {
        this.DataService.deleteDataByModel(
          "model_config",
          data.model_name
        ).subscribe((res: any) => {
          this.dialogService.openSnackBar(
            "Data has been deleted successfully",
            "OK"
          );
          // this.getList() //!NEW
        });
      }
      // else if (this.collectionName === "data_model") {

      //   this.DataService.deleteDataById("data_model", data._id).subscribe(
      //     (res: any) => {
      //       this.dialogService.openSnackBar(
      //         "Data has been deleted successfully",
      //         "OK"
      //       );
      //       // this.getList() //!NEW
      //     }
      //   );
      //   console.log("INSIDE data")

      //   // }
      // }
      // Chnages End

      if (confirm("Do you wish to delete this record?")) {
        this.DataService.deleteDataById(
          this.collectionName,
          data._id
        ).subscribe((res: any) => {
          this.dialogService.openSnackBar(
            "Data has been deleted successfully",
            "OK"
          );
          const transaction: ServerSideTransaction = {
            remove: [data],
          };
          const result = this.gridApi.applyServerSideTransaction(transaction);
          console.log(transaction, result);
        });
      }
    }
  }

  onCellClicked(event:any){
    let clickCell:any=event.column.getColId()

 if (this.config.screenEditMode == "projectdashboard" && clickCell !="Action") {
      
      let filer:any={
        start:0,end:1000,filter:[{
          
            clause: "AND",
            conditions: [
              {column: "client_id",operator: "EQUALS",type: "string",value: event.data.client_id},
            ],
          
        }]
      }
       this.DataService.getDataByFilter('client',filer).subscribe((res:any)=>{
        console.log(res);
        let data={
          logo:res.data[0].response[0].logo.storage_name,
          client_name:res.data[0].response[0].client_name,
name: event.data.project_name,
_id: event.data._id
        }
        this.helperService.getProjectmenu(data)
        console.log("final Data",data);
        
       })
    } else {
      return;
    }
  }
// Add OR Edit DATA To Change with out api request
  // close(event: any) {
  //   this.dialogService.closeModal();
  //   this.gridApi.deselectAll();
    
  //   if (event) {
  //     // Ensure 'event' contains the expected properties before proceeding
  //     if (event.action === "Add" && event.data) {
  //     const transaction: ServerSideTransaction = {
  //       add: 
  //       [event.data ],
  //     };
  //     const result = this.gridApi.applyServerSideTransaction(transaction);
  //     console.log(transaction, result)
  //     }else{
  //       const transaction: ServerSideTransaction = {
  //             update:  [event.data ]
  //            };
  //           const result = this.gridApi.applyServerSideTransaction(transaction);
  //       console.log(transaction, result)

  //     }
  //   }
  // }
  close(event: any) {
    debugger
    console.log(event);
    
    this.dialogService.closeModal();
    this.fields = undefined;
    if (!event) return
    if (event.action == "filter") {
      this.getList(event.data)
     }
    if (event.action === "Add" && event.data) {
    this.gridApi.deselectAll();
    const transaction: ServerSideTransaction = {
    add: [ event.data],
    };
    const result = this.gridApi.applyServerSideTransaction(transaction);
    console.log(transaction, result)
    } else {
    const transaction: ServerSideTransaction = {
    update: [event.data],
    };
    const result = this.gridApi.applyServerSideTransaction(transaction);
    console.log(transaction, result)
    }
    }

  // Open dialog for add,edit and view
  doAction(data?: any, id?: string) {
    if (this.config.editMode == "popup") {
      if (this.formAction == "add") {
        console.log(this.config);

        if (this.config.role) {
          var value: any = {};

          let storage: any = sessionStorage.getItem("auth");
          let role: any = JSON.parse(storage).role;
          console.log(role);
          if (role == "SA") {
            value.access = 1;
          } else {
            value.access = 0;
          }
          this.dialogService.openDialog(
            this.editViewPopup,
            this.config["screenWidth"],
            null,
            value
          );
        } 
        else if (this.config.individual) {

          this.grpfn();
        } 
        else {
          this.dialogService.openDialog(
            this.editViewPopup,
            this.config["screenWidth"],
            null,
            data
          );
        }
      } else {
        if (this.config.individual) {
          this.editgrp(data);
        }else{
          this.dialogService.openDialog(
            this.editViewPopup,
            this.config["screenWidth"],
            null,
            data
          );
        }
      }
    } else {
      console.log("elese");

      if (this.formAction == "add") {
        console.log("add");
        this.router.navigate([`${this.config.addRoute}`]);
      } else if (this.formAction == "edit") {
        if (this.config.individual) {

          this.editgrp(data);
        }
        this.router.navigate([
          `${this.config.editRoute}`,
          data[this.config.keyField],
        ]);
      } else if (this.formAction == "view") {
        this.router.navigate([
          `${this.config.viewRoute}`,
          data[this.config.keyField],
        ]);
      } else {
        this.dialogService.openDialog(
          this.editViewPopup,
          this.config["screenWidth"],
          null,
          data
        );
      }
    }
  }
  
  getContextMenuItems(
    params: GetContextMenuItemsParams
    ): (string | MenuItemDef)[] {
    var result: (string | MenuItemDef)[] = [
    
    // 'autoSizeAll',
    // 'resetColumns',
    // 'expandAll',
    // 'contractAll',
    'copy',
    'copyWithHeaders',
    'separator',
    // 'paste',
    {
    name: 'Export To Excel',
    subMenu: [
    // {
    // name: 'Excel',
    // subMenu: [
    {
    name: 'Selected Data Only ',
    action: () => {
    if(params.context.componentParent.gridApi.getSelectedRows().length!==0){
    params.context.componentParent.onBtExport(false)
    }else{
    window.alert('No data Selected');
    }
    }
    },{
    name: 'All Data',
    action: () => {
    params.context.componentParent.onBtExport(true)
    }
    }
    ]
    }
    ];
    
    return result;
    
    }
    
  onBtExport(flag?:any) {
    if(flag==true){
    this.DataService.getDataByFilter(
        this.collectionName ,{}
      ).subscribe(async (xyz: any) => {
        console.log(xyz.data[0].response[0])
        this.excelservice.exportAsExcelFile(xyz.data[0].response, "Sanjay");
   
        } 
        )
      }else{
        // console.log(data);
        let data =this.gridApi.getSelectedRows()
        console.log(data);
        
        this.excelservice.exportAsExcelFile(data, "Sanjay");
        this.gridApi.deselectAll();
      }
        
  }
 async editgrp(data: any) {
    // todo
    var filterCondition1 = {
      filter: [
        {
          clause: "AND",
          conditions: [
            { column: "is_collection", operator: "EQUALS", value: "Yes" },
          ],
        },
      ],
    };
    this.DataService.getDataByFilter(
      "model_config",
      filterCondition1
    ).subscribe((res: any) => {
      this.collections = res.data[0].response.map((response: any) => {
        return {
          model_name: response.model_name
            .replace(/_/g, " ")
            .toUpperCase()
            .replace(/_/g, " "),
          value: response.collection_name,
        };
      });
    });
    this.groupName=data.group_name
    this.selectedCollection=data.ref_collection
    this.groupDescription=data.groupDescription
    this.grouptype=data.grouptype
let filter:any=data.filter
  const overallcondition: any[] = await this.converRawdataintoArray(filter)
let filterCondition = {
  filter: [
    {
      clause: "AND",
      conditions: [
        {
          column: "model_name",
          operator: "EQUALS",
          value: this.selectedCollection,
        },
      ],
    },
  ],
};

this.DataService.getDataByFilter("data_model", filterCondition).subscribe(
  (res: any) => {
    let values: any;
    values = res.data[0].response.map((res: any) => {
      let field_name = res.column_name.toLowerCase();
      let data: any = {};
      if (res.is_reference) {
        data.collection_name = res.collection_name;
        data.field = res.field;
        return {
          name: res.column_name
            .replace(/_/g, " ")
            .toUpperCase()
            .replace(/_/g, " "),
          field_name: field_name,
          reference: res.is_reference,
          orbitalvaule: data,
          type: res.type,
        };
      } else {
        return {
          name: res.column_name
            .replace(/_/g, " ")
            .toUpperCase()
            .replace(/_/g, " "),
          field_name: field_name,
          type: res.type,
        };
      }
    });
    let addtionalvalues: any[] = [];
    values.forEach((result: any) => {
      const typeMapping: { [key: string]: string } = {
        string: "string",
        int: "number",
        int64: "number",
        float32: "number",
        float64: "number",
        bool: "boolean",
        "time.Time": "Date",
      };
      const selectedTypes = result.type.replace("[", "").replace("]", "");
      if (!(selectedTypes in typeMapping)) {
        let filterCondition = {
          filter: [
            {
              clause: "AND",
              conditions: [
                {
                  column: "model_name",
                  operator: "EQUALS",
                  value: selectedTypes,
                },
              ],
            },
          ],
        };
        this.DataService.getDataByFilter(
          "data_model",
          filterCondition
        ).subscribe((res: any) => {

          let values: any;
          values = res.data[0].response.map((res: any) => {
            let field_name =
              result.field_name + "." + res.column_name.toLowerCase();
            let column_name =
              result.name
                .replace(/_/g, " ")
                .toUpperCase()
                .replace(/_/g, " ") +
              " : " +
              res.column_name
                .replace(/_/g, " ")
                .toUpperCase()
                .replace(/_/g, " ");
            let data: any = {};
            if (res.is_reference) {
              data.collection_name = res.collection_name;
              data.field = res.field;
              addtionalvalues.push({
                name: column_name,
                field_name: field_name,
                reference: res.is_reference,
                orbitalvaule: data,
                type: res.type,
              });
            } else {
              addtionalvalues.push({
                name: column_name,
                field_name: field_name,
                type: res.type,
              });
            }
          });
        });
      } else {
        addtionalvalues.push(result);
      }
    });
    this.options = addtionalvalues;
//     for (let parentIndex = 0; parentIndex < overallcondition.length; parentIndex++) {
//       const PArentfilter = overallcondition[parentIndex];
      
//       if(PArentfilter.clause!==undefined){
//       this.grp.push([{ flag: true ,operator:PArentfilter.clause}]);
//       this.field.push([]);
//       this.operator.push([]);
//       this.orbitalValue.push([]);
//       this.orbitalOptions.push([]);
//       this.operatorOptions.push([]);
//       this.flag.push([]);
//       this.anotherfield.push([]);
//       this.inputflag.push([]);
//       }
//       this.field[parentIndex]=[]
//       this.operator[parentIndex]=[]
//       this.orbitalValue[parentIndex]=[]
//       for (let childIndex = 0; childIndex < PArentfilter.condition.length; childIndex++) {
//         const condition = PArentfilter.condition[childIndex];
//         let condistion:any= PArentfilter.condition

//         if(condition!=undefined){
//         this.field[parentIndex][childIndex]=[]
//         this.operator[parentIndex][childIndex]=[]
//         this.orbitalValue[parentIndex][childIndex]=[]
//         console.log(condistion.length  >=childIndex);
        
//         if (condistion.length  >=childIndex ) {
//           this.grp[parentIndex].push({ flag: true ,operator:this.grp[parentIndex][0].operator})

//         }
        
//             // if (this.grp[parentIndex].condition.length >= this.grp[parentIndex].condition.length) {
//           // this.addgrp(parentIndex, childIndex);
// // 
//         // }
//             const filteredOptions =this.options.filter((res: any) =>  res.field_name === condition.column_name);    
//         this.setflag(filteredOptions[0],parentIndex,childIndex);
//         this.getOperators(filteredOptions[0],parentIndex,childIndex);
//         this.button_Flag=true

//         const filteredOperatorOptions = this.operatorOptions[parentIndex][childIndex].filter((resoprator: any) => {
//           return resoprator.value === condition.operator;
//         });
//         this.opertorchange(filteredOperatorOptions[0],parentIndex,childIndex)
//         this.apiflag=true
//         this.field[parentIndex][childIndex]=filteredOptions[0]
//         this.operator[parentIndex][childIndex]=filteredOperatorOptions[0]
//         this.orbitalValue[parentIndex][childIndex]=condition.values
//           this.convertdata_into_string(parentIndex,childIndex)

//         }
// }
// }
overallcondition.forEach((parentFilter:any, parentIndex:any) => {
  // Check if parentFilter has a clause property before accessing it
  if (parentFilter.clause !== undefined) {
    this.grp.push([{ flag: true, operator: parentFilter.clause }]);
    this.field.push([]);
    this.operator.push([]);
    this.orbitalValue.push([]);
    this.orbitalOptions.push([]);
    this.operatorOptions.push([]);
    this.flag.push([]);
    this.anotherfield.push([]);
    this.inputflag.push([]);
  }

  // Initialize arrays
  this.field[parentIndex] = [];
  this.operator[parentIndex] = [];
  this.orbitalValue[parentIndex] = [];

  parentFilter.condition.forEach((condition:any, childIndex:any) => {
    // Check if condition is defined before accessing it
    if (condition !== undefined) {
      // Initialize arrays
      this.field[parentIndex][childIndex] = [];
      this.operator[parentIndex][childIndex] = [];
      this.orbitalValue[parentIndex][childIndex] = [];
      console.log(parentFilter.condition.length >= childIndex);

      if (parentFilter.condition.length >= childIndex) {
        if (this.grp[parentIndex][childIndex]?.flag === undefined) {
          this.grp[parentIndex].push({ flag: true, operator: this.grp[parentIndex][0].operator });
        }
      }

      // Use find to find matching options and operators
      const filteredOption = this.options.find((res:any) => res.field_name === condition.column_name);
      if (filteredOption) {
        this.setflag(filteredOption, parentIndex, childIndex);
        this.getOperators(filteredOption, parentIndex, childIndex);
        this.button_Flag = true;

        const filteredOperatorOption = this.operatorOptions[parentIndex][childIndex].find(
          (resOperator:any) => resOperator.value === condition.operator
        );

        if (filteredOperatorOption) {
          this.opertorchange(filteredOperatorOption, parentIndex, childIndex);
          this.apiflag = true;
          this.field[parentIndex][childIndex] = filteredOption;
          this.operator[parentIndex][childIndex] = filteredOperatorOption;
          this.orbitalValue[parentIndex][childIndex] = condition.values;
          this.convertdata_into_string(parentIndex, childIndex);
        }
      }
    }
  });
});

    this.dialogService.openDialog(
      this.Popup,
      this.config["screenWidth"],
      null
    ); 
  }
);

  
// })
  

    
// })

  }

 converRawdataintoArray(filter:any):Promise<any> {
  return new Promise(async (resolve, reject) => {
    let final:any[]=[]

    var parentFilter:any
for (let index = 0; index < filter.length; index++) {
const element = filter[index];
const clonedElement = { ...element };
parentFilter = { ...clonedElement };
parentFilter.condition = [];
for (let conditionIndex = 0; conditionIndex < clonedElement.condition.length; conditionIndex++) {
  const condition = clonedElement.condition[conditionIndex];

  if (condition.condition) {
    final.push(condition);
  } else {
    parentFilter.condition.push(condition);
  }
}
final.push(parentFilter);
}
resolve(final)
  })
 }

  grpfn() {
    var filterCondition1 = {
      filter: [
        {
          clause: "AND",
          conditions: [
            { column: "is_collection", operator: "EQUALS", value: "Yes" },
          ],
        },
      ],
    };
    this.DataService.getDataByFilter(
      "model_config",
      filterCondition1
    ).subscribe((res: any) => {
      this.dialogService.openDialog(
        this.Popup,
        this.config["screenWidth"],
        null
      );
      this.collections = res.data[0].response.map((response: any) => {
        return {
          model_name: response.model_name
            .replace(/_/g, " ")
            .toUpperCase()
            .replace(/_/g, " "),
          value: response.collection_name,
        };
      });
    });
  }
  grp: any[]= [];
  subGrp: any[]= [];
  subGrpflag: any[]= [];
button_Flag:boolean=false
  Parent_Conditons(flag:any,vals:any,index:any) {
    debugger
    if(flag==true){
      this.grp.push([{ flag: true ,operator:vals}]);
      this.field.push([]);
      this.operator.push([]);
      this.orbitalValue.push([]);
      this.orbitalOptions.push([]);
      this.operatorOptions.push([]);
      this.flag.push([]);
      this.anotherfield.push([]);
      this.inputflag.push([]);
    }else{
     this.grp[index].push({ flag: true ,operator:this.grp[index][0].operator});
    }
  }

  removeField(i: number,index:any) {
    this.field[i].splice(index, 1);
    this.operator[i].splice(index, 1);
    this.orbitalValue[i].splice(index, 1);
    this.flag[i].splice(index, 1);
    this.grp[i].splice(index, 1);
  }

  addgrp(index: any,i:any) {
    console.log(this.grp[index][i],'this.grp[index][i]');
    
this.grp[index].push({ flag: true ,operator:this.grp[index][0].operator})
}

  getOperators(field: any ,i: any,index:any) {
    if (field?.reference) {
      this.operatorOptions[i][index] = [
        {
          label: "== Equal To",
          value: "equals",
          type: "orbital_value",
          anotherfield: false,
        },
        {
          label: "!= Must Not Be Equal To",
          value: "notEqual",
          type: "orbital_value",
          anotherfield: false,
        },
      ];
    } else if (field.type == "time.Time") {
      this.operatorOptions[i][index] = [
        {
          label: ">= Greater than or equal to",
          value: "greaterThanOrEqual",
          type: field.type,
          anotherfield: false,
        },
        {
          label: "<= Less than or equal to",
          value: "lessThanOrEqual",
          type: field.type,
          anotherfield: false,
        },
        {
          label: "< Greater than",
          value: "greaterThan",
          type: field.type,
          anotherfield: false,
        },
        {
          label: "> Less than",
          value: "lessThan",
          type: field.type,
          anotherfield: false,
        },
        // { label: "Within Duration", value: "within" ,type:field.type},
        {
          label: "Within Any Date Range",
          value: "in_between",
          type: field.type,
          anotherfield: true,
          anotherfieldtype: "date",
        },
      ];
    } else if (field.type == "string") {
      // this.dateflag[i]=false

      this.operatorOptions[i][index] = [
        // { label: "Greater Than or Equal To", value: "greaterThanOrEqual",type:"string" },
        // { label: "Less Than or Equal To", value: "lte" ,type:"string"},
        // { label: "Greater Than", value: "gt" ,type:"string"},
        // { label: "Less Than", value: "lt" ,type:"string"},
        {
          label: "==  Equal To",
          value: "equals",
          type: field.type,
          anotherfield: false,
        },
        {
          label: "!= Not Equal To",
          value: "notEqual",
          type: field.type,
          anotherfield: false,
        },
        {
          label: "A.. StartWith",
          value: "startwith",
          type: field.type,
          anotherfield: false,
        },
        {
          label: "..T EndWith",
          value: "endwith",
          type: field.type,
          anotherfield: false,
        },
        {
          label: "Not Blank",
          value: "notblank",
          type: field.type,
          anotherfield: false,
          flag: true,
        },
        {
          label: "Blank",
          value: "blank",
          type: field.type,
          anotherfield: false,
          flag: true,
        },
        {
          label: "Contains Any Words",
          value: "contain",
          type: field.type,
          anotherfield: false,
        },
        // { label: "Min and Max Value", value: "in_between" ,type:"string"}
      ];
    } else if (field.type == "boolean") {
      // this.dateflag[i]=false

      this.operatorOptions[i][index] = [
        { label: "True", value: "true", type: field.type, anotherfield: false },
        {
          label: "false",
          value: "false",
          type: field.type,
          anotherfield: false,
        },
      ];
    } else {
      // Number
      // this.dateflag[i]=false
      this.operatorOptions[i][index] = [
        {
          label: ">= Greater Than or Equal To",
          value: "greaterThanOrEqual",
          type: field.type,
          anotherfield: false,
        },
        {
          label: "<= Less Than or Equal To",
          value: "lessThanOrEqual",
          type: field.type,
          anotherfield: false,
        },
        {
          label: "< Greater Than",
          value: "greaterThan",
          type: field.type,
          anotherfield: false,
        },
        {
          label: "> Less Than",
          value: "lessThan",
          type: field.type,
          anotherfield: false,
        },
        {
          label: "== Equal To",
          value: "equals",
          type: field.type,
          anotherfield: false,
        },
        {
          label: "!= Not Equal To",
          value: "notEqual",
          type: field.type,
          anotherfield: false,
        },
        {
          label: "Minimum value",
          value: "min",
          type: field.type,
          anotherfield: false,
        },
        {
          label: "Maximum value",
          value: "max",
          type: field.type,
          anotherfield: false,
        },
        {
          label: "Regular Expression",
          value: "regexp",
          type: field.type,
          anotherfield: false,
        },
        {
          label: "Min and Max Value",
          value: "in_between",
          type: field.type,
          anotherfield: true,
          anotherfieldtype: "any",
        },
      ];
    }
  }

  filterindex:any[]=[]
  flag: any[] = [];
  // dateflag:any[]=[]
  // nonorbitalvalues:any[]=[]
  options: any;
  groupName: any;
  groupDescription: any;
  selectedCollection: any;
  collections: any;
  field: any[] = [];
  operator: any[] = [];
  operatorOptions: any[] []= [];
  // startdate:any[]=[]
  // enddate:any[]=[]
  grouptype: any;
  orbitalValue: any []= [];
  orbitalOptions: any[] = [];
  clause: any[] = [];
  inputflag: any[] = [];
  anotherfield: any []= [];
  Conditon: any[] = [];
  // GrpEditmode:any[]=[]
  apiflag: boolean = false;
  // dummyCollections:any
  valuechange(vals: any,flag?:any) {

    // this.dummyCollections=vals.value
    if ((this.apiflag == true && this.selectedCollection != "")|| flag) {
      // let values= vals.model_name
      let filterCondition = {
        filter: [
          {
            clause: "AND",
            conditions: [
              {
                column: "model_name",
                operator: "EQUALS",
                value: this.selectedCollection,
              },
            ],
          },
        ],
      };

      // model_config
      //! to chnage
      // this.dataService.getotherModuleName(model_name)
      this.DataService.getDataByFilter("data_model", filterCondition).subscribe(
        (res: any) => {
          let values: any;
          values = res.data[0].response.map((res: any) => {
            let field_name = res.column_name.toLowerCase();
            let data: any = {};
            if (res.is_reference) {
              data.collection_name = res.collection_name;
              data.field = res.field;
              return {
                name: res.column_name
                  .replace(/_/g, " ")
                  .toUpperCase()
                  .replace(/_/g, " "),
                field_name: field_name,
                reference: res.is_reference,
                orbitalvaule: data,
                type: res.type,
              };
            } else {
              return {
                name: res.column_name
                  .replace(/_/g, " ")
                  .toUpperCase()
                  .replace(/_/g, " "),
                field_name: field_name,
                type: res.type,
              };
            }
          });
          let addtionalvalues: any[] = [];
          values.forEach((result: any) => {
            // console.log(result);
            const typeMapping: { [key: string]: string } = {
              string: "string",
              int: "number",
              int64: "number",
              float32: "number",
              float64: "number",
              bool: "boolean",
              "time.Time": "Date",
            };
            const selectedTypes = result.type.replace("[", "").replace("]", "");
            // console.log(selectedTypes,'selectedTypes');
            if (!(selectedTypes in typeMapping)) {
              let filterCondition = {
                filter: [
                  {
                    clause: "AND",
                    conditions: [
                      {
                        column: "model_name",
                        operator: "EQUALS",
                        value: selectedTypes,
                      },
                    ],
                  },
                ],
              };
              //  console.log(result.field_name);
              //  console.log();

              // model_config
              //! to chnage
              // this.dataService.getotherModuleName(model_name)
              this.DataService.getDataByFilter(
                "data_model",
                filterCondition
              ).subscribe((res: any) => {

                let values: any;
                values = res.data[0].response.map((res: any) => {
                  let field_name =
                    result.field_name + "." + res.column_name.toLowerCase();
                  let column_name =
                    result.name
                      .replace(/_/g, " ")
                      .toUpperCase()
                      .replace(/_/g, " ") +
                    " : " +
                    res.column_name
                      .replace(/_/g, " ")
                      .toUpperCase()
                      .replace(/_/g, " ");
                  let data: any = {};
                  if (res.is_reference) {
                    data.collection_name = res.collection_name;
                    data.field = res.field;
                    addtionalvalues.push({
                      name: column_name,
                      field_name: field_name,
                      reference: res.is_reference,
                      orbitalvaule: data,
                      type: res.type,
                    });
                  } else {
                    addtionalvalues.push({
                      name: column_name,
                      field_name: field_name,
                      type: res.type,
                    });
                  }
                });
              });
            } else {
              addtionalvalues.push(result);
            }
          });
          this.options = addtionalvalues;
        }
      );
    }
  }
  // addEvent(type: any, event: any,i:any) {
  //
  //   if(type){
  //     console.log('of');

  //     this.startdate[i]=moment.utc(event.value)
  //   }else{
  //     this.enddate[i]=moment.utc(event.value)

  //   }
  // }

  setflag(vals: any ,i: any,index:any) {
    if (vals.reference) {
      let filterCondition = [
        {
          clause: "AND",
          conditions: [
            //  { column: 'model_name', operator: "EQUALS", value:  vals.orbitalvaule.collection_name},
          ],
        },
      ];

      //  ,filterCondition ByFilter
      this.DataService.getDataByFilter(
        vals.orbitalvaule.collection_name,
        {}
      ).subscribe((xyz: any) => {
        this.flag[i][index] = true;
        this.inputflag[i][index] = true;
        this.orbitalOptions[i][index] = xyz.data[0].response.map((vals: any) => {

          return { label: vals.name, value: vals["_id"] };
        });
        // this.orbitalOptions[i]=xyz.data
      });
  } else {
      this.flag[i][index] = false;
    }
  }
  closegrp(flag?: any) {

    if (!flag == false) {
      this.groupName = "";
      this.groupDescription = "";
      this.clause = [];
      this.grouptype = "";
    }
    this.selectedCollection = "";
    this.operator = [];
    this.field = [];
    this.options = [];
    this.operator = [];
    this.operatorOptions = [];
    this.orbitalValue = [];
    this.orbitalOptions = [];
    this.flag = [];
    // this.dateflag=[]
    // this.startdate=[]
    // this.enddate=[]
    this.grp = [];
    this.Conditon = [];
    this.inputflag = [];
    this.anotherfield = [];
  }

  opertorchange(values: any,i: any,index:any) {
    if (values.anotherfield) {
      this.inputflag[i][index] = values?.anotherfieldtype;
    } else {
      if (values.flag) {
        this.flag[i][index] = true;
        // this.inputflag[i]=false
      } else {
        if (values.type != "orbital_value") {
          if (this.flag[i][index] == true) {
            this.flag[i][index] = false;
          }
          this.inputflag[i][index] = values?.anotherfield;
        }
      }
    }
  }

  savegrp() {
      let overallcondition: any[] = [];
        let value: any;
    
for (let index = 0; index < this.grp.length; index++) {
  const element1 = this.grp[index];  
  let Condition: any[] = [];

  for (let i = 0; i <element1.length; i++) {
    let field: any = this.field[index][i];
        let operator: any = this.operator[index][i];
        let value: any;
        if (field.type === "time.Time" && operator.type === "time.Time") {
          if (
            operator.anotherfieldtype == "date" &&
            operator.value == "in_between" &&
            operator.anotherfield == true
          ) {

          } else {

          }
        }
         else {
          if (operator.anotherfield == true && operator.value == "in_between") {
            value = [this.orbitalValue[index][i], this.anotherfield[index][i]];
          } else {
            value = this.orbitalValue[index][i];
          }
        }
if(operator.type=="orbital_value"){
  operator.type="String"
}
        const conditions = {
          column_name: field.field_name,
          operator: operator.value,
          type:operator.type.toUpperCase(),
          values: value,
        };
        // overallcondition.push(condition);
  }
  let filter:any={
    clause:this.grp[index][0].operator,
    condition: Condition
  }
  overallcondition.push(filter);
}



let final:any[]=[]

for (let index = 0; index < overallcondition.length; index++) {
  const element = overallcondition[index];
  if(index==0){
    final.push(element)    
  }else{
    final[0].condition.push(element)    
  }
  
}
let finaldata: any = {
  group_name: this.groupName,
  ref_collection: this.selectedCollection,
  groupDescription: this.groupDescription,
  grouptype: this.grouptype,
  status: "A",
  filter: final,
};
this.DataService.save(this.collectionName, finaldata).subscribe(
  (res: any) => {
    if (res) {
      this.dialogService.closeModal();
      this.closegrp(true);
      this.getList();
    }
  }
);
// console.log(overallcondition);
// console.log(finaldata);

  }
  Grp_undo_edit(index: any,i:any) {
    this.grp[index]=[{ flag: true ,operator:this.grp[index][i].operator }];

  }
  // ! TO do
  convertdata_into_string(index?: any,i?:any) {
    let field: any = this.field[index][i];
    let operator: any = this.operator[index][i];
    let value: any;
    if (operator.anotherfield == true && operator.value == "in_between") {
      // if(operator.type=='')
      value = [this.orbitalValue[index] [i] , this.anotherfield[index] [i] ];
    } else {
      if (this.orbitalValue[index] [i]  !== undefined) {
        value = this.orbitalValue[index] [i] ;
      } else {
        value = "";
      }
    }
    

    let vals: any =
      // this.Conditon  [index] +
      // "-" +
      field.name +
      " " +
      operator.label +
      " " +
      value;

    //! Undo
    // const condition = {
    //   column_name: field.field_name,
    //   operator: operator.value,
    //   values: value,
    //   conditon:this.Conditon[index]
    // };
    // console.log(condition);
    // let filterCondition:any ={
    //   clause:this.clause,
    //   conditon:condition
    //   }
    //   console.log(filterCondition);
    // ! Color Change purposes only
    // let color:any =""
    // if(this.Conditon[index]=="OR"){

    // }
    // let data:any={
    //   filter:filterCondition
    // }
    // this.grp[index].flag=false
    console.log(this.grp[index][i],'this.dasdassssssssssss[index][i]');

    this.grp[index][i] = { flag: false, filter: vals ,operator:this.grp[index][i].operator};
  }

}
