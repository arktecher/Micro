/**
 * Space-based QR code API (corporate auth required).
 */
import { api } from "@/lib/api";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export interface SpaceQRCodeResponse {
  qr_code_id: string;
  custom_id: string;
  space_id: string;
  qr_code_url: string;
  redirect_url: string;
  status: string;
  total_scans: number;
  created_at: string;
}

/** Create QR for space, or return existing if already linked. */
export async function generateSpaceQRCode(
  spaceId: string,
): Promise<SpaceQRCodeResponse> {
  return api.post<SpaceQRCodeResponse>(`/spaces/${spaceId}/qr-code`, {});
}

/** Fetch QR metadata (404 if not generated yet). */
export async function getSpaceQRCode(
  spaceId: string,
): Promise<SpaceQRCodeResponse> {
  return api.get<SpaceQRCodeResponse>(`/spaces/${spaceId}/qr-code`);
}

/** High-resolution PNG from backend (proxies storage). */
export async function downloadSpaceQRCodeImage(spaceId: string): Promise<Blob> {
  const url = `${API_BASE_URL}/spaces/${spaceId}/qr-code/download`;
  const token = localStorage.getItem("mgj_access_token");
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(url, { headers });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const detail = (err as { detail?: string }).detail;
    throw new Error(
      typeof detail === "string" ? detail : "ダウンロードに失敗しました",
    );
  }
  return response.blob();
}
