import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppFooterComponent } from './app-footer/app-footer.component';
import { AppHeaderComponent } from './app-header/app-header.component';
import { DefaultLayoutComponent } from './default-layout/default-layout.component';
import { MenuItemComponent } from './menu-item/menu-item.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { HttpClientModule } from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatExpansionModule } from '@angular/material/expansion';
import { LoginLayoutComponent } from './login-layout/login-layout.component';
import { MatSelectModule } from '@angular/material/select';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { NgSelectModule } from '@ng-select/ng-select';
import { SideNavbarComponent } from './side-navbar/side-navbar.component';
import { MatSlideToggleModule, _MatSlideToggleRequiredValidatorModule } from '@angular/material/slide-toggle';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    AppFooterComponent,
    AppHeaderComponent,
    DefaultLayoutComponent,
    LoginLayoutComponent,
    MenuItemComponent,
    SideNavbarComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    CommonModule,
    MatMenuModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    MatAutocompleteModule,
    NgSelectModule,
    HttpClientModule,
    MatInputModule,
    MatSlideToggleModule,
    _MatSlideToggleRequiredValidatorModule,
    MatSidenavModule,
    MatListModule,
    FlexLayoutModule,
    MatExpansionModule,
    MatSelectModule
  ],


  exports: [
    AppHeaderComponent,
    AppFooterComponent,
    DefaultLayoutComponent,
    LoginLayoutComponent,
    MenuItemComponent,
    MatIconModule,
  ]
})
export class AppLayoutModule { }
