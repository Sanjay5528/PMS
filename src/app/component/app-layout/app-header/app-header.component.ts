import { Component, ViewChild, OnInit, OnDestroy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { NavItem } from '../nav-items';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { HttpClient } from "@angular/common/http";
import { DataService } from 'src/app/services/data.service';
@Component({
  selector: 'app-app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.css']
})
export class AppHeaderComponent implements OnInit {
  @ViewChild('childMenu') public childMenu: any;
  navItems!: NavItem[]
  logo = environment.logoUrl
  user_role: any
  menu_type: any
  id: any 
  constructor(
    private router: Router,
    private httpClient: HttpClient,
    private dataservice: DataService
  ) { }


  ngOnInit() {
    this.httpClient.get("assets/menu-json/" + "menu" + ".json").subscribe((data: any) => {
      this.navItems = data;
      let data1:any =localStorage.getItem('auth')
      this.id=JSON.parse(data1).name;
      console.log();
      
    })


  }
  logout(event: any) {
    debugger
    localStorage.clear()
    // this.dataservice.getData("auth/signout").subscribe((res: any) => {
    //   window.location = res?.logout_url
    // })
    this.router.navigate(['/login']);
  }
  homepage(event: any) {
    this.router.navigate(['/home']);
  }
  navigate(item: any) {
    this.router.navigate([item.route]);

  }

  reset(event: any) {
    debugger
    
    // this.dataservice.getData("auth/signout").subscribe((res: any) => {
    //   window.location = res?.logout_url
    // })
    this.router.navigate(['/forgot-password']);
  }
}
