import { getAccessToken } from './token-manager';
import { API_CONFIG } from './config';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ApiRequestOptions extends RequestInit {
  skipAuth?: boolean;
}

class Client {
  private async request<T>(url: string, method: HttpMethod, body?: any, options?: ApiRequestOptions): Promise<T> {
    const headers = new Headers(options?.headers);
    headers.set('Content-Type', 'application/json');

    if (!options?.skipAuth) {
      const token = await getAccessToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    const config: RequestInit = {
      ...options,
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    };

    const fullUrl = url.startsWith('http') ? url : `${API_CONFIG.apiUrl}${url}`;

    const response = await fetch(fullUrl, config);

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
