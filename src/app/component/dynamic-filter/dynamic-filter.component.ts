
import { DataService } from 'src/app/services/data.service';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';
import * as moment from 'moment';

import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-dynamic-filter',
  templateUrl: './dynamic-filter.component.html',
  styleUrls: ['./dynamic-filter.component.scss']
})
export class DynamicFilterComponent {
  dateBind: boolean = true
  projectData:any
  constructor(
    private dataService: DataService,

  ) { }
  @Input('filterOptions') filterOptions: any;
  @Input('listData') listData: any
  @Input('config') config: any
  @Input('showdefaultFilter') showdefaultFilter: any
  @Output('onClick') onClick = new EventEmitter<any>();
  @Output('filterValue') filterValue = new EventEmitter<any>();
  @Output('pdf') pdf = new EventEmitter<any>();

  ngOnInit(): void {
    




    /*
    Sample filter control option

    "filterOptions": [
      {
        "columnName": "pc_code",   --> Database column name
        "label":"Pickup Center",   --> Control Label
        "dataSource":"collection", --> Dropdown control options take from DB
        "collectionName":"pickup_center",
        "multiSelection": false,
        "labelProp":"name",
        "valueProp":"_id"
      },
      {
        "columnName": "customer_type",
        "label":"Customer type",
        "dataSource":"list",
        "multiSelection": false,
        "labelProp":"label",
        "valueProp":"value",
        "options":[
          {"label":"Credit Customer", "value":"Cr"},
          {"label":"Cash Customer", "value":"Cash"}
        ]
      }
    ],
     */
  }


filteredOptions:any
filteredData(eneteredData:any) {
  
  // var conditions: any = []
  // this.filterOptions.forEach((opt: any) => {
  //   if (opt.selectedValue) {
  //  if (opt.type == 'autocomplete' && opt.selectedValue != "" || opt.type == 'text') {
  //       conditions.push({
  //         column: opt.columnName,
  //         operator: opt.operator,
  //         type: 'string',
  //         value: opt.selectedValue
  //       })
  //     }}})
  this.filteredOptions = this.projectData.filter((item:any) => {
    return item.project_name.toLowerCase().indexOf(eneteredData.toLowerCase()) > -1
  
  })
  

  // this.filterValue.emit(filterQuery);
}

  toggleSelectAll(event: any) {
    if (event.source.selected) {
      event.source._parent.options.map((e: any) => {
        e.select()
      });
    } else {
      event.source._parent.options.map((e: any) => {
        e.deselect()
      });
    }
  }

  applyFilter(event: any) {
    const val = event.target.value.toLowerCase();
    this.filterValue.emit(val);
  }

  triggerFilter() {
    
    //build the condition for all filters
    var filterQuery:any  = undefined
    var conditions: any = []
    //get filter condition from the selected/typed values
    this.filterOptions.forEach((opt: any) => {
      if (opt.selectedValue) {
        if (opt.type == 'select' && opt.selectedValue != "" || opt.type == "text") {
          conditions.push({
            column: opt.columnName,
            operator: opt.operator,
            type: 'string',
            value: opt.selectedValue
          })
        }  else if (opt.type == 'autocomplete' && opt.selectedValue != "" || opt.type == 'text') {
          
          // conditions = [
          //   {
              // clause: "AND",
                conditions.push({
                  column: opt.columnName,
                  operator: opt.operator,
                  type: 'string',
                  value: opt.selectedValue
                // }]
            })
          // ]
        }
        else if (opt.type == 'datepicker') {
          conditions.push({
            column: opt.columnName,
            operator: opt.operator,
            type: 'date',
            value: opt.selectedValue.format(opt.filterFormat)
          })
        } else if (opt.type == "data" && opt.selectedValue != "") {        //text filter type
          conditions.push({
            column: opt.columnName,
            operator: opt.operator,
            type: 'string',
            value: opt.selectedValue.charAt(0).toUpperCase() + opt.selectedValue.slice(1).trim()
          })
        } else { }
      }
      // Add fixed (always) filter condition
    this.dataService.makeFilterConditions(this.config.fixedFilter, conditions)
    if (conditions.length > 0) {
      filterQuery = [{
        clause: "AND",
        conditions: conditions
      }]
    }
    this.filterValue.emit(filterQuery)
    })
    // Add fixed (always) filter condition
    // this.dataService.makeFilterConditions(this.config.fixedFilter, conditions)
    // if (conditions.length > 0) {
    //   filterQuery = [{
    //     clause: "AND",
    //     conditions: conditions
    //   }]
    // }
    // this.onClick.emit(filterQuery)
  }

  generatePdf() {
    this.pdf.emit(true)
  }

}
