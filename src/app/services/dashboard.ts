import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { Color, id, ScaleType } from "@swimlane/ngx-charts";
import { DataService } from "./data.service";

@Injectable({
 providedIn: "root",
})
export class DashboardService {
 private _id: any;
 name: any;
 status: any;
 showDashboard = false; //show dashboard for the component

 constructor(
 private httpClient: HttpClient,
 private dataService: DataService
 ) { }

 view: any = [1865, 200];
 colorScheme = {
 domain: ["#F79554", "#F34526", "#57DE21", "#76B3FE"],
 name: "myScheme",
 selectable: false,
 group: ScaleType.Ordinal,
 };
 cardColor: string = "black";
 cardData = [
 {
 id: "Facility",
 name: "Facility",
 value: 2,
 },
 {
 id: "Devices",
 name: "Devices",
 value: 4,
 },
 {
 id: "Employee Health",
 name: "Employee Health",
 value: "4",
 }
 ];

 loadDashBoardData() {
 // this.getDueTaskStatus();
 // this.getOpenTaskStatus();
 // this.getApproveTasks();
 }

 //get due tasks from the api
// getDueTaskStatus() {
// this.dataService.getDueTasks().then((res: any) => {
// if (res.data) {
// res.data.forEach((d: any) => {
// this.setCardData(d._id, d.count);
// });
// }
// });
// }

 //get open tasks from the api
// getOpenTaskStatus() {
// this.dataService.getOpenTasks().then((res: any) => {
// if (res.data) {
// res.data.forEach((d: any) => {
// this.setCardData(d._id, d.count);
// });
// }
// });
// }

 //get pending tasks from the api
// getApproveTasks() {
// this.dataService.getPendingTasks().then((res: any) => {
// if (res.data) {
// res.data.forEach((d: any) => {
// this.setCardData(d._id, d.count);
// });
// }
// });
// }

 //ngxchart canbe count show all tasks
 setCardData(id: string, value: number) {
 this.cardData.find((d: any) => {
 if (d.id == id) {
 d.value = value;
 }
 });
 this.cardData = [...this.cardData];
 }
}