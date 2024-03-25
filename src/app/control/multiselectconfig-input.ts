import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from "@angular/core";
import { FieldType } from "@ngx-formly/core";
import { DataService } from "../services/data.service";
import {
  IDropdownSettings,
  NgMultiSelectDropDownModule,
} from "ng-multiselect-dropdown";
import * as _ from "lodash";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";

@Component({
  selector: "multiselectconfig-input",
  template: `
    <style>
      ::ng-deep .dropdown-list {
        position: relative !important;
      }

      ::ng-deep
        .multiselect-dropdown
        .dropdown-btn
        .selected-item-container
        .selected-item {
        border: 1px solid #337ab7 !important;
        margin-right: 4px !important;
        background: #337ab7 !important;
        padding-right: auto !important;
        color: #fff !important;
        border-radius: 2px !important;
        float: left !important;
        max-width: 250px !important;
      }
      ::ng-deep
        .multiselect-dropdown[_ngcontent-ng-c1411523848]
        .dropdown-btn[_ngcontent-ng-c1411523848]
        .selected-item-container[_ngcontent-ng-c1411523848]
        .selected-item[_ngcontent-ng-c1411523848]
        a[_ngcontent-ng-c1411523848] {
        cursor: pointer;
        text-decoration: none;
      }
      ::ng-deep
        .multiselect-dropdown[_ngcontent-ng-c1411523848]
        .dropdown-btn[_ngcontent-ng-c1411523848] {
        display: inline-block !important;
        border: 1px solid #adadad !important;
        width: 100% !important;
        padding: 15px 9px !important;
        margin-bottom: 0 !important;
        font-weight: 400 !important;
        vertical-align: middle !important;
        cursor: pointer !important;
        background-image: none !important;
        border-radius: 4px !important;
      }
      ::ng-deep
        .multiselect-dropdown[_ngcontent-ng-c1411523848]
        .dropdown-btn[_ngcontent-ng-c1411523848]
        .selected-item-container[_ngcontent-ng-c1411523848]
        .selected-item[_ngcontent-ng-c1411523848] {
        padding: 0 5px !important;
        margin-top: 7px !important;
      }
    </style> 
    <h4 style="font-weight: 100;" > {{ field.props!["label"] }}</h4>  
    <ng-multiselect-dropdown    
      [settings]="settings"
      [data]="dropdownList"
      [placeholder]="to.label  " 
      [(ngModel)]="selectedValue" 
      [required]="to.required || false"
      [formlyAttributes]="field" 
      [disabled]="false"
      (onSelect)="onItemSelectController($event)"
      (onSelectAll)="onItemSelectController($event)"
      (onDeSelect)="onItemSelectController($event)"  
      (onDeSelectAll)="onItemSelectController($event)"
      >  
  </ng-multiselect-dropdown>

  <mat-error *ngIf="this?.formControl?.touched && this?.formControl?.errors?.required">
  This {{ this.field.props?.label  }} is required
</mat-error>

<mat-error *ngIf="this?.formControl?.touched && this?.formControl?.errors?.pattern">
  This {{ this.field.props?.label  }} does not match the pattern
</mat-error>
<div style="height: 15px;">
 
  </div>




  `,
})
export class MultiSelectConfigInput extends FieldType<any> implements OnInit {
  constructor(
    private dataService: DataService,
    private fb: FormBuilder,
    private cf: ChangeDetectorRef
  ) {
    super();
  }
  @ViewChild("multiSelect") multiSelect!: NgMultiSelectDropDownModule;
  public formGroup!: FormGroup;
  loadContent: boolean = false;
  dropdownList: any = [];
  settings: IDropdownSettings = {};
  selectedItems = [];
  valueProp: any;
  labelProp: any;
  values: any;
  label: any;
  opt: any;
  onValueChangeUpdate: any;
  currentField: any;
  selectedValue: any[] = [];

  public get FormControl() {
    return this.formControl as FormControl;
  } 

  ngOnInit() {
    this.label = this.field.props?.label;
    this.opt = this.field.props || {};
    this.currentField = this.field;
    this.onValueChangeUpdate = this.opt.onValueChangeUpdate; 
    const { labelProp, valueProp } = this.opt;

    this.settings = {
      singleSelection: false,
      defaultOpen: false,
      idField: valueProp,
      textField: labelProp,
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      enableCheckAll: true,
      itemsShowLimit: 15,
      allowSearchFilter: true,
      noDataAvailablePlaceholderText: "No data available",
    };

    const transformValue = (value: string | undefined) =>
      this.removeSpecialCharacters(value?.toLowerCase() ?? "");

    this.form.get("config_select")?.valueChanges.subscribe((data: any) => {
      this.DefaultDataInit(transformValue(data));
    });

    this.DefaultDataInit(transformValue(this.form.get("config_select")?.value));
  }

  removeSpecialCharacters(input: string): string {
    const regex = /[!@#$%^&*(),.?":{}|<>]/g;
    return input.replace(regex, "");
  }

  public setForm() {
    const formControlName = this.field.key;
    this.formGroup = new FormGroup({
      [formControlName]: new FormControl(null, Validators.required),
    });
    this.loadContent = true;
  }

 
  DefaultDataInit(DbName: any) { 
    this.dataService.GetDataByDefaultSharedDB(DbName).subscribe((res: any) => {
      this.dropdownList = res.data[0][this.field.key];
      const allValues = this.dropdownList.map(
        (item: any) => item[this.valueProp]
      );
      this.FormControl.setValue(allValues);
 
      this.selectedValue =this.dropdownList
      // if(this.model[this.opt.key]){
        // this.valueSlected()
      // } 
      this.cf.detectChanges();
    });
  }

  onItemSelectController(event: any) { 
    if (_.isEmpty(this.dropdownList)) {
      this.formControl.setValue(undefined);
    } else {  
      let data: any[] = this.dropdownList;
      let arrayValue: any[] = [];
      data.map((result: any) => {
        arrayValue.push(result[this.opt.valueProp]);
      });
      this.formControl.setValue(arrayValue); 
    }
  }

  valueSlected(){
    let arr:any[]=this.model[this.field.key];
    this.selectedValue=[] 
   
    arr.map((result:any) => {
      let arrayValue:any={}
        arrayValue[this.to.valueProp] =result

        this.selectedValue.push(arrayValue)
      }) 
      // this.thisFormControl.setValue(this.selectedValue)
      // this.cdr.detectChanges()
  }



  onFilterChange(event: any) {
    if (this.opt.serverSide) {
      if (this.opt.optionsDataSource.methodName) {
        let queryParams: any = this.opt.optionsDataSource.defaultQueryParams;
        queryParams[this.opt.labelProp] = event; 
        //  (this.dataService[this.opt.optionsDataSource.methodName](this.opt.optionsDataSource.params,queryParams) as Observable<any>)
        //   .subscribe((res:any)=>{
        //      if(!_.isEmpty(res.data)){
        //          this.dropdownList = res.data
        //          if (this.model.isEdit||this.model.isView) {
        //           this.valueSlected()
        //           }
        //          this.cdr.detectChanges();
        //      }
        //   })
      }
    }
  }
}
