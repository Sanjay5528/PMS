import { Component } from '@angular/core';
import { FieldArrayType } from '@ngx-formly/core';

@Component({
  selector: 'formly-repeat-section',
  template: `
    <div style="margin-bottom: 1rem;">
      <legend *ngIf="props.label" style="font-weight: bold;">{{ props.label }}</legend>
      <p *ngIf="props.description">{{ props.description }}</p>

      <div *ngFor="let field of field.fieldGroup; let i = index" style="display: flex; align-items: baseline; margin-bottom: 0.5rem;">
        <formly-field style="flex: 1;" [field]="field"></formly-field>
        <div style="flex: 0 0 auto; display: flex; align-items: center;">
           <mat-icon  (click)="remove(i)" style=" border: none; cursor: pointer;align-items: center; ">delete_outline</mat-icon>
        </div>
      </div>
      <div style="margin: 1rem 0;">
      <mat-icon style=" border: none; cursor: pointer; " (click)="add()">add_circle_outline</mat-icon>
      </div>
    </div>
  `,
})
export class RepeatTypeComponent extends FieldArrayType {}
