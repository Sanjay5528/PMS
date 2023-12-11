import { Injectable } from '@angular/core';
import { isEmpty } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbsService {

  route: any = {};
  totalRoute: any[] = []; 
  constructor() {}

   routing(component: any, display_Name: any, icon?: any): Promise<any>  { 

    return new Promise<any>(async (resolve, reject) => {
      this.route = {
        current_route: component.route._futureSnapshot._routerState.url,
        display_Name: display_Name,
        icon: icon || 'default'
      };
      if (!isEmpty(this.totalRoute)) {
        const routeIndex: any = this.totalRoute.findIndex((exist: any) => exist.display_Name.toLowerCase() === this.route.display_Name.toLowerCase());
        console.log(routeIndex);
        if(routeIndex < 0) {
          this.totalRoute.push(this.route);
        }else{
          const breadcrumbs = this.totalRoute.slice(0, routeIndex + 1);
          console.log(breadcrumbs);
        }
       } else {
        this.totalRoute.push(this.route);
       }
       resolve(this.totalRoute)
    })
  } 
}
