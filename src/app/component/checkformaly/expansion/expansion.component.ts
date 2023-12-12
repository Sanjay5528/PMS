import { Component } from '@angular/core';
import { isEmpty } from 'lodash';
import * as moment from 'moment';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-expansion',
  templateUrl: './expansion.component.html',
  styleUrls: ['./expansion.component.css']
})
export class ExpansionComponent  {
  childData:any={}
expanisionpanel:any[]=[]
opt:any
field:any
arr:any[]=[]
constructor(public dataservices:DataService){
  // todo
  // this.opt=this.field.props
  // let parentCollectionName:any=this.opt.parentCollectionName
  // let ChildCollectionName:any=this.opt.childCollectionName
    //  let parentMatchField:any=this.opt.parentMatchField
    //  let childMatchField:any=this.opt.childMatchField
    //  let childValueProp:any=this.opt.valueProp
    //  let childLabelProp:any=this.opt.labelProp
  
this.dataservices.getDataByFilter("designation",{start:0,end:100}).subscribe((xyz:any)=>{
  console.log(xyz.data[0].response);
  let parentData:any[]=xyz.data[0].response

  this.dataservices.getDataByFilter("employee",{start:0,end:10000}).subscribe((res:any)=>{
    console.log(res.data[0].response);
    let ChildData:any=res.data[0].response
    parentData.forEach((designation:any) => {
      let Checkboxarr:any[]=[]
      ChildData.map((employee:any)=>{
        if(designation.name==employee.designation){
          Checkboxarr.push({value:employee.employee_id,label:employee.first_name+employee.last_name})
        }
      })
      if(!isEmpty(Checkboxarr)){
        this.expanisionpanel.push(designation.name)
        this.arr.push(false)
        this.childData[designation.name]=Checkboxarr
      }
    });
    console.log(this.childData);
    
  })
})
// const startTime = moment().startOf('day').format(); 
// const endTime = moment().endOf('day').subtract(1, 'minute').format(); 
// console.log(startTime,endTime);

}
onParentCheckboxChange(values: string,event:any,index:any) {
  console.log(event);
this.arr[index]=event.srcElement.checked
if(event.srcElement.checked==true){

  event.stopPropagation();

}
  for (let checkBoxData of this.childData[values]) {
    checkBoxData.checked = event.srcElement.checked
  }

  console.log( this.childData[values]);
  
}

ChildCheckBox(values:any,event:any,index:any){
console.log(event.srcElement.checked);
  event.stopPropagation();
  console.log(values);
  if(event.srcElement.checked==false){
    this.arr[index]=event.srcElement.checked
  }
  console.log( this.childData[values]);
  if(event.srcElement.checked==true){

    
    for (let checkBoxData of this.childData[values]) {
    if(  checkBoxData.checked ==false ){
      this.arr[index]=false
    }else{
      this.arr[index]=true
    }
    }
  }

}
}
