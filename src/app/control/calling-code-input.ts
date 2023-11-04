import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {  FormControl } from '@angular/forms';
import { FieldType } from '@ngx-formly/core';
import { DataService } from '../services/data.service';


@Component({
  selector: 'calling-code-input',
  template: `
  <style>

  *{
    color:black;
  }
  
  .mat-mdc-menu-panel.mat-mdc-menu-panel {
    max-height: 150px !important;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    position: absolute;
    display:none
}
  </style>
  <div class="form-width">
  <mat-form-field appearance="fill">
  <mat-label>{{field.props!['label']}}</mat-label>
  <ngx-mat-intl-tel-input
  [formControl]="FormControl"     
  [formlyAttributes]="field"
  [preferredCountries]="[countrycode]"
  [enablePlaceholder]="true"
  [enableSearch]="field.props?.searchbar"  
  placeholder="Enter your phone number"
  >
  </ngx-mat-intl-tel-input>
</mat-form-field> 
</div>

     
     
  
  `,
  encapsulation: ViewEncapsulation.None,
 

})
export class CallingcodeInput extends FieldType<any> implements OnInit {
  countrycode:any
  currentField:any
  opt:any
  constructor( public dataService: DataService){
    super();
  let country_code  =  sessionStorage.getItem("countrycode")
    this.countrycode=country_code?.toLowerCase()
  }
 
    ngOnInit(): void {
      this.opt = this.field.props || {};
      this.currentField = this.field

      if(this.field?.parentKey!= "") {
        (this.field.hooks as any).afterViewInit = (f:any) => {
          let parentkey=this.field?.parentKey
          console.log(parentkey)
            const parentControl = this.form.get(parentkey)//this.opt.parent_key);
            parentControl?.valueChanges.subscribe((val:any) =>{
              
              let collection =this.field.ParentCollectionName
              // this.dataService.getparentdataById(collection,val).subscribe((res: any) => {
              //   if(res.data!=null){
              //     let data=res.data[0]
              //    this.countrycode=data['country_code'].toLowerCase()
              //    this.countrycode='in'
              //    console.log(this.countrycode)
              //   }
              // })
             })
            }
          } 
    }

	// phoneForm = new FormGroup({
	// 	phone: new FormControl(undefined, [Validators.required])
	// });

  public get FormControl() {
    return this.formControl as FormControl; 
  }

  onChange(event:any){
    console.log(event);
    this.formControl.setValue(event.internationalNumber)
  }

}