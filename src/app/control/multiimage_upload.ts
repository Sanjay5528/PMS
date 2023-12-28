import { DatePipe } from '@angular/common';
import { Component, OnInit, AfterViewInit, ChangeDetectorRef, TemplateRef, ViewChild } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { DataService } from '../services/data.service';
import { environment } from '../../environments/environment';
import { DialogService } from '../services/dialog.service';
import { MatDialog } from '@angular/material/dialog';


@Component({
    selector: 'formly-imageupload',
    template: `
    <p style="font-style: italic;display: contents;font-weight: bold;">{{to['label']}}</p>
    <div *ngIf="UploadShow">
            <button mat-raised-button  style="color: white; background-color: grey; text-align: center; margin: 20px;" 
        (click)="fileInput.click();">Select File</button>
<button style="height: 40px; width: 90px; border-radius: 10%; color: gray;" button color="gray" 
        (click)="uploadFiles()" [disabled]="dispableTrue">
  <span ></span> Upload
</button>
<input style="display: none" #attachments type="file" id="pic" accept=".jpg, .png" 
       (change)="onFileSelection($event)" #fileInput multiple="true">
<div style="display:flex; flex-direction: row;">
  <div style="flex: 1 0 auto; width: 100px; border: 1px solid #dddd;" 
       *ngFor="let image of imageList; let index = index">
    <span>
      <img [src]="image" alt="Image">
      <mat-icon (click)="removeSelectedFile(index)">delete</mat-icon>
    </span>
  </div>
</div>
    </div>
       

<div style="display:flex; flex-direction: row;" *ngIf="showUploadedImages">
  <div *ngFor="let data of imageFile" style="margin: 2px; display:flex">
    <span style="display:inline-block;">
    <img (click)="carsoasls()" [src]="docBasePath + data.storage_name" width="100px" height="100px" [alt]='data.file_name'></span>
  </div>
</div>

<ng-template #editViewPopup class="example-sidenav" mode="over" style="height: auto;width: auto;" let-data >
  <div style="text-align-last: end">
    <mat-icon [matDialogClose]="true">close</mat-icon>
  </div>
  <div class="page">
    <div class="page-content">
      <app-carsoal [data]="imageFile"></app-carsoal>
    </div>
  </div>
</ng-template>

`,
})
export class FormlyMultiImageUpload extends FieldType<any>   {
    image: any[]=[];
    selectedAppModel: any;
    imageList: any[]=[];
    imageFile:any[]=[]
    docBasePath: string=environment?.ImageBaseUrl
    refId:any
    res:any[]=[]
    UploadShow: boolean=true
dispableTrue:boolean=false
showUploadedImages:boolean=false
    carsoasl: boolean= false;
    @ViewChild("editViewPopup", { static: true })
    editViewPopup!: TemplateRef<any>;
    constructor(
        private dataservice: DataService, private cf: ChangeDetectorRef,
        private matdiolog: MatDialog,
        private dialogService: DialogService
    ) {
        super();
    }
    closeModal(){
      this.matdiolog.afterAllClosed
    }
    carsoasls(){
      this.matdiolog.open(this.editViewPopup);
    }
    ngOnInit(): void {
      debugger
      if(this.field.props?.carsoasl == true ){

        this.carsoasl=true
        this.imageFile=this.model[this.field.key]
        this.UploadShow=false
    this.showUploadedImages=true
      }
       if(this.field.props.disabled==true){
        this.imageFile=this.model[this.field.key]
        this.UploadShow=false
    this.showUploadedImages=true
       }
       if(this.model.isEdit==true){
        this.showUploadedImages=true

       }
    }
  uploadFiles() {
    
    if(!this.image){
      return this.dialogService.openSnackBar("Select the File First","OK")
    }

     let ref=this?.field?.props?.['refId']
     this.refId=this.model[ref]
     if(this.field?.['bind_key']){
        if(this.model[this.field?.['bind_key']]==undefined){
            return this.dialogService.openSnackBar(`${this.field.bind_key.toUpperCase().replace('_', ' ')} Is Missing`,"OK")
        }
      }
      this.dispableTrue=true

      var formData = new FormData();
      for (const file of this.image) {
          formData.append("file", file);
          if(this.field?.['bind_key']){
            formData.append(ref,this.model[this.field.bind_key]);
          }
      }

      this.dataservice.imageupload(this.field.role,this.model[this.field.bind_key],formData).subscribe((res: any) => {
      if (res.data) {
        this.dispableTrue=false
        this.res.push(...res.data)
        this.formControl.setValue(this.res)
        this.dialogService.openSnackBar("File Uploaded successfully", "OK")
      }
      })
  }

//* UPLOADED IMAGE and  IMAGE resize
  onFileSelection(event: any) {
    for (const file of event.target.files) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = 120; // desired width
            canvas.height =100; // desired height
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const resizedImage = canvas.toDataURL('image/jpeg');
            // const url = (<FileReader>event.target).result as string;

            this.imageList.push(resizedImage);
            this.image.push(file);
             this.cf.detectChanges();

          } else {
            console.error('Failed to get canvas context');
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
 
  
  removeSelectedFile(index: any) {
    this.imageList.splice(index, 1);
    this.image.splice(index, 1);

  }

}