export abstract class ApiErrorsTracker {
  abstract track(error: Error): void
}
