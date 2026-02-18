/**
 * Artwork Service
 * Handles artwork CRUD operations
 */
import { api } from "@/lib/api";

export interface Artwork {
  id: string;
  custom_id: string;
  title: string;
  description?: string;
  story?: string;
  price: number;
  lease_price?: number;
  status: "draft" | "published" | "exhibited" | "sold" | "recalled";
  main_image_url?: string;
  artist_id: string;
  artist?: {
    id: string;
    name: string;
    profile_image_url?: string;
  };
  dimensions?: {
    width: number;
    height: number;
    depth?: number;
  };
  size_class?: string;
  year?: number;
  medium?: string;
  support?: string;
  weight?: number;
  has_frame?: boolean;
  coating?: string;
  packaging_info?: string;
  maintenance_info?: string;
  dominant_color?: string;
  created_at: string;
  published_at?: string;
  view_count: number;
}

export interface ArtworkListResponse {
  artworks: Artwork[];
  total: number;
  page: number;
  page_size: number;
}

export interface CreateArtworkRequest {
  title: string;
  description?: string;
  story?: string;
  price: number;
  lease_price?: number;
  dimensions?: {
    width: number;
    height: number;
    depth?: number;
  };
  size_class?: string;
  year?: number;
  medium?: string;
  support?: string;
  weight?: number;
  has_frame?: boolean;
  coating?: string;
  packaging_info?: string;
  maintenance_info?: string;
}

export const artworkService = {
  /**
   * List artworks with pagination and filters
   */
  async listArtworks(params?: {
    page?: number;
    page_size?: number;
    status?: string;
    artist_id?: string;
    search?: string;
    min_price?: number;
    max_price?: number;
    size_class?: string;
    medium?: string;
    sort_by?: string;
  }): Promise<ArtworkListResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    return api.get<ArtworkListResponse>(`/artworks?${queryParams.toString()}`);
  },

  /**
   * Get artwork by ID
   */
  async getArtwork(artworkId: string): Promise<Artwork> {
    return api.get<Artwork>(`/artworks/${artworkId}`);
  },

  /**
   * Create artwork with images
   */
  async createArtwork(data: CreateArtworkRequest, images: File[]): Promise<Artwork> {
    const formData = new FormData();
    
    // Add artwork data
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    // Add images
    images.forEach((file) => {
      formData.append("images", file);
    });

    return api.upload<Artwork>("/artworks", formData);
  },

  /**
   * Update artwork
   */
  async updateArtwork(artworkId: string, data: Partial<CreateArtworkRequest>): Promise<Artwork> {
    return api.put<Artwork>(`/artworks/${artworkId}`, data);
  },

  /**
   * Publish artwork
   */
  async publishArtwork(artworkId: string): Promise<Artwork> {
    return api.post<Artwork>(`/artworks/${artworkId}/publish`, {});
  },

  /**
   * Unpublish artwork
   */
  async unpublishArtwork(artworkId: string): Promise<Artwork> {
    return api.post<Artwork>(`/artworks/${artworkId}/unpublish`, {});
  },

  /**
   * Delete artwork
   */
  async deleteArtwork(artworkId: string, hardDelete: boolean = false): Promise<void> {
    return api.delete<void>(`/artworks/${artworkId}?hard_delete=${hardDelete}`);
  },

  /**
   * Add artwork to favorites
   */
  async addToFavorites(artworkId: string): Promise<{ message: string }> {
    return api.post(`/artworks/${artworkId}/favorite`, {});
  },

  /**
   * Remove artwork from favorites
   */
  async removeFromFavorites(artworkId: string): Promise<{ message: string }> {
    return api.delete(`/artworks/${artworkId}/favorite`);
  },
};
