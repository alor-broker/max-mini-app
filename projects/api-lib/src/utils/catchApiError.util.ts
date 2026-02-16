import {
  catchError,
  MonoTypeOperatorFunction,
  of,
  pipe
} from "rxjs";
import { ApiErrorsTracker } from "../api-errors-tracker";

/**
 *
 * @param valueToReturn
 * @param errorTracker
 * @returns
 */
/**
 * Allows to catch error and provide default value.
 * @param valueToReturn - A default value that will be returned in case of error.
 * @param errorTracker - An error tracker. Can be provided to follow common error handling approach. Optional
 */
export function catchApiError<T>(
  valueToReturn: (err: any) => T,
  errorTracker?: ApiErrorsTracker
): MonoTypeOperatorFunction<T> {
  return pipe(
    catchError(err => {
      if (errorTracker != null) {
        errorTracker.track(err);
      }

      return of(valueToReturn(err));
    })
  );
}
