import { Component } from '@angular/core';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';

@Component({
  selector: 'tab',
  template: `
    <mat-tab-group>
      <div *ngFor="let tab of field.fieldGroup; let i = index; let last = last">
      <mat-tab [label]="tab.props!.label || 'Tab'" *ngIf="!tab.hide"  >
        <formly-field [field]="tab"></formly-field>
      </mat-tab>
      </div>
    </mat-tab-group>
  `,
})
export class Tab extends FieldType {
  isValid(field: FormlyFieldConfig): any {
    if (field.key) {
      return field.formControl?.valid;
    }
    return field.fieldGroup?.every(f => this.isValid(f));
  }
}
