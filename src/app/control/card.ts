import { Component } from '@angular/core';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';

@Component({
  selector: 'card',
  template: `
    
    
      <div *ngFor="let card of field.fieldGroup; let i = index; let last = last">

          <mat-card>
          <mat-card-header>
            <mat-card-title>{{ card.props!.label || 'Card Title' }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <formly-field [field]="card"></formly-field>
          </mat-card-content>
        </mat-card>
        
      </div>
  `,
})
export class Card extends FieldType {
    // {
    //     "type": "card",
    //     "fieldGroup": [
    //       {
    //         "props": {
    //           "label": "Settings"
    //         },
    //         "fieldGroup": [
    //             {
    //                 "type": "logo",
    //                 "key": "Org_logo",
    //                 "className": "flex-6",
    //                 "templateOptions": {
    //                     "label": "Organization Logo"
    //                 }
    //             },{
    //                 "type": "toogle",
    //                 "key": "Org_logo",
    //                 "className": "flex-6",
    //                 "templateOptions": {
    //                     "label": "Organization Logo",
    //                     "sublabel":["HI - Organization","would you like to"]
    //                 }
    //             }
    //         ]
    //       }
    //     ]
    //   }
}
