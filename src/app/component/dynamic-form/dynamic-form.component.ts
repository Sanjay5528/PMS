import { Component, EventEmitter, Input, Output, SimpleChange, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'src/app/services/dialog.service';
import { FormService } from 'src/app/services/form.service';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.css']
})
export class DynamicFormComponent {
  form = new FormGroup({});
  pageHeading: any
  formAction = 'Add'
  butText = 'Save'
  id: any
  moduleid: any
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formService: FormService,

    private dialogService: DialogService
  ) {

  }

  ngOnInit() {
    this.paramsSubscription = this.route.params.subscribe(params => {
      debugger
      console.log(params);
      
      if (params['form']) {
        this.formName = params['form'];

      }
      if (params['id'] != undefined) {
        this.id = params['id']
      }
      if (params['moduleid'] != undefined) {
        this.moduleid = params['moduleid']
      }
      this.initLoad()

    })

  }

  ngOnChanges(changes: SimpleChanges) {
    const currentItem: SimpleChange = changes['item'];
    if (this.formName && this.model) {
      this.id = this.model['_id']
      this.initLoad()
    } 
   
  }

  frmSubmit(data: any) {
    this.formService.saveFormData(this).then((result: any) => {
      result
      if (result != undefined) {
        this.goBack(result)
      }
    })
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
    event.preventDefault(); // Prevent form submission
    this.frmSubmit(this);
    }
    }

  ngOnDestroy() {
    console.log("Component will be destroyed");
    this.paramsSubscription.unsubscribe();
  }

  initLoad() {
    this.formService.LoadInitData(this)
  }

  goBack(data?: any) {
    debugger
    if (this.config.editMode == 'page') {
      this.router.navigate([`${this.config.onCancelRoute}`]);
    } else if (this.config.editMode == 'popup') {
      // this.router.navigate([`${this.config.onCancelRoute}`]);
      if (data) {
        this.onClose.emit(data)
      } else {
        this.onClose.emit({ action: this.formAction, data: this.model })
       }
      // return 
    }
  }

  resetBtn(data?: any) {
    debugger
    this.model = {}
    this.formAction = this.model.id ? 'Edit' : 'Add'
    this.butText = this.model.id ? 'Update' : 'Save';

  }

  cancel() {
    debugger
    if (this.config.editMode == "page") {
      this.router.navigate([`${this.config.onCancelRoute}`]);
    } else
      this.dialogService.closeModal()
  }


}
