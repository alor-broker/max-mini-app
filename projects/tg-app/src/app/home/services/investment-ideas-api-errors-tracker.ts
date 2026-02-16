import { ApiErrorsTracker } from "@api-lib";
import { HttpErrorResponse } from "@angular/common/http";

export class InvestmentIdeasApiErrorsTracker extends ApiErrorsTracker {

  private unauthorizedErrorCallback: () => void;
  private apiErrorsTracker: ApiErrorsTracker;

  constructor(
    apiErrorsTracker: ApiErrorsTracker,
    unauthorizedErrorCallback: () => void
  ) {
    super();
    this.apiErrorsTracker = apiErrorsTracker;
    this.unauthorizedErrorCallback = unauthorizedErrorCallback;
  }

  override track(error: Error) {
    if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)) {
      this.unauthorizedErrorCallback();
    } else {
      this.apiErrorsTracker.track(error);
    }
  }
}
