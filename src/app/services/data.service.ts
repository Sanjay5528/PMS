import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  [x: string]: any;

  constructor(private http: HttpClient) { }
  public getWsBaseUrl() {
    return environment.apiBaseUrl
  }
  public getDataById(path: any, id: any) {

    // id = id.replace(/\//g, "%2F")
    return this.http.get(this.getWsBaseUrl() + "entities/" + path + '/' + id);
  }
   

public getChidData(collectionName:any, id:any, data?:any){
  return this.http.post(this.getWsBaseUrl()+ `${collectionName}` + '/' + id ,data)
}

  public getDataByIdTree(path: any, id: any) {

    // id = id.replace(/\//g, "%2F")
    return this.http.get(this.getWsBaseUrl() + "query/" + path + '/' + id);
  }


  public getDataByIdTimesheet(path: any, id: any) {

    // id = id.replace(/\//g, "%2F")
    return this.http.get(this.getWsBaseUrl() + "query/" + path + '/' + id);
  }


  public getDataByIdProject(ctrl: any, id: any) {

    // id = id.replace(/\//g, "%2F")
    return this.http.get(this.getWsBaseUrl() + "query/" + `${ctrl.config.form.collectionName}` + '/' + id);
  }
  public getcalendar( employee_id: any) {

    // id = id.replace(/\//g, "%2F")
    return this.http.get(this.getWsBaseUrl() + "query/timesheet"+ `/employeeid` + '/' + `${employee_id}` );
  }
  public getDataId(path: any, id: any) {

    // id = id.replace(/\//g, "%2F")
    return this.http.get(this.getWsBaseUrl() + path + '/' + id);
  }
  public getDataId1(path: any, id: any) {

    // id = id.replace(/\//g, "%2F")
    return this.http.get(this.getWsBaseUrl() + path + '/'+"projectid"+ '/'+ id);
  }

  public getDataByIdClient(path: any, id: any) {
    debugger
    // id = id.replace(/\//g, "%2F")
    return this.http.get(this.getWsBaseUrl() + "entities/" + 'filters/' + path + '/' + id);
  }
  public saveAll(collectionName:any,data: any) {
      return this.http.post(this.getWsBaseUrl() + "entities/" + `${collectionName}`, data);
      
  }



  // for login 
  public loginUser(data: any) {
    return this.http.post(this.getWsBaseUrl() + 'auth/login', data);
  }
  public upload(data: any, id: any) {
    return this.http.post(this.getWsBaseUrl() + 'upload/' + `${id}`, data);
  }
  public savetimesheet(data:any){
  return this.http.put(this.getWsBaseUrl()+'lookup/timesheet',data)
  }
  public savedata(data:any){
    return this.http.put(this.getWsBaseUrl()+'lookup/timesheet',data)
    }
  public updateapproved(data:any,ctrl:any){
    return this.http.put(this.getWsBaseUrl()+"entities/"+'${data}',ctrl);
  }



  //save the data
  public save(data: any, ctrl: any) {
    if (data == "timesheet") {
      return this.http.post(this.getWsBaseUrl() + "entities/" + `${data}`, ctrl);
    }
   
    else if (ctrl.pageHeading == 'Testcase') {
      return this.http.post(this.getWsBaseUrl() + "entities/" + `${ctrl.collectionName}`, data);
    }
    else {
      if (ctrl.pageHeading == 'Modules') {
        return this.http.post(this.getWsBaseUrl() + "entities/" + `${ctrl.config.form.collectionName}`, data);
      }
      else if (ctrl.pageHeading == 'Project Team') {
        debugger
        return this.http.post(this.getWsBaseUrl() + "entities/" + `${ctrl.config.form.collectionName}`, data);
      }
      else if (ctrl.pageHeading == 'Employee') {
        return this.http.post(this.getWsBaseUrl() + "entities/" + `${ctrl.collectionName}`, data);
      }
      else if (ctrl.pageHeading == 'Project Team Members') {
        return this.http.post(this.getWsBaseUrl() + "entities/" + `${ctrl.collectionName}`, data);
      }
      else if (ctrl.pageHeading == 'Client') {
        return this.http.post(this.getWsBaseUrl() + "entities/" + `${ctrl.collectionName}`, data);
      }
      else if (ctrl.pageHeading == 'Timesheet') {
        return this.http.post(this.getWsBaseUrl() + "entities/" + `${ctrl.collectionName}`, data);
      } else if (ctrl.pageHeading == 'unschedule') {
        return this.http.post(this.getWsBaseUrl() + "entities/" + `${ctrl.collectionName}`, data);
      }
      else {
        return this.http.post(this.getWsBaseUrl() + "entities/" + `${ctrl.config.form.collectionName}`, data);
      }
    }
  }

  //to list the datas in table
  public getdata(data: any) {
    return this.http.get(this.getWsBaseUrl() + "entities/" + `${data}`);
  }
  public getdata1() {
    return this.http.get(this.getWsBaseUrl() + "lookup/task" +"/SA");
  }
  public getdataTimesheet(id:any) {
    return this.http.get(this.getWsBaseUrl() + 'lookup/tasks/timesheet'+ `/${id}`);
  }

  //to list the module filter data
  public getModuleFilter(collectionName: any, key: any) {
    return this.http.get(this.getWsBaseUrl() + "entities/filter/" + `${collectionName}` + "/" + `${key}`);
  }

  //to update the data
  public update(data: any, ctrl: any) {
    let id = ctrl.id
    return this.http.put(this.getWsBaseUrl() + "entities/" + `${ctrl.collectionName}` + `/${id}`, data);
  }
  public UpdateAll(collectionName:any,id: any, data: any) {
    // let id = ctrl.id
    return this.http.put(this.getWsBaseUrl() + "entities/" + `${collectionName}` + `/${id}`, data);
  }
  public updateModules(data: any, ctrl: any,id:any) {
    return this.http.put(this.getWsBaseUrl() + "entities/modules"+ `/${id}` , data);
  }

  public updateTimesheet(data: any, id: any,collection_name:any) {
    // let id = ctrl.id
    return this.http.put(this.getWsBaseUrl() + "entities/"+`${collection_name}` + `/${id}`, data);
  }
 
  public AddTimesheet(data: any) {
    // let id = ctrl.id
    return this.http.post(this.getWsBaseUrl() + "entities/timesheet", data);
  }
  public AddUnScheduleTimesheet(data: any) {
    // let id = ctrl.id
    return this.http.post(this.getWsBaseUrl() + "entities/unschedule", data);
  }

  public updateUnschedule(data: any, id: any) {
    // let id = ctrl.id
    return this.http.put(this.getWsBaseUrl() + "entities/unschedule" + `/${id}`, data);
  }

  public getData(collectionName: any) {
    //  id = id.replace(/\//g,"%2F")
    return this.http.get(this.getWsBaseUrl() + "entities/" + collectionName);
  }

  //get data by url
  public getDataByUrl(id: any) {
    const encodedUrl = encodeURIComponent(id);
    // http%3A%2F%2Flocalhost%3A4301%2Fpz3uA
    return this.http.get(this.getWsBaseUrl() + 'emandate/urlData/' + `${encodedUrl}`);
  }

  //update data by url
  public updateDataByUrl(id: any) {
    const encodedUrl = encodeURIComponent(id);
    return this.http.get(this.getWsBaseUrl() + 'emandate/urlData/' + `${encodedUrl}`);
  }

  public deleteDataById(path: any, id: any) {
    // id = id.replace(/\//g, "%2F")
    return this.http.delete(this.getWsBaseUrl() + path + '/_id/' + id);
  }
  public deleteById(path: any, id: any) {
    // id = id.replace(/\//g, "%2F")
    return this.http.delete(this.getWsBaseUrl() + path +'/'+ id);
  }



  //captcha api
  public getCaptcha(data?: any) {
    return this.http.get(this.getWsBaseUrl() + 'captcha');
  }

  //For send otp for forgot password 
  public sendOTP(data?: any, id?: any) {
    return this.http.post(this.getWsBaseUrl() + `${data}` + `${id}`, data);
  }
  // /user/forget-password/{userId}

  public resetPwd(data: any) {
    return this.http.post(this.getWsBaseUrl() + 'auth/change-password', data);
  }



  public saveDoc(data: any) {
    return this.http.post(this.getWsBaseUrl() + `programdocument/create`, data, { reportProgress: true, observe: 'events' });
  }

  // //search the data
  // public search(data: any, id: any) {
  //   return this.http.get(this.getWsBaseUrl() + 'lookup/task/' + `${data}` + "/" + `${id}`, data);
  // }
  public  getTimesheetdata(data: any, id: any) {
    //console.log(format_date);
    
    return this.http.get(this.getWsBaseUrl() + 'lookup/timesheet/' + `${data}` + "/" + `${id}`,  data);
  }
  public getTimesheetdatabyadmin( data: any) {
    
    return this.http.get(this.getWsBaseUrl() + 'lookup/timesheet/SA/' + `${data}` );
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
  // public gettaskdatabyadmin() {
    
  //   return this.http.get(this.getWsBaseUrl() + 'lookup/tasks/timesheet' );
  // }
  public getworkhours(employee_id: any,scheduledstartdate:any) {
    
    return this.http.get(this.getWsBaseUrl() + 'lookup/workedhour/'+ `${employee_id}` + "/" + `${scheduledstartdate}`);
  }


  //Post the data
  public postData(endPoint: string, data: any) {
    return this.http.post(this.getWsBaseUrl() + `${endPoint}`, data);
  }



  public getRights() {
    return this.http.get(this.getWsBaseUrl() + 'userRights');
  }

  //to list the netbanking data 
  public getNetBankingList() {
    return this.http.get(this.getWsBaseUrl() + "emandate/list/NetBanking/{totalcount}");
  }

  // to list the Debitlist data
  public getDebitList() {
    return this.http.get(this.getWsBaseUrl() + "emandate/list/Debit/{totalcount}");
  }
  public getAadharList() {
    return this.http.get(this.getWsBaseUrl() + "emandate/list/AadharCard/{totalcount}");
  }
  public getUPI_MandatesList() {
    return this.http.get(this.getWsBaseUrl() + "emandate/list/UPI_Mandates/{totalcount}");
  }

  public getDates() {
    debugger
    return this.http.get(this.getWsBaseUrl() + "emandate/count/dates");
  }



  public updatePatch(data: any, ctrl: any) {

    let id = ctrl.id
    return this.http.patch(this.getWsBaseUrl() + `${ctrl.collectionName}` + `/${id}`, data);


  }

  // public imageupload(data: any, id: any) {  
  // return this.http.post(this.getWsBaseUrl() + "upload" + "/" + id, data);
  // }
 
  public imageupload(data: any) {  
    return this.http.post(this.getWsBaseUrl() +"upload"+"/S3" ,  data);
  }


  public updateById(collectionname: any, id: any, data: any) {
    return this.http.put(this.getWsBaseUrl() + `${collectionname}` + `/${id}`, data);
  }


  //update by id 
  public data_update(collectionname: any, id: any, data: any) {
    return this.http.put(this.getWsBaseUrl() + `${collectionname}` + `/${id}`, data);
  }

  //soft delete the data
  public disable(data: any, ctrl: any, id: any) {
    let collection_name = ctrl.collectionName
    return this.http.put(this.getWsBaseUrl() + `${collection_name}/` + "disable" + `/${id}`, data);
  }


  public getDataByFilter(collectionName: any, filter: any, c?: any) {
    return this.http.get(this.getWsBaseUrl() + collectionName + `/${filter}`);
  }
  public getDataByFilter1(collectionName: any, filter: any, c?: any) {
    return this.http.post(this.getWsBaseUrl() + 'search/' + collectionName +`/0/${1000}`,filter);
  }
  public getDataByFilterdate(collectionName: any, filter: any, c?: any) {
    return this.http.get(this.getWsBaseUrl() +"entities/"+ collectionName + `/${filter}`);
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
    if (conditions.length > 0)
      return [{
        clause: "$and",
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
    debugger
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
}



