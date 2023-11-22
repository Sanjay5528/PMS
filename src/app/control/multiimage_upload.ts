import { DatePipe } from '@angular/common';
import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { DataService } from '../services/data.service';
import { environment } from '../../environments/environment';
import { DialogService } from '../services/dialog.service';


@Component({
    selector: 'formly-imageupload',
    template: `
 <!-- <button mat-raised-button style="color: white;background-color: grey;text-align: center; 
          margin:20px;" (click)="fileInput.click()">Select File</button>
          <span>File Size Maximum 2Mb</span>
            <button style="height: 40px;width: 90px;border-radius: 10%;color:gray ;" button color="gray"
              (click)="uploadFiles()" [disabled]="!imageList.length">
              <span class="glyphicon glyphicon-upload"></span> Upload
            </button>
            <input style="display: none" #attachments type="file" id="pic" accept=".jpg, .png" (change)="onFileSelection($event)"
              #fileInput multiple="true">
            <div style="display:flex;flex-direction: row;">
              <div style="flex:1 0 auto;width:100px;border: 1px solid #dddd;"
                *ngFor="let image of imageList;let index = index">
                <span>
                  <img [src]="image" alt="Image">
                  <mat-icon (click)="removeSelectedFile(index)">delete</mat-icon>
                </span>

              </div>

            </div>
          
            


            <div style="display:flex;flex-direction: row;" *ngIf="imageFile.length>0">
              <span>Uploaded Images</span>
              <div *ngFor="let data of imageFile" style="margin: 2px; display:flex">
                <span style="display:inline-block;"><img src={{docBasePath}}{{data.storage_name}} alt="Image"></span>
              </div>
            </div> -->
            <p style="font-style: italic;    display: contents">{{to['label']}}</p>
            <button mat-raised-button style="color: white; background-color: grey; text-align: center; margin: 20px;" 
        (click)="fileInput.click()">Select File</button>
<!-- <span>File Size Maximums 2Mb</span> -->
<button style="height: 40px; width: 90px; border-radius: 10%; color: gray;" button color="gray" 
        (click)="uploadFiles()" [disabled]="!imageList.length">
  <span class="glyphicon glyphicon-upload"></span> Upload
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

<div style="display:flex; flex-direction: row;" *ngIf="showUploadedImages">
  <span>Uploaded Images</span>
  <div *ngFor="let data of imageFile" style="margin: 2px; display:flex">
    <span style="display:inline-block;"><img [src]="docBasePath + data.storage_name" alt="Image"></span>
  </div>
</div>

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

    showUploadedImages:boolean=false
    constructor(
        private dataservice: DataService, private cf: ChangeDetectorRef,

        private dialogService: DialogService
    ) {
        super();
    }

    ngOnInit(): void {
       if(this.model.isEdit==true){
        this.imageFile=this.model[this.field.key]
    
    this.showUploadedImages=true
       }
    }

  uploadFiles() {
    debugger
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

      var formData = new FormData();
      for (const file of this.image) {
          formData.append("file", file);
          if(this.field?.['bind_key']){
            formData.append(ref,this.model[this.field.bind_key]);
          }
      }

      this.dataservice.imageupload(this.field.role,this.model[this.field.bind_key],formData).subscribe((res: any) => {
      if (res.data) {
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