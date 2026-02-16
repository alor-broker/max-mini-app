import {
  Component,
  ViewEncapsulation
} from '@angular/core';

@Component({
  host: {
    class: 'sections'
  },
  selector: 'tga-sections',
  standalone: true,
  imports: [],
  template: `
    <ng-content></ng-content> `,
  styleUrl: './sections.component.less',
  encapsulation: ViewEncapsulation.None
})
export class SectionsComponent {

}
