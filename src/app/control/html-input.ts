import { Component, EventEmitter, Output, OnInit, AfterViewInit } from '@angular/core';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'html-input',
  template: `
    <style>
    .header {
        margin-top: 100px;
        text-align: center;
        margin-bottom: 40px;
      }
      .html-header {
        margin: 15px 0 5px;
      }

      .html {
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 0.5rem;
        background-color: #f1f1f1;
        min-height: 20px;
        max-height: 10rem;
        overflow: auto;
      }
      </style>
     <div style="margin-bottom: 20px;background-color: white;">
    
    <span style="margin-left:15px">{{field.props!['label'] || "HTML"}}</span>

     <angular-editor height="50px" minHeight="50px"
        [formlyAttributes]="field"
        [formControl]="FormControl"
        [config]="editorConfig" [(ngModel)]="data">
      </angular-editor>
      
      <mat-error *ngIf=" this.FormControl.touched && this.FormControl?.errors?.['required']">This {{ this.field.props!.label }} is required</mat-error>
     </div>
     
  `

})
export class HtmlInput extends FieldType implements OnInit {

  data: any

  hide = [
    'undo',
    'redo',
    'strikeThrough',
    'insertImage',
    'link',
    'unlink',
    'insertVideo',
    'insertHorizontalRule',
    'customClasses',
    'toggleEditorMode',
    // 'fontName'

  ]
  editorConfig: any = {
    editable: true,
    spellcheck: true,
    showToolbar: false,
    // sanitize: false,
    height: '5rem',
    minHeight: '3rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: '',
    defaultFontName: '',
    defaultFontSize: '',
    toolbarHiddenButtons: [this.hide]
  }
  public get FormControl() {
    return this.formControl as FormControl;
  }
  ngOnInit() {
    let key = this.field.key as string
    this.data = this.field.model[key]
    debugger
    this.editorConfig.editable = !this.field.props?.disabled
    this.editorConfig.showToolbar = !this.field.props?.disabled
  }

  
}
