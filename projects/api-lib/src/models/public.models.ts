import { Observable } from "rxjs";
import { ApiErrorsTracker } from "@api-lib";

export type ApiResponse<T> = Observable<T | null>;

export interface ApiRequestOptions {
  errorTracker?: ApiErrorsTracker
}
