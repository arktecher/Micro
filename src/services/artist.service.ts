import { api } from "@/lib/api";
export interface BiographyEntry {
    year: string;
    content: string;
}
export interface ArtistShippingAddress {
    id: string;
    name: string;
    postal_code: string;
    prefecture: string;
    city: string;
    street_address: string;
    building_name?: string | null;
    phone?: string | null;
}
export interface ArtistProfile {
    id: string;
    name: string;
    email: string;
    profile_image_url?: string;
    biography?: string;
    career_history?: BiographyEntry[];
    phone_number?: string;
    address?: string;
    postal_code?: string;
    shipping_address?: ArtistShippingAddress | null;
    profile_completion: number;
    created_at: string;
    updated_at: string;
}
export interface UpsertArtistShippingAddressRequest {
    postal_code: string;
    prefecture: string;
    city: string;
    street_address: string;
    building_name?: string | null;
    phone?: string | null;
}
export interface UpdateArtistProfileRequest {
    name?: string;
    biography?: string;
    career_history?: BiographyEntry[];
    phone_number?: string;
    address?: string;
    postal_code?: string;
}
export interface ArtworkCounts {
    total: number;
    draft: number;
    published: number;
    exhibited: number;
    in_transit: number;
    sold: number;
    recalled: number;
}
export interface RevenueStats {
    total: number;
    monthly: number;
    yearly: number;
    count: number;
}
export interface ViewStats {
    total: number;
    monthly: number;
}
export interface ArtistStatistics {
    artwork_counts: ArtworkCounts;
    revenue: RevenueStats;
    views: ViewStats;
    favorites: {
        total: number;
        monthly: number;
    };
    qr_scans: {
        total: number;
        monthly: number;
    };
    qr_top_locations?: Array<{
        space_id: string;
        space_name: string;
        scan_count: number;
    }>;
    top_artworks: Array<{
        id: string;
        custom_id: string;
        title: string;
        view_count: number;
        price: number;
        status: string;
    }>;
}
export interface DashboardResponse {
    statistics: ArtistStatistics;
    recent_activity: Array<{
        type: string;
        artwork_id?: string;
        artwork_title?: string;
        timestamp: string;
    }>;
    pending_actions: Array<{
        type: string;
        message: string;
        count?: number;
        completion?: number;
        action_url: string;
    }>;
    revenue_summary: {
        total_revenue: number;
        monthly_revenue: number;
        yearly_revenue: number;
        total_sales: number;
        average_sale_price: number;
    };
}
export interface RevenueAnalytics {
    period_type: string;
    revenue_by_period: Array<{
        period: string;
        revenue: number;
    }>;
    revenue_by_artwork: Array<{
        artwork_id: string;
        custom_id: string;
        title: string;
        price: number;
        sold_at: string;
    }>;
    total_revenue: number;
    total_sales: number;
}
export interface PerformanceAnalytics {
    total_views: number;
    view_trends: Array<{
        artwork_id: string;
        title: string;
        views: number;
    }>;
    conversion_rates: {
        view_to_published: number;
        published_to_sold: number;
    };
    performance_summary: {
        total_artworks: number;
        published_artworks: number;
        sold_artworks: number;
        average_views_per_artwork: number;
    };
}
export const artistService = {
    async getProfile(): Promise<ArtistProfile> {
        return api.get<ArtistProfile>("/artists/me/profile");
    },
    async updateProfile(data: UpdateArtistProfileRequest): Promise<ArtistProfile> {
        return api.put<ArtistProfile>("/artists/me/profile", data);
    },
    async upsertShippingAddress(data: UpsertArtistShippingAddressRequest): Promise<ArtistShippingAddress> {
        return api.put<ArtistShippingAddress>("/artists/me/shipping-address", data);
    },
    async getStatistics(): Promise<ArtistStatistics> {
        return api.get<ArtistStatistics>("/artists/me/statistics");
    },
    async getDashboard(): Promise<DashboardResponse> {
        return api.get<DashboardResponse>("/artists/me/dashboard");
    },
    async getRevenueAnalytics(period: "daily" | "monthly" | "yearly" = "monthly"): Promise<RevenueAnalytics> {
        return api.get<RevenueAnalytics>(`/artists/me/analytics/revenue?period=${period}`);
    },
    async getPerformanceAnalytics(): Promise<PerformanceAnalytics> {
        return api.get<PerformanceAnalytics>("/artists/me/analytics/performance");
    },
};
