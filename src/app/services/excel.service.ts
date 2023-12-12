import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor() { }
  public exportAsExcelFile(json:any, excelFileName: string): void {
    const processedData = json.map((item:any) => this.flattenObject(item));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(processedData);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    //! Column width is defined here
let  columnWidths:any[]=[]
    XLSX.utils.sheet_to_json(worksheet, { header: 1 }).forEach((row:any) => {
      row.forEach((value:any, columnIndex:any) => {
        const columnWidth = columnWidths[columnIndex] || { wch: 0 };
        const contentLength = value ? String(value).length : 0;
        if (contentLength > columnWidth.wch) {
          columnWidth.wch = contentLength;
        }
        columnWidths[columnIndex] = columnWidth;
      });
    });
    worksheet['!cols'] = columnWidths;
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    this.saveAsExcelFile(excelBuffer, excelFileName);
  }
  private saveAsExcelFile(buffer: any, fileName: string): void {
     const data: Blob = new Blob([buffer], {type: EXCEL_TYPE});
     FileSaver.saveAs(data, fileName + '_export_' + new  Date().getTime() + EXCEL_EXTENSION);
  }
public excel(data:any){
  const csvContent = this.convertToCSV(data);
  const csvFile = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  saveAs(csvFile, 'data.csv');
}

convertToCSV(array: string[]): string {
  const csvArray = array.map(item => item.replace(/,/g, '\\,')); // Escape commas in the array items

  const csvContent = csvArray.join(','); // Join the array items with commas

  return csvContent;
}

 flattenObject(obj: any, parentKey?: string): any {
  let result: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = parentKey ? `${parentKey}_${key}` : key;
      if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        const nested = this.flattenObject(obj[key], newKey);
        result = { ...result, ...nested };
      } else {
        result[newKey] = obj[key];
      }
    }
  }
  console.log(result);
  
  return result;
}

  }