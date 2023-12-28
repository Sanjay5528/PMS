import { NgModule } from '@angular/core';
import { RouterModule, Routes, provideRouter, withDebugTracing, withRouterConfig } from '@angular/router';
import { DefaultLayoutComponent } from './component/app-layout/default-layout/default-layout.component';
import { DynamicFormComponent } from './component/dynamic-form/dynamic-form.component';
import { DatatableComponent } from './component/datatable/datatable.component';
import { LoginComponent } from './component/authentication/login/login.component';

import { AuthGuardService } from './services/auth-guard.service';
import { LoginLayoutComponent } from './component/app-layout/login-layout/login-layout.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { MasterSingleDetailFormComponent } from './component/master-single-detail-form/master-single-detail-form.component';
import { ForgotPasswordComponent } from './component/authentication/forgot-password/forgot-password.component';
import { AccessrightComponent } from './component/ACL/accessright/accessright.component';
import { IndividualAccessComponent } from './component/ACL/individual-access/individual-access.component';
import { RoleDataAclComponent } from './component/ACL/role-data-acl/role-data-acl.component';
import { DatasetComponent } from './component/dataset/dataset.component';
import { NgmodelComponent } from './component/dataset/ngmodel/ngmodel.component';
import { AggridTreeComponent } from './component/aggrid-tree/aggrid-tree.component';
import { TimesheetComponent } from './component/timesheet/timesheet.component';
import { CreatecvComponent } from './component/createcv/createcv.component';
import { ExpansionComponent } from './component/checkformaly/expansion/expansion.component';
import { NestedtablesComponent } from './component/nestedtables/nestedtables.component';
import { GantchartComponent } from './component/gantchart/gantchart.component';



const routes: Routes = [

  {
    path: "",
    redirectTo: "login",
    pathMatch: "full"
  },
  {
    path: 'activate',
    component: ForgotPasswordComponent
  },
  {
    path: "login",
    loadChildren: () =>
      import("./component/authentication/authentication.module").then(
        (m) => m.AuthenticationModule
      ),
    component: LoginComponent
  },
  
  // {
  //   path: "add",
  //   component: DefaultLayoutComponent,
  //   children:[]},
  {
    path: 'access_right/:Type/:Role',
    component: DefaultLayoutComponent,
   canActivate: [AuthGuardService],

    children:[
      {path:'',component: AccessrightComponent}
    ]
  },{
    path: 'ACL/:id',
    component: DefaultLayoutComponent,
   canActivate: [AuthGuardService],

    children:[
      {path:'',component: IndividualAccessComponent}
    ]
  },{
    path: 'role/acl/:orgid/:role',
   canActivate: [AuthGuardService],

    component: DefaultLayoutComponent,
    children:[
      {path:'',component: RoleDataAclComponent}
    ]
  },
  // {
  //   path: 'ACL/:id',
  //   component: IndividualAccessComponent
  // },
  // {
  //   path: 'type_acl/:Type',
  //   component: AccessrightComponent
  // },
  // {
  //   path: "register",
  //   loadChildren: () =>
  //     import("./component/authentication/authentication.module").then(
  //       (m) => m.AuthenticationModule
  //     ),
  //   component: RegisterComponent
  // },

  {
    path: "Dashboard",
    component: DefaultLayoutComponent,
   canActivate: [AuthGuardService],
    children: [
      {
        path: ":Type/:Id",
        component:DashboardComponent
        // component: GantchartComponent

      }

    ]
  },
{
  path:"check",
  component:ExpansionComponent
},
{
  path:"nestestedtable",
  component: DefaultLayoutComponent,
  canActivate: [AuthGuardService],
  children: [
    {
      path: ":component/:id",
      component:NestedtablesComponent
    },
  ],
},
  {
    path: "add",
    component: DefaultLayoutComponent,
   canActivate: [AuthGuardService],

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
   canActivate: [AuthGuardService],

    children: [
      {
        path: ":form/:id",
        component: DynamicFormComponent,
      },
    ],
  },

  {
    path: "list",
    canActivate: [AuthGuardService], 
    component: DefaultLayoutComponent,
    children: [
      {
        path: "",
        component: DatatableComponent,
      },
      {
        path: ":form",
        component: DatatableComponent,
      }
    ],
  },
  {
    path:'data_set',
    canActivate: [AuthGuardService], 
    component: DefaultLayoutComponent,
    children:[
      {
        path: "",
        component:DatasetComponent
      
      },{
        path:'ngmodel',
        component:NgmodelComponent
      },{
        path:':id',
        component:DatasetComponent
      }
    ]
  },
   {
    path: "project",
    // path: "client/:cid",
    component: DefaultLayoutComponent,
    children: [
      // {
      //   path:"Project/:pid/:Action",
      //   component:AggridTreeComponent
      // },
      {
        path: ":id/:Action",
        component: AggridTreeComponent,
      },
      // {
      //   path: "projectteam/:id",
      //   component: AggridTreeComponent,
      // }
    ],
  },
//   {
//     path: "client/:cid",
//    component: DefaultLayoutComponent,
//    children: [
//      {
//        path:"Project/:id/:Action",
//        component:AggridTreeComponent
//      }, 
//    ],
//  }, 
  {
    path: "profile",
    component: DefaultLayoutComponent,
    children: [
      {
        path: ":component",
        component: TimesheetComponent,
      },
    ],
  }, 
  
  // {
  //   path: "approval",
  //   component: DefaultLayoutComponent,
  //   children: [
  //     {
  //       path: "",
  //       component: TimesheetComponent,
  //     },
  //   ],
  // }, 

  //  {
  //   path: "createcv",
  //   component: DefaultLayoutComponent,
  //   children: [
  //     {
  //       path: "",
  //       component: CreatecvComponent,
  //     },
  //   ],
  // },
  // {
  //   path: "projectteam/project/:id",
  //   component: DefaultLayoutComponent,
  //   children: [
  //     {
  //       path: "",
  //       component: ProjectteamComponent,
  //     },
  //   ],
  // },
  {
    path: "data",
    canActivate: [AuthGuardService],
    component: DefaultLayoutComponent,
    children: [
      {
        path: "list/:form",
        component: DatatableComponent,
      },
      // MAster Single COmponent
      {
        path: "add/:form",
        component: MasterSingleDetailFormComponent,
      },
      {
        path: "edit/:form/:id",
        component: MasterSingleDetailFormComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  // providers:[ provideRouter(routes,
  //   withDebugTracing(),
  //   withRouterConfig({paramsInheritanceStrategy: 'always'}))
  // ],
  exports: [RouterModule]
})
export class AppRoutingModule { }



