import { Component, Input } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-carsoal',
  template:`
  <!-- <div fxLayout="row" fxLayoutAlign="center center" >
  <div  *ngFor="let image of data; let index = index"   >
    <div *ngIf="CurrentImageIndex == index" fxLayoutGap="20px" fxLayout="row"  fxLayoutAlign="space-between center">
      <mat-icon 
        (click)="imageIndexMove('Left')"
        >keyboard_arrow_left</mat-icon
      >
      <img
        [src]="DocImagePAth + image.storage_name"
        [alt]="image.file_name"
        [height]="calcHeight()"
      />
      <mat-icon
        (click)="imageIndexMove('Right')"
        >keyboard_arrow_right</mat-icon
      >
    </div>
  </div>
  </div>
   -->
   
   <div fxLayout="row" fxLayoutAlign="center center" fxLayoutGap="100px">
  <!-- <div *ngFor="let image of data; let index = index">
    <div *ngIf="CurrentImageIndex == index"style="display: flex;justify-content: space-between;  align-items: center;  gap: 20px;">
      <mat-icon (click)="imageIndexMove('Left')">keyboard_arrow_left</mat-icon>
      <img [src]="DocImagePAth + image.storage_name" [alt]="image.file_name" [height]="calcHeight()" [width]="calcwidth()" />
      <mat-icon (click)="imageIndexMove('Right')">keyboard_arrow_right</mat-icon>
    </div>
  </div> -->
  <img [src]="DocImagePAth + data.storage_name" [alt]="data.file_name" [height]="calcHeight()" [width]="calcwidth()" />
</div>

  `
})
export class CarsoalComponent  {
  DocImagePAth:any=environment.ImageBaseUrl;
  imageUrl:any
  // @Input("data")data:any[]=[]
  @Input("data")data:any

  CurrentImageIndex:any=0
  calcHeight(): string {
    const windowHeight = window.innerHeight;
    const calculatedHeight = windowHeight - 50; 
    return `
    ${calculatedHeight}`;
  }
  calcwidth(): string {
    const windowHeight = window.innerWidth;
    const calculatedHeight = windowHeight  - 50 
    return `
    ${calculatedHeight}`;
  }
  ngOnInit(){ 
    // this.imageUrl =this.DocImagePAth+this.data[this.CurrentImageIndex].storage_name
    this.imageUrl =this.DocImagePAth+this.data.storage_name

  }

// imageIndexMove(movedType: string) {
//   if (movedType === "Left") {
//     this.CurrentImageIndex = this.CurrentImageIndex - 1;
//     if (this.CurrentImageIndex < 0) {
//        let leftSideMove=this.data.length -  ( -  this.CurrentImageIndex)
//   console.log(leftSideMove);
//   this.CurrentImageIndex=leftSideMove
//   this.imageUrl =this.DocImagePAth+this.data[this.CurrentImageIndex].storage_name
// }}
//  else if (movedType === "Right") {
//   this.CurrentImageIndex = this.CurrentImageIndex + 1;
//   if (this.CurrentImageIndex >= this.data.length) {
//     this.CurrentImageIndex = 0;
//     this.imageUrl =this.DocImagePAth+this.data[this.CurrentImageIndex].storage_name
    
//   }}}

}
