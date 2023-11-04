import { Component, OnInit } from '@angular/core';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'label-view',
  template: `
    <div style="margin: 10px;display:flex;flex-direction:row">
    <div style=" font-weight: bold;width:{{width}};height:{{height}}">{{this.field.props?.label}}</div>
    <div *ngIf="displayType =='text'">: {{getValue()}}</div>
    <div *ngIf="displayType !='text'" [innerHtml]="getValue()"></div>
    </div>
  `
})

export class LabelView extends FieldType implements OnInit {
  displayType = 'text'
  opt: any;
  date: any
  width = "150px"
  height = "20px"

  constructor(
    private datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.opt = this.field.props || {};
    this.width = this.opt.width || "150px"
    this.height = this.opt.height || "20px"
    this.displayType = this.opt.inputType || 'text'
  }

  getValue() {
    this.date = this.field.props?.attributes
    if (this.date?.pipe == "date") {
      let key = this.field.key as string
      let date = this.field.model[key]
      return this.datePipe.transform(date, ("dd-MM-YYYY h:mm a"))
    }
    else {
      return this.formControl?.value
    }
  }


}


