import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'timePipe'
})
export class TimePipe extends
DatePipe implements PipeTransform {
  override transform(value: any, args?: any): any {
    return super.transform(value, "hh:mm:ss a");
  }
}
@Pipe({ name: 'fileSize' })
export class FileSizePipe implements PipeTransform {
  transform(size: number, extension: string = ' MB') {
    return (size / (1024 * 1024)) > 1 ? (size / (1024 * 1024)).toFixed(2) + extension : (size / 1024).toFixed(2) + ' KB'
  }
}