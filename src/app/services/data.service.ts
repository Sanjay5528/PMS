import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  

  constructor(private http: HttpClient) { }
  public getWsBaseUrl() {
    return environment.apiBaseUrl
  }

/**Api
 * @screenApi loadScreenConfigJson,loadListConfigJson,loadReportConfigJson
 * 
 * @baseCrud
 * @getData It take input as Collectionname Get All data
 * @getDataById it take input collectioname , id(_id)
 * @deleteDataById it take input collectioname , id(_id)
 * @save it take input collectioname , data
 * @update it take the input collectioname,_id , data 
 * @getDataByFilter it take input as filter condition and take the match data list
 */



/**
 * This method mainly used for Form Json Name
 * IT Can used for both  Screen List Json (or) form Json (or) menu Json
 * @screenId Screen Name
 * @data must be in (Screen-Json-name-list) (or) (form-Json-name) (or) (menujosnname) && etc...
 */
  public loadScreenConfigJson(screenId: string): Observable<any> {
    return this.loadConfig(screenId)
  }


/**
 * This method used for Screen List Json
 * @screenId Screen only List Json Name Because we ADD Screen name + -list 
 */
	public loadListConfigJson(screenlistId: string): Observable<any> {
		return this.loadConfig(screenlistId+'-list')
	}


/**
 * This method used for Screen List Json
 * @screenId Screen only Resport Json Name Because we ADD Screen name + -report 
 */
  public loadReportConfigJson(screenreportId: string): Observable<any> {
    return this.loadConfig(screenreportId+'-report')
    }


/**
 * This method used for Screen View Json
 * @screenId Screen only View Json Name Because we ADD Screen name + -view 
 */
    public loadViewConfigJson(screenViewId: string): Observable<any> {
      return this.loadConfig(screenViewId+'-view')
      }

  public loadConfig(screenId:any):Observable<any> {
    //let config = sessionStorage.getItem(screenId)
    return new Observable((observer) => {
      // if (config) {
      //   observer.next(JSON.parse(config))
      // }
      this.getDataById('screen',screenId).subscribe((result:any)=>{       
        let config =  result.data ? result.data[0].config : []
        observer.next(JSON.parse(config))
       
      })
    })
  }

/**
 * This method Get Data By ID(_id) Dynamic Data from Data base using collectionName and ID
 * @collectionName Dynamic pass of Collection Name 
 * @ID Dynamic pass of _id or any Primary key 
 */
  public getDataById(collectionName: any, id: any) {
    return this.http.get(this.getWsBaseUrl() +"entities/"+ collectionName + '/' + id);
  }

 
  //deleteDataByModel Chnage it parent detelet 
  //PArent delete Child Delete
  public deleteDataByModel(collectionName: any, id: any) {
   return this.http.delete(this.getWsBaseUrl() + "entities/" + collectionName + "/_id/" + id);
  }

/**
 * This method Delete Data By ID(_id) Dynamic Data from Data base using collectionName and ID
 * @collectionName Dynamic pass of Collection Name 
 * @ID Dynamic pass of _id or any Primary key 
 */
  public deleteDataById(collectionName: any, id: any) {
    return this.http.delete(this.getWsBaseUrl()+ "entities/"+ collectionName + '/' + id);
  }


/**
 * This method USed To Get data Using Filter Condition
 * @filter
 * var filterCondition1 =
 *  [
 * {
 *   clause: "AND",
 *   conditions: [ 
 *    { column: , operator: "EQUALS", value:  }, 
 *  ]
 * }
 * ]
 * @clause Type OR ,AND,$nor,$in,$nin 
 * @conditions It Should Be in Array of Object
 * @operator Type * "EQUALS","NOTEQUAL", "NOTCONTAINS","STARTSWITH","ENDSWITH","LESSTHAN","GREATERTHAN","LESSTHANOREQUAL","GREATERTHANOREQUAL","INRANGE","BLANK","NOTBLANK","EXISTS","IN"
 * @column Key name
 * @value Value For the Key to match
 */
  public getDataByFilter(collectionName: any,data:any) {
    return this.http.post(this.getWsBaseUrl() +"entities/filter/"+ collectionName,data);
  }

  public login(data: any) {
    return this.http.post(this.getWsBaseUrl() + 'auth/login', data);
  }


  
/**
 * This method Send New Data
 * @collectionName Dynamic pass of Collection Name 
 * @Data Any TYPE of Data
 */
  public save(collectionName: any,data: any,) {
    return this.http.post(this.getWsBaseUrl()+"entities/"+`${collectionName}`, data);
  }

  public dataSetPreview(data:any){
    return this.http.post(this.getWsBaseUrl()+"dataset/config", data);
  }
  public dataSetSave(methodName:any,data:any){
    return this.http.post(this.getWsBaseUrl()+`dataset/config/${methodName}`, data);
  }
  public dataset_Get_Data(dataSetName: string,filterData?:any) {
    return this.http.post(this.getWsBaseUrl() + `data/${dataSetName}`,filterData);
    
  }
  
  public forgotPswd(data?: any, id?: any) {
    return this.http.post(this.getWsBaseUrl() + 'user/forget-password/' + `${id}`, data);
  }

  public download_excel(data:any) {
    return this.http.get(this.getWsBaseUrl() + data);
  }
 
  //Post the data
  public bulkpost(endPoint: string, data: any) {
    return this.http.post(this.getWsBaseUrl() + `${endPoint}`, data, { reportProgress: true, observe: 'events' });
    
  }

  //! public getDataByFilter(collectionName: any, filter: any,c?: any,limit?: any) {
  //     return this.http.post(this.getWsBaseUrl() + 'search/' + collectionName +`/0/${limit||1000}`,filter);
    
  // }

  public fileupload(data: any) {
    return this.http.post(this.getWsBaseUrl() + "s3files/upload", data);
  }
  // * TO CHANGE INTO Project ID
    public lookUpBug(project_id: any,regression_id?: any){
      return this.http.get(this.getWsBaseUrl() +`lookup/bug-report/${project_id}/${regression_id}`)
    }

public lookup(orgID:any){
  return this.http.get(this.getWsBaseUrl()+"query/"+orgID)
}
public lookupTreeData(collection_name:any,project_id:any){
  return this.http.get(this.getWsBaseUrl()+"lookup/"+collection_name+"/"+project_id)
}
// lookup/requriment/
/**
 * This method USed to verfiy the activation of the key in parms
 */
  public verify_key(data:any){
    return this.http.get(this.getWsBaseUrl()+"activation-api/"+data)
  }
 

  public generate_pwd(id:any,data:any){
    return this.http.put(this.getWsBaseUrl()+"activation-api/generate-pwd/"+id,data)
  }
 

  public sidenav(employee_id:any){
    return this.http.get(this.getWsBaseUrl()+"lookup/project_sidenav/"+employee_id)
  }


/**
 * This method Upset Method IT check If Data is Present it Updata Or Else in Create A new data
 * This Can used For Both Save and Update
 * @collectionName Dynamic pass of Collection Name 
 * @id is Refered as Primarykey
 * @Data Any TYPE of Data
 */
//! need to change the data before the
  public update(collectionName: any, id  : any,data:any) {   
      return this.http.put(this.getWsBaseUrl() +"entities/"+ `${collectionName}` + `/${id}`, data);
  }
  public acl_update(collectionName: any,data?:any){
    return this.http.put(this.getWsBaseUrl() +"entities/"+ `${collectionName}` , data);

  }

// public lookdatamodel(){
//   return this.http.get(this.getWsBaseUrl()+'/query/datamodel/employee')
// }


//Image Upload
public imageupload(folder:any,refId:any,data: any) {
  return this.http.post(this.getWsBaseUrl() + `file/${folder}/${refId}`, data);
}

  public getDataByPath(data: any, path: string) {
    if (!path) return data; // if path is undefined or empty return data
    if (path.startsWith("'"))
      return path.replace(/'/g, "")
    var paths = path.split(".");
    for (var p in paths) {
      if (!paths[p]) continue;
      data = data[paths[p]]; // new data is subdata of data
      if (!data) return data;
    }
    return data;
  }
  public  getTimesheetdata(employee_id: any, date: any) {
    //console.log(format_date);
    // finaltimesheet/:employee_id/:datefinaltimesheet
    return this.http.get(this.getWsBaseUrl() + 'lookup/finaltimesheet/' + `${employee_id}` + "/" + `${date}`);
  }
  public getTimesheetforApproval( employee_id: any,start_date:any,end_date:any) {
    
    return this.http.get(this.getWsBaseUrl() + 'lookup/team_specifcaiton/' + `${employee_id}`+ "/" + `${start_date}`+ "/" + `${end_date}` );
  }
  public workhours(scheduledstartdate:any) {
    
    return this.http.get(this.getWsBaseUrl() + 'lookup/workedhour/SA/'+ `${scheduledstartdate}`);
  }
  public getunschedule(employee_id: any,date:any) {
    
    return this.http.get(this.getWsBaseUrl() + 'lookup/unschedule/' + `${employee_id}` + "/" + `${date}`);
  }
  public gettaskdata(employee_id: any) {
    
    return this.http.get(this.getWsBaseUrl() + 'lookup/task/' + `${employee_id}`);
  }
  public savetimesheet(data:any){
    return this.http.put(this.getWsBaseUrl()+'lookup/timesheet',data)
    }
  public getworkhours(employee_id: any,scheduledstartdate:any) {
    
    return this.http.get(this.getWsBaseUrl() + 'lookup/workedhour/'+ `${employee_id}` + "/" + `${scheduledstartdate}`);
  }

  public processText(exp: any, data: any) {
    if (data !== null) {
      exp = exp.replace(
        /{{(\w+)}}/g, // this is the regex to replace %variable%
        (match: any, field: any) => {
          return this.getDataByPath(data, field) || ''
        }
      );
      return exp.trim();
    }
  }
  public getFilterQuery(config: any, model_data?: any) {
    if (!config) return undefined
    var conditions: any = []
    this.makeFilterConditions(config.defaultFilter, conditions, model_data)
    this.makeFilterConditions(config.fixedFilter, conditions, model_data)
    console.log(conditions);
    
    if (conditions.length > 0)
      return [{
        clause: config.filtercondition || "AND",
        conditions: conditions
      }]
    return undefined
  }

  makeFilterConditions(filterConditions: any, conditions: any, model_data?: any) {
    if (filterConditions && filterConditions.length) {
      filterConditions.forEach((c: any) => {
        var data = c['value']
        //check whether any {{}} expression is there or not?
        if (typeof data == 'string' && data.indexOf('{{') >= 0) {
          //process {{}} express
          data = this.processText(data, model_data)
        } else if (c['type'] && c['type'] == "date") {
          // date type filter
          // data = moment().add(c['addDays'] || 0, 'day').format(c['format'] || 'yyyy-MM-DDT00:00:00.000Z')
        }else if (c['type'] && c['getdata']=='local') {
          data=sessionStorage.getItem(c.field)
          // date type filter
          // data = moment().add(c['addDays'] || 0, 'day').format(c['format'] || 'yyyy-MM-DDT00:00:00.000Z')
        }
        conditions.push({
          column: c['column'],
          operator: c['operator'],
          type: c['type'] || 'string',
          value: data
        })

      });
    }
  }

  buildOptions(res: any, to: any) {
    var data: any[] = res.data ? res.data : res
    if (to.labelPropTemplate) {
      data.map((e: any) => {
        e[to.labelProp] = this.processText(to.labelPropTemplate, e)
      })
    }
    data = _.sortBy(data, to.labelProp)
    if (to.optionsDataSource.firstOption) {
      data.unshift(to.optionsDataSource.firstOption)
    }
    to.options = data
  }


  getdetails(){
  let value:any=sessionStorage.getItem("auth")
  let details:any=JSON.parse(value)
  return details
 }  
 
 public getModuleFilter(collectionName: any, key: any) {
  return this.http.get(this.getWsBaseUrl() + "entities/filter/" + `${collectionName}` + "/" + `${key}`);
}
//  async makeFiltersConditions(Input_object: any): Promise<any> {
//   return await new Promise((resolve, reject) => {
//     let vals:any={
//       start:Input_object.start,
//       end:Input_object.end,
//       filter:[],
//       sort:Input_object.sort
//     }
// let overallfilter:any[]=[]

// if (!_.isEmpty(Input_object.filter)) {
//   let filter: any = Input_object.filter;
  

//   for (const column in filter) {
//     let data: any = filter[column];
//     let filtervaluse: any = {
//       clause: '',
//       conditions: [],
//     };
//     filtervaluse.clause=data.operator || "AND" //! AND / OR
//     // if (data.operator == "OR") {
//     //   filtervaluse.clause = "OR";
//     // } else {
//     //   filtervaluse.clause = "AND";
//     // }

//     let dataconditions: any[] = [];

//     // Check if data has a 'conditions' property and if it's an array with length > 0
//     if (data.conditions && Array.isArray(data.conditions) && data.conditions.length > 0) {
//       console.log(data);
      
//       data.conditions.forEach((xyz: any) => {
//         let operator: any=xyz.type.toUpperCase();
//         let flag:boolean=false;
//         // if (xyz.type == "equals") {
//         //   operator = "EQUALS";
//         // } else if (xyz.type == "notEqual") {
//         //   operator = "NOTEQUAL";
//         // }else if (xyz.type == "lessThanOrEqual") {
//         //   operator = "$lte";
//         // } else if (xyz.type == "greaterThanOrEqual") {
//         //   operator = "$gte";
//         // } else if (xyz.type == "greaterThan") {
//         //   operator = "$gt";
//         // } else if (xyz.type == "lessThan") {
//         //   operator = "$le";
//         // } else 
//         if (xyz.type == "inRange") {
          
//           flag=true;
//         }
//         // }  else {
//         //   operator = xyz.type;
//         // }
//         console.log(xyz.filterType);
        
//         if(xyz.filterType=="date"){
// console.log(xyz);
// if(flag){
//   dataconditions.push({
//     column: column,
//     operator: operator,
//     type: xyz.dateFrom.toUpperCase(),
//     value: [moment(xyz.dateFrom).format( 'yyyy-MM-DDT00:00:00.000Z'),moment(xyz.dateTo).format( 'yyyy-MM-DDT00:00:00.000Z')],
//   });
// }else{
//   dataconditions.push({
//     column: column,
//     operator: operator,
//     type: xyz.filterType.toUpperCase(),
//     value: moment(xyz.dateFrom).format( 'yyyy-MM-DDT00:00:00.000Z'),
//   });
// }  
//         }else{

//           if(flag){
//             dataconditions.push({
//               column: column,
//               operator: operator,
//               type: xyz.filterType.toUpperCase(),
//               value: [xyz.filter,xyz.filterTo],
//             });
//           }else{
//             dataconditions.push({
//               column: column,
//               operator: operator,
//               type: xyz.filterType.toUpperCase(),
//               value: xyz.filter,
//             });
//           }
//         }
//       });
//     } else {
//       let operator: any=data.type.toUpperCase();;
//       let flag:boolean=false;
//       //! go here
//       // if (data.type == "equals") {
//       //   operator = "EQUALS";
//       // } else if (data.type == "notEqual") {
//       //   operator = "NOTEQUAL";
//       // }else if (data.type == "lessThanOrEqual") {
//       //   operator = "$lte";
//       // } else if (data.type == "greaterThanOrEqual") {
//       //   operator = "$gte";
//       // } else if (data.type == "greaterThan") {
//       //   operator = "$gt";
//       // } else if (data.type == "lessThan") {
//       //   operator = "$le";
//       // } else
//        if (data.type == "inRange") {
        
//         flag=true;
//       }
//       //   else {
//       //   operator = data.type;
//       // }
//       if(data.filterType=="date"){
//         console.log(data);
        
//         if(flag){
//           dataconditions.push({
//             column: column,
//             operator: operator,
//             type: data.filterType.toUpperCase(),
            
//             value: [moment(data.dateFrom).format( 'yyyy-MM-DDT00:00:00.000Z'),moment(data.dateTo).format( 'yyyy-MM-DDT00:00:00.000Z')],
//           });
//         }else{
//           dataconditions.push({
//             column: column,
//             operator: operator,
//             type: data.filterType.toUpperCase(),
//             value: moment(data.dateFrom).format( 'yyyy-MM-DDT00:00:00.000Z'),
//           });
//         }    
//              }else{  
//                   if(flag){
//                     dataconditions.push({
//                       column: column,
//                       operator: operator,
//                       type: data.filterType.toUpperCase(),
//                       value: [data.filter,data.filterTo],
//                     });
//                   }else{
//                     dataconditions.push({
//                       column: column,
//                       operator: operator,
//                       type: data.filterType.toUpperCase(),
//                       value: data.filter,
//                     });
//                   }
//                 }
      
//     }

//     filtervaluse.conditions = dataconditions;
//     overallfilter.push(filtervaluse);
//   }
// vals.filter=overallfilter
//   console.log(overallfilter);
// }
// resolve(vals)
//   })


// }
 
async makeFiltersConditions(Input_object: any): Promise<any> {
  return await new Promise((resolve, reject) => {
    let vals: any = {
      start: Input_object.start,
      end: Input_object.end,
      filter: [],
      sort: Input_object.sort,
    };
    let overallfilter: any[] = [];

    if (!_.isEmpty(Input_object.filter)) {
      let filter: any = Input_object.filter;

      for (let column in filter) {
        let data: any = filter[column];
        let filtervaluse: any = {
          clause: "",
          conditions: [],
        };
        filtervaluse.clause = data.operator || "AND";
        let dataconditions: any[] = [];

        if (
          data.conditions &&
          Array.isArray(data.conditions) &&
          data.conditions.length > 0
        ) {
          data.conditions.forEach((xyz: any) => {
            let operator: any = xyz.type.toUpperCase();
            let flag: boolean = false;

            if (xyz.type == "inRange") {
              flag = true;
            }

            if (xyz.filterType == "string") {
              if (!_.isEmpty(data.value)) {
                if (xyz.values[0][2] == true) {
                  console.log("if");

                  column = xyz.values[0][1];
                  xyz.filter = xyz.values.map((vals: any) => {
                    return vals[0];
                  });
                }
              } else {
                xyz.filter = xyz?.values;
              }
            }
            if (xyz.filterType == "set") {
              xyz.filterType = "string";
              xyz.type = "IN";
              if (!_.isEmpty(data.value)) {
                if (xyz?.values[0][2] == true) {
                  console.log("if");

                  column = xyz?.values[0][1];
                  xyz.filter = xyz.values.map((vals: any) => {
                    return vals[0];
                  });
                }
              } else {
                console.log("else");

                xyz.filter = xyz?.values;
              }
            }
            console.log(xyz);

            if (xyz.filterType == "date") {
              console.log(xyz);
              if (flag) {
                dataconditions.push({
                  column: column,
                  operator: operator,
                  type: xyz.dateFrom,
                  value: [
                    moment(xyz.dateFrom).format("yyyy-MM-DDT00:00:00.000Z"),
                    moment(xyz.dateTo).format("yyyy-MM-DDT00:00:00.000Z"),
                  ],
                });
              } else {
                dataconditions.push({
                  column: column,
                  operator: operator,
                  type: xyz.filterType,
                  value: moment(xyz.dateFrom).format(
                    "yyyy-MM-DDT00:00:00.000Z"
                  ),
                });
              }
            } else {
              if (xyz.filterType == "string") {
                if (!_.isEmpty(data.value)) {
                  if (xyz?.values[0][2] == true) {
                    console.log("if");

                    column = xyz?.values[0][1];
                    xyz.filter = xyz.values.map((vals: any) => {
                      return vals[0];
                    });
                  }
                } else {
                  console.log("else");

                  xyz.filter = xyz?.values;
                }
              }
              if (flag) {
                dataconditions.push({
                  column: column,
                  operator: operator,
                  type: xyz.filterType,
                  value: [xyz.filter, xyz.filterTo],
                });
              } else {
                dataconditions.push({
                  column: column,
                  operator: operator,
                  type: xyz.filterType,
                  value: xyz.filter,
                });
              }
            }
          });
        } else {
          if (data.filterType == "set") {
            data.filterType = "string";
            data.type = "IN";
            if (!_.isEmpty(data.value)) {
              if (data?.values[0][2] == true) {
                column = data.values[0][1];
                data.filter = data?.values.map((vals: any) => {
                  console.log(vals);
                  return vals[0];
                });
              }
            } else {
              data.filter = data.values;
            }
            console.log(data);
          }

          let operator: any = data.type.toUpperCase();
          let flag: boolean = false;

          if (data.type == "inRange") {
            flag = true;
          }
          if (data.filterType == "string") {
            if (!_.isEmpty(data.value)) {
              if (data.values[0][2] == true) {
                console.log("if");

                column = data.values[0][1];
                data.filter = data.values.map((vals: any) => {
                  return vals[0];
                });
              }
            }
          }
          if (data.filterType == "date") {
            console.log(data);
            if (flag) {
              dataconditions.push({
                column: column,
                operator: operator,
                type: data.filterType,

                value: [
                  moment(data.dateFrom).format("yyyy-MM-DDT00:00:00.000Z"),
                  moment(data.dateTo).format("yyyy-MM-DDT00:00:00.000Z"),
                ],
              });
            } else {
              dataconditions.push({
                column: column,
                operator: operator,
                type: data.filterType,
                value: moment(data.dateFrom).format(
                  "yyyy-MM-DDT00:00:00.000Z"
                ),
              });
            }
          } else {
            if (flag) {
              dataconditions.push({
                column: column,
                operator: operator,
                type: data.filterType,
                value: [data.filter, data.filterTo],
              });
            } else {
              dataconditions.push({
                column: column,
                operator: operator,
                type: data.filterType,
                value: data.filter,
              });
            }
          }
        }

        filtervaluse.conditions = dataconditions;
        overallfilter.push(filtervaluse);
      }
      vals.filter = overallfilter;
      console.log(overallfilter);
    }
    resolve(vals);
  });
}

}

