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
      
      // Handle validation errors (detail is an array) or simple errors (detail is a string)
      let errorMessage = "エラーが発生しました";
      
      if (error.detail) {
        if (Array.isArray(error.detail)) {
          // Validation errors: extract messages from each error object
          const fieldNames: Record<string, string> = {
            email: "メールアドレス",
            password: "パスワード",
            name: "名前",
            title: "タイトル",
            price: "価格",
            body: "入力内容",
          };
          
          errorMessage = error.detail
            .map((err: any) => {
              // Get field name (last item in loc array)
              const fieldKey = err.loc && err.loc.length > 0 
                ? err.loc[err.loc.length - 1] 
                : "入力";
              
              // Translate field name to Japanese
              const fieldName = fieldNames[fieldKey] || fieldKey;
              
              // Extract error message
              let msg = err.msg || err.message || "無効な値です";
              
              // Clean up common validation messages
              if (msg.includes("not a valid email address")) {
                msg = "有効なメールアドレスを入力してください";
              } else if (msg.includes("not a valid")) {
                msg = "無効な値です";
              } else if (msg.includes("required")) {
                msg = "必須項目です";
              } else if (msg.includes("too short")) {
                msg = "文字数が不足しています";
              } else if (msg.includes("too long")) {
                msg = "文字数が多すぎます";
              }
              
              return `${fieldName}: ${msg}`;
            })
            .join("\n");
        } else {
          // Simple error: detail is a string
          errorMessage = error.detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = `エラーが発生しました。ステータスコード: ${response.status}`;
      }
      
      throw new Error(errorMessage);
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
      
      // Handle validation errors (detail is an array) or simple errors (detail is a string)
      let errorMessage = "ファイルのアップロードに失敗しました";
      
      if (error.detail) {
        if (Array.isArray(error.detail)) {
          // Validation errors: extract messages from each error object
          const fieldNames: Record<string, string> = {
            file: "ファイル",
            images: "画像",
            body: "入力内容",
          };
          
          errorMessage = error.detail
            .map((err: any) => {
              const fieldKey = err.loc && err.loc.length > 0 
                ? err.loc[err.loc.length - 1] 
                : "入力";
              
              const fieldName = fieldNames[fieldKey] || fieldKey;
              let msg = err.msg || err.message || "無効な値です";
              
              // Clean up common validation messages
              if (msg.includes("not a valid")) {
                msg = "無効な値です";
              } else if (msg.includes("required")) {
                msg = "必須項目です";
              }
              
              return `${fieldName}: ${msg}`;
            })
            .join("\n");
        } else {
          // Simple error: detail is a string
          errorMessage = error.detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = `ファイルのアップロードに失敗しました。ステータスコード: ${response.status}`;
      }
      
      throw new Error(errorMessage);
    }
    
    return response.json();
  },
};
