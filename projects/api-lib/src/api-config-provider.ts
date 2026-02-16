import { Observable } from "rxjs";

export interface ApiConfig {
  apiUrl: string;
  userDataUrl: string;
  superAppUrl: string
}

export abstract class ApiConfigProvider {
  abstract getConfig(): Observable<ApiConfig>
}
