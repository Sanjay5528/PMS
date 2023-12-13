import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, HostListener, NgZone, OnInit, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { DialogService } from 'src/app/services/dialog.service';
import { NavItem } from '../nav-items';
interface SideNavToggle {
  screenwidth: number
  collapsed: boolean
}
@Component({
  selector: 'app-side-navbar',
  templateUrl: './side-navbar.component.html',
  styleUrls: ['./side-navbar.component.css']
})
export class SideNavbarComponent implements OnInit {


  @Output() onToggleSidenav: EventEmitter<SideNavToggle> = new EventEmitter

  navItems!: NavItem[]

  collapsed = true
  screenwidth = 0
  user: any
  leftpanel: any;
  leftpanel2: any;
  data: any;
  menu: any
  showSubmenu: boolean = false;
  showSubSubMenu: boolean = false;
  subsectionExpanded: { [key: string]: boolean } = {};
  logo_image: any;
  id: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private dataservice: DataService,
    public dialogService: DialogService,
    private zone: NgZone
  ) {
    let data: any = sessionStorage.getItem("auth")
    this.user = JSON.parse(data)
  }


  toggleSubsection(section: any): void {
    // Iterate through the keys (subsection names) in subsectionExpanded
    for (let subsectionName in this.subsectionExpanded) {
      // Check if the current subsection is not the same as the provided section
      if (subsectionName !== section.displayName) {
        // Collapse other subsections
        this.subsectionExpanded[subsectionName] = false;
      }
    }
  
    // Expand or collapse the provided section
    if (section.children) {
      // Toggle the expansion state of the provided section
      this.subsectionExpanded[section.displayName] = !this.subsectionExpanded[section.displayName];
    }
  }


  ngOnInit(): void {

    this.screenwidth = window.innerWidth
     

    // this.httpClient.get("assets/menu-json/" + this.menu + ".json").subscribe((data: any) => {
      this.navItems = [];
      this.onToggleSidenav.emit({ collapsed: this.collapsed, screenwidth: this.screenwidth })
    // })
  
  }




  @HostListener('window:ressize', ['$event'])
  onResize(event: any) {
    this.screenwidth = window.innerWidth;
    if (this.screenwidth <= 768) {
      this.collapsed = false
      this.onToggleSidenav.emit({ collapsed: this.collapsed, screenwidth: this.screenwidth })
    }
  }

  togglecollapse(menuItem?:boolean) {
    if(!menuItem){
      this.collapsed = !this.collapsed
      this.onToggleSidenav.emit({ collapsed: this.collapsed, screenwidth: this.screenwidth })
    }
   
  }

  closesidenv() {
    this.collapsed = false
    this.onToggleSidenav.emit({ collapsed: this.collapsed, screenwidth: this.screenwidth })
  }


 

  logout() { 
    this.zone.run(() => {
      if (confirm("Are you sure you want to Logout?")) {
        sessionStorage.clear();
        localStorage.clear();
        this.router.navigate(['/login']);
      }
    });
  }


  dashboard() {
    if (this.user?.user_type == "SAAS") {
      this.router.navigate(['/saas-dashboard']);
    } else if(this.user?.user_type == "Corporate Customer") {
      this.router.navigate(['/corporate-dashboard']);
    } else {
      this.router.navigate(['/enduser-dashboard']);
    }

  }

}
