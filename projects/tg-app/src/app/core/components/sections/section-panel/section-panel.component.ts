import {
  Component,
  ViewEncapsulation
} from '@angular/core';

@Component({
  host: {
    class: 'section-panel'
  },
  selector: 'tga-section-panel',
  standalone: true,
  imports: [],
  template: `
    <ng-content></ng-content> `,
  styleUrl: './section-panel.component.less',
  encapsulation: ViewEncapsulation.None
})
export class SectionPanelComponent {

}
