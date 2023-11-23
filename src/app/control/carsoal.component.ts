import { Component, Input } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-carsoal',
  template:`<div  style="display: contents; max-height: 400px; max-width: 400px">
  <div
    *ngFor="let image of data; let index = index"
   
  >
    <div *ngIf="CurrentImageIndex == index" style="display: flex;align-items: center;">
      <mat-icon 
        (click)="imageIndexMove('Left')"
        >keyboard_arrow_left</mat-icon
      >
      <img
        [src]="DocImagePAth + image.storage_name"
        [alt]="image.file_name"
        [height]="calcHeight()"
        [width]="calcwidth()"
      />
      <mat-icon
        (click)="imageIndexMove('Right')"
        >keyboard_arrow_right</mat-icon
      >
    </div>
  </div>
  </div>`
})
export class CarsoalComponent  {
  DocImagePAth:any=environment.ImageBaseUrl;
  imageUrl:any
  @Input("data")data:any
  // data:any[]=[
  //   {
  //       "_id": "b47e4a79d9f146b085f4ff1eb4b3ca45",
  //       "file_name": "Screenshot from 2023-11-17 16-19-02.png",
  //       "folder": "test_case",
  //       "ref_id": "testclientID-R1-TC2",
  //       "size": 139096,
  //       "storage_name": "test_case/testclientID-R1-TC2/Screenshot from 2023-11-17 16-19-02__2023-11-23-13-46-42.png",
  //       "uploaded_by": "sanjay123sanjay12@gmial.com"
  //   },
  //   {
  //       "_id": "7d81e0eabbbc40c9910c522c4b91b97a",
  //       "file_name": "Screenshot from 2023-11-06 10-18-22.png",
  //       "folder": "test_case",
  //       "ref_id": "testclientID-R1-TC2",
  //       "size": 333355,
  //       "storage_name": "test_case/testclientID-R1-TC2/Screenshot from 2023-11-06 10-18-22__2023-11-23-13-46-42.png",
  //       "uploaded_by": "sanjay123sanjay12@gmial.com"
  //   },
  //   {
  //       "_id": "ecc3285b3d214197b663d41ce6cfb595",
  //       "file_name": "Screenshot from 2023-10-07 18-06-46.png",
  //       "folder": "test_case",
  //       "ref_id": "testclientID-R1-TC2",
  //       "size": 189517,
  //       "storage_name": "test_case/testclientID-R1-TC2/Screenshot from 2023-10-07 18-06-46__2023-11-23-13-46-43.png",
  //       "uploaded_by": "sanjay123sanjay12@gmial.com"
  //   },
  //   {
  //       "_id": "4e256c897b7948008519b0db332b975f",
  //       "file_name": "Screenshot from 2023-09-27 13-31-32.png",
  //       "folder": "test_case",
  //       "ref_id": "testclientID-R1-TC2",
  //       "size": 440051,
  //       "storage_name": "test_case/testclientID-R1-TC2/Screenshot from 2023-09-27 13-31-32__2023-11-23-13-46-43.png",
  //       "uploaded_by": "sanjay123sanjay12@gmial.com"
  //   },
  //   {
  //       "_id": "4c4c33286d7941ba9ea1afe4ee80da96",
  //       "file_name": "Screenshot from 2023-09-27 12-10-20.png",
  //       "folder": "test_case",
  //       "ref_id": "testclientID-R1-TC2",
  //       "size": 713406,
  //       "storage_name": "test_case/testclientID-R1-TC2/Screenshot from 2023-09-27 12-10-20__2023-11-23-13-46-43.png",
  //       "uploaded_by": "sanjay123sanjay12@gmial.com"
  //   }
  // ]
  CurrentImageIndex:any=0
  calcHeight(): string {
    const windowHeight = window.innerHeight;
    const calculatedHeight = windowHeight - 500; 
    return `
    ${calculatedHeight}`;
  }
  calcwidth(): string {
    const windowHeight = window.innerWidth;
    const calculatedHeight = windowHeight - 500; 
    return `
    ${calculatedHeight}`;
  }
  ngOnInit(): void {
    this.imageUrl =this.DocImagePAth+this.data[this.CurrentImageIndex].storage_name
    console.log(this.data);
    
}

imageIndexMove(movedType: string) {
  if (movedType === "Left") {
    this.CurrentImageIndex = this.CurrentImageIndex - 1;
    if (this.CurrentImageIndex < 0) {
      // this.CurrentImageIndex = this.data.length - 1;
      let leftSideMove=this.data.length -  ( -  this.CurrentImageIndex)
  console.log(leftSideMove);
  this.CurrentImageIndex=leftSideMove
  this.imageUrl =this.DocImagePAth+this.data[this.CurrentImageIndex].storage_name
  
}
} else if (movedType === "Right") {
  this.CurrentImageIndex = this.CurrentImageIndex + 1;
  if (this.CurrentImageIndex >= this.data.length) {
    this.CurrentImageIndex = 0;
    this.imageUrl =this.DocImagePAth+this.data[this.CurrentImageIndex].storage_name
    
  }
}
console.log(this.imageUrl);
}

}
