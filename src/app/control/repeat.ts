// import { Component } from '@angular/core';
// import { FieldArrayType } from '@ngx-formly/core';

// @Component({
//   selector: 'formly-repeat-section',
//   template: `
//     <div>
//         <mat-card-header>
//           <mat-card-title>{{ props.label }}</mat-card-title>
//           <mat-card-subtitle>{{ props.description }}</mat-card-subtitle>
//         </mat-card-header>
//       <div *ngFor="let field of field.fieldGroup; let i = index">
//           <formly-field [field]="field"></formly-field>
//           <mat-icon  (click)="remove(i)">delete_outline</mat-icon>

//       </div>
//       <div style="margin: 30px 0;">
//         <mat-icon (click)="add()">add_circle_outline</mat-icon>
//       </div>
//     </div>
//   `,
// })
// export class RepeatTypeComponent extends FieldArrayType {}
import { Component } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
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
           <mat-icon  (click)="remove(i)" style=" border: none; cursor: pointer; ">delete_outline</mat-icon>
        </div>
      </div>
      <div style="margin: 1rem 0;">
      <mat-icon style=" border: none; cursor: pointer; " (click)="add()">add_circle_outline</mat-icon>
      </div>
    </div>
  `,
})
export class RepeatTypeComponent extends FieldArrayType {}
