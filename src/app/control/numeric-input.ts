import { Component } from "@angular/core";
import { FormControl } from "@angular/forms";
import { FieldType } from "@ngx-formly/core";

@Component({
  selector: "numeric-input",
  template: `
    <mat-form-field class="numbers">
      <mat-label>{{ to.label }}</mat-label>
      <input
        matInput
        type="text"
        [(ngModel)]="amount"
        (input)="formatCurrency()"
        [placeholder]="to.placeholder"
        [required]="to.required"
        [formControl]="FormControl"
      />
    </mat-form-field>
  `,
})
export class NumericInput extends FieldType<any> {
  amount!: any;

  constructor() {
    super();
  }

  public get FormControl() {
    return this.formControl as FormControl;
  }

  formatCurrency() {
    let numericValue = parseFloat(this.amount.replace(/[^0-9.]/g, "")); 
    if (!isNaN(numericValue)) {
      this.amount = this.numberToCurrency(numericValue);
    }
  }

  numberToCurrency(value: number): string {
 
    return value.toLocaleString(this.field.Currency, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }
}



// {
//   "type": "numeric-input",
//   "key": "number_input",
//   "Currency":"en-US",
//   "className": "flex-6",
//   "templateOptions": {
//     "label": "Enter a number",
//     "placeholder": "Enter a number"
//     }
// }