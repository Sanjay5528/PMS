import {
  Component,
  OnInit,
  AfterViewInit,
  SimpleChanges,
  OnChanges,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { FieldType, FormlyFieldConfig } from "@ngx-formly/core";
import { DataService } from "../services/data.service";

import { DialogService } from "../services/dialog.service";

@Component({
  selector: "multiselectconfig-input",
  template: `
    <style></style>
    <div *ngIf="this.field?.height === false" style="height: 300px;">
      <ng-select
        [dropdownPosition]="'bottom'"
        [placeholder]="field.props!['label']"
        [items]="dropdownList"
        [clearSearchOnAdd]="true"
        [multiple]="true"
        [bindLabel]="labelProp"
        [closeOnSelect]="false"
        [bindValue]="valueProp"
        [formControl]="FormControl"
        [formlyAttributes]="field"
        appearance="outline"
      >
        <ng-template
          ng-option-tmp
          let-item="item"
          let-item$="item$"
          let-index="index"
          style="height: 25px;"
        >
          <input
            id="item-{{ index }}"
            type="checkbox"
            [ngModel]="item$.selected"
          />
          <span
            style="margin-left:5px"
            [innerHTML]="item[this.labelProp]"
          ></span>
        </ng-template>

        <ng-template ng-multi-label-tmp let-items="items" let-clear="clear">
          <div class="ng-value" *ngFor="let item of items">
            <span class="ng-value-label">
              {{ $any(item)[this.labelProp] }}</span
            >
            <span
              class="ng-value-icon right"
              (click)="clear(item)"
              aria-hidden="true"
              >×</span
            >
          </div>
        </ng-template>
      </ng-select>
    </div>
    <div  *ngIf="this.field?.height != false">
      <ng-select
        [dropdownPosition]="'bottom'"
        [placeholder]="field.props!['label']"
        [items]="dropdownList"
        [clearSearchOnAdd]="true"
        [multiple]="true"
        [bindLabel]="labelProp"
        [closeOnSelect]="false"
        [bindValue]="valueProp"
        [formControl]="FormControl"
        [formlyAttributes]="field"
        groupBy="collection_name"
        [selectableGroup]="true"
        [selectableGroupAsModel]="false"
       [closeOnSelect]="false"
        appearance="outline"
      >

      <!-- <ng-template
    ng-optgroup-tmp
    let-item="item"
    let-item$="item$"
    let-index="index"
  >
    <input id="item-{{ index }}" type="checkbox" [ngModel]="item$.selected" />
    Select All
  </ng-template> -->

  <ng-template ng-optgroup-tmp let-item="item" let-item$="item$" let-index="index">
        <input id="item-{{index}}" type="checkbox" [ngModel]="item$.selected"/> {{item.collection_name}} Collection
    </ng-template>

        <ng-template
          ng-option-tmp
          let-item="item"
          let-item$="item$"
          let-index="index"
          style="height: 25px;"
        >
          <input
            id="item-{{ index }}"
            type="checkbox"
            [ngModel]="item$.selected"
            [ngModelOptions]="{ standalone: true }"
          />
         
          <span
            style="margin-left:5px"
            [innerHTML]="item[this.labelProp]"
          ></span>
        </ng-template>

        <ng-template ng-multi-label-tmp let-items="items" let-clear="clear">
          <div class="ng-value" *ngFor="let item of items">
            <span class="ng-value-label">
              {{ $any(item)[this.labelProp] }}</span
            >
            <span
              class="ng-value-icon right"
              (click)="clear(item)"
              aria-hidden="true"
              >×</span
            >
          </div>
        </ng-template>
      </ng-select>









      
    </div>
  `,
})
export class MultiSelectConfigInput extends FieldType<any> implements OnInit {
  opt: any;
  valueProp: any;
  labelProp: any;
  onValueChangeUpdate: any;
  label: any;
  dropdownList: any = [];
  currentField: any;
  value: any;

  constructor(
    private dataService: DataService,
    private dialogService: DialogService
  ) {
    super();
  }

  public get FormControl() {
    return this.formControl as FormControl;
  }

  ngOnInit(): void {
console.log(this.model);

    this.form.get("config_select")?.valueChanges.subscribe((data: any) => {
      this.value = data;

      this.DefaultDataInit(this.value);
    });

    this.value = this.form.get("config_select")?.value;

    this.DefaultDataInit(this.value);

    this.label = this.field.props?.label;
    this.opt = this.field.props || {};
    this.labelProp = this.opt.labelProp;
    this.valueProp = this.opt.valueProp;
    this.currentField = this.field;
    this.onValueChangeUpdate = this.opt.onValueChangeUpdate;
  }
  selectAllForDropdownItems(items: any[]) {
    let allSelect = (items: any[]) => {
      items.forEach(element => {
        element['selectedAllGroup'] = 'selectedAllGroup';
      });
    };

    allSelect(items);
  }
  DefaultDataInit(type: any) {
    let observable$;
    if (type === "default") {
      observable$ = this.dataService.GetDataByDefaultSharedDB(type);
    } else {
      observable$ = this.dataService.GetDataByDefaultSharedDB("other", this.value);
    }
  
    observable$.subscribe((res: any) => {
      switch (this.field?.key) {
        case "datamodel_config":
          this.dropdownList = res.data[0].model_config;
          break;
        case "screen_config":
          this.dropdownList =  res.data[0].screen;
          break;
        case "menu_config":
          this.dropdownList = res.data[0].menu;
          break;
        case "dataset_config":
          this.dropdownList = res.data[0].data_set;
          break;
        default:
          this.dropdownList = [];
          break;
      }
      // this.dropdownList = this.selectAllForDropdownItems(this.dropdownList)
      console.log(this.dropdownList);
      
      const allValues = this.dropdownList.map((item: any) => item[this.valueProp]);
      this.FormControl.setValue(allValues);
    });
  }
  
}
