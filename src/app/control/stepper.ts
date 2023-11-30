 
import { Component } from '@angular/core';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';

@Component({
  selector: 'formly-field-stepper',
  template: `
    <mat-vertical-stepper>
    <!-- <mat-stepper [linear]="isLinear" #stepper> -->

   <!-- <mat-stepper [linear]="isLinear" #stepper>  -->

      <mat-step  *ngFor="let step of field.fieldGroup; let index = index; let last = last">
        <ng-template matStepLabel>{{ step.props!.label }}</ng-template>
        <formly-field [field]="step"></formly-field>

        <div>
          <button matStepperPrevious mat-button *ngIf="index !== 0"  type="button">Back</button>
<!-- //<button style="margin: 5px" mat-button mat-dialog-close (click)="closedia()">  Cancel </button> -->
          <button matStepperNext mat-raised-button *ngIf="!last"  type="button" [disabled]="!isValid(step)">
            Next
          </button>

          <!-- <button *ngIf="last" mat-raised-button class="btn btn-primary" [disabled]="!form.valid" type="submit">Submit</button> -->
        </div>
      </mat-step>
      <!-- </mat-stepper> -->
<!-- </mat-stepper> -->
    </mat-vertical-stepper>
  `,
})

export class FormlyFieldStepper extends FieldType {
  isLinear = false;

  isValid(field: FormlyFieldConfig): any {
    if (field.key) {
      return field.formControl?.valid;
    }
    return field.fieldGroup?.every(f => this.isValid(f));
  }
}

 

//[linear]="isLinear"

 