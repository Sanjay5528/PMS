import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, EventEmitter, HostListener, NgZone, OnInit, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { DialogService } from 'src/app/services/dialog.service';
import { NavItem } from '../nav-items';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { validate } from 'uuid';
import { HelperService } from 'src/app/services/helper.service';
import { environment } from 'src/environments/environment';
import { Location } from '@angular/common';
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
  subsectionExpanded: { [key: string]: boolean } = {};
  logo_image: any; 
  project_Data:any=[] 
  constructor(
    private router: Router,
    private route: ActivatedRoute,
     private _location: Location,
    private dataservice: DataService,
    public dialogService: DialogService,
    private zone: NgZone,

    private helperServices:HelperService,
   public dataservices:DataService,
  //  private cfr :ChangeDetectorRef
  ) {
  }


  toggleSubsection(section: any): void {
    for (let subsectionName in this.subsectionExpanded) { 
      if (subsectionName !== section.displayName) { 
        this.subsectionExpanded[subsectionName] = false;
      }
    } 
    if (section.children) { 
      this.subsectionExpanded[section.displayName] = !this.subsectionExpanded[section.displayName];
    }
  }

  screenId:any
  selectProject:any

  ngOnInit(): void {
    // this.dataservice.getDataByFilter('project',{}).subscribe((res:any)=>{
    //   console.log(res);
    //   this.project_Data=res.data[0].response
    // })

    this.screenId ='ProjectMenu'
    this.screenwidth = window.innerWidth
    this.dataservice.loadScreenConfigJson(this.screenId).subscribe((config:any)=>{

      this.navItems = config
      // this.selectProject=sessionStorage.getItem("selectedProjectID")
      // console.log(this.selectProject);
      
      this.onToggleSidenav.emit({ collapsed: this.collapsed, screenwidth: this.screenwidth })
      // this.logo_image = "../../../../assets/images/profilepics.jpeg";
      // this.logo_image = environment.ImageBaseUrl+this.selectProject?.logo;
    }); 
    this.helperServices.getProjectObservable().subscribe((res:any)=>{
      
      this.logo_image = "../../../../assets/images/profilepics.jpeg";

      if(res.logo != undefined &&res.logo != null){
      this.logo_image = environment.ImageBaseUrl+res.logo
      }
      this.selectProject=res
    
      // this.route.params.subscribe((response:any)=>{
      
    })
    
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



 close(){
  this.helperServices.getProjectmenu(false)
 }

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
console.log(data);

  let route=data.first+this.selectProject._id+data.last
  console.log(route);
  // this._location.replaceState(route)
  // this.route.params.subscribe(params=>{
  //   console.warn(params);
  // })
  // let routes:any=this.router
  // console.warn("this.router",routes.currentUrlTree.root);
  // console.warn("this.route",this.route);
  
  // this.router.events.subscribe((event) => console.warn(event));

  this.router.navigate([route])  
}  

}
