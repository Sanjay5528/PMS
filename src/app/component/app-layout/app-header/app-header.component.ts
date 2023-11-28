import { Component, ViewChild, OnInit, OnDestroy, ChangeDetectorRef, AfterViewInit, Injectable, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NavItem } from '../nav-items';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { HttpClient } from "@angular/common/http";
import { MediaMatcher } from '@angular/cdk/layout';

import { MatSidenav } from '@angular/material/sidenav';
import { DataService } from 'src/app/services/data.service';
import { DialogService } from 'src/app/services/dialog.service';
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
  logo = environment.logoUrl
  CustomerList:any
  role:any
  constructor(
    private router: Router,
    private route:ActivatedRoute,
    private httpClient: HttpClient,
    private dataservice:DataService,
    public dialogService: DialogService,
  ) { }
  screenId:any

  ngOnInit() { 
    this.screenId="COORDR_menu";
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
      // this.dataservice.getData("user").subscribe((res:any)=>{
      //   this.CustomerList = res?.data.filter((a:any)=>{
      //     if(a.companyname){
      //       return a
      //     }
      //   }) 
      //   console.log(this.CustomerList )
      // })
  }

  


    //patch the selected data to the field
    selectionChange(ctrl: any, inputObj: any,value:any) {
      const url = this.router.serializeUrl(
        this.router.createUrlTree([`/corporate-admin-dashboard/${value._id}`])
      );
      window.open(url, '_blank  ');

  }






  logout(event: any) {
    localStorage.clear()
    sessionStorage.clear()
    this.router.navigateByUrl('/login')
    // this.dataservice.getData("auth/signout").subscribe((res:any)=>{
    //   window.location=res?.logout_url
    // })
  }


// Switch account as Corporate Customer by SAAS
setSelectedCusId(event:any){
  
this.dataservice.getDataById("entities/user",event._id).subscribe((res:any)=>{
  this.role=sessionStorage.getItem("role")
 this.company_logo=sessionStorage.getItem("company_logo")
 this.router.navigate(['/data/corporate-admin-dashboard']);
})


  }

   
  homepage(event: any) {
    this.router.navigate(['/home']);
  }
  navigate(item:any){
    this.router.navigate([item.route]);

  }
}
