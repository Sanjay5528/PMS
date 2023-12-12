 
import { Component } from '@angular/core';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';

@Component({
  selector: 'formly-field-stepper',
  template: `
     <mat-horizontal-stepper>  
    
      <div >
      <mat-step    *ngFor="let step of field.fieldGroup; let index = index; let last = last" (change)="valueCheck(step,index)">

      <ng-template matStepLabel    >{{ step.props!.label }}</ng-template>
        <formly-field [field]="step"></formly-field>

 
          <button matStepperPrevious mat-button *ngIf="index !== 0"  type="button">Back</button>
          
          <button matStepperNext mat-raised-button *ngIf="!last"  type="button" [disabled]="!isValid(step)">
            Next
          </button>
         
        </mat-step>
      </div>
 
    </mat-horizontal-stepper>
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


  // ngOnInit(): void {
  //  if ( this.field.props?.label =="Speaker Details")  {

  //    console.log('Stepper form group includes "speaker_details"');
  //  }
  //   // const speakerDetailsField = this.field.fieldGroup?.find(field => field.key === 'speaker_details');
  
  //   // if (speakerDetailsField) {
  //     //   // Add any additional logic you want to execute when "speaker_details" is found.
  //     // }

       

  // }
  
 
  valueCheck(label:any,index:any){
    console.log("label",label)
    console.log("index",index);
    




  }













  
}

 

//[linear]="isLinear"

 