
import { HttpClient } from '@angular/common/http';
import { Component, TemplateRef, ViewChild, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from "../../services/data.service";
import {
  ColDef,
  FirstDataRenderedEvent,
  GridReadyEvent,
} from "ag-grid-community";
import * as moment from "moment";
import { DialogService } from '../../services/dialog.service';
import { ActionButtonComponent } from './button';
import * as _ from 'lodash';
import { MyLinkRendererComponent } from './cellstyle';
import { Subject } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import "ag-grid-enterprise";
import { JwtHelperService } from '@auth0/angular-jwt';
@Component({
  selector: 'app-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.css']
})

export class DatatableComponent implements OnInit {

  collectionName!: string;
  listName!: string;
  // listClientName!: string;
  config: any;
  pageHeading: any;
  columnDefs: ColDef[] = [];
  listData: any
  addEditMode: string = "popup";
  fields: any;
  selectedRow: any = {};
  loading: boolean = false;
  id: any
  gridApi: any;
  frameworkComponents: any;
  context: any
  formAction: string = "add"
  selectedModel: any = {}
  showbutton!: boolean;
  dataExist = true
  @ViewChild("editViewPopup", { static: true }) editViewPopup!: TemplateRef<any>;
  @ViewChild("urlViewPopup", { static: true }) urlViewPopup!: TemplateRef<any>;
  @Output('data') data = new EventEmitter<any>();
  clientData: any
  formName!: string
  model: any
  user_id: any
  fieldss!: FormlyFieldConfig[]
  models: any = {}

  @Output('onClose') onClose = new EventEmitter<any>();
  @Input('mode') mode: string = "page"


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private httpclient: HttpClient,
    private DataService: DataService,
    public dialogService: DialogService) {
    this.user_id = sessionStorage.getItem('user_id')
    this.context = { componentParent: this };
    this.frameworkComponents = {
      buttonRenderer: ActionButtonComponent,
      linkRenderer: MyLinkRendererComponent
    };

  }
  ById: any
  byModule: any
  moduleData: any
  ngOnInit() {
    debugger
    this.route.params.subscribe((params) => {
      this.ById = params['id'];
      this.byModule = params['moduleid'];
      if (params["form"]) {
        this.listName = params["form"];
        this.formName = this.listName
        this.loadConfig();
      }
      else if (params["id"]) {
        this.listName = "project"
        this.DataService.getDataByIdClient("client", this.ById).subscribe((res: any) => {
          this.clientData = res.data[0]
        })
        debugger
        this.DataService.getDataByIdClient("project", this.ById).subscribe((res: any) => {
          this.listData = res.data
        })
        this.loadConfig();
      }
      else if (params["id"]) {
        this.listName = "testcase"
        this.formName = this.listName
        this.DataService.getDataId("query/modules", this.byModule).subscribe((res: any) => {
          this.moduleData = res.data[0]

        })
        this.DataService.getDataId("query/testcase", this.byModule).subscribe((res: any) => {
          this.listData = res.data
          //location.reload()
        })
        this.loadConfig();
      }
        
    });
  }

  public defaultColDef: ColDef = {
    resizable: true,
  };

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
  }

  onFirstDataRendered(params: FirstDataRenderedEvent) {
    params.api.sizeColumnsToFit();
  }


  loadConfig() {
    debugger
    this.httpclient
      .get("assets/jsons/" + this.listName + "-" + "list.json")
      .subscribe((config: any) => {

        this.config = config;
        this.showbutton = config.showbutton;
        this.collectionName = config.collectionName
        this.pageHeading = config.pageHeading;
        this.addEditMode = config.addEditMode;
        this.fields = [];
        this.columnDefs = this.config.columnDefs;
        this.columnDefs.forEach((e: any) => {
          if (e.type == "datetime") {
            e.valueGetter = (params: any) =>
              moment(params.data[e.field]).format(e.format || "DD-MM-YYYY ");
          }
          if (e.type == "date") {
            e.valueGetter = (params: any) =>
              moment(params.data[e.field]).format(e.format || "DD-MM-YYYY ");
          }
          if (e.type == "datepicker") {
            e.valueGetter = (params: any) =>
              moment(params.data[e.field]).format(e.format || "DD-MM-YYYY ");
          }
          if (e.type == "color") {
            e.cellStyle = (params: any) => {
              return { color: 'blue' };
            }
          }
          if (e.width) {
            e['width'] = e.width
          }
        });
        //get list of records for specific collection/table
        if (this.ById != undefined) {
          this.getList(this.ById);
        } else if (this.byModule != undefined) {
          this.getList(this.byModule);
        } else {
          this.getList();
        }
      });
  }


  //get data from api for grid
  getList(data?: any) {
    debugger
    if(this.config.flag){
      let data:any =localStorage.getItem('auth');
      // let data1:any =localStorage.getItem('auth')
      // this.id=JSON.parse(data1).name;
      // console.log();
      // this.DataService.getdataTimesheet(id).subscribe((res:any)=>{
      //   console.log(res);
        
      // this.listData= res.data
      // })
      let userPermissions = JSON.parse(data).role
          let id =JSON.parse(data).profile.employeeid

    if (userPermissions === 'SA' || userPermissions === 'team lead') {
     this.DataService.getdata1().subscribe((xyz:any)=>{
      this.listData= xyz.data

     })
    }else{
       this.DataService.gettaskdata(id).subscribe((res:any)=>{
           console.log(res);
           
         this.listData= res.data
        })

    }
      // else if(this.config.task){
        // console.log('task');
        
            // }
    }else if (data) {
      this.DataService.getDataByIdClient(this.collectionName, data).subscribe((res: any) => {
        this.listData = res.data
      })
    }
    else if (!data) {
      this.DataService.getdata(this.collectionName).subscribe((res: any) => {
        if (res) {
          this.listData = res.data
        }
        else {
          this.listData = []
        }
        this.gridApi.sizeColumnsToFit();
      });
    } else {
      console.log("No data")
    }
  }

  onSelectionChanged(event: any) {
    this.selectedRow = event.api.getSelectedRows()[0]
    this.selectedModel = this.selectedRow
    console.log('hi', this.selectedRow)

    //this.model.testcaseid = this.selectedRow.testcaseid;

  }
  // Method for add form
  onAddButonClick() {
    debugger
    this.selectedModel = {}
    this.formAction = "add"
    this.doAction()
  }
  valueChanged: any[] = []
  datas: any

  /**get supplier by view in the data */
  onCellValueChanged(params: any) {
    debugger
    let fieldName = params.colDef.field;
    this.valueChanged = params.value;
    let data: any = {};
    data[fieldName] = params.value;

    this.DataService.updateById("timesheet", params.data.id, data).subscribe((res: any) => {
      this.listData = res.data;
    });
  }

  // Method for action buttons
  onActionButtonClick(item: any, data: any ,params:any) {
    debugger
    this.selectedModel = this.selectedRow
    this.formAction = item.label.toLowerCase()
    this.formName = item.formName
    let id = this.config.keyField
    console.log(this.formAction);
    
    if (this.formAction == "add") {
      this.selectedModel = {}
      this.doAction()
    } else if (this.formAction == "edit") {
      this.selectedModel = data
      console.log('edit');
      if(item.formName=="task"){
        sessionStorage.setItem('projectname',data.projectname)
      }
      this.doAction(data, data[id])
    } else if (this.formAction == "route") {
      this.router.navigate([`${this.config.addRoute}`, data[this.config.keyField]])
      //this.router.navigate([`${this.config.addRoute}`])
     
      
    } else if (this.formAction == "modules") {
      // const emitData = data

      this.router.navigate([`${this.config.moduleRoute}` + "/" + `${data._id}`])
      //this.router.navigate([`${this.config.addRoute}`])
    }
    else if (this.formName == "projectteam") {
      this.router.navigate([`${this.config.projectteamRoute}` + "/" + `${data._id}`])
       
    }
   
   
    else if (this.formName == "project") {
      this.router.navigate(["/list/project" + "/" + `${data.clientname}`])
    }
    else if (this.formName == "testcase") {
      this.router.navigate(["/list/testcase" + "/" + `${data.moduleid}`])

    }
    else if (this.formName == "testresult") {
      //this.router.navigate([`${this.config.testresultRoute}` + "/" + `${data.testcaseid}`])
      this.selectedModel = {}
      sessionStorage.setItem("testcasename",data.testcasename)
    
      this.doAction()
    }
   
    else if (this.formAction == "view") {
      this.httpclient
        .get("assets/jsons/" + this.formName + "-" + "view" + ".json")
        .subscribe((frmConfig: any) => {
          this.config = frmConfig
          this.fields = frmConfig.form.fields
          this.pageHeading = frmConfig.pageHeading;
          this.doAction(data, data[id])
        });
    } else if (this.formAction == "delete") {
      debugger
      if (confirm("Do you wish to delete this record?")) {
        // debugger
        this.DataService.deleteDataById(this.formName, data._id).subscribe((res: any) => {
          this.dialogService.openSnackBar('Data has been deleted successfully', 'OK');
          this.getList();
        });
      }
    }
  }

  close(event: any) {
    this.dialogService.closeModal()
    this.fields = undefined
    if (event) {
      if (event.action == 'Add') {
        this.listData.push(event.data)
        this.listData = [...this.listData]
      } else {
        this.getList()
      }
    }
  }


  // Open dialog for add,edit and view
  doAction(data?: any, id?: string) {
    debugger
    console.log(this.formAction );
    
    if (this.config.editMode == 'popup') {
      this.dialogService.openDialog(this.editViewPopup, this.config['screenWidth'], null, data);
    }
    else {
      if (this.formAction == "add") {
        // if (this.collectionName = "project") {
        if (this.ById != undefined) {
          sessionStorage.setItem('ById', this.ById)
        }
        // }

        this.router.navigate([`${this.config.addRoute}`])
      } else if (this.formAction == "edit") {
      
        
        this.router.navigate([`${this.config.editRoute}`, data[this.config.keyField]])
      }
      else {
        this.dialogService.openDialog(this.editViewPopup, this.config['screenWidth'], null, data);
      }
    }
  }

}




