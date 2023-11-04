import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { Chart, registerables } from 'chart.js';

import { HttpClient } from '@angular/common/http';
import { GridReadyEvent } from 'ag-grid-community';
import { combineLatest } from 'rxjs';

Chart.register(...registerables);
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  
  cardData: any;
  listData: any = [];
  gridApi: any;
  columnDefs = [
    { headerName: 'Date', field: 'date' },
    { headerName: 'NetBanking', field: 'netBankingCount' },
    { headerName: 'DebitCard', field: 'debitCount' },
    { headerName: 'UPI Mandates', field: 'UPICount' },
    { headerName: 'Aadhar', field: 'aadharCount' },
  ];

  @ViewChild('donutChart', { static: true }) chartCanvas!: ElementRef;
  valuesArray: any;
  // DataService: any;

  constructor(
    private DataService: DataService,
    private httpclient: HttpClient,
    private cdref: ChangeDetectorRef,


  ) { }

  ngOnInit(): void {
    //sessionStorage.setItem("employeeid", "KT120");
    let data: any = localStorage.getItem('auth');
    let name = JSON.parse(data).profile.employeeid
    
    
  }


  ngAfterViewInit() {

  }
 

  // this.gridApi.sizeColumnsToFit();
}
