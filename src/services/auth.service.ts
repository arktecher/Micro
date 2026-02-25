/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
import { api } from "@/lib/api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: "artist" | "customer" | "corporate";
    profile_image_url?: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: "artist" | "customer" | "corporate";
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export const authService = {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return api.post<LoginResponse>("/auth/login", credentials);
  },

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<LoginResponse> {
    const endpoint = `/auth/register/${data.role}`;
    return api.post<LoginResponse>(endpoint, {
      email: data.email,
      password: data.password,
      name: data.name,
    });
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      await api.post<void>("/auth/logout", {});
    } catch (error) {
      // Logout even if API call fails
      console.error("Logout API error:", error);
    } finally {
      // Clear local storage
      localStorage.removeItem("mgj_access_token");
      localStorage.removeItem("mgj_user_type");
      localStorage.removeItem("mgj_current_user");
      localStorage.removeItem("mgj_is_authenticated");
    }
  },

  /**
   * Forgot password - request reset link
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    return api.post("/auth/forgot-password", data);
  },

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    return api.post("/auth/reset-password", data);
  },

  /**
   * Resend verification email
   */
  async resendVerification(email: string): Promise<{ message: string }> {
    return api.post("/auth/resend-verification", { email });
  },

  /**
   * Check verification status
   */
  async getVerificationStatus(): Promise<{ is_verified: boolean; email: string }> {
    return api.get("/auth/verification-status");
  },
};
