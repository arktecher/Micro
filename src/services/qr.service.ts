/**
 * QR Code Service
 * Handles QR code generation and management (space-based)
 * 
 * NOTE: Will be fully implemented in Phase 5
 */
import { api } from "@/lib/api";

export interface QRCode {
  id: string;
  space_id: string;
  qr_code_url: string;
  total_scans: number;
}

export const qrService = {
  /**
   * Generate QR code for space
   * TODO: Implement in Phase 5
   */
  async generateQRCode(spaceId: string): Promise<QRCode> {
    // return api.post(`/spaces/${spaceId}/qr-code`, {});
    throw new Error("Not implemented yet - Phase 5");
  },

  /**
   * Get QR code for space
   * TODO: Implement in Phase 5
   */
  async getQRCode(spaceId: string): Promise<QRCode> {
    // return api.get(`/spaces/${spaceId}/qr-code`);
    throw new Error("Not implemented yet - Phase 5");
  },
};
