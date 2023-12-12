import { OnInit, Inject, LOCALE_ID, PipeTransform } from '@angular/core';
import { DecimalPipe,formatNumber } from '@angular/common';


export class NumberPipe extends
DecimalPipe implements PipeTransform {
  override transform(value: any, args?: any): any {
    return super.transform(value, '1.2-2')
  }
}


