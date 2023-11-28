import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'formly-field-logo',
  template:`
  <style>
    
    img {
      height: 100%;
      width: 100%;
      border-radius: 50%;
    }
    
    .hoverable {
      position: relative;
      display: block;
      cursor: pointer;
      height: 150px;
      width: 150px;
      border: 1px solid rgba(255, 255, 255, 0.5);
      border-radius: 50%;
    }
    
    .hoverable .hover-text {
      position: absolute;
      display: none;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 2;
      font-size: 10px;
    }
    
    .hoverable .background {
      position: absolute;
      display: none;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      background-color: rgba(255, 255, 255, 0.5);
      pointer-events: none;
      border-radius: 50%;
      z-index: 1;
    }
    
    .hoverable:hover .hover-text {
      display: block;
    }
    
    .hoverable:hover .background {
      display: block;
    }
    
    #fileInput{
      display: none;
    }
    
    label {
      margin-bottom: 30px;
    } 
    </style>
    <div class="text-center mb-5">
        
        <div fxLayoutAlign="center center"style="justify-content: space-between;">
                <label class="hoverable" for="fileInput">
                  <img src="{{url}}">
                  <div class="hover-text">{{label}}</div>
                  <div class="background"></div>
                  <input id="fileInput" type='file' (change)="handleFileUpload()" (change)="onSelectFile($event)">
                </label>

              </div>
            </div>

    <input type="hidden" 
          [formControl]="thisFormControl"
          [formlyAttributes]="field"
          />
    
    
  `
})
export class LogoComponent extends FieldType implements OnInit {
  opt: any;
  url: any;
  label: any;

  
  constructor(private http: HttpClient,private cf: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
    this.opt = this.field.templateOptions || {};
    this.label = this.opt.label || 'Upload';
  this.url=this.model[this.opt.key]

  }

  public get thisFormControl(): FormControl {
    return this.formControl as FormControl;
  }

  handleFileUpload(): void {
    const fileInput: any = document.getElementById('fileInput');
    const file = fileInput.files[0];

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'profile_pic');

    console.log(formData);

   console.log(this.form);
   
  }

  onSelectFile(event: any): void {
    if (event.target.files && event.target.files[0]) {
        var reader = new FileReader();
        let sourcefile:any=event.target.files[0]
        reader.readAsDataURL(sourcefile);
        // this.url=sourcefile;
        this.cf.detectChanges();
        
    //   reader.readAsDataURL();
    reader.onload = (event) => {
        const url = (<FileReader>event.target).result as string;
        this.url=url
        this.cf.detectChanges();
      };
    //   reader.onload = (event: any) => {
    //     this.cf.detectChanges();

    //     this.url = event.target.result;
    //   };
    }
  }
}
// ! SAmple
// 	{
//   "type": "logo",
//   "key": "Org_logo",
//   "className": "flex-6",
//   "templateOptions": {
//     "label": "Organization Logo"
//   }
// },