import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DefaultLayoutComponent } from './component/app-layout/default-layout/default-layout.component';
import { DynamicFormComponent } from './component/dynamic-form/dynamic-form.component';
import { DatatableComponent } from './component/datatable/datatable.component';
import { LoginComponent } from './component/authentication/login/login.component';

import { AuthGuardService } from './services/auth-guard.service';
import { LoginLayoutComponent } from './component/app-layout/login-layout/login-layout.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { MasterSingleDetailFormComponent } from './component/master-single-detail-form/master-single-detail-form.component';
import { ForgotPasswordComponent } from './component/authentication/forgot-password/forgot-password.component';

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
    path: "home",
    component: DefaultLayoutComponent,
   canActivate: [AuthGuardService],
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
      },
      {
        path: ":menu/:type",
        component: DatatableComponent,
      }
    ],
  },
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
  exports: [RouterModule]
})
export class AppRoutingModule { }



