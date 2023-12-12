import { Component, signal, ChangeDetectorRef, AfterViewInit, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CalendarOptions, DateSelectArg, EventClickArg, EventApi, EventInput } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { DataService } from '../../services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FullCalendarComponent } from '@fullcalendar/angular/full-calendar.component';
import * as moment from 'moment';
import { MomentInput } from 'moment';
import { GanttGroup, GanttItem, GanttViewOptions } from '@worktile/gantt';

@Component({
  selector: 'app-calender',
  templateUrl: './calender.component.html',
  styleUrls: ['./calender.component.css']
})
export class CalenderComponent implements OnInit {
  @ViewChild('fullCalendar') calendarComponent!: FullCalendarComponent;

  listData:EventInput[] = [];
  showRed: boolean = false;
  showGreen: boolean = false;
  calendarVisible = signal(true);
  calendarOptions = signal<CalendarOptions>({
    plugins: [
      interactionPlugin,
      dayGridPlugin,
      timeGridPlugin,
      listPlugin,
    ],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridYear,dayGridMonth'
    },
    initialView: 'dayGridMonth',
    // initialEvents: this.listData, // alternatively, use the `events` setting to fetch from a feed
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this)
    /* you can update a remote database when these fire:
    eventAdd:
    eventChange:
    eventRemove:
    */
   
  });
  currentEvents = signal<EventApi[]>([]);
  date: MomentInput;
  formattedDate: any;
  calendarDate: any;

  constructor(private changeDetector: ChangeDetectorRef, private activatedRoute: ActivatedRoute, private elementRef: ElementRef, private dataService: DataService, private router: Router,) {
  }

  ngOnInit() {
    debugger
    // let userPermissions = JSON.parse(data).role
    // let id =JSON.parse(data).profile.employeeid
    // let data: any = localStorage.getItem('auth');
    // let name = JSON.parse(data).profile.employeeid
 
    // if (userPermissions === 'SA' || userPermissions === 'team lead') {
     //this.dataService.getData("timesheet").subscribe((res:any)=> {
  
      // ! UNDO
    //  this.dataService.getcalendar(name).subscribe((res:any)=>{
    //   var calendarApi = this.calendarComponent.getApi();   
    //   res.data.forEach((item:any) => {
    //     let changeStringToNumber = parseFloat(item.workedhours)
    //     item.workedhours = changeStringToNumber;
    //     if(item.formatedDate){
    //       if(item.workedhours >= "8") {
    //         // this.showGreen = true;
    //         // this.showRed = false;
    //         calendarApi.addEvent({
    //           // id: item._id,
    //           title: item.workedhours,
    //           start: item.formatedDate,  
    //           // textColor: "green",
    //           // backgroundColor: "#0000",
    //           // borderColor: "#0000",
    //         });  
    //       } else if(item.workedhours< "8") {
    //         // this.showRed = true;
    //         // this.showGreen = false;
    //         calendarApi.addEvent({
    //           // id: item._id,
    //           title: item.workedhours,
    //           start: item.formatedDate,  
    //           // textColor: "green",
    //           // backgroundColor: "#0000",
    //           // borderColor: "#0000",
    //         });
    //       } else {
    //         // this.router.navigate(['timesheet'])
    //         console.log("hi")
    //       }
    //     }
    //   }); 
    // });  
    
    // this.getdata();
  }
 

// getdata(){
//   // let data: any = localStorage.getItem('auth');
//   // let userPermissions = JSON.parse(data).role
//   //    let id =JSON.parse(data).profile.employeeid
    
//     //let name = JSON.parse(data).profile.employeeid
//     this.activatedRoute.params.subscribe(params => {
//       this.calendarDate = params['date'];
//     });
//      if (userPermissions === 'SA' || userPermissions === 'team lead') {
    
//     //   this.dataService.getData("timesheet").subscribe((res:any)=> {
  
//             // ! UNDO

//     // // this.dataService.getcalendar(name).subscribe((res:any)=>{
//     //   var calendarApi = this.calendarComponent.getApi();   
//     //   res.data.forEach((item:any) => {
//     //     let changeStringToNumber = parseFloat(item.workedhours)
//     //     item.workedhours = changeStringToNumber;
//     //     if(item.formatedDate){
//     //       if(item.workedhours >= "8") {
//     //         // this.showGreen = true;
//     //         // this.showRed = false;
//     //         calendarApi.addEvent({
//     //           // id: item._id,
//     //           title: item.workedhours,
//     //           start: item.formatedDate,  
//     //           // textColor: "green",
//     //           // backgroundColor: "#0000",
//     //           // borderColor: "#0000",
//     //         });  
//     //       } else if(item.workedhours< "8") {
//     //         // this.showRed = true;
//     //         // this.showGreen = false;
//     //         calendarApi.addEvent({
//     //           // id: item._id,
//     //           title: item.workedhours,
//     //           start: item.formatedDate,  
//     //           // textColor: "green",
//     //           // backgroundColor: "#0000",
//     //           // borderColor: "#0000",
//     //         });
//     //       } else {
//     //         // this.router.navigate(['timesheet'])
//     //         console.log("hi")
//     //       }
//     //     }
//     //   }); 
//     // });  

// }
// }

  // handleCalendarToggle() {
  //   this.calendarVisible.update((bool) => !bool);
  // }

  // handleWeekendsToggle() {
  //   this.calendarOptions.mutate((options) => {
  //     options.weekends = !options.weekends;
  //   });
  // }

  // handleDateSelect(selectInfo: DateSelectArg) {
  //   debugger
  //   let title:any = prompt('Please enter your event total hours');
  //   const calendarApi = selectInfo.view.calendar;
  //   const alphabeticPattern = /^[A-Za-z]+$|[!@#$%^&*()_+{}\[\]:;<>,?~`|\\\/\-='"]/;

  //   calendarApi.unselect(); // clear date selection

  //   let changeStringToNumber = parseFloat(title)

  //   title = changeStringToNumber;

  //   if (title == "" || alphabeticPattern.test(title)) {
  //     alert("Please enter the valid number");
  //   }
  //   else if (title >= "8") {
  //     this.showGreen = true;
  //     this.showRed = false;
  //     calendarApi.addEvent({
  //       id: createEventId(),
  //       title,
  //       start: selectInfo.startStr,
  //       end: selectInfo.endStr,
  //       allDay: selectInfo.allDay,
  //       textColor: "green",
  //       backgroundColor: "#0000",
  //       borderColor: "#0000",
  //     });
  //   } else {
  //     this.showRed = true;
  //     this.showGreen = false;
  //     calendarApi.addEvent({
  //       id: createEventId(),
  //       title,
  //       start: selectInfo.startStr,
  //       end: selectInfo.endStr,
  //       allDay: selectInfo.allDay,
  //       textColor: "red",
  //       backgroundColor: "#0000",
  //       borderColor: "#0000",
  //     });
  //   }
  // }

  handleEventClick(clickInfo: EventClickArg) {
    debugger
    // if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
    //   clickInfo.event.remove();
    // }
    this.router.navigate(['timesheet'])
    console.log(clickInfo);
    
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    debugger
    // let title:any = prompt('Please enter your event total hours');
    // const calendarApi = selectInfo.view.calendar;
    // const alphabeticPattern = /^[A-Za-z]+$|[!@#$%^&*()_+{}\[\]:;<>,?~`|\\\/\-='"]/;

    // calendarApi.unselect();
    // let changeStringToNumber = parseFloat(title)

    // title = changeStringToNumber;

    // if (title == "" || alphabeticPattern.test(title)) {
    //   this.router.navigate(['timesheet'])
    // }
    console.log(selectInfo.start);
    let calendarDate:any = moment(selectInfo.start).format('YYYY-MM-DDT00:00:00.000+00:00');
    // console.log(formatedDate);
    this.router.navigate([`timesheet/${calendarDate}`])

    
   

  }

  handleEvents(events: EventApi[]) {
    this.currentEvents.set(events);
    this.changeDetector.detectChanges();
     // workaround for pressionChangedAfterItHasBeenCheckedError
  }
}

