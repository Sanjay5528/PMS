import { Injectable, OnInit } from '@angular/core';

import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { DatePipe, PlatformLocation } from '@angular/common';

import { environment } from 'src/environments/environment';
import { DataService } from './data.service';
import { DialogService } from './dialog.service';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class HelperService implements OnInit {

  selectedOrgId: Subject<string> = new Subject<string>();
  constructor(
    public dataService: DataService,
    private dialogService: DialogService,
    public loc: PlatformLocation,
    public router:Router,
    private datepipe: DatePipe,
    private jwtService:JwtHelperService,
    private httpClient: HttpClient) {
      this.selectedOrgId.asObservable()
   
  }

  public ngOnInit() {
  }
  public isLoggedIn(): boolean {
    // check for token expiry, will fail for no token or invalid token
    const token = sessionStorage.getItem('token');
    console.log("isTokenExpired",);
    
    try {
      return token && !this.jwtService.isTokenExpired(token) && true || false;
    } catch (e) {
      return false;
    }
  }

  public isEmpty = (data: string) => {
    if (data === "") return true;
    return false;
  }
/**
   *
   * This method will dynamically collect the all the form fields and apply the validation rules
   */
// validateAllFormFields(formGroup: FormGroup) {
//   Object.keys(formGroup.controls).forEach(field => {
//     const control = formGroup.get(field);
//     if (control instanceof FormControl) {
//       control.markAsTouched({ onlySelf: true });
//     } else if (control instanceof FormGroup) {
//       this.validateAllFormFields(control);
//     }
//   });
// }

  getDataFromRow(row:any, col: any, type:any, prefix?:any,suffix?:any):any {
    if (!row) return ""
     if (col instanceof Array) {
        let result = ""
        for(let idx=0;idx<col.length;idx++) {
             result += this.getDataFromRow(row,col[idx],type,prefix,suffix)
        }
        return result;
     } else {
      if (col instanceof Object) {
         return  this.getDataFromRow(row,col.name,type,col.prefix,col.suffix)
      } else {
        var dot = col.indexOf('.')
        if (dot > 0) {
          if (row[col.substr(0, dot)])
            return this.getDataFromRow(row[col.substr(0, dot)], col.substr(dot + 1), type,prefix,suffix)
        }
        if (row) {
          let val = this.formatData(row[col], type)
          return  val!=""? (prefix || '') + val + (suffix || ''):""
        }
    }
    }
    return ""
  }

  formatData(data:any, type:any) {
    if (!data) return ''
    if (type == "date") {
      return this.showDate(data)
    } else if (type == "time") {
      return this.showTime(data)
    } else if (type == "dateTime") {
      return this.showDateTime(data)
    } else if (type == "duration") {
      return this.convertMinsToHrsMins(data)
    }
    return data
  }


  convertMinsToHrsMins(minutes: any) {
    let hours, mins;
    var h = Math.floor(minutes / 60);
    var m = Math.round(minutes % 60);
    hours = h < 10 ? '0' + h : h;
    mins = m < 10 ? '0' + m : m;
    return hours + ':' + mins;
  }

  showDate(dt: any) {
    if (!dt) return ""
    try {
      return this.datepipe.transform(dt, 'dd-MM-yy')
    } catch (e) {
      return ""
    }
  }

  showDateTime(dt: any) {
    if (!dt) return ""
    try {
      return this.datepipe.transform(dt, 'dd-MM-yy hh:mm a')
    } catch (e) {
      return ""
    }
  }

  showFullDate(dt: any) {
    if (!dt) return ""
    try {
      return this.datepipe.transform(dt, 'EEE, MMM d, y')
    } catch (e) {
      return ""
    }
  }

  showFullDateTime(dt: any) {
    if (!dt) return ""
    try {
      return this.datepipe.transform(dt, 'EEE, MMM d, y, hh:mm a')
    } catch (e) {
      return ""
    }
  }

  showTime(dt: any) {
    if (!dt) return ""
    try {
      return this.datepipe.transform(dt, 'hh:mm a')
    } catch (e) {
      return ""
    }
  }

  public getFilteredValue(filterValue: any, data: any, column: any) {
    if (this.isEmpty(filterValue) || !data.length || !filterValue) {
      return data;
    } else {
      if (!column.length) {
        let d = data[0];
        column = Object.keys(d);
      }
      var arrayTemp: any = [];
      data.filter((d: any) => {
        Object.keys(d).map(key => {
          if (column.includes(key)) {
            if (d[key] != null && typeof d[key] != 'number' && typeof d[key] != 'object' && typeof d[key] != 'boolean') {
              if (d[key].toLowerCase().indexOf(filterValue) !== -1 || !filterValue) {
                if (arrayTemp.length != 0) {
                  var data = arrayTemp.filter((data: any) => data._id === d._id)

                  if (data.length == 0) {
                    arrayTemp.push(d);
                  }
                }
                else {
                  arrayTemp.push(d);
                }
              }
            }
          }
        });
      })
      return arrayTemp;
    }
  }

  public getToken() {
    return sessionStorage.getItem('token') 
  }

  public getdecodeToken(){
    let token:any=this?.getToken()
    let values:any= this.jwtService.decodeToken(token)
    console.log(values);
    return values
  }

  getSelectedOrgId() {
    return sessionStorage.getItem("selectedOrgId")
  }

  getSubDomainName() {
    var hostName = this.loc.hostname.replace("www.", "").split(".")
    // return environment?.OrgId  //hostName[0]
  }

  getRole() {
    let value:any= sessionStorage.getItem('auth')
    let parsedValue:any=JSON.parse(value)
    console.log(parsedValue);
    
    return parsedValue.data.LoginResponse.role
  }
 
  getEmp_id() {
    let value:any= sessionStorage.getItem('auth')
    let parsedValue:any=JSON.parse(value)
    return parsedValue.data.LoginResponse.employee_id
  }

  getDataValidatoion(controls: any, invalidLabels: string = ''): any{
    //   for (const key in controls) {
    //       if (controls.hasOwnProperty(key)) {
    //           const control = controls[key];
      
    //           if (control instanceof FormGroup) {
    //               invalidLabels += this.getDataValidatoion(control?.controls);
    //           } else if (control instanceof FormControl && control?.status === 'INVALID') {
    //               invalidLabels +=controls[key]?._fields[0]?.props?.label + ",";
    //           }else if(control instanceof FormArray && control.status === 'INVALID'){
    //             invalidLabels +=controls[key]._fields[0].props.label + ",";
    //           }
    //       }
    //   console.log(invalidLabels);
    // }
    // var n =invalidLabels.lastIndexOf(",")
    // var value=invalidLabels.substring(0,n)
    // return value;
    for (const key in controls) {
      if (controls.hasOwnProperty(key)) {
          const control = controls[key];
  
          if (control instanceof FormGroup) {
              invalidLabels += this.getDataValidatoion(control?.controls);
          } else if (control instanceof FormControl && control?.status === 'INVALID') {
              if (controls[key]?._fields && controls[key]._fields[0]?.props?.label) {
                  invalidLabels += controls[key]._fields[0].props.label + ",";
              }
          } else if (control instanceof FormArray && control.status === 'INVALID') {
              if (controls[key]?._fields && controls[key]._fields[0]?.props?.label) {
                  invalidLabels += controls[key]._fields[0].props.label + ",";
              }
          }
      }
      // console.log(invalidLabels);
  }
  
  var n = invalidLabels.lastIndexOf(",");
  var value = invalidLabels.substring(0, n);
  return value;
  
  }

  private project: BehaviorSubject<any> = new BehaviorSubject<any>(false);

  getProjectmenu(data: any) {
    this.project.next(data);
    if(data==false){
      return
    }
    this.router.navigate(["Dashboard","Project",data._id])
    // this.project.next(data);
  }
  getProjectObservable(): Observable<any> {
     return this.project.asObservable();
  }



  private routing: BehaviorSubject<any> = new BehaviorSubject<any>(false);

  getrouting(data: any) {
    this.routing.next(data);
  }
  getroutingObservable(): Observable<any> {
     return this.routing.asObservable();
  }
}
