import { Component, OnInit } from '@angular/core';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'formly-field-label_view',
  template: `
  
    <div *ngIf="!value_in_next_row" style="margin: 10px;display:flex;flex-direction:row">
    <div style=" font-weight: bold;width:{{label_width}}">{{this.field.templateOptions?.label}}</div>  <!-- to set the name of the coming data -->
    <b style="margin-right: 5px;font-weight: bold;">:</b>
        <div *ngIf="displayType =='text'"style="width:{{value_width}};word-wrap: break-word;" >
     {{getValue()}}</div>  <!-- get value as string text input -->
    <!-- <div *ngIf="displayType !='text'" [innerHtml]="getValue()"></div> --> <!-- no text input -->
    </div>

    
    <div *ngIf="value_in_next_row" style="margin: 10px;">
    <div style=" font-weight: bold;width:{{label_width}}">{{this.field.templateOptions?.label}}</div>  <!-- to set the name of the coming data -->
        <div *ngIf="displayType =='text'"style="width:{{value_width}};  padding: 5px;" >{{getValue()}}</div>  <!-- get value as string text input -->
    <!-- <div *ngIf="displayType !='text'" [innerHtml]="getValue()"></div> --> <!-- no text input -->
    </div>
  `
})

export class LabelView extends FieldType implements OnInit {
// mainly after Creating it we need to import in it formly-extension module.ts
  displayType = 'text'
  opt: any;
  date: any
  label_width :any
  value_in_next_row!:boolean
  value_width:any

  constructor(
    private datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    
    this.opt = this.field.templateOptions || {};
    this.label_width = this.opt.label_width || "150px"
    this.displayType = this.opt.inputType || 'text'
    this.value_in_next_row=this.opt.value_in_next_row || false
    this.value_width=this.opt.value_width
  }
  getValue() {
    this.date = this.field.templateOptions?.attributes
    if (this.date?.pipe == "date") {
      let key = this.field.key as string
      let date = this.field.model[key]
      date = this.datePipe.transform(date, ("dd-MM-YYYY"))
      return date

    }
    else {
      return this.formControl.value
     }
  }
}


/// Json Fromat

// {
//   "type": "label_view", //initialze 
//   "key": "publish_date",
//   "templateOptions": {            
//     "attributes": { "pipe": "date" }, to set date
//     "label": "Publish Date", 
// "label_width":100,        label Width 
// "value_width":200,        VAlue width 
// "value_in_next_row":false, if we need it in next line or not 
//     "placeholder": "publish_date",
//     "required": true
//   }
// }
// ],