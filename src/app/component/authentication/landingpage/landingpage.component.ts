import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { DialogService } from 'src/app/services/dialog.service';
import { environment } from 'src/environments/environment';
import { NavItem } from '../../app-layout/nav-items';

@Component({
  selector: 'app-landingpage',
  templateUrl: './landingpage.component.html',
  styleUrls: ['./landingpage.component.css']
})
export class LandingpageComponent {
  @ViewChild('childMenu') public childMenu: any;
  navItems!: NavItem[]
  logo = environment.logoUrl
  user_role: any
  menu_type: any
  user_name: any
  showAccountOptions: boolean = false;
  showAccountOption: boolean = false;
  showAccountOptionSaas:boolean=false;
  constructor(
    private router: Router,
    private httpClient: HttpClient,
    private dataservice:DataService,
    public dialogService: DialogService,
    public authService: AuthService
  ) { }
  

  ngOnInit() { 
      this.httpClient.get("assets/menu-json/" +"menu" + ".json").subscribe((data: any) => {
        this.navItems = data;
      })
    
  
  }
  navigate(item:any){
    this.router.navigate([item.route]);

  }
  login(){
    this.router.navigate(['/login']);
  }
  register(){
    this.router.navigate(['/register']);
  }
  toggleAccountOptions(event: Event): void {
    event.stopPropagation();
    this.showAccountOptions = !this.showAccountOptions;
  }
  toggleAccountOption(event: Event): void {
    event.stopPropagation();
    this.showAccountOption = !this.showAccountOption;
  }
  toggleAccountOptionSaas(event: Event): void {
    event.stopPropagation();
    this.showAccountOptionSaas = !this.showAccountOptionSaas;
  }
  onMenuClosed(): void {
    this.showAccountOptions = false;
  }

}
