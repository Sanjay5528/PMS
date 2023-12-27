import { Component, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NavItem } from '../nav-items';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-menu-item',
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.css']
})
export class MenuItemComponent {
  @Input() items!: NavItem[];
  @ViewChild('childMenu', { static: true }) public childMenu: any;
  constructor(
    public router: Router,
    public helperService:HelperService
  ) {

  }


  navigate(item:any){
    this.helperService.getProjectmenu(false)
    this.router.navigate([item.route]);

  }
}
