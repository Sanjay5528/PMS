import { Component } from '@angular/core';
import * as moment from 'moment';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-expansion',
  templateUrl: './expansion.component.html',
  styleUrls: ['./expansion.component.css']
})
export class ExpansionComponent  {
  panelOpenState = false;

constructor(public dataservices:DataService){
this.dataservices.getDataByFilter("designation",{start:0,end:100}).subscribe((xyz:any)=>{
  console.log(xyz.data[0].response);
  this.dataservices.getDataByFilter("employee",{start:0,end:10000}).subscribe((xyz:any)=>{
    console.log(xyz.data[0].response);
    
  })
})
const startTime = moment().startOf('day').format(); 
const endTime = moment().endOf('day').subtract(1, 'minute').format(); 
console.log(startTime,endTime);

}

}
