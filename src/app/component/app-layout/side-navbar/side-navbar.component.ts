import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { DialogService } from 'src/app/services/dialog.service';
import { NavItem } from '../nav-items';
interface SideNavToggle{
  screenwidth:number
  collapsed:boolean
}
@Component({
  selector: 'app-side-navbar',
  templateUrl: './side-navbar.component.html',
  styleUrls: ['./side-navbar.component.css']
})
export class SideNavbarComponent implements OnInit{


  @Output() onToggleSidenav:EventEmitter<SideNavToggle>=new EventEmitter

  navItems!: NavItem[]

  collapsed=true
  screenwidth=0
  user_type:any
  menu:any
  showSubmenu: boolean = false;
  showSubSubMenu: boolean = false;
  subsectionExpanded: { [key: string]: boolean } = {};

  constructor(
    private router: Router,
    private route:ActivatedRoute,
    private httpClient: HttpClient,
    private dataservice:DataService,
    public dialogService: DialogService,
  ) {
    this.user_type= sessionStorage.getItem("user_type")
   }


   toggleSubsection(section: any): void {
    if (section.children) {
      this.subsectionExpanded[section.displayName] = !this.subsectionExpanded[section.displayName];
    }
  }


  ngOnInit(): void {

    this.screenwidth=window.innerWidth
  //   if(this.user_type == "Corporate Customer"){
  //      this.menu="corporate-customer"
  //   }else if(this.user_type == "SAAS"){
  //     this.menu="saas"
  //  }
  
        this.httpClient.get("assets/menu-json/" +"menu"+ ".json").subscribe((data: any) => {
        this.navItems = data;
        this.onToggleSidenav.emit({collapsed:this.collapsed,screenwidth:this.screenwidth})
      })
    
  }



  
   @HostListener('window:ressize',['$event'])
   onResize(event:any){
     this.screenwidth= window.innerWidth;
     if(this.screenwidth<=768){
      this.collapsed=false
      this.onToggleSidenav.emit({collapsed:this.collapsed,screenwidth:this.screenwidth})
     }
   }

   togglecollapse(){
    this.collapsed=!this.collapsed
    this.onToggleSidenav.emit({collapsed:this.collapsed,screenwidth:this.screenwidth})
  }

  closesidenv(){
    this.collapsed=false
    this.onToggleSidenav.emit({collapsed:this.collapsed,screenwidth:this.screenwidth})
  }




logout(){
  sessionStorage.clear()
  sessionStorage.clear()
  this.router.navigate(["/login"]);

}

















}
