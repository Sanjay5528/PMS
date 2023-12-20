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
  // @Input() height: any;

  @Input() width: any;
  @Input() backgroundColor: string = 'transparent';
  get iconClass() {
    return 'icon';
  }
}
