export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | undefined>;
}

class ApiClient {
  private telegramInitData: string = '';
  private activeTelegramUser: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
  } | null = null;

  constructor() {
    // Check Telegram WebApp JS SDK
    if (typeof window !== 'undefined') {
      const tg = (window as any).Telegram?.WebApp;
      if (tg && tg.initData) {
        this.telegramInitData = tg.initData;
      }
    }
  }

  public setTelegramInitData(data: string) {
    this.telegramInitData = data;
  }

  public setActiveUser(user: { id: number; first_name: string; last_name?: string; username?: string } | null) {
    this.activeTelegramUser = user;
    if (user) {
      localStorage.setItem('ielts_simulated_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ielts_simulated_user');
    }
  }

  public getActiveUser() {
    if (this.activeTelegramUser) return this.activeTelegramUser;
    try {
      const saved = localStorage.getItem('ielts_simulated_user');
      if (saved) {
        this.activeTelegramUser = JSON.parse(saved);
        return this.activeTelegramUser;
      }
    } catch {}
    return null;
  }

  public async fetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers: customHeaders, ...restOptions } = options;

    let url = endpoint;
    if (params) {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          query.append(key, String(val));
        }
      });
      const queryString = query.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    const headers = new Headers(customHeaders);
    headers.set('Content-Type', 'application/json');

    if (this.telegramInitData) {
      headers.set('x-telegram-init-data', this.telegramInitData);
    }

    const simUser = this.getActiveUser();
    if (simUser) {
      headers.set('x-telegram-user-id', String(simUser.id));
      headers.set('x-telegram-first-name', encodeURIComponent(simUser.first_name));
      if (simUser.username) {
        headers.set('x-telegram-username', simUser.username);
      }
    }

    const res = await fetch(url, {
      ...restOptions,
      headers
    });

    if (!res.ok) {
      let errorMsg = `Request failed (${res.status})`;
      try {
        const errorJson = await res.json();
        if (errorJson.error) {
          errorMsg = errorJson.error;
        }
      } catch {}
      throw new Error(errorMsg);
    }

    return res.json() as Promise<T>;
  }

  public get<T>(url: string, params?: Record<string, string | number | undefined>): Promise<T> {
    return this.fetch<T>(url, { method: 'GET', params });
  }

  public post<T>(url: string, body?: any): Promise<T> {
    return this.fetch<T>(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
  }

  public put<T>(url: string, body?: any): Promise<T> {
    return this.fetch<T>(url, { method: 'PUT', body: body ? JSON.stringify(body) : undefined });
  }

  public delete<T>(url: string): Promise<T> {
    return this.fetch<T>(url, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
