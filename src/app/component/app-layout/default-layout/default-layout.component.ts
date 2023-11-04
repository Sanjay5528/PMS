import { Component, Input } from '@angular/core';
interface SideNavToggle{
  screenwidth:number
  collapsed:boolean
}
@Component({
  selector: 'app-default-layout',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.css']
})
export class DefaultLayoutComponent {
  @Input() collapsed=false
  @Input() screenwidth=0
 
   
    isSideNavCollapsed = false
 
   onToggleSidenav(data:SideNavToggle){
     
     this.screenwidth=data.screenwidth
     this.collapsed=data.collapsed
 
     let styleclass=""
     if(this.collapsed && this.screenwidth > 768){
 styleclass='body-trimmed'
     } else if(this.collapsed && this.screenwidth <=768 && this.screenwidth>0){
 styleclass='body-md-screen'
     }
     return styleclass
   }
 
 
   class(){
    
     let styleclass=""
     if(this.collapsed && this.screenwidth > 768){
 styleclass='body-trimmed'
     } else if(this.collapsed && this.screenwidth <=768 && this.screenwidth>0){
 styleclass='body-md-screen'
     }
     return styleclass
   }
}
