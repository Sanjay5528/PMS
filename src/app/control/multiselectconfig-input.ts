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
    </style>

    <h4>{{ field.props!["label"] }}</h4>
    <ng-multiselect-dropdown
      #multiSelect
      [placeholder]="field.props!['label']"
      [data]="dropdownList || []"
      [settings]="settings"
      [formlyAttributes]="field"
      [(ngModel)]="dropdownList"
      [required]="to.required || false"
      [disabled]="false"
      (onSelect)="onItemSelectController($event)"
      (onSelectAll)="onItemSelectController($event)"
      (onDeSelect)="onItemSelectController($event)"
      (onDeSelectAll)="onItemSelectController($event)"
 
    >
    </ng-multiselect-dropdown>
    <div style="height: 30px;"></div>
    <!--  (onFilterChange)="onFilterChange($event)" -->
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

  public get FormControl() {
    return this.formControl as FormControl;
  }

  ngOnInit() {
    this.label = this.field.props?.label;
    this.opt = this.field.props || {};
    this.labelProp = this.opt.labelProp;
    this.valueProp = this.opt.valueProp;
    this.currentField = this.field;
    this.onValueChangeUpdate = this.opt.onValueChangeUpdate;

    this.settings = {
      singleSelection: false,
      defaultOpen: false,
      idField: this.opt.valueProp,
      textField: this.opt.labelProp,
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      enableCheckAll: true,
      itemsShowLimit: 7,
      allowSearchFilter: true,
      noDataAvailablePlaceholderText: "No data available",
    };

    if (this.model.isEdit == true) {
      this.formControl.setValue(this.model[this.field.key]); 
      this.selectedItems = this.formControl?.value;  
      this.dropdownList =  this.formControl?.value 
      // this.form.get("config_select")?.valueChanges.subscribe((data: any) => {
      //   this.DefaultDataInit(this.removeSpecialCharacters(data.toLowerCase()));
      // });
      this.DefaultDataInit(
        this.removeSpecialCharacters(
          this.form.get("config_select")?.value.toLowerCase()
        )
      );
    } else {
      this.form.get("config_select")?.valueChanges.subscribe((data: any) => {
        this.DefaultDataInit(this.removeSpecialCharacters(data.toLowerCase()));
      });
      this.DefaultDataInit(
        this.removeSpecialCharacters(
          this.form.get("config_select")?.value.toLowerCase()
        )
      );
    }
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

  get f() {
    return this.formGroup.controls;
  }

  DefaultDataInit(type: any) {
    let observable$;
    if (type === "shared") {
      observable$ = this.dataService.GetDataByDefaultSharedDB(type);
    } else {
      observable$ = this.dataService.GetDataByDefaultSharedDB("other", type);
    }

    observable$.subscribe((res: any) => {
      this.dropdownList = res.data[0][this.field.key];
      const allValues = this.dropdownList.map(
        (item: any) => item[this.valueProp]
      );
      this.FormControl.setValue(allValues);
      this.selectedItems = allValues;
      this.cf.detectChanges();
    });
  }

  onItemSelectController(event: any) {
    console.log(this.selectedValue, event);
    if (_.isEmpty(this.selectedValue)) {
      this.formControl.setValue(undefined);
    } else {
      // Change arr of object into arr string
      let data: any[] = this.selectedValue;
      let arrayValue: any[] = [];
      data.map((result: any) => {
        arrayValue.push(result[this.opt.valueProp]);
      });
      console.log(this.selectedValue, arrayValue);
      this.formControl.setValue(arrayValue);
    }
  }

  selectedValue: any[] = [];
  valueSlected() {
    let arr: any[] = this.model[this.field.key];
    this.selectedValue = [];
    console.log(arr);

    arr.map((result: any) => {
      let arrayValue: any = {};
      arrayValue[this.to.valueProp] = result;
      this.selectedValue.push(arrayValue);
    });
    console.error(this.selectedValue);
    // this.thisFormControl.setValue(this.selectedValue)
    // this.cdr.detectChanges()
  }

  onFilterChange(event: any) {
    if (this.opt.serverSide) {
      if (this.opt.optionsDataSource.methodName) {
        let queryParams: any = this.opt.optionsDataSource.defaultQueryParams;
        queryParams[this.opt.labelProp] = event;
        console.log(queryParams);
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
