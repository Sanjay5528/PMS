import { Component, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NavItem } from '../nav-items';

@Component({
  selector: 'app-menu-item',
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.css']
})
export class MenuItemComponent {
  @Input() items!: any[];
  @ViewChild('childMenu', { static: true }) public childMenu: any;
role:any
  constructor(
    public router: Router
  ) {
let details:any=localStorage.getItem("auth")
this.role=JSON.parse(details).role
  }


  navigate(item:any){
    this.router.navigate([item.route]);

  }
}
