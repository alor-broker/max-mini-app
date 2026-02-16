import { Component, Input } from '@angular/core';
import { NzIconDirective } from "ng-zorro-antd/icon";

@Component({
  selector: 'tga-page-loader',
  standalone: true,
  imports: [
    NzIconDirective
  ],
  templateUrl: './page-loader.component.html',
  styleUrl: './page-loader.component.less'
})
export class PageLoaderComponent {
  @Input({ required: true }) isVisible!: boolean;
}
