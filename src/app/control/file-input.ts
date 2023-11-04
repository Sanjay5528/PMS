import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  OnDestroy,
  Inject,
} from "@angular/core";
import { FieldType } from "@ngx-formly/core";
import { environment } from "src/environments/environment";

@Component({
  selector: "file-input",
  template: `
 
  <div style="display: flex; margin: 20px">
 
    <input
      #myInput
      type="file"
      multiple
      
      (change)="onFileSelected($event.target)"
    />
    <br />
   

    <div>
    <button style="margin-left:2px;margin-right:10px" type="button" color="warn"  mat-raised-button (click)="reset(myInput)">
      <span class="glyphicon glyphicon-trash"></span> Reset
    </button>
  
    <button
    type="button"
    (click)="save()"
    [disabled]="!selectedFiles.length"
    mat-raised-button
    class="approve-button"
  >
    <span class="glyphicon glyphicon-upload"></span>Save 
  </button>
  </div>
  </div>
  <div style="margin-left:20px" *ngFor="let data of this.selectedFiles" >{{data.name}}<br></div>
  `,
})
export class FileInput extends FieldType<any> implements OnInit {
 
  constructor() {
    super();
  }

  selectedFiles: any[] = [];


  ngOnInit(): void {
    
  }


  save(){
  //api call
  this.selectedFiles
}

  reset(file:any) {
    this.selectedFiles=[]
    file.value = "";
  }

   onFileSelected(target: any) {
      this.selectedFiles=target.files
    }

    onApiResponse(res: any) {
    if (res.status == 200) {
      this.formControl.setValue(res.body.data);
    }
    }
}
