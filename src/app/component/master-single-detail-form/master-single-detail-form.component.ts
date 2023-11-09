import { ActivatedRoute, Router } from '@angular/router';
import { Component, Injectable, Input, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { DataService } from 'src/app/services/data.service';
import * as _ from 'lodash'
import { DialogService } from 'src/app/services/dialog.service';
import { FormService } from 'src/app/services/form.service';

import { environment } from 'src/environments/environment';
import { MasterButtonComponent } from './master-button';
import { ColDef, FirstDataRenderedEvent, GetRowIdFunc, GetRowIdParams, GridApi, GridReadyEvent } from 'ag-grid-community';


@Component({
  selector: 'master-single-detail-form',
  templateUrl: './master-single-detail-form.component.html',
  styleUrls: ['./master-single-detail-form.component.css'],
  providers: [DataService]
})
@Injectable({
  providedIn: 'root'
})
export class MasterSingleDetailFormComponent {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public formService: FormService,
    public dialogService: DialogService,
    private dataService: DataService
  ) {
    this.context = { componentParent: this };
    this.components = {
      buttonRenderer: MasterButtonComponent,
    };
  }

  @Input('controls') controls: any = {
    hideFilter: false,
    hideAddButton: false,
    enableEdit: true
  }

  //main form variables
  form = new FormGroup({});
  model = {}
  fields!: FormlyFieldConfig[]
  isFormDataLoaded = false
  id: any
  data: any
  //detail form variables
  detailForm = new FormGroup({});
  detailModel: any = {}
  detailFields!: FormlyFieldConfig[]
  detailListFields: any = []
  detailListConfig: any = {}
  isPopupEdit: any = false


  pageHeading: any
  formAction = 'Add'
  isEditMode = false
  isDetailEditMode = false
  isDataError = false
  butText = "Add"
  detailOldData: any
  config: any = {}
  options: any = {};
  listData: any[] = []

  keyCol: any
  formName: any
  showdefaultFilter: any = "yes"

  detailDefaultFocusIndex = 0;
  tempListData: any[] = []; //! unwanted
  selectedRow: any    // pop screen
  delete: any
  components: any;
  context: any;
  public gridApi!: GridApi
  // public gridOptions: any = {
  //   flex: 1,
  //   cacheBlockSize: environment.cacheBlockSize,
  //   paginationPageSize: environment.paginationPageSize,
  //   rowModelType: environment.rowModelType,
  // };

  // overlayNoRowsTemplate =
  //   '<span style="padding: 10px; background:white ;">No Data Found</span>"';
  otherdetails: any = {}
  value: any = {}
  valueformGrupo: any = new FormGroup({})
  // public getRowId: GetRowIdFunc = (params: GetRowIdParams) => `${params.data[this.config.keyField ? this.config.keyField  : "_id"]}`;

  @ViewChild('popupEdit', { static: true }) popupEdit!: TemplateRef<any>;
  @ViewChild('otherpopupEdit', { static: true }) otherpopupEdit!: TemplateRef<any>;

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.formName = params['form']
      this.id = params['id']
      this.formService.LoadMasterInitData(this)

    })
  }

  onGridReady(params: GridReadyEvent<any>) {
    this.gridApi = params.api;
  }
  public defaultColDef: ColDef = {
    resizable: true,
    suppressMovable: true,
    //   filterParams: {
    //     closeOnApply:true,
    //     buttons: ['reset', 'apply'],
    // },
  };
  frmStart(event: any) {
    var data: any = this.form.value
    this.id = data['_id']
    if (this.id) {
      this.formService.LoadData(this).subscribe(isDataAvail => {
        if (!isDataAvail) { // data not available, so save the data
          this.formService.saveFormData(this).then(() => {
            this.formService.LoadDetailConfig(this)
            this.isFormDataLoaded = true
          })
        }
      })
    }
  }
  addForm(mode: any) {

    //! send the value in local storage 
    //! amd remove in componet destroy 
    if (this.isPopupEdit) {
      this.isDetailEditMode = mode != "add"
      console.log(this, mode);
      this.butText = 'Add'
      if (this?.config?.detailForm?.collectionName == "data_model") {
        let data: any = this.model
        sessionStorage.setItem("model_name", data.model_name)
      }
      this.dialogService.openDialog(this.popupEdit, null, null, {})
    }
    else {
      this.router.navigate([`${this.config.addRoute}`])
    }

  }
  SaveProjectTeam() {

  }


  frmDetailSubmit(event: any) {
    if (!this.detailForm.valid) {
      function collectInvalidLabels(controls: any, invalidLabels: string = ''): string {
        for (const key in controls) {
          if (controls.hasOwnProperty(key)) {
            const control = controls[key];

            if (control instanceof FormGroup) {
              invalidLabels += collectInvalidLabels(control.controls);
            } else if (control instanceof FormControl && control.status === 'INVALID') {
              // Access the label property assuming it exists in the control
              invalidLabels += controls[key]._fields[0].props.label + ",";
            }
          }
        }
        return invalidLabels;
      }
      const invalidLabels: any = collectInvalidLabels(this.detailForm.controls);
      this.dialogService.openSnackBar("Error in " + invalidLabels, "OK");
      this.detailForm.markAllAsTouched();
      return
    }

    if (this?.config?.isCustomFuction == true) {
      this.SaveProjectTeam()
      return
    }
    event.preventDefault();
    event.stopPropagation();
    this.formService.updateDetailFormData(this).then((res: any) => {
      this.dialogService.closeModal()
    })
  }

  closePopup(data: any) {
    this.gridApi.deselectAll()
    this.dialogService.closeModal()
    if (Object.keys(data).length !== 0) {

      Object.assign(this.selectedRow, data)    // while file uploading,field get changed in grid
      this.detailForm.reset()
    }
  }

  goBack() {
    if (this.config.onCancelRoute) {
      let url = [this.config.onCancelRoute]
      // if (this.config.onCancelRouteParam)url.push(this.model[this.config.onCancelRouteParam]) //Todo 
      this.router.navigate(url)
    }
  }

  onSelect(event: any) {
    this.selectedRow = event.api.getSelectedRows()[0]
    this.detailFields[this.detailDefaultFocusIndex].focus = true
    this.detailModel = this.selectedRow
    this.detailModel['isEdit'] = true
    this.detailOldData = _.cloneDeep(this.detailModel)
    this.isDetailEditMode = true
    this.butText = "Update"
  }




  showList() {
    this.router.navigate([`/data/list/${this.formName}`]);
  }

  showDetail(row: any, action: any, $event: any) {               //  new screen opens when clicking the icon
    $event.stopPropagation();
    this.router.navigate([`${action}/${row._id}`])
  }
  // flag:boolean=false;
  onActionButtonClick($event: any, item: any, data: any) {
    console.log(data, item);
    if (item.formAction == "listpopup") {
      console.log('actions');
      this.dataService.loadScreenConfigJson(item.formName).subscribe((xyz: any) => {
        console.log(xyz);

        this.otherdetails = xyz
        this.dialogService.openDialog(this.otherpopupEdit, null, null, this.selectedRow)

      })
    } else if (item.formAction == "delete") {
      if (confirm("Do you wish to delete this record?")) {
        this.dataService.deleteDataById(this.config.detailForm.collectionName, data._id).subscribe(
          (res: any) => {
            this.dialogService.openSnackBar(
              "Data has been deleted successfully",
              "OK"
            );

          }
        );
      }
    }
    else {
      this.selectedRow = data
      if (this.config.extraData) {

        this.formService.split_Struct(data).then((vals: any) => {
          this.selectedRow = vals
          console.log(vals);
          this.dialogService.openDialog(this.popupEdit, null, null, this.selectedRow)
          $event.preventDefault();
          $event.stopPropagation();
        })
      } else {
        this.dialogService.openDialog(this.popupEdit, null, null, this.selectedRow)
        $event.preventDefault();
        $event.stopPropagation();
      }
    }

  }

  saveChild(data: any, value?: any) {
    console.log(data);

    console.log(this.valueformGrupo.value);
    let values = this.valueformGrupo.value
    values.facility_id = data._id // facitlity add
    values.org_id = data.org_id // Org ID add
    values.status = "Active"
    console.log(values);

    console.log(this.otherdetails);
    this.dataService.save(this.otherdetails.form.collectionName, values).subscribe((data: any) => {
      console.log(data);
      this.dialogService.closeModal();
    })
  }

  //  openOtherForm($event:any,row:any,config:any)    // popup form will open clicking the icon
  // {
  //     
  //     this.selectedRow = row
  //     $event.preventDefault();
  //     $event.stopPropagation();
  //     this.otherFormName  = config.formName
  //     if(config.icon=='arrow_upward'){
  //     this.dialogService.openDialog(this.otherFormPopup, null,null,row)
  //     }
  //     else
  //       this.getFile(row)  
  //     }

  delete_record($event: any, row: any, config: any) {
    $event.preventDefault();
    $event.stopPropagation();
    if (confirm("Are you sure,you want to delete the data?") == true) {

      this.dataService.deleteDataById(config.collectionName, row._id).subscribe((res: any) => {
        console.log(res);

        this.listData = res.data
        this.dialogService.openSnackBar("Article Deleted", "OK")
        this.formService.LoadInitData(this)
      })
    } else {
    }

  }


}
