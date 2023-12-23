import { HttpClient } from "@angular/common/http";
import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { FieldType } from "@ngx-formly/core";
import { DialogService } from "../services/dialog.service";
import { DataService } from "../services/data.service";

@Component({
  selector: "formly-field-logo",
  template: `
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
        height: 250px;
        width: 250px;
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

      #fileInput {
        display: none;
      }

      label {
        margin-bottom: 30px;
      }
    </style>
    <div class="text-center mb-5">
      <div
        fxLayoutAlign="center center"
        style="justify-content: space-between;"
      >
        <label class="hoverable" for="fileInput">
          <img src="{{ url }}" />
          <div class="hover-text">{{ label }}</div>
          <div class="background"></div>
          <input
            id="fileInput"
            type="file"
            (change)="handleFileUpload($event)"
            (change)="onSelectFile($event)"
          />
        </label>
      </div>
    </div>

    <input
      type="hidden"
      [formControl]="thisFormControl"
      [formlyAttributes]="field"
    />
  `,
})
export class LogoComponent extends FieldType<any> implements OnInit {
  opt: any;
  url: any;
  label: any;

  constructor(
    private dataService: DataService,
    private cf: ChangeDetectorRef,
    private dialogService: DialogService
  ) {
    super();
  }

  ngOnInit(): void {
    this.opt = this.field.templateOptions || {};
    this.label = this.opt.label || "Upload";
    this.url = "../../assets/image/logo1.png";
    if (this.model.isEdit == true) {
      this.url = this.model[this.opt.key];
    }
  }

  public get thisFormControl(): FormControl {
    return this.formControl as FormControl;
  }
  refId: any;

  handleFileUpload(event: any): void {
    const fileInput: any = document.getElementById("fileInput");
    const file = fileInput.files[0];

    if (!event) {
      return this.dialogService.openSnackBar("Select the File First", "OK");
    }
    let ref = this.field.props.refId;
    this.refId = this.model[ref];
    const formData = new FormData();
    if (this.field.bind_key) {
      if (this.model[this.field.bind_key] == undefined) {
        return this.dialogService.openSnackBar(
          `${this.field.bind_key.toUpperCase().replace("_", " ")} Is Missing`,
          "OK"
        );
      }
      formData.append("file", event.target.files[0]);
      formData.append(this.field.refId, this.model[this.field.bind_key]);
    this.dataService
        .imageupload(this.field.role, this.model[this.field.bind_key], formData)
        .subscribe((res: any) => {
          if (res.data) {
            this.formControl.setValue(res.data[0]);
            this.dialogService.openSnackBar("File Uploaded successfully", "OK");
          }
        });
    }
  }

  onSelectFile(event: any): void {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      let sourcefile: any = event.target.files[0];
      reader.readAsDataURL(sourcefile);
      this.cf.detectChanges();
      reader.onload = (event) => {
        const url = (<FileReader>event.target).result as string;
        this.url = url;
        this.cf.detectChanges();
      };
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
