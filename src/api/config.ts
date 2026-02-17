import { environment as prodEnv } from '../environments/environment';
import { environment as devEnv } from '../environments/environment.dev';

export interface ApiConfig {
  apiUrl: string;
  userDataUrl: string;
  ssoUrl: string;
  superAppUrl: string;
}

const isProd = process.env.NODE_ENV === 'production';
const environment = isProd ? prodEnv : devEnv;

// Configuration from tg-app environment
export const API_CONFIG: ApiConfig = {
  apiUrl: environment.apiUrl,
  userDataUrl: environment.userDataUrl,
  ssoUrl: environment.ssoUrl,
  superAppUrl: environment.superAppUrl
};

