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
  (change)="onSelectFile($event,myInput)"
  style="margin-top: 30px;"
/>
</div>

<div 
style="margin-top: 40px; 
 display: flex; gap: 12px" >

  <img width="200" height="133" style="object-fit:contain"    [src]="image"  
  /> 

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
  public dialogservice:DialogService,
  private cf: ChangeDetectorRef
){
  super();
}


ngOnInit(): void {
  debugger

  console.log(this.refId)
  this.image=this.model[this.field.key]
}

    onSelectFile(event:any,value:any) {
     

      if(this.field.bind_key){
        if(this.model[this.field.bind_key]==undefined){
          this.file=[]
          value.value = "";
          return this.dialogservice.openSnackBar(`${this.field.error_msg}`,"OK")
        }
    
      }
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


          
      let ref=this.field.props.refId
      this.refId=this.model[ref]
      const formData = new FormData();
      if(this.field.bind_key){
        if(this.model[this.field.bind_key]==undefined){
          return this.dialogservice.openSnackBar(`${this.field.error_msg}`,"OK")
        }
        formData.append('file',this.file);
        formData.append(this.field.refId,this.model[this.field.bind_key]);
        formData.append("category",this.field.category);
      }
      this.dataservice.imageupload(formData).subscribe((res:any)=>{
        if(res.data){
          this.formControl.setValue(res.data.file_path)
          this.dialogservice.openSnackBar("File Uploaded successfully", "OK")
          this.show_button =true
        }
      
      })
       
       
    }


    reset(file:any){
      file.value = ""
      this.image=""
      this.formControl.setvalue("")
    }

   
   
  }