import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldType } from '@ngx-formly/core';
import { AnyObject } from 'chart.js/dist/types/basic';
import { Observable } from 'rxjs';
import { DataService } from '../services/data.service';

@Component({
    selector: 'formly-field-autocomplete',
    template: `
     <mat-form-field style="margin-bottom: 15px;">
     <mat-label>{{field.props!['label']}}</mat-label>
     <input type="text"
           matInput
           #autoCompleteInput
           [formControl]="searchControl"
           [formlyAttributes]="field"
           [matAutocomplete]="auto"
           (input)="allCaps($event,autoCompleteInput)"
           (keydown.enter)="frmSubmit($event,field)"
           placeholder={{placeholder}}
           [required]="this.required"
           />
    <mat-autocomplete #auto="matAutocomplete" autoActiveFirstOption (optionSelected)="selectionChange($event,autoCompleteInput)">
      <mat-option *ngFor="let op of filteredOptions" [value]="op[this.valueProp]">
        {{ op[this.labelProp] }}
      </mat-option>
    </mat-autocomplete>
    <mat-error *ngIf="this.required">This {{this.field.props.label}} is required</mat-error>
    </mat-form-field>
  `,
})
export class FormlyAutocomplete extends FieldType<any> implements OnInit {
    constructor(private dataService: DataService) {
        super()
    }
    filteredOptions: any[] = [];
    opt: any
    //default prop setting
    valueProp = "_id"
    labelProp = "name"
    placeholder: any
    show:any
    required:any

    public get searchControl() {
        return this.formControl as FormControl;
    }
    //  override formControl:FormControl

    ngOnInit(): void {
        debugger
        this.required=this.field.props?.required
        this.placeholder = this.field.props?.['placeholder']
        this.opt = this.field.props || {};
        this.subscribeOnValueChangeEvent()
       
        if (!this.to['optionsDataSource'] || this.to.options) {
            this.getSelectedValue()
            return;
        }
        this.labelProp = this.opt.labelProp
        this.valueProp = this.opt.valueProp
        if (this.field.props.optionsDataSource) {
            this.dataService.getData(this.field.props.optionsDataSource.collectionName).subscribe((res:any) => {
                this.dataService.buildOptions(res, this.opt)
                this.filteredOptions = res?.data
                this.setValueChangeEvent()
                this.getSelectedValue()
            })
        } else if (this.field.props.optionsDataSource.collectionName) {
            this.dataService.getDataByFilter(this.field.props.optionsDataSource.collectionName, this.field.props.optionsDataSource.filter)
                .subscribe((res: any) => {
                    this.dataService.buildOptions(res, this.opt)
                    this.setValueChangeEvent()
                })
        }


    }

    //filter the data based on input values
    setValueChangeEvent() {
        debugger
        this.searchControl.valueChanges.subscribe(val => {
            // this.field.props.attributes
            if (!this.opt.options) return
            const filterValue = val ? val.toUpperCase() : "";
            this.filteredOptions = this.opt.options.filter((option: any) => option[this.field.props.attributes].toUpperCase().includes(filterValue));
            if (this.filteredOptions.length <= 0) {
                alert(this.field.props.label + " InValid !!!")
                this.searchControl.setValue('')

            }
        })
    }


    //push data to the child based on parent
    subscribeOnValueChangeEvent() {
        // on ParentKey changes logic to be implemented
        debugger
        if (this.field.parentKey != "") {
            (this.field.hooks as any).afterViewInit = (f: any) => {
                const parentControl = this.form.get(this.field.parentKey)//this.opt.parent_key);
                parentControl?.valueChanges.subscribe((val: any) => {
                    let selectedOption = this.model[this.field.parentKey as string]
                    let parentCollectionName = this.field.parentCollectionName as string

                    this.dataService.getDataByFilter(parentCollectionName, selectedOption).subscribe((res: any) => {
                        // '/' + this.opt.optionsDataSource.collectionName, selectedOption
                        this.dataService.buildOptions(res, this.opt);
                        this.field.formControl.setValue(this.model[this.field.key])
                     
                        this.selectionChange($ctrl, inputObj)
                    })
                })
            }
        }
    }

    //push data to input based on autocomplete
    selectionChangeValues(selectedObject: any) {
        if (selectedObject && this.opt.onValueChangeUpdate && this.opt.onValueChangeUpdate instanceof Array) {
            for (const obj of this.opt.onValueChangeUpdate) {
                this.field.formControl.parent.controls[obj.key].setValue(
                    selectedObject[obj.valueProp]
                );
            }
        }
    }


    //patch the selected data to the field
    selectionChange(ctrl: any, inputObj: any) {
        debugger
        let obj = this.filteredOptions.find(o => o[this.valueProp] == ctrl.option.value)
        if (obj) inputObj.value = obj[this.labelProp]
        if (this.opt.onValueChangeUpdate) {
            this.selectionChangeValues(obj)
        }
        if( this.field.props.show){
            this.matchType(obj)
        }
    }


    //patch the value coming from edit
    getSelectedValue() {
        if (this.model[this.field.key]){
            this.field.formControl.setValue(this.model[this.field.key])
        }
      }
    

    matchType(res:any){
       this.model['userAadhaarFlag']= res.liveBankId.aadhaarFlag
       this.model['userDebitcardFlag']= res.liveBankId.debitcardFlag
       this.model['userNetbankFlag']=res.liveBankId.netbankFlag

    }
    

    allCaps($event: any, ctrl: AnyObject) {
        if (this.opt.allCaps) {
            //   ctrl.value = $event.target.value.toUpperCase()
        }
    }


    frmSubmit(event: any, field: any) {
        var opt = field.templateOptions

        if (!opt.onEnterSubmit) {
            try {
                let ctrl = event.currentTarget.form.elements[opt.nextTabIndex || event.currentTarget.tabIndex + 1]
                ctrl.focus()
                ctrl.click()
            } catch {

            }
            event.preventDefault()
            event.stopPropagation()
        }
    }
}




function $ctrl($ctrl: any, inputObj: any) {
    throw new Error('Function not implemented.');
}

function inputObj($ctrl: ($ctrl: any, inputObj: any) => void, inputObj: any) {
    throw new Error('Function not implemented.');
}

function selectedObject(selectedObject: any) {
    throw new Error('Function not implemented.');
}
