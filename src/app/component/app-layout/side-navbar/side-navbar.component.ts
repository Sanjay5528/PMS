import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, HostListener, NgZone, OnInit, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { DialogService } from 'src/app/services/dialog.service';
import { NavItem } from '../nav-items';
import { FormControl, Validators } from '@angular/forms';
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
  formControl:FormControl = new FormControl (null, Validators.required);
  project_Data:any=[]
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private dataservice: DataService,
    public dialogService: DialogService,
    private zone: NgZone,
    public dataservices:DataService
  ) {
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

    this.dataservice.getDataByFilter('project',{}).subscribe((res:any)=>{
      console.log(res);
      this.project_Data=res.data[0].response
    })

    this.screenwidth = window.innerWidth


    // this.httpClient.get("assets/menu-json/" + this.menu + ".json").subscribe((data: any) => {
    this.navItems = [
      
      
      {
        "displayName": "Requirement",
        "iconName": "../../../../assets/images/requriement.svg",
        "route": "project/Requirement/"
      },

      {
        "displayName": "Task Creation",
        "iconName": "../../../../assets/images/requriement.svg",
        "route": "project/team_member/"
      },

      {
        "displayName": "Modules",
        "iconName": "../../../../assets/images/requriement.svg",
        "route": "project/module/"
      },

      {
        "displayName": "Release",
        "iconName": "../../../../assets/images/requriement.svg",
        "route": "data/edit/release/"
      },

      {
        "displayName": "Sprint",
        "iconName": "../../../../assets/images/requriement.svg",
        "route": "data/edit/project_sprint/"
      },

      {
        "displayName": "Project Team Member",
        "iconName": "../../../../assets/images/requriement.svg",
        "route": "project/projectteam/"
      },

      {
        "displayName": "Test Case",
        "iconName": "../../../../assets/images/requriement.svg",
        "route": "data/edit/regression/"
      },

      {
        "displayName": "Bug List",
        "iconName": "../../../../assets/images/requriement.svg",
        "route": "project/bug_list/"
      },
      {
        "displayName": "Back",
        "iconName": "../../../../assets/images/requriement.svg",
        "route": "list/project"
      },
      // {
      //   "displayName": "Jobs",
      //   "iconName": "../../../../assets/images/briefcase_icon .svg",
      //   "children": [
      //     {
      //       "displayName": "My Jobs",
      //       "iconName": "../../../../assets/images/Group.svg",
      //       "route": "/list/company-user-job"
      //     },
      //     {
      //       "displayName": "Post a Job",
      //       "iconName": "../../../../assets/images/Post job.svg",
      //       "route": "/endclient/add/job-post"
      //     },
      //     {
      //       "displayName": "Company Jobs",
      //       "iconName": "../../../../assets/images/briefcase_icon .svg",
      //       "route": "/list/company-jobs"
      //     }


      //   ]
      // },
      // {
      //   "displayName": "Wallet",
      //   "iconName": "../../../../assets/images/wallet.svg",
      //   "route": "/home-user/wallet"
      // },
      // {
      //   "displayName": "Transaction History",
      //   "iconName": "../../../../assets/images/transaction.svg",
      //   "route": "/list/home-user-wallet"
      // }

    ];
    this.onToggleSidenav.emit({ collapsed: this.collapsed, screenwidth: this.screenwidth })
    // })
    this.logo_image = "../../../../assets/images/profilepics.jpeg"
    // != 'undifiend' ? this.logo_image  :'../../../../assets/images/profilepics.jpeg'
    //   if (this.user?.user_type == "SAAS") {
    //     this.logo_image = "../../../../assets/images/logo-menu.png"
    //     let b =  getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
    //     document.documentElement.style.setProperty('--primary', b);
    //   }

    //   if (this.user?.user_type == "Corporate Customer") {
    //     this.id = sessionStorage.getItem("org_id")
    //     this.dataservice.getDataById("corporate_customer", this.id).subscribe((res: any) => {
    //       this.logo_image = res.data?.logo

    //     })




    //   //   let da: any = sessionStorage.getItem('theme')
    //   //   this.leftpanel2 = JSON.parse(da)
    //   //   // console.log(this.leftpanel2)
    //   //   let a = this.leftpanel2?.left_panel_color;
    //   //   if (typeof (a) !== 'string') {
    //   //   let b =  document.documentElement.style.getPropertyValue('--primary-color')
    //   //     document.documentElement.style.setProperty('--primary', b);
    //   //   } else {
    //   //     document.documentElement.style.setProperty('--primary', a);
    //   // }
    // }

    // if (this.user?.user_type == "Corporate" || this.user?.user_type == "Home User" || this.user?.user_type == "Client User" ) {
    //   this.logo_image = "../../../../assets/images/logo-menu.png"

    // }
    const project_Menu: any = (this.formControl) as FormControl;
    project_Menu.valueChanges.subscribe((value: any) => {
      console.log(value);
    });
    
  }




  @HostListener('window:ressize', ['$event'])
  onResize(event: any) {
    this.screenwidth = window.innerWidth;
    if (this.screenwidth <= 768) {
      this.collapsed = false
      this.onToggleSidenav.emit({ collapsed: this.collapsed, screenwidth: this.screenwidth })
    }
  }

  togglecollapse(menuItem?: boolean) {
    if (!menuItem) {
      this.collapsed = !this.collapsed
      this.onToggleSidenav.emit({ collapsed: this.collapsed, screenwidth: this.screenwidth })
    }

  }

  closesidenv() {
    this.collapsed = false
    this.onToggleSidenav.emit({ collapsed: this.collapsed, screenwidth: this.screenwidth })
  }




  // logout(){
  //   sessionStorage.clear()
  //   localStorage.clear()
  //   this.router.navigate(["/login"]);
  // }

  logout() {
    // if (confirm("Are you sure you want to Logout?")) {
    //   sessionStorage.clear();
    //   localStorage.clear();
    //   this.router.navigate(['/login']);
    // }
    this.zone.run(() => {
      if (confirm("Are you sure you want to Logout?")) {
        sessionStorage.clear();
        localStorage.clear();
        this.router.navigate(['/login']);
      }
    });
  }

routeToDestination(data:any){
  this.router.navigateByUrl(data)  
}
  dashboard() {

  }

}
