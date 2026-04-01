/**
 * Artwork Service
 * Handles artwork CRUD operations
 */
import { api } from "@/lib/api";

/** DB granular statuses grouped under the 「輸送中」 filter */
export const ARTWORK_IN_TRANSIT_DB_STATUSES = [
  "in_transit_exhibition",
  "in_transit_corporate_return",
  "in_transit_recall",
  "recall_pending",
] as const;

/** DB statuses: arrived at artist or soft-withdrawn (「アーティストに返却済み」 filter) */
export const ARTWORK_RETURNED_AT_ARTIST_STATUSES = [
  "returned_corporate",
  "returned_recall",
  "withdrawn",
] as const;

export function isArtworkInTransitFamily(status: string): boolean {
  return (ARTWORK_IN_TRANSIT_DB_STATUSES as readonly string[]).includes(status);
}

export function isArtworkReturnedAtArtistFamily(status: string): boolean {
  return (ARTWORK_RETURNED_AT_ARTIST_STATUSES as readonly string[]).includes(status);
}

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
  status:
    | "draft"
    | "published"
    | "exhibited"
    | "exhibition_requested"
    | "in_transit_exhibition"
    | "in_transit_corporate_return"
    | "in_transit_recall"
    | "recall_pending"
    | "returned_corporate"
    | "returned_recall"
    | "withdrawn"
    | "sold"
    | "rented"
    | string;
  main_image_url?: string;
  /** Gallery images (GET detail includes for owner / published). */
  images?: ArtworkImage[];
  /** Fallback when building carousel if images is empty (API may send thumbnails). */
  thumbnail_urls?: string[];
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
  favorite_count?: number;
  /** When status is in_transit: exhibition leg vs return/recall (from GET /artworks). */
  in_transit_kind?:
    | "to_corporate"
    | "return_to_artist"
    | "recall_pending"
    | "recall_in_transit"
    | string
    | null;
  /** Artist dashboard: work on wall with corporate return pending (status may be exhibited). */
  artist_pipeline_kind?: "corporate_return_pending" | null;
}

export interface ArtworkListResponse {
  items: Artwork[]; // Backend returns 'items' not 'artworks'
  total: number;
  page: number;
  page_size: number;
  total_pages?: number;
}

/** GET /artworks/{id}/online-confirm/context — post-registration オンライン公開確認 */
export interface OnlineConfirmContext {
  artwork_id: string;
  title?: string;
  status: string;
  main_image_url?: string;
  price?: number;
  can_publish: boolean;
  message?: string | null;
  /** When draft is incomplete: title / price / main_image_url */
  missing_fields?: string[] | null;
}

/** GET /artworks/me/status-counts — artist dashboard filter badges */
export interface ArtistArtworkStatusCounts {
  all: number;
  draft: number;
  published: number;
  exhibition_requested: number;
  exhibited: number;
  /** All in-transit legs (to corporate, return to artist, recall, etc.). */
  in_transit: number;
  /** Shipped to venue; awaiting corporate receipt. */
  in_transit_to_corporate?: number;
  /** Return/recall pipeline toward artist (in_transit rows classified as return leg). */
  in_transit_return?: number;
  /** Corporate return requested (pending/approved) while work still on display. */
  return_requested?: number;
  /** Artist recall: awaiting corporate ship (recall_pending kind). */
  recall_requested?: number;
  sold: number;
  recalled: number;
}

/** GET /artworks/{id}/issue-reports — artist-only */
export interface ArtistIssueReportItem {
  id: string;
  assignment_id: string;
  issue_type: string;
  description: string;
  status: string;
  discovered_at: string | null;
  created_at: string;
  space_name: string | null;
  photo_urls: string[] | null;
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
    min_lease_price?: number;
    max_lease_price?: number;
    size_class?: string[];
    medium?: string[];
    support?: string[];
    min_width?: number;
    max_width?: number;
    min_height?: number;
    max_height?: number;
    min_depth?: number;
    max_depth?: number;
    min_weight?: number;
    max_weight?: number;
    year_from?: number;
    year_to?: number;
    has_frame?: boolean;
    is_ai_generated?: boolean;
    style_tags?: string[];
    min_view_count?: number;
    max_view_count?: number;
    min_favorite_count?: number;
    max_favorite_count?: number;
    min_inquiry_count?: number;
    max_inquiry_count?: number;
    date_type?: "created_at" | "published_at" | "updated_at";
    date_from?: string;
    date_to?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
    /** Catalog sidebar: substring match on artist name (independent of `search`) */
    artist_name?: string;
    /** Catalog: exact hex match (MGJ palette), OR semantics — backend filters after query */
    dominant_color?: string[];
    /** Catalog price buckets: 1-5, 5-10, 10-20, 20+ — OR semantics — backend */
    price_range?: string[];
    /**
     * If true, backend excludes works currently on display (any corporate space).
     * Use with status=published for corporate manual exhibition-request pickers.
     */
    eligible_for_corporate_assignment?: boolean;
  }): Promise<ArtworkListResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          // Handle arrays
          if (Array.isArray(value)) {
            value.forEach((item) => {
              queryParams.append(key, String(item));
            });
          } else {
            queryParams.append(key, String(value));
          }
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
   * Artist-only: eligibility for POST publish-online (same validation, no mutation).
   */
  async getOnlineConfirmContext(artworkId: string): Promise<OnlineConfirmContext> {
    return api.get<OnlineConfirmContext>(
      `/artworks/${artworkId}/online-confirm/context`
    );
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
    
    // Style tags - send as JSON string array
    if (data.style_tags !== undefined && Array.isArray(data.style_tags)) {
      formData.append("style_tags", JSON.stringify(data.style_tags));
    }
    
    // AI generated flag
    if (data.is_ai_generated !== undefined) {
      formData.append("is_ai_generated", String(data.is_ai_generated));
    }

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
   * Publish artwork (draft → published). Uses backend publish-online endpoint
   * aligned with the オンライン公開確認 screen.
   */
  async publishArtwork(artworkId: string): Promise<Artwork> {
    return api.post<Artwork>(`/artworks/${artworkId}/publish-online`, {});
  },

  /**
   * Unpublish artwork
   */
  async unpublishArtwork(artworkId: string): Promise<Artwork> {
    return api.post<Artwork>(`/artworks/${artworkId}/unpublish`, {});
  },

  /**
   * Artist: exhibition pipeline — mark shipped (assignment pending → in_transit, artwork → in_transit).
   * Mock for now: no carrier API; user confirms after physically shipping.
   */
  async markExhibitionShipped(artworkId: string): Promise<{
    message: string;
    assignment_id: string;
    status: string;
  }> {
    return api.post(`/artworks/${artworkId}/exhibition/mark-shipped`, {});
  },

  /**
   * Batch publish multiple artworks
   */
  async batchPublishArtworks(artworkIds: string[]): Promise<{
    total: number;
    successful: number;
    failed: number;
    results: Array<{
      artwork_id: string;
      success: boolean;
      message?: string;
    }>;
  }> {
    return api.post("/artworks/batch/publish", {
      artwork_ids: artworkIds,
    });
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
  async requestRecall(artworkId: string): Promise<{
    message: string;
    assignment_id: string;
    artwork_id: string;
    status: string;
  }> {
    return api.post(`/artworks/${artworkId}/request-recall`, {});
  },

  /** Artist confirms physical receipt after corporate return request */
  async confirmReturnArrival(artworkId: string): Promise<{
    message: string;
    artwork_id: string;
    assignment_id: string;
    return_request_id: string;
    status: string;
  }> {
    return api.post(`/artworks/${artworkId}/confirm-return-arrival`, {});
  },

  /** Artist confirms receipt after corporate shipped an artist-initiated recall (no return_requests row) */
  async confirmRecallArrival(artworkId: string): Promise<{
    message: string;
    artwork_id: string;
    assignment_id: string;
    status: string;
  }> {
    return api.post(`/artworks/${artworkId}/confirm-recall-arrival`, {});
  },

  /** Corporate damage/defect reports for artist (dashboard badge + edit page) */
  async getOpenIssueReportSummary(): Promise<{ counts: Record<string, number> }> {
    return api.get(`/artworks/issue-reports/open-summary`);
  },

  /** Artist-only: counts per dashboard status chip (aligned with list filters) */
  async getMyArtworkStatusCounts(): Promise<ArtistArtworkStatusCounts> {
    return api.get(`/artworks/me/status-counts`);
  },

  async listArtworkIssueReports(artworkId: string): Promise<{
    items: ArtistIssueReportItem[];
  }> {
    return api.get(`/artworks/${encodeURIComponent(artworkId)}/issue-reports`);
  },

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
      artist_recall_requested_at?: string | null;
    } | null;
    /** Active corporate return request for this assignment, if any */
    return_request?: {
      id: string;
      status: string;
      requested_date?: string | null;
      reason?: string | null;
    } | null;
    recall_awaiting_corporate_ship?: boolean;
    recall_awaiting_artist_confirm?: boolean;
  }> {
    return api.get(`/artworks/${artworkId}/exhibition`);
  },

  /** Artist: pending / in_transit exhibition pipeline — shipping destination + mark shipped flag */
  async getExhibitionRequestContext(artworkId: string): Promise<{
    has_exhibition_request: boolean;
    assignment: { id: string; status: string } | null;
    space: {
      id?: string | null;
      name?: string | null;
      address?: string | null;
    } | null;
    corporate: {
      company_name?: string | null;
      postal_code?: string | null;
      address?: string | null;
      address_formatted?: string | null;
      contact_name?: string | null;
      contact_email?: string | null;
      contact_phone?: string | null;
    } | null;
    can_mark_shipped: boolean;
  }> {
    return api.get(`/artworks/${encodeURIComponent(artworkId)}/exhibition-request/context`);
  },
};
