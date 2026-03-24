import { api } from "@/lib/api";

export interface SpaceResponse {
  id: string;
  custom_id: string;
  corporate_id: string;
  name: string;
  facility_type: string;
  description?: string | null;
  address?: string | null;
  postal_code?: string | null;
  photo_urls?: string[] | null;
  is_active: boolean;
  qr_code_id?: string | null;
  current_artwork_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSpacePayload {
  name: string;
  facility_type: string;
  description?: string | null;
  address?: string | null;
  postal_code?: string | null;
  photo_urls?: string[] | null;
}

export interface UpdateSpacePayload {
  name?: string;
  facility_type?: string;
  description?: string | null;
  address?: string | null;
  postal_code?: string | null;
  photo_urls?: string[] | null;
}

export interface SpaceListResponse {
  items: SpaceResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages?: number | null;
}

export async function getSpace(spaceId: string): Promise<SpaceResponse> {
  return api.get<SpaceResponse>(`/spaces/${spaceId}`);
}

export async function listSpaces(params?: {
  page?: number;
  page_size?: number;
  is_active?: boolean;
}): Promise<SpaceListResponse> {
  const search = new URLSearchParams();
  if (params?.page != null) search.set("page", String(params.page));
  if (params?.page_size != null) search.set("page_size", String(params.page_size));
  if (params?.is_active != null) search.set("is_active", String(params.is_active));
  const q = search.toString();
  return api.get<SpaceListResponse>(`/spaces${q ? `?${q}` : ""}`);
}

export async function createSpace(payload: CreateSpacePayload): Promise<SpaceResponse> {
  return api.post<SpaceResponse>("/spaces", payload);
}

export async function updateSpace(
  spaceId: string,
  payload: UpdateSpacePayload
): Promise<SpaceResponse> {
  return api.put<SpaceResponse>(`/spaces/${spaceId}`, payload);
}

/** Delete a space (204 No Content on success). */
export async function deleteSpace(spaceId: string): Promise<void> {
  await api.delete<void>(`/spaces/${spaceId}`);
}

export interface UploadResult {
  success: boolean;
  path: string;
  url: string;
  bucket: string;
  size: number;
  content_type: string;
  filename: string;
}

/** Upload one image to the spaces bucket (requires auth). */
export async function uploadSpaceImage(file: File, spaceId: string): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("bucket", "spaces");
  formData.append("subfolder", spaceId);
  return api.upload<UploadResult>("/uploads/upload", formData);
}
