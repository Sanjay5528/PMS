
import { Component, EventEmitter, Input, Output, SimpleChange, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'src/app/services/dialog.service';
import { FormService } from 'src/app/services/form.service';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.css']
})
export class DynamicFormComponent {
  form = new FormGroup({})
  pageHeading: any
  formAction = 'Add'
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formService: FormService,
    
    private dialogService: DialogService
  ) {
   
  }

  ngOnInit() {
    
    this.paramsSubscription = this.route.params.subscribe(params => {
      if (params['form']) {
        this.formName = params['form'];
      }
      if (params['id'] != undefined) {
        this.id = params['id']
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

  frmSubmit(event:any) {

    if (!this.form.valid) {
      let array = "";  
      // function collectInvalidLabels(controls: any) {
      //   for (const key in controls) {

      //     if (controls.hasOwnProperty(key)) {
      //       const data = controls[key].status;
      //       if (data === "INVALID") {
      //         array += controls[key]._fields[0].props.label + ",";
      //       }
      //     }
      //   }
      // }
      // collectInvalidLabels(this.form.controls);
      function collectInvalidLabels(controls: any, invalidLabels: string = ''): string {
        for (const key in controls) {
            if (controls.hasOwnProperty(key)) {
                const control = controls[key];
        
                if (control instanceof FormGroup) {
                    invalidLabels += collectInvalidLabels(control.controls);
                } else if (control instanceof FormControl && control.status === 'INVALID') {
                    // Access the label property assuming it exists in the control
                    invalidLabels +=controls[key]._fields[0].props.label + ",";
                }else if(control instanceof FormArray && control.status === 'INVALID'){
                  invalidLabels +=controls[key]._fields[0].props.label + ",";
                }
            }
        }
        return invalidLabels;
    }
    
    // Assuming this.mainForm is your main FormGroup
    // const invalidLabelsString = collectInvalidLabels(this.mainForm.controls);
    // console.log('Invalid Labels:', invalidLabelsString);
    
    // Assuming this.mainForm is your main FormGroup
    const invalidLabels:any = collectInvalidLabels(this.form.controls);
    // console.log('Invalid Labels:', invalidLabels.join(', '));
    
      // const modifiedString = array.slice(0, -1);
  
      this.dialogService.openSnackBar("Error in " + invalidLabels, "OK");
     this.form.markAllAsTouched();
      this.butonflag=false
      return ;
    }
// if(this.form.valid){

        this.formService.saveFormData(this).then((result: any) => {
          console.log(result);
          if (result != undefined) {
            this.goBack(result)
            
        this.butonflag=true
          }
        })
    // }
    
  }

  ngOnDestroy() {
    console.log("Component will be destroyed");
    this.paramsSubscription.unsubscribe();
  }

  initLoad() {
    this.formService.LoadInitData(this)
  }
  goBack(data?: any) {
    if (this.mode == 'page') {
     this.router.navigate([`${this.config.onCancelRoute}`]);
    } else if (this.mode == 'popup') {
      if (data) {
        this.onClose.emit({ action: this.formAction, data: this.form.value })
        
      } else {
        this.onClose.emit({ action: this.formAction, data: this.form.value })
        
      }
      return
    }
  }

  resetBtn(data?: any) {
    this.model = {}
    this.formAction = this.model.id ? 'Edit' : 'Add'
    this.butText = this.model.id ? 'Update' : 'Save';

  }

  cancel() {
    console.log(this.config);
    
    if(this.config.editMode=="page"){
      this.router.navigate([`${this.config.onCancelRoute}`]);
    }else
    this.dialogService.closeModal()
    // this.dialogService.CloseALL()

  }


}
