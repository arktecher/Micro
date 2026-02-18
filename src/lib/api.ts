/**
 * API Configuration and utilities
 */

// API base URL - imported from environment variable
// Set VITE_API_BASE_URL in .env file (defaults to localhost:8000)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export const api = {
  baseUrl: API_BASE_URL,
  
  /**
   * Make API request with authentication
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Get access token from localStorage if available
    const token = localStorage.getItem("mgj_access_token");
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> || {}),
    };
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "エラーが発生しました" }));
      throw new Error(error.detail || error.message || `エラーが発生しました。ステータスコード: ${response.status}`);
    }
    
    return response.json();
  },
  
  /**
   * POST request
   */
  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  
  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "GET",
    });
  },

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  },

  /**
   * Upload file(s) with multipart/form-data
   */
  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem("mgj_access_token");
    
    const headers: Record<string, string> = {};
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    // Don't set Content-Type - let browser set it with boundary
    
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "ファイルのアップロードに失敗しました" }));
      throw new Error(error.detail || error.message || `ファイルのアップロードに失敗しました。ステータスコード: ${response.status}`);
    }
    
    return response.json();
  },
};
