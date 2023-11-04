
import { ThisReceiver } from '@angular/compiler';
import { Component, OnInit, TemplateRef, ViewChild, NgModule, AfterViewInit, ElementRef } from '@angular/core';
import { AbstractControl, FormControl, Validators } from '@angular/forms';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';
import { filter } from 'lodash';
import { Observable } from 'rxjs';
import { DataService } from '../services/data.service';
import { DialogService } from '../services/dialog.service';

@Component({
  selector: 'select-input',
  template: `

  <!-- <div class="center"><span>{{field.props!['label']}}</span></div> -->

  <mat-form-field>
  <mat-label>{{field.props!['label']}}</mat-label>
  <mat-select
  #matSelectInput
      [formlyAttributes]="field"
      [formControl]="thisFormControl"
      [required]="this.field.props.required"
      *ngIf="!field.props.readonly"
>
  <mat-option
  *ngFor="let op of this.opt.options"
    [value]="op[this.valueProp]" (click)="selectionChange(op)"
  >
  <span [innerHTML]="op[this.labelProp]"></span>

  </mat-option>
</mat-select>
 
<mat-error *ngIf="this.field.props.required">This  {{this.field.props?.label}} is required</mat-error>
<input matInput readonly [formlyAttributes]="field"
      [value]="selectedValue" *ngIf="field.props.readonly"/>
 
</mat-form-field>
  `,
})


export class SelectInput extends FieldType<any> implements OnInit {
  opt: any;
  data: any
  currentField: any
  //default prop setting

  //default prop setting
  valueProp = "id"
  labelProp = "name"
  dropdown: any
  selectedValue: any = ""
  selectedObject: any
  constructor(
    public dataService: DataService,
  ) {
    super();
  }

  public get thisFormControl() {
    return this.formControl as FormControl;
  }

  ngOnInit(): void {
    //debugger
    this.opt = this.field.props || {};
    this.labelProp = this.opt.labelProp;
    this.valueProp = this.opt.valueProp;
    this.currentField = this.field
    this.subscribeOnValueChangeEvent()
    console.log(this.opt);

    //below logic only for dynamic selection option
    if (this.opt.optionsDataSource.collectionName) {
      let name = this.opt.optionsDataSource.collectionName
      this.dataService.getdata(name).subscribe((res: any) => {
        debugger
        this.dataService.buildOptions(res, this.opt);

        if (this.field.props.attribute) {     //if the data in array of object
          let data = this.field.key.split(".").reduce((o: any, i: any) =>
            o[i], this.model
          );
          this.field.formControl.setValue(data)
        } else {
          this.field.formControl.setValue(this.model[this.field.key])
        }
      })
    }

    if (this.opt.optionsDataSource.collectionNameById) {
      let name = this.opt.optionsDataSource.collectionNameById
      let id = sessionStorage.getItem('projectname')
      console.log(name)
      this.dataService.getDataId(name, id).subscribe((res: any) => {
        debugger
        console.log(this.opt);
        console.log(this.valueProp);
        console.log(res);

        if (this.opt.flag) {
          let data = res.data[0].data
          this.dataService.buildOptions(data, this.opt);

        } else {
          this.dataService.buildOptions(res, this.opt);

        }

        if (this.field.props.attribute) {     //if the data in array of object
          let data = this.field.key.split(".").reduce((o: any, i: any) =>
            o[i], this.model
          );
          this.field.formControl.setValue(data)
        } else {
          this.field.formControl.setValue(this.model[this.field.key])
        }
      })
    }


    if (this.currentField.parentKey != "") {
      (this.field.hooks as any).afterViewInit = (f: any) => {
        const parentControl = this.form.get(this.currentField.parentKey)//this.opt.parent_key);
        parentControl?.valueChanges.subscribe((val: any) => {
          debugger
          console.log(val)
          let selectedOption = val
          if (selectedOption == undefined) return

          if (selectedOption != undefined) {

            if (this.currentField.method == "post") {
              this.dataService.getChidData(this.currentField.parentCollectionName, selectedOption).subscribe((res: any) => {
                if (res.data == null) {
                  this.opt.options = []
                } else {
                  this.dataService.buildOptions(res, this.opt);
                }
              })
            }
            else {
              this.dataService.getDataByIdTree(this.currentField.parentCollectionName, selectedOption).subscribe((res: any) => {
                if (res.data == null) {
                  this.opt.options = []
                } else {
                  this.dataService.buildOptions(res, this.opt);
                  console.log("hiii", this.opt)
                }
                if (this.field.props.attribute) {      //if the data in array of object
                  let data = this.field.key.split(".").reduce((o: any, i: any) => o[i], this.model);
                  this.field.formControl.setValue(data)
                } else {
                  this.field.formControl.setValue(this.model[this.field.key])
                }

              })

            }

          }

        })

      }
    }
  }




  selectionChange(selectedObject: any) {
    // if (selectedObject && this.opt.onValueChangeUpdate && this.opt.onValueChangeUpdate instanceof Array) {
    //   for (const obj of this.opt.onValueChangeUpdate) {
    //     this.field.formControl.parent.controls[obj.key].setValue(
    //       selectedObject[obj.valueProp]
    //     );
    //   }
    debugger
    console.log(selectedObject);
 
    if (this.opt.flag) {
      console.log("sdad");

      this.field.form.value['employeeid'] = selectedObject.employeeid
      console.log(this.field.form);

    }

    console.log(this.opt.onValueChangeUpdate);

    if (this.opt.onValueChangeUpdate) {
      this.field.form.controls[this.opt.onValueChangeUpdate.key].setValue(
        selectedObject[this.opt.onValueChangeUpdate.key]
      );
      selectedObject = {}
    }


  }

  // subscribeOnValueChangeEvent() {
  //   // on ParentKey changes logic to be implemented
  //   if (this.field.parentKey! != "") {
  //     (this.field.hooks as any).afterViewInit = (f: any) => {
  //       const parentControl = this.form.get(this.field.parentKey)//this.opt.parent_key);
  //       parentControl?.valueChanges.subscribe((val: any) => {
  //         this.selectedObject = val
  //       })

  //     }
  //   }
  // }
  subscribeOnValueChangeEvent() {
    // on ParentKey changes logic to be implemented
    console.log(this.opt, 'u');

    if (this.field.parentKey! != "") {
      (this.field.hooks as any).afterViewInit = (f: any) => {
        const parentControl = this.form.get(this.field.parentKey)//this.opt.parent_key);
        debugger
        parentControl?.valueChanges.subscribe((val: any) => {
          // if (val == undefined || val == "") {
          //   this.opt.options = []
          //   this.field.formControl.setValue(null)
          //   this.selectedValue = ""
          // } else {
          // this.model.division_code = ""

          let selectedOption = this.model[this.field.parentKey as string]
          let parentCollectionName = this.field.parentCollectionName as string
          this.dataService.getDataByFilterdate(parentCollectionName, selectedOption).subscribe((res: any) => {
            // '/' + this.opt.optionsDataSource.collectionName, selectedOption
            this.dataService.buildOptions(res, this.opt);
            //this.field.formControl.setValue(null)
            this.field.formControl.setValue(this.model[this.field.key])
            this.getSelectedValue()
          })
        }
          // }
        )
      }
    }
  }

  getSelectedValue() {
    if (this.model[this.field.key])
      console.log('asd');

    this.selectedValue = this.opt.options.find((o: any) => o[this.valueProp] === this.model[this.field.key])[this.labelProp]
  }


}

