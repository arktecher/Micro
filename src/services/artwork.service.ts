/**
 * Artwork Service
 * Handles artwork CRUD operations
 */
import { api } from "@/lib/api";

export interface ArtworkImage {
  id: string;
  image_url: string;
  image_order: number;
  is_main: boolean;
  alt_text?: string;
}

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
  images?: ArtworkImage[];
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
  style_tags?: string[];  // Array of style tag strings
  is_ai_generated?: boolean;
  dominant_color?: string;
  created_at: string;
  published_at?: string;
  view_count: number;
}

export interface ArtworkListResponse {
  items: Artwork[]; // Backend returns 'items' not 'artworks'
  total: number;
  page: number;
  page_size: number;
  total_pages?: number;
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
  style_tags?: string[];  // Array of style tag strings
  is_ai_generated?: boolean;
  main_image_url?: string;
  new_image_urls?: string[]; // URLs of newly uploaded images to add
  delete_image_ids?: string[]; // IDs of images to delete
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
    
    // Add artwork data - backend expects individual fields, not nested objects
    if (data.title !== undefined) formData.append("title", data.title);
    if (data.description !== undefined) formData.append("description", data.description);
    if (data.story !== undefined) formData.append("story", data.story);
    if (data.price !== undefined) formData.append("price", String(data.price));
    if (data.lease_price !== undefined) formData.append("lease_price", String(data.lease_price));
    
    // Dimensions as separate fields (backend expects width, height, depth as Form fields)
    if (data.dimensions) {
      formData.append("width", String(data.dimensions.width));
      formData.append("height", String(data.dimensions.height));
      if (data.dimensions.depth !== undefined) {
        formData.append("depth", String(data.dimensions.depth));
      }
    }
    
    if (data.size_class !== undefined) formData.append("size_class", data.size_class);
    if (data.year !== undefined) formData.append("year", String(data.year));
    if (data.medium !== undefined) formData.append("medium", data.medium);
    if (data.support !== undefined) formData.append("support", data.support);
    if (data.weight !== undefined) formData.append("weight", String(data.weight));
    if (data.has_frame !== undefined) formData.append("has_frame", String(data.has_frame));
    if (data.coating !== undefined) formData.append("coating", data.coating);
    if (data.packaging_info !== undefined) formData.append("packaging_info", data.packaging_info);
    if (data.maintenance_info !== undefined) formData.append("maintenance_info", data.maintenance_info);

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

  /**
   * Get exhibition/assignment information for an artwork
   */
  async getExhibitionInfo(artworkId: string): Promise<{
    is_exhibited: boolean;
    assignment: {
      id: string;
      status: string;
      display_start_date?: string;
      display_end_date?: string;
      exhibition_days: number;
      space: {
        id?: string;
        name?: string;
        address?: string;
      };
      corporate: {
        company_name?: string;
        contact_name?: string;
        contact_email?: string;
        contact_phone?: string;
      };
      qr_scan_count: number;
    } | null;
  }> {
    return api.get(`/artworks/${artworkId}/exhibition`);
  },
};
