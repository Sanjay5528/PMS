import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DefaultLayoutComponent } from './component/app-layout/default-layout/default-layout.component';
import { DynamicFormComponent } from './component/dynamic-form/dynamic-form.component';
import { DatatableComponent } from './component/datatable/datatable.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { LoginLayoutComponent } from './component/app-layout/login-layout/login-layout.component';
import { RegisterComponent } from './component/authentication/register/register.component';
import { MyprofileComponent } from './component/myprofile/myprofile.component';
import { CreatecvComponent } from './component/createcv/createcv.component';
import { AggridTreeComponent } from './component/aggrid-tree/aggrid-tree.component';
import { TimesheetComponent } from './component/timesheet/timesheet.component';
import { ForgotPasswordComponent } from './component/authentication/forgot-password/forgot-password.component';
import { ProjectteamComponent } from './component/projectteam/projectteam.component';


const routes: Routes = [


  {
    path: "",
    redirectTo: "login",
    pathMatch: "full"
  },

  {
    path: "login",
    loadChildren: () =>
      import("./component/authentication/authentication.module").then(
        (m) => m.AuthenticationModule
      ),
    component: LoginLayoutComponent
  },

  {
    path: "register",
    loadChildren: () =>
      import("./component/authentication/authentication.module").then(
        (m) => m.AuthenticationModule
      ),
    component: RegisterComponent
  },


  {
    path: "home",
    component: DefaultLayoutComponent,
    // canActivate: [AuthGuardService],
    children: [
      {
        path: "",
        component: DashboardComponent

      }

    ]
  },

  {
    path: "add",
    component: DefaultLayoutComponent,
    children: [
      {
        path: ":form",
        component: DynamicFormComponent,
      },
    ],
  },

  {
    path: "edit",
    component: DefaultLayoutComponent,
    children: [
      {
        path: ":form/:id",
        component: DynamicFormComponent,
      },
    ],
  },
 
  {
    path: "list",
    component: DefaultLayoutComponent,
    children: [
      {
        path: "",
        component: DatatableComponent
      },
      {
        path: ":form",
        component: DatatableComponent
      },
      {
        path: "testcase/:moduleid",
        component: DatatableComponent
      },
      {
        path: "project/:id",
        component: DatatableComponent
      },
      {
        path: "testresult/:testcaseid",
        component: DatatableComponent
      }
      


    ],
  },

  {
    path: "module/project/:id",
    component: DefaultLayoutComponent,
    children: [
      {
        path: "",
        component: AggridTreeComponent,
      },
    ],
  },
  {
    path: "projectteam/project/:id",
    component: DefaultLayoutComponent,
    children: [
      {
        path: "",
        component: ProjectteamComponent,
      },
    ],
  },

  {
    path: "myprofile",
    component: DefaultLayoutComponent,
    children: [
      {
        path: "",
        component: MyprofileComponent,
      },
    ],
  },
  {
    path: "timesheet/:date",
    component: DefaultLayoutComponent,
    children: [
      {
        path: "",
        component: TimesheetComponent,
      },
    ],
  },

  // {
  //   path: "calender",
  //   component: DefaultLayoutComponent,
  //   children: [
  //     {
  //       path: "",
  //       component: CalenderComponent,
  //     },
  //   ],
  // },
  { path: "forgot-password", component: ForgotPasswordComponent },
  { path: "myprofile", component: MyprofileComponent },
  { path: "timesheet", component: TimesheetComponent },
  // { path: "createcv", component: CreatecvComponent },
  // {
  //   path: "data",
  //   component: DefaultLayoutComponent,
  //   children: [
  //     {
  //       path: "engineer/:id",
  //       component: EngineersApprovalRequestComponent,
  //     },
  //   ],
  // },

  {
    path: "createcv",
    component: DefaultLayoutComponent,
    children: [
      {
        path: "",
        component: CreatecvComponent,
      },
    ],
  },

  {
    path: "data",
    component: DefaultLayoutComponent,
    children: [
      // {
      //   path: "engineer/:id",
      //   component: EngineerProfileComponent,
      //   children: [
      //     {
      //       path: "profile",
      //       component: EngineersApprovalRequestComponent,
      //     },
      //   ],
      // },
    ],
  },

  // {
  //   path: "data",
  //   component: EngineerProfileComponent,
  //   children: [
  //     {
  //       path: "engineer",
  //       component: EngineersApprovalRequestComponent,
  //     },
  //   ],
  // },
  // {
  //   path: "data/engineer/:id",
  //   component: DefaultLayoutComponent,
  //   loadChildren: () =>
  //   import("./component/engineer-profile/engineer-profile.module").then(
  //     (m) => m.EngineerProfileModule
  //   ),
  // },


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }



