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



@NgModule({
  declarations: [
    AppFooterComponent,
    AppHeaderComponent,
    DefaultLayoutComponent,
    LoginLayoutComponent,
    MenuItemComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule,
    BrowserAnimationsModule,
    CommonModule,
    MatMenuModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    HttpClientModule,
    MatInputModule,
    MatSidenavModule,
    MatListModule,
    FlexLayoutModule,
    MatExpansionModule,
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
