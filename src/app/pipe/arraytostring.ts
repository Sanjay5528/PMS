

import { Pipe, PipeTransform } from "@angular/core";
import * as moment from "moment";
@Pipe({
  name: 'arrayPipe'
})
export class ArrayToStringPipe implements PipeTransform {
  
  transform(input: any[] , attribute?:any): string {
    let txt = "";
    for (let i=0; i < input?.length;i++){
        txt += (input[i][attribute]) +","
     }
     var n =txt.lastIndexOf(",")
     var value=txt.substring(0,n)
    return value
 }
}

@Pipe({
  name: 'removehtml'
})
export class RemovehtmlPipe implements PipeTransform {
  transform(input: any): string {
   let value=input?.replace( /(<([^>]+)>)/ig, '');
   
    return value
 }
}

@Pipe({
  name: 'lastindexpipe'
})
export class LastIndexPipe implements PipeTransform {
  
  transform(input: any[] , attribute?:any): string {

    let data=[]
    for (let i=0; i < input?.length;i++){
        data.push(input[i][attribute])
     }
     let txt:any=data.slice(-1)
     let despatch:any=data.includes("Despatched")
     if(input.length>1 && despatch==true){
     txt= data.find(a=>{return a=="Despatched"})
      return txt
     }else{
      return txt[0]
     }
   
 }
}
@Pipe({
  name: 'arraytimePipe'
})
export class ArrayTodateStringPipe implements PipeTransform {
  
  transform(input: any[] , attribute1?:any,attribute2?:any,attribute3?:any): string {
  
    let txt= ""
    
    for (let i=0; i < input?.length;i++){
      if(input[i][attribute2]!=undefined){
        txt += (moment(input[i][attribute1]).format('hh:mm a')) +" - "+(moment(input[i][attribute2]).format('hh:mm a'))+" : "+input[i][attribute3]  
      }
      }
    return txt
    
 }
 
}


@Pipe({
  name: 'sumpipe'
})
export class SumPipe implements PipeTransform {
  
  duration:any
  transform(input: any[], attribute?:any) {
   let data=[]
   
    for (var i = 0; i < input.length; i++) {
      if(input[i][attribute]!=undefined){
        data.push(input[i][attribute])
      }
  }
  this.sumtime(data)
  return this.duration
  }
  sumtime(data:any) {
    let sumSeconds = 0;  
        data?.forEach((time:any)=> {
            let a = time?.split(":");
            let seconds = +a[0] * 60 * 60 + +a[1] * 60 + +a[2];
            sumSeconds += seconds;
    });
  let time=(sumSeconds * 1000)
  this.duration= moment.utc(time).format('HH:mm:ss')
  }
}


