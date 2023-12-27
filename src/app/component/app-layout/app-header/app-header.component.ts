import { Component, ViewChild, OnInit, OnDestroy, ChangeDetectorRef, AfterViewInit, Injectable, Input, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { NavItem } from '../nav-items';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { HttpClient } from "@angular/common/http";
import { MediaMatcher } from '@angular/cdk/layout';

import { MatSidenav } from '@angular/material/sidenav';
import { DataService } from 'src/app/services/data.service';
import { DialogService } from 'src/app/services/dialog.service';
import { FormControl, Validators } from '@angular/forms';
import { HelperService } from 'src/app/services/helper.service';
import { Location } from '@angular/common';
//import { ChangePasswordComponent } from '../../authentication/change-password/change-password.component';

@Component({
  selector: 'app-app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.css']
})
export class AppHeaderComponent {
  @ViewChild('childMenu') public childMenu: any;
  @Input('company_logo') company_logo: any
  navItems!: NavItem[]
  project_menu:any=false
  logo = environment.logoUrl
  CustomerList:any
  selectProject:FormControl = new FormControl (null, Validators.required);
@Output() project = new EventEmitter; 
  role:any
  constructor(
    private router: Router,
    private route:ActivatedRoute,
    private _location:Location,
    private dataservice:DataService,
    private helperService:HelperService,
    public dialogService: DialogService,
  ) { }
  screenId:any
  project_Data:any=[]
  ngOnInit() { 
    this.screenId="COORDR_menu";
    // this.screenId="devops";
    // this.helperService.getProjectObservable().subscribe(
    //   (result: any) => {
    //     // console.warn(result);
    //     // this.project_menu =result
    //     this.selectProject.setValue(result)
        
    //   },(err:any) =>{
    //     console.log(err);

    //   }
    // )
    
    // this.router.events.subscribe(() => {
    //   const currentUrl = this.router.url;
    //   console.log(currentUrl);
      
    //   // if (currentUrl.includes('saas-dashboard/engineer') && currentUrl.includes('/profile')) {
    //   //   // this.isContentVisible = true; 
    //   // } else {
    //   //   // this.isContentVisible = false; 
    //   // }
    // });

        let emp_id:any=this.helperService.getEmp_id()
    this.dataservice.sidenav(emp_id).subscribe((res:any)=>{
      // this.dataservice.sidenav("E0001").subscribe((res:any)=>{
  console.log(res);
  
          if(res.data != null){
            this.project_Data=res.data
            this.helperService.getProjectObservable().subscribe((res:any)=>{
              this.selectProject.setValue(res._id)
           })
           
          }
        })
  

      //   this.selectProject?.valueChanges.subscribe((change: any) => {
      //     if(change != null || change != undefined){
      //      console.log(change);
      //      this.project_menu=true;
      //      this.projectmenu(change)
      //      // let changes:any= change?._id ? change?._id : change
      //     //  sessionStorage.setItem("selectedProjectID", JSON.stringify(change))
      //     //  this.logo_image = environment.ImageBaseUrl+change?.logo;
      //    }
      //  })
 
    // rewrite the code
      // this.httpClient.get("assets/menu-json/" +"menu" + ".json").subscribe((data: any) => {
      //   console.log(data);
        
      //   this.navItems = [
      //     {
      //       "displayName": "Production",
      //       "iconName": "group",
      //       "children": [
      //       {
      //         "displayName": "Job",
      //         "iconName": "assignment_ind",
      //         "children": [
      //         {
      //           "displayName": "Book",
      //           "iconName": "assignment_ind",
      //           "children": [
      //           {
      //             "displayName": "Book",
      //             "iconName": "assignment_ind",
      //             "route": "/list/book"
      //           }
      //           ]
      //         },
          
      //         {
      //           "displayName": "Journal",
      //           "iconName": "assignment_ind",
      //           "children": [
      //             {
      //               "displayName": "Journal Master",
      //               "iconName": "assignment_turned_in",
      //               "route": "/list/journal_master"
      //             },
      //           {
      //             "displayName": "Journal",
      //             "iconName": "collections_bookmark",
      //             "route": "/list/journal"
      //           },
      //                                   {
      //             "displayName": "Article Task Track",
      //             "iconName": "collections_bookmark",
      //             "route": "/list/article_task_track"
      //           },
      //           {
      //             "displayName": "Dispatched Articles",
      //             "iconName": "collections_bookmark",
      //             "route": "/list/dispatch"
      //           }
      //           ]
      //         }
      //         ]
      //       },
      //       {
      //         "displayName": "Screen Configuration",
      //         "iconName": "edit",
      //         "route": "/data/list/screen"
      //       }
      //       ]
      //     },
      //     {
      //       "displayName": "MDM",
      //       "iconName": "group_work",
      //       "children": [
      //       {
      //         "displayName": "Client",
      //         "iconName": "group",
      //         "route": "/list/client"
      //       },
      //       {
      //         "displayName": "User",
      //         "iconName": "account_circle",
      //         "route": "/list/user"
      //       },
      //       {
      //         "displayName": "Holidays",
      //         "iconName": "today",
      //         "route": "/list/holiday"
      //       },
      //       {
      //         "displayName": "Designation",
      //         "iconName": "account_circle",
      //         "route": "/list/designation"
      //       },
      //       {
      //         "displayName": "Role",
      //         "iconName": "perm_identity",
      //         "route": "/list/role"
      //       },
      //       {
      //         "displayName": "Team",
      //         "iconName": "group",
      //         "route": "/list/team"
      //       },
      //       {
      //         "displayName": "Task",
      //         "iconName": "assignment",
      //         "route": "/list/task"
      //       },
      //       {
      //         "displayName": "Status",
      //         "iconName": "view_list",
      //         "route": "/list/status"
      //       },
      //       {
      //         "displayName": "Process",
      //         "iconName": "assignment",
      //         "route": "/list/process"
      //       },
      //       {
      //         "displayName": "Workflow",
      //         "iconName": "assignment_turned_in",
      //         "route": "/list/workflow"
      //       },
      //       {
      //         "displayName": "Journal Task",
      //         "iconName": "assignment_turned_in",
      //         "route": "/list/journal_task"
      //       },
      //                   {
      //         "displayName": "J Task",
      //         "iconName": "assignment_turned_in",
      //         "route": "/list/j_task"
      //       },
      //       {
      //         "displayName": "Email Template",
      //         "iconName": "email",
      //         "route": "/list/email_template"
      //       }
      //       ]
      //     },
      //     {
      //       "displayName": "Reports",
      //       "iconName": "assignment",
      //       "children": [
      //       {
      //         "displayName": "Journal",
      //         "iconName": "assignment"
              
      //       },
      //       {
      //         "displayName": "Book",
      //         "iconName": "assignment"
              
      //       }
      //       ]
      //     },
      //     {
      //       "displayName": "HR",
      //       "iconName": "assignment",
      //       "children": [
            
      //       {
      //         "displayName": "My Leaves",
      //         "iconName": "assignment_ind",
      //         "route": "/list/my_leaves"
      //       },
      //       {
      //         "displayName": "Leave Approval Request List",
      //         "iconName": "assignment_ind",
      //         "route": "/list/approve_leave_list"
      //       },
      //       {
      //         "displayName": "Holidays",
      //         "iconName": "assignment_ind",
      //         "route": "/list/user_holiday"
      //       }
      //       ]
      //     },
      //     {
      //       "displayName": "HR Admin",
      //       "iconName": "perm_identity",
      //       "children": [
      //       {
      //         "displayName": "Leave Management",
      //         "iconName": "check_circle",
      //         "children": [
      //         {
      //           "displayName": "Approved List",
      //           "iconName": "assignment_ind",
      //           "route": "/list/leave"
      //         },
      //         {
      //           "displayName": "Employee Record",
      //           "iconName": "perm_identity",
      //           "route": "/list/employee_record"
      //         },
      //               {
      //           "displayName": "User Leave Reset",
      //           "iconName": "perm_identity",
      //           "route": "/list/user_leave_reset"
      //         },
      //         {
      //           "displayName": "User Leave Adjustment",
      //           "iconName": "perm_identity",
      //           "route": "/list/hr_admin_leave_adjust"
      //           }
      //         ]
      //       },
      //       {
      //         "displayName": "User Log Sheet",
      //         "iconName": "perm_contact_calendar",
      //         "route": "/list/user_logsheet"
      //       },
      //       {
      //         "displayName": "User Gantt Chart",
      //         "iconName": "insert_chart",
      //         "route": "/data/gantt_chart"
              
      //       }
      //       ]
      //     }
      //     ]
      //     ;
      // })
// this.httpClient.get('http://10.0.0.123:7000/entities/user').subscribe((xyz:any)=>{
//   console.log(xyz);
  
// })
      this.dataservice.loadScreenConfigJson(this.screenId).subscribe((config:any)=>{

         this.navItems = config
        
      });
  }

  

projectmenuClose(){
  this.helperService.getProjectmenu(false)
}





  logout(event: any) {
    localStorage.clear()
    sessionStorage.clear()
    this.router.navigateByUrl('/login')
    // this.dataservice.getData("auth/signout").subscribe((res:any)=>{
    //   window.location=res?.logout_url
    // })
  }
   
  homepage(event: any) {
    this.router.navigate(['/home']);
  }

  projectmenu(data:any){ 
    this.helperService.getProjectmenu(data)
    this.routechange(data)

  }

  routechange(projectDetails:any){

    // let data:any=this.route.snapshot
    // let valueSplit=data._routerState.url.split("/")
    // valueSplit= valueSplit.splice(1,)
    // console.log(valueSplit);
    // let valueSplitlength = valueSplit[(valueSplit.length)-2].length
    // let projectlength =projectDetails._id.length
    // console.log(projectlength,valueSplitlength);
    
    // if ( projectDetails._id != valueSplit[(valueSplit.length)-2] && (valueSplitlength == projectlength) ){
    //   valueSplit=valueSplit.splice(0,(valueSplit.length)-2)
    //   valueSplit.push(projectDetails._id)
    // let route =valueSplit.join("/") 
    //   this.router.navigateByUrl(route) 
    // }
    
    // this.router.navigate(["Dashboard","Project",projectDetails._id])

    // let route_Project_Id=this.route.children[0].snapshot.params["id"]
    // let selected_Project_Id=projectDetails._id

    // if(route_Project_Id != selected_Project_Id && (route_Project_Id.length == selected_Project_Id.length)){
    //   let route="project/"+selected_Project_Id+"/"+this.route.children[0].snapshot.params["Action"]
    //   this.router.navigateByUrl(route);
    // }

  }

  navigate(item:any){
    this.router.navigate([item.route]);
  }

}
