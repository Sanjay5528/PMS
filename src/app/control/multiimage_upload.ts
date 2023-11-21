import { DatePipe } from '@angular/common';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { DataService } from '../services/data.service';
import { environment } from '../../environments/environment';
import { DialogService } from '../services/dialog.service';


@Component({
    selector: 'formly-imageupload',
    template: `
 <button mat-raised-button style="color: white;background-color: grey;text-align: center; 
          margin:20px;" (click)="fileInput.click()">Select File</button>
          <span>File Size Maximum 2Mb</span>
            <!-- UPLOADED FILE-->
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
          
            


            <div style="display:flex;flex-direction: row;" *ngIf="files.length>0">
              <span>Uploaded Images</span>
              <div *ngFor="let data of imageFile" style="margin: 2px; display:flex">
                <span style="display:inline-block;"><img src={{docBasePath}}{{data.path}} alt="Image"></span>
              </div>
            </div>
           
`,
})
export class FormlyMultiImageUpload extends FieldType  {
    image: any[]=[];
    selectedAppModel: any;
    imageList: any[]=[];
    files:any[]=[]
    imageFile:any[]=[]
    docBasePath: string=environment.ImageBaseUrl
//     fileData: any[] = [];
//     imageList: any[] = [];
//     imageLists: any[] = [];
//     data: any
//     opt: any;
//     files: any[] = [];
//     docBasePath = environment.ImageBaseUrl


    constructor(private datePipe: DatePipe,
        private dataservice: DataService,
        private dialogService: DialogService
    ) {
        super();
    }

//     ngOnInit(): void {
//         this.opt = this.field.props || {};
//         this.opt.fileType
//         // this.getImages()
//     }
// //* UPLOADED IMAGE and  IMAGE resize
// onFileSelection(event: any) {
//     debugger
//     for (const file of event.target.files) {
//       const reader = new FileReader();
//       reader.onload = () => {
//         const img = new Image();
//         img.onload = () => {
//           const canvas = document.createElement('canvas');
//           const ctx = canvas.getContext('2d');
//           if (ctx) {
//             canvas.width = 250; // desired width
//             canvas.height = 250; // desired height
//             ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
//             const resizedImage = canvas.toDataURL('image/jpeg'); // you can change the image format if needed
//             this.imageLists.push(resizedImage);
//             this.imageList.push(file);
//           } else {
//             console.error('Failed to get canvas context');
//           }
//         };
//         img.src = reader.result as string;
//       };
//       reader.readAsDataURL(file);
//     }
//   }


//     uploadFiles() {
//         debugger
//         var formData = new FormData();
//         for (const file of this.imageList) {
//             formData.append("file", file);
//         }
//         // this.field.model["model_no"]
//         // this.dataservice.postData(this.opt.endPoint + "/" + "AC001", formData).subscribe((res: any) => {
//         //     if (res.success == 1) {
//         //         // this.files = this.files.concat(res.data)
//         //         // this.files = [...this.files]
//         //         this.dialogService.openSnackBar("Image has been uploaded successfully", "OK")

//         //     } else {
//         //         alert('Error')
//         //     }
//         // })

//     }

  
//     // getImages() {
//     //     // this.dataservice.getDataById(this.opt.endPoint, this.field.model["id"]).subscribe((res: any) => {
//     //     //     this.files = [...res?.data]
//     //     // });
//     //     debugger
//     //     this.dataservice.getDataById(this.opt.endPoint, "AC001").subscribe((res: any) => {
//     //       this.files = [...res?.data]
//     //   });
//     // }

//     removeSelectedFile(index: any) {
//       this.imageList.splice(index, 0);
//     }

//     formatFileSize(bytes: number, decimalPoint: number) {
//         if (bytes == 0) return '0 Bytes';
//         var k = 1000,
//             dm = decimalPoint || 2,
//             sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
//             i = Math.floor(Math.log(bytes) / Math.log(k));
//         return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
//     }
uploadFiles() {
    debugger
    var formData = new FormData();



    for (const file of this.image) {
      formData.append("file", file);

    }

    console.log(this.selectedAppModel.app_code);

    // this.dataservice.postData("application/image/" + this.selectedAppModel.app_code, formData).subscribe((res: any) => {
    //   if (res.success == 1) {
    //     // this.files = this.files.concat(res.data)
    //     // this.files = [...this.files]
    //     this.dialogService.openSnackBar("Image has been uploaded successfully", "OK")

    //   } else {
    //     alert('Error')
    //   }
    // })


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
            canvas.width = 250; // desired width
            canvas.height = 250; // desired height
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const resizedImage = canvas.toDataURL('image/jpeg'); // you can change the image format if needed
            this.imageList.push(resizedImage);
            this.image.push(file);
            console.log(this);
            
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
  }

}