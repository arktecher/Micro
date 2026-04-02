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
    corporate_return_pending?: boolean;
    artist_recall_pending?: boolean;
    artist_recall_awaiting_artist_confirm?: boolean;
    pending_exhibition_assignment_id?: string | null;
    pending_exhibition_artwork_id?: string | null;
    pending_exhibition_status?: "pending" | "in_transit" | string | null;
    pending_exhibition_has_outbound_shipment?: boolean;
    active_return_request_id?: string | null;
    active_return_request_status?: string | null;
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
    if (params?.page != null)
        search.set("page", String(params.page));
    if (params?.page_size != null)
        search.set("page_size", String(params.page_size));
    if (params?.is_active != null)
        search.set("is_active", String(params.is_active));
    const q = search.toString();
    return api.get<SpaceListResponse>(`/spaces${q ? `?${q}` : ""}`);
}
export async function createSpace(payload: CreateSpacePayload): Promise<SpaceResponse> {
    return api.post<SpaceResponse>("/spaces", payload);
}
export async function updateSpace(spaceId: string, payload: UpdateSpacePayload): Promise<SpaceResponse> {
    return api.put<SpaceResponse>(`/spaces/${spaceId}`, payload);
}
export async function deleteSpace(spaceId: string): Promise<void> {
    await api.delete<void>(`/spaces/${spaceId}`);
}
export interface AssignSpaceArtworkPayload {
    artwork_id: string;
    assignment_reason?: string;
}
export interface AssignSpaceArtworkResponse {
    space_id: string;
    artwork_id: string;
    assignment_id: string;
    assigned_at: string;
    status: string;
    message: string;
}
export async function assignSpaceArtwork(spaceId: string, payload: AssignSpaceArtworkPayload): Promise<AssignSpaceArtworkResponse> {
    return api.put<AssignSpaceArtworkResponse>(`/spaces/${spaceId}/artwork`, payload);
}
export async function confirmExhibitionDisplay(spaceId: string, assignmentId: string): Promise<AssignSpaceArtworkResponse> {
    return api.post<AssignSpaceArtworkResponse>(`/spaces/${spaceId}/confirm-exhibition`, { assignment_id: assignmentId });
}
export interface SpaceArtworkHistoryItem {
    assignment_id: string;
    artwork_id: string;
    title: string | null;
    custom_id?: string | null;
    main_image_url: string | null;
    artist_name: string | null;
    artwork_status: string;
    price: number | null;
    display_start_date: string | null;
    display_end_date: string | null;
    assignment_status: string;
    scan_count: number;
    artwork?: {
        id: string;
        title?: string | null;
        custom_id?: string | null;
        main_image_url?: string | null;
    };
    assigned_at?: string | null;
    removed_at?: string | null;
    status?: string;
}
export interface SpaceArtworkHistoryResponse {
    space_id: string;
    assignments: SpaceArtworkHistoryItem[];
    total: number;
}
export async function getSpaceArtworkHistory(spaceId: string): Promise<SpaceArtworkHistoryResponse> {
    return api.get<SpaceArtworkHistoryResponse>(`/spaces/${spaceId}/artwork-history`);
}
export type QrAnalyticsUiPeriod = "week" | "month" | "quarter";
export interface QrAnalyticsResponse {
    qr_code_id: string;
    space: {
        id: string;
        name?: string | null;
    };
    period: string;
    period_days: number | null;
    previous_period_total: number | null;
    total_scans: number;
    scans_by_day: {
        date: string;
        scans: number;
    }[];
    device_breakdown: Record<string, number>;
    current_artwork: {
        id: string;
        title?: string | null;
        custom_id?: string | null;
    } | null;
}
export async function getQrAnalytics(qrCodeId: string, period: QrAnalyticsUiPeriod): Promise<QrAnalyticsResponse> {
    return api.get<QrAnalyticsResponse>(`/qr/${encodeURIComponent(qrCodeId)}/analytics?period=${encodeURIComponent(period)}`);
}
export interface ReturnRequestContext {
    assignment_id: string;
    space_id: string;
    space_name: string;
    artwork_id: string;
    artwork_title: string | null;
    artist_name: string | null;
    main_image_url: string | null;
    display_start_date: string | null;
    display_days: number;
    shipping_cost_bearer: "corporate" | "artist";
    can_submit: boolean;
    pending_return_request_id: string | null;
    pending_message: string | null;
    artist_address_formatted: string | null;
    artist_phone: string | null;
    space_address_formatted: string | null;
    corporate_company_name: string | null;
    corporate_phone: string | null;
    corporate_address_formatted: string | null;
}
export async function getReturnRequestContext(spaceId: string): Promise<ReturnRequestContext> {
    return api.get<ReturnRequestContext>(`/spaces/${spaceId}/return-request/context`);
}
export interface CreateReturnRequestPayload {
    reason_code: string;
    additional_notes?: string | null;
}
export interface ReturnRequestCreated {
    id: string;
    assignment_id: string;
    space_id: string;
    artwork_id: string;
    status: string;
    requested_date: string;
    reason: string;
    notes: string | null;
    shipping_cost_bearer: "corporate" | "artist";
}
export async function createReturnRequest(spaceId: string, payload: CreateReturnRequestPayload): Promise<ReturnRequestCreated> {
    return api.post<ReturnRequestCreated>(`/spaces/${spaceId}/return-request`, payload);
}
export async function markReturnRequestShipped(spaceId: string, payload?: {
    return_request_id?: string | null;
}): Promise<{
    message: string;
    return_request_id: string;
    assignment_id: string;
    artwork_id: string;
    status: string;
}> {
    return api.post(`/spaces/${encodeURIComponent(spaceId)}/return-request/mark-shipped`, payload ?? {});
}
export async function markRecallShipped(spaceId: string): Promise<{
    message: string;
    assignment_id: string;
    artwork_id: string;
    status: string;
}> {
    return api.post(`/spaces/${encodeURIComponent(spaceId)}/recall/mark-shipped`, {});
}
export interface IssueReportContext {
    assignment_id: string;
    space_id: string;
    space_name: string;
    artwork_id: string;
    artwork_title: string | null;
    artist_name: string | null;
    main_image_url: string | null;
    display_start_date: string | null;
    display_location_label: string | null;
}
export async function getIssueReportContext(spaceId: string): Promise<IssueReportContext> {
    return api.get<IssueReportContext>(`/spaces/${spaceId}/issue-report/context`);
}
export interface CreateIssueReportPayload {
    issue_type: string;
    description: string;
    discovered_at: string;
    photo_urls?: string[] | null;
}
export interface IssueReportCreated {
    id: string;
    assignment_id: string;
    space_id: string;
    artwork_id: string;
    status: string;
    issue_type: string;
    discovered_at: string | null;
}
export async function createIssueReport(spaceId: string, payload: CreateIssueReportPayload): Promise<IssueReportCreated> {
    return api.post<IssueReportCreated>(`/spaces/${spaceId}/issue-report`, payload);
}
export async function uploadIssueReportImage(file: File, spaceId: string): Promise<UploadResult> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", "artworks");
    formData.append("subfolder", `issue-reports/${spaceId}`);
    formData.append("generate_sizes", "large");
    formData.append("convert_heic", "true");
    const raw = await api.upload<ProcessedImageUploadApiResponse>("/uploads/upload/processed", formData);
    return uploadResultFromProcessed(raw, "artworks");
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
interface ProcessedImageUploadApiResponse {
    success: boolean;
    images: Record<string, {
        path: string;
        url: string;
        width?: number;
        height?: number;
        format?: string;
        size_bytes?: number;
    }>;
    metadata?: unknown;
    dominant_color?: string | null;
    original_info?: unknown;
}
function uploadResultFromProcessed(data: ProcessedImageUploadApiResponse, bucket: string): UploadResult {
    const large = data.images?.large ||
        data.images?.medium ||
        data.images?.thumbnail ||
        Object.values(data.images || {})[0];
    if (!large?.url) {
        throw new Error("画像のアップロードに失敗しました（URLが取得できません）");
    }
    const fmt = (large.format || "jpeg").toLowerCase();
    return {
        success: true,
        path: large.path,
        url: large.url,
        bucket,
        size: large.size_bytes ?? 0,
        content_type: fmt === "png" ? "image/png" : `image/${fmt}`,
        filename: large.path.split("/").pop() || "image.jpg",
    };
}
export interface CorporateShippingIncomingItem {
    id: string;
    shipment_id: string;
    assignment_id: string;
    space_id: string;
    artwork_id: string;
    title: string;
    artist: string;
    location: string;
    image: string | null;
    price: string;
    status: string;
    order_date: string | null;
    estimated_arrival: string | null;
    tracking_number: string | null;
    shipping_status: string;
    shipment_status: string | null;
}
export interface CorporateShippingReturnItem {
    id: string;
    return_request_id: string;
    assignment_id: string;
    artwork_id: string;
    title: string;
    artist: string;
    location: string;
    image: string | null;
    price: string;
    status: string;
    return_date: string | null;
    estimated_return: string | null;
    tracking_number: string | null;
    shipping_status: string;
    return_reason: string | null;
    shipping_cost_bearer: "corporate" | "artist";
    return_request_status: string;
}
export interface CorporateShippingRecallItem {
    id: string;
    shipment_id: string;
    assignment_id: string;
    space_id: string;
    artwork_id: string;
    title: string;
    artist: string;
    location: string;
    image: string | null;
    price: string;
    status: string;
    order_date: string | null;
    estimated_return: string | null;
    tracking_number: string | null;
    shipping_status: string;
    shipment_status: string | null;
}
export interface CorporateShippingDisplayItem {
    assignment_id: string;
    space_id: string;
    space_name: string;
    artwork_id: string;
    title: string;
    artist: string;
    image: string | null;
    price: string;
    pipeline_label: string;
    detail: string;
    artwork_status: string;
}
export async function getCorporateShippingDashboard(): Promise<{
    incoming: CorporateShippingIncomingItem[];
    returns: CorporateShippingReturnItem[];
    recalls: CorporateShippingRecallItem[];
    display_overview: CorporateShippingDisplayItem[];
}> {
    return api.get("/spaces/shipping-dashboard");
}
export interface CorporateDisplayArtworkContext {
    assignment_id: string;
    space_id: string;
    space_name: string;
    facility_type?: string | null;
    space_address?: string | null;
    artwork_id: string;
    display_start_date?: string | null;
    display_days: number;
    pipeline_label: string;
    pipeline_detail: string;
    artwork_status: string;
    qr_scan_count: number;
    view_count: number;
    favorite_count: number;
    has_artist_recall_request: boolean;
    artist_recall_requested_at?: string | null;
    has_pending_corporate_return_request: boolean;
    pending_return_request_id?: string | null;
    shipping_cost_bearer: "corporate" | "artist";
}
export async function getCorporateDisplayArtworkContext(artworkId: string): Promise<CorporateDisplayArtworkContext> {
    return api.get(`/spaces/display-artwork/${artworkId}/context`);
}
export async function uploadSpaceImage(file: File, spaceId: string): Promise<UploadResult> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", "spaces");
    formData.append("subfolder", spaceId);
    formData.append("generate_sizes", "large");
    formData.append("convert_heic", "true");
    const raw = await api.upload<ProcessedImageUploadApiResponse>("/uploads/upload/processed", formData);
    return uploadResultFromProcessed(raw, "spaces");
}
export async function uploadSpaceRegistrationImage(file: File, draftSpaceId: string): Promise<UploadResult> {
    return uploadSpaceImage(file, `pending/${draftSpaceId}`);
}
