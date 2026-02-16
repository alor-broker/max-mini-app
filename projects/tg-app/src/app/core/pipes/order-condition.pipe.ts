import { Pipe, PipeTransform } from '@angular/core';
import { StopOrderCondition } from "@api-lib";

@Pipe({
  name: 'orderCondition',
  standalone: true
})
export class OrderConditionPipe implements PipeTransform {

  transform(value: StopOrderCondition | null): string {
    switch (value) {
      case StopOrderCondition.Less:
        return '<';
      case StopOrderCondition.LessOrEqual:
        return '≤';
      case StopOrderCondition.More:
        return '>';
      case StopOrderCondition.MoreOrEqual:
        return '≥';
      default:
        return '';
    }
  }

}
