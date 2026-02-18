import { environment as prodEnv } from '../environments/environment';
import { environment as devEnv } from '../environments/environment.dev';

export interface ApiConfig {
  apiUrl: string;
  userDataUrl: string;
  historyApiUrl: string;
  ssoUrl: string;
  superAppUrl: string;
}

const isDev = process.env.NODE_ENV === 'development' || process.env.REACT_APP_ENV === 'development';
const environment = isDev ? devEnv : prodEnv;

// Configuration from tg-app environment
export const API_CONFIG: ApiConfig = {
  apiUrl: environment.apiUrl,
  userDataUrl: environment.userDataUrl,
  historyApiUrl: environment.historyApiUrl ?? environment.userDataUrl,
  ssoUrl: environment.ssoUrl,
  superAppUrl: environment.superAppUrl
};

