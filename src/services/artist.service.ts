/**
 * Artist Service
 * Handles artist-specific operations (dashboard, statistics, analytics)
 * 
 * NOTE: Will be fully implemented in Phase 2
 */
import { api } from "@/lib/api";

export interface ArtistStatistics {
  artwork_counts: {
    total: number;
    draft: number;
    published: number;
    exhibited: number;
    sold: number;
  };
  revenue: {
    total: number;
    monthly: number;
    yearly: number;
  };
  views: {
    total: number;
    monthly: number;
  };
}

export const artistService = {
  /**
   * Get artist dashboard overview
   * TODO: Implement in Phase 2
   */
  async getDashboard(): Promise<any> {
    // return api.get("/artists/me/dashboard");
    throw new Error("Not implemented yet - Phase 2");
  },

  /**
   * Get artist statistics
   * TODO: Implement in Phase 2
   */
  async getStatistics(): Promise<ArtistStatistics> {
    // return api.get("/artists/me/statistics");
    throw new Error("Not implemented yet - Phase 2");
  },
};
