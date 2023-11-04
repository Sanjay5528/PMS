import { ChangeDetectorRef, Component, OnInit, SimpleChanges } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

import { DataService } from '../services/data.service';
import { DialogService } from '../services/dialog.service';

@Component({
    selector: 'image-input',
    template: `

  <style>
  .mat-mdc-raised-button{
    color: white;
}
  .mat-raised-button{
    color:white
  }
  
  .delete-icon {
    position: absolute;
    top: 4px;
    right: 4px;
    color: #ffffff;
    background-color: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    padding: 2px;
    cursor: pointer;
  }
  
  </style>

  <mat-label>{{field.props!['label']}}</mat-label>
  <div>
<input
   #myInput
  type="file"
  accept="image/*"
  name="myfile"
  (change)="onSelectFile($event)"
  style="margin-top: 30px;"
/>
<button style="margin-left:2px;margin-right:10px" type="button" [disabled]="show_button"   mat-button (click)="reset(myInput)">
      <span class="glyphicon glyphicon-trash"></span> Reset
    </button>

    <button
    [disabled]="this.model[this.field.props?.refId]?false:true"
    type="button"
    (click)="upload()"
    mat-raised-button
    [disabled]="show_button" 
    class="approve-button"
    class="btn btn-primary"
  >
    Upload
  </button>
</div>

<div 
style="margin-top: 40px; 
 display: flex; gap: 12px;" >
 <div>
  <img width="200" height="133"
    [src]="image"  
  /> 
 </div>
</div>  
  `,
})
export class ImageInput extends FieldType<any>  implements OnInit{
 
  public file: any;
  urls:any[]=[];
  refId:any
  image:any
  show_button:boolean=true
constructor(
  public dataservice:DataService,
  public dialogService:DialogService,
  private cf: ChangeDetectorRef
){
  super();
}


ngOnInit(): void {
  

  console.log(this.refId)
  this.image=this.model[this.field.key]
}

    onSelectFile(event:any) {
     
      this.show_button =false
        let i: number = 0;
        for (const singlefile of event.target.files) {
          this.file = singlefile
          var reader = new FileReader();
          reader.readAsDataURL(singlefile);
          this.urls.push(singlefile);
          this.cf.detectChanges();
          i++;
          console.log(this.urls);
          reader.onload = (event) => {
            const url = (<FileReader>event.target).result as string;
            this.image=url
            this.cf.detectChanges();
          };
        }
       
    }


    reset(file:any){
      file.value = ""
      this.image=""
    }

    upload(){
      
      let ref=this.field.props.refId
      this.refId=this.model[ref]
      const formData = new FormData();
      formData.append('file',  this.file );
      formData.append('CorpCustomer', this.refId);
      this.dataservice.imageupload(formData).subscribe((res:any)=>{
        if(res.data){
          this.formControl.setValue(res.data[0])
          this.dialogService.openSnackBar("File Uploaded successfully", "OK")
          this.show_button =true
        }
      
      })
    }
   
  }