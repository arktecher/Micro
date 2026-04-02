import { api } from "@/lib/api";
export const ARTWORK_IN_TRANSIT_DB_STATUSES = [
    "in_transit_exhibition",
    "in_transit_corporate_return",
    "in_transit_recall",
    "recall_pending",
] as const;
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
    status: "draft" | "published" | "exhibited" | "exhibition_requested" | "in_transit_exhibition" | "in_transit_corporate_return" | "in_transit_recall" | "recall_pending" | "returned_corporate" | "returned_recall" | "withdrawn" | "sold" | "rented" | string;
    main_image_url?: string;
    images?: ArtworkImage[];
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
    style_tags?: string[];
    is_ai_generated?: boolean;
    dominant_color?: string;
    created_at: string;
    published_at?: string;
    view_count: number;
    favorite_count?: number;
    in_transit_kind?: "to_corporate" | "return_to_artist" | "recall_pending" | "recall_in_transit" | string | null;
    artist_pipeline_kind?: "corporate_return_pending" | null;
}
export interface ArtworkListResponse {
    items: Artwork[];
    total: number;
    page: number;
    page_size: number;
    total_pages?: number;
}
export interface OnlineConfirmContext {
    artwork_id: string;
    title?: string;
    status: string;
    main_image_url?: string;
    price?: number;
    can_publish: boolean;
    message?: string | null;
    missing_fields?: string[] | null;
}
export interface ArtistArtworkStatusCounts {
    all: number;
    draft: number;
    published: number;
    exhibition_requested: number;
    exhibited: number;
    in_transit: number;
    in_transit_to_corporate?: number;
    in_transit_return?: number;
    return_requested?: number;
    recall_requested?: number;
    sold: number;
    recalled: number;
}
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
    style_tags?: string[];
    is_ai_generated?: boolean;
    main_image_url?: string;
    new_image_urls?: string[];
    delete_image_ids?: string[];
}
export const artworkService = {
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
        artist_name?: string;
        dominant_color?: string[];
        price_range?: string[];
        eligible_for_corporate_assignment?: boolean;
    }): Promise<ArtworkListResponse> {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    if (Array.isArray(value)) {
                        value.forEach((item) => {
                            queryParams.append(key, String(item));
                        });
                    }
                    else {
                        queryParams.append(key, String(value));
                    }
                }
            });
        }
        return api.get<ArtworkListResponse>(`/artworks?${queryParams.toString()}`);
    },
    async getArtwork(artworkId: string): Promise<Artwork> {
        return api.get<Artwork>(`/artworks/${artworkId}`);
    },
    async getOnlineConfirmContext(artworkId: string): Promise<OnlineConfirmContext> {
        return api.get<OnlineConfirmContext>(`/artworks/${artworkId}/online-confirm/context`);
    },
    async createArtwork(data: CreateArtworkRequest, images: File[]): Promise<Artwork> {
        const formData = new FormData();
        if (data.title !== undefined)
            formData.append("title", data.title);
        if (data.description !== undefined)
            formData.append("description", data.description);
        if (data.story !== undefined)
            formData.append("story", data.story);
        if (data.price !== undefined)
            formData.append("price", String(data.price));
        if (data.lease_price !== undefined)
            formData.append("lease_price", String(data.lease_price));
        if (data.dimensions) {
            formData.append("width", String(data.dimensions.width));
            formData.append("height", String(data.dimensions.height));
            if (data.dimensions.depth !== undefined) {
                formData.append("depth", String(data.dimensions.depth));
            }
        }
        if (data.size_class !== undefined)
            formData.append("size_class", data.size_class);
        if (data.year !== undefined)
            formData.append("year", String(data.year));
        if (data.medium !== undefined)
            formData.append("medium", data.medium);
        if (data.support !== undefined)
            formData.append("support", data.support);
        if (data.weight !== undefined)
            formData.append("weight", String(data.weight));
        if (data.has_frame !== undefined)
            formData.append("has_frame", String(data.has_frame));
        if (data.coating !== undefined)
            formData.append("coating", data.coating);
        if (data.packaging_info !== undefined)
            formData.append("packaging_info", data.packaging_info);
        if (data.maintenance_info !== undefined)
            formData.append("maintenance_info", data.maintenance_info);
        if (data.style_tags !== undefined && Array.isArray(data.style_tags)) {
            formData.append("style_tags", JSON.stringify(data.style_tags));
        }
        if (data.is_ai_generated !== undefined) {
            formData.append("is_ai_generated", String(data.is_ai_generated));
        }
        images.forEach((file) => {
            formData.append("images", file);
        });
        return api.upload<Artwork>("/artworks", formData);
    },
    async updateArtwork(artworkId: string, data: Partial<CreateArtworkRequest>): Promise<Artwork> {
        return api.put<Artwork>(`/artworks/${artworkId}`, data);
    },
    async publishArtwork(artworkId: string): Promise<Artwork> {
        return api.post<Artwork>(`/artworks/${artworkId}/publish-online`, {});
    },
    async unpublishArtwork(artworkId: string): Promise<Artwork> {
        return api.post<Artwork>(`/artworks/${artworkId}/unpublish`, {});
    },
    async markExhibitionShipped(artworkId: string): Promise<{
        message: string;
        assignment_id: string;
        status: string;
    }> {
        return api.post(`/artworks/${artworkId}/exhibition/mark-shipped`, {});
    },
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
    async deleteArtwork(artworkId: string, hardDelete: boolean = false): Promise<void> {
        return api.delete<void>(`/artworks/${artworkId}?hard_delete=${hardDelete}`);
    },
    async addToFavorites(artworkId: string): Promise<{
        message: string;
    }> {
        return api.post(`/artworks/${artworkId}/favorite`, {});
    },
    async removeFromFavorites(artworkId: string): Promise<{
        message: string;
    }> {
        return api.delete(`/artworks/${artworkId}/favorite`);
    },
    async requestRecall(artworkId: string): Promise<{
        message: string;
        assignment_id: string;
        artwork_id: string;
        status: string;
    }> {
        return api.post(`/artworks/${artworkId}/request-recall`, {});
    },
    async confirmReturnArrival(artworkId: string): Promise<{
        message: string;
        artwork_id: string;
        assignment_id: string;
        return_request_id: string;
        status: string;
    }> {
        return api.post(`/artworks/${artworkId}/confirm-return-arrival`, {});
    },
    async confirmRecallArrival(artworkId: string): Promise<{
        message: string;
        artwork_id: string;
        assignment_id: string;
        status: string;
    }> {
        return api.post(`/artworks/${artworkId}/confirm-recall-arrival`, {});
    },
    async getOpenIssueReportSummary(): Promise<{
        counts: Record<string, number>;
    }> {
        return api.get(`/artworks/issue-reports/open-summary`);
    },
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
    async getExhibitionRequestContext(artworkId: string): Promise<{
        has_exhibition_request: boolean;
        assignment: {
            id: string;
            status: string;
        } | null;
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
