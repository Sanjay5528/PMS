import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent {
  @Input() count: any;
  @Input() text: any;
  @Input() icon: any;
  @Input() iconColor: any;
  @Input() altText: any;
  @Input() height: any;
  @Input() type: any= 'Single' ; 
  @Input() width: any;
  @Input() backgroundColor: string = 'transparent';
  get iconClass() {
    return 'icon';
  }
ngOnInit(): void {
  console.warn(this.count);
  console.log(this.text);
  console.log(this.icon);
  console.log(this.iconColor);
  console.log(this.altText);
  console.log(this.height);
  console.log(this.type);
  console.log(this.width);
  console.log(this.backgroundColor);
  
}
}
