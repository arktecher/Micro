/**
 * User Service
 * Handles user profile and account management
 */
import { api } from "@/lib/api";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: "artist" | "customer" | "corporate";
  profile_image_url?: string;
  profile_completion: number;
  phone_number?: string;
  address?: string;
  postal_code?: string;
  biography?: string;
  company_name?: string;
  company_address?: string;
  company_postal_code?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;  // Backend uses 'phone', not 'phone_number'
  phone_number?: string;  // Keep for backward compatibility, will be mapped
  address?: string;
  postal_code?: string;
  bio?: string;  // Backend uses 'bio' for artists
  biography?: string;  // Keep for backward compatibility
  website?: string;  // For artists
  instagram?: string;  // For artists
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
