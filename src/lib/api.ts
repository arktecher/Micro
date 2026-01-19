/**
 * API Configuration and utilities
 */

// API base URL - can be overridden via environment variable
// Set VITE_API_BASE_URL in .env file if needed
const API_BASE_URL = "http://localhost:8000/api/v1";

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
      const error = await response.json().catch(() => ({ detail: "An error occurred" }));
      throw new Error(error.detail || error.message || `HTTP error! status: ${response.status}`);
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
};
