import {
  Component,
  ViewEncapsulation
} from '@angular/core';

@Component({
  selector: 'tga-list-item',
  host: {
    class: 'list-item'
  },
  standalone: true,
  imports: [],
  template: `
    <ng-content></ng-content> `,
  styleUrl: './list-item.component.less',
  encapsulation: ViewEncapsulation.None
})
export class ListItemComponent {

}
