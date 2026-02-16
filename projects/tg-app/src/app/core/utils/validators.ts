import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { MathHelper } from "./math-helper";

export class TgaValidators {
  static stepMultiplicity(priceStep: number): ValidatorFn {
    return (ctrl: AbstractControl): ValidationErrors | null => {
      if (ctrl.value == null || priceStep === 0) {
        return null;
      }

      const priceStepDecimals = MathHelper.getPrecision(priceStep);
      const value = Math.abs(+ctrl.value);

      if (MathHelper.getPrecision(value) > priceStepDecimals) {
        return {
          priceStepMultiplicity: {
            step: priceStep
          }
        };
      }

      const precision = 10 ** priceStepDecimals;
      const valueMOD = Math.round((value % priceStep) * precision) / precision;

      if ((!valueMOD || valueMOD === priceStep)) {
        return null;
      }

      return {
        priceStepMultiplicity: {
          step: priceStep
        }
      };
    };
  }
}
