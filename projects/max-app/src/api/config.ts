export interface ApiConfig {
  apiUrl: string;
  userDataUrl: string;
  ssoUrl: string;
  superAppUrl: string;
}

// Configuration from tg-app environment
export const API_CONFIG: ApiConfig = {
  apiUrl: 'https://api.alor.ru',
  userDataUrl: 'https://lk-api.alor.ru',
  ssoUrl: 'https://login.alor.ru',
  superAppUrl: 'https://tgminiapp.alor.ru/superapp'
};
