import {
  Component,
  ViewEncapsulation
} from '@angular/core';

@Component({
  selector: 'tga-list',
  host: {
    class: 'list'
  },
  standalone: true,
  imports: [],
  template: `
    <ng-content></ng-content> `,
  styleUrl: './list.component.less',
  encapsulation: ViewEncapsulation.None
})
export class ListComponent {

}
