/**
 * User Service
 * Handles user profile and account management
 */
import { api } from "@/lib/api";
import type { CorporateOrgRole } from "@/lib/corporatePermissions";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  /** API returns `user_type`; older code may use `role` */
  user_type?: "artist" | "customer" | "corporate";
  role?: "artist" | "customer" | "corporate";
  /** GET /users/me — corporate only (primary | admin | editor | viewer) */
  corporate_role?: CorporateOrgRole;
  profile_image_url?: string;
  profile_completion?: number;
  phone_number?: string;
  phone?: string;
  address?: string;
  postal_code?: string;
  biography?: string;
  company_name?: string;
  contact_name?: string;
  company_address?: string;
  company_postal_code?: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  contact_name?: string;
  phone?: string;
  phone_number?: string;
  address?: string;
  postal_code?: string;
  bio?: string;
  biography?: string;
  website?: string;
  instagram?: string;
  company_name?: string;
  company_address?: string;
  company_postal_code?: string;
}

export const userService = {
  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<UserProfile> {
    return api.get<UserProfile>("/users/me");
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    return api.put<UserProfile>("/users/me", data);
  },

  /**
   * Upload profile image
   */
  async uploadProfileImage(file: File): Promise<{ profile_image_url: string }> {
    const formData = new FormData();
    formData.append("file", file);
    return api.upload<{ profile_image_url: string }>("/users/me/profile-image", formData);
  },

  /**
   * Delete profile image
   */
  async deleteProfileImage(): Promise<UserProfile> {
    return api.delete<UserProfile>("/users/me/profile-image");
  },

  /**
   * Deactivate account (soft delete)
   */
  async deactivateAccount(): Promise<{ message: string }> {
    return api.post("/users/me/deactivate", {});
  },

  /**
   * Delete account permanently (hard delete)
   */
  async deleteAccount(): Promise<{ message: string }> {
    return api.post("/users/me/delete", {});
  },
};
