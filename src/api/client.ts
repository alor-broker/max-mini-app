import { getAccessToken, getRefreshToken, setAccessToken } from './token-manager';
import { API_CONFIG } from './config';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ApiRequestOptions extends RequestInit {
  skipAuth?: boolean;
  _retriedAfterRefresh?: boolean;
}

class Client {
  private refreshInFlight: Promise<boolean> | null = null;

  private async refreshAccessToken(): Promise<boolean> {
    if (this.refreshInFlight) {
      return this.refreshInFlight;
    }

    this.refreshInFlight = (async () => {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        return false;
      }

      try {
        const response = await fetch(`${API_CONFIG.userDataUrl}/auth/actions/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken, context: { skipAuthorization: true } })
        });

        if (!response.ok) {
          return false;
        }

        const data = await response.json() as { jwt?: string };
        if (!data?.jwt) {
          return false;
        }

        await setAccessToken(data.jwt);
        return true;
      } catch {
        return false;
      } finally {
        this.refreshInFlight = null;
      }
    })();

    return this.refreshInFlight;
  }

  private async request<T>(url: string, method: HttpMethod, body?: any, options?: ApiRequestOptions): Promise<T> {
    const { _retriedAfterRefresh, ...requestOptions } = options ?? {};
    const headers = new Headers(options?.headers);
    headers.set('Content-Type', 'application/json');

    if (!options?.skipAuth) {
      const token = await getAccessToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    const config: RequestInit = {
      ...requestOptions,
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    };

    const fullUrl = url.startsWith('http') ? url : `${API_CONFIG.apiUrl}${url}`;

    const response = await fetch(fullUrl, config);
    if (response.status === 401 && !options?.skipAuth && !options?._retriedAfterRefresh) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        return this.request<T>(url, method, body, { ...options, _retriedAfterRefresh: true });
      }
    }

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    try {
      return await response.json();
    } catch (e) {
      return {} as T;
    }
  }

  get<T>(url: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(url, 'GET', undefined, options);
  }

  post<T>(url: string, body: any, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(url, 'POST', body, options);
  }

  put<T>(url: string, body: any, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(url, 'PUT', body, options);
  }

  delete<T>(url: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(url, 'DELETE', undefined, options);
  }
}

export const apiClient = new Client();
