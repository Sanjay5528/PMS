import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSidenav } from '@angular/material/sidenav';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-eventstepper',
  templateUrl: './eventstepper.component.html',
  styleUrls: ['./eventstepper.component.css']
})
export class EventstepperComponent implements OnInit {
  formControl = new FormControl();
  form = new FormGroup({});
  filteredOptions: any[] = [];
  valueProp = "_id";
  labelProp = "name";
  formAction: string = "add";
  // collectionName:any;
  // form = new FormGroup({})
  pageHeading: any
  // formAction = 'Add'
  butText = 'Save'
  id: any
  keyField: any
  isDataError = false
  config: any = {}
  authdata: any
  options: any = {};
  fields!: FormlyFieldConfig[]
  paramsSubscription !: Subscription;
  @Input('formName') formName: any
  @Input('mode') mode: string = "page"
  @Input('model') model: any = {}
  @Output('onClose') onClose = new EventEmitter<any>();
  butonflag: boolean = false;

  // @Input('model') model: any = {}
  // butText = 'Save'
  @ViewChild("drawer") drawer!: MatSidenav;
  
  @ViewChild("modulesViewPopup", { static: true })  modulesViewPopup!: TemplateRef<any>;
  formService: any;

  // config: any;
  constructor(    public dataService: DataService,
    public dialogService: DialogService,
    public formBuilder: FormBuilder,){
    
  }
  public searchText: FormControl = new FormControl('', []);
  public search = { searchText: '' };


  clearSearch() {
    this.searchText.setValue('');
    this.search.searchText = '';
  }
  ngOnInit(): void {
    
  this.dataService.loadConfig("event").subscribe((frmConfig: any) => {
    this.formAction = "Add";
    this.butText="Save"
    this.config = frmConfig;
    // this.model_heading="Team Member - Add"
    this.fields = frmConfig.form.fields;
    this.dialogService.openDialog(this.modulesViewPopup,null, null, {});
  });


  }
  initLoad() {
    this.formService.LoadInitData(this)
  }

  selectionChange(event: any, autoCompleteInput: HTMLInputElement): void {
    // Handle selection change logic
    const selectedValue = event.option.value;
    autoCompleteInput.value = selectedValue; // Set the input value based on the selected option
    // Additional logic as needed
  }

  isLinear = false;

  isValid(field: FormlyFieldConfig): any {
    if (field.key) {
      return field.formControl?.valid;
    }
    return field.fieldGroup?.every(f => this.isValid(f));
  }

  valueCheck(label: any): void {
    if (label && label.templateOptions && label.templateOptions.label) {
      console.log("label", label.templateOptions.label);
    }
  }
  
}
