import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRefreshOnInterval } from "@/hooks/useRefreshOnInterval";
import { motion, AnimatePresence } from "motion/react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useCorporateOrgRole } from "@/hooks/useCorporateOrgRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ArtworkAreaSelectionDialog } from "@/components/ArtworkAreaSelectionDialog";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, } from "recharts";
import { Sparkles, ChevronRight, Edit, RefreshCw, Package, Truck, AlertCircle, Bell, Users, Home, Image as ImageIcon, ArrowLeft, ExternalLink, BarChart3, Wallet, LifeBuoy, Trash2, Settings, ChevronLeft, Image, Frame, Loader2, QrCode, Download, } from "lucide-react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { getSpace, updateSpace as updateSpaceApi, deleteSpace as deleteSpaceApi, getSpaceArtworkHistory, assignSpaceArtwork, confirmExhibitionDisplay, getQrAnalytics, markReturnRequestShipped, markRecallShipped, type SpaceArtworkHistoryItem, type SpaceResponse, type QrAnalyticsResponse, type QrAnalyticsUiPeriod, } from "@/services/space.service";
import { artworkService, type Artwork } from "@/services/artwork.service";
import { ManualArtworkSelectDialog } from "@/components/corporate/ManualArtworkSelectDialog";
import { getSpaceQRCode, generateSpaceQRCode, downloadSpaceQRCodeImage, type SpaceQRCodeResponse, } from "@/services/qr.service";
import { artworkStatusLabelJa, badgeClassForArtworkStatusVariant, type ArtworkStatusDisplayVariant, } from "@/utils/artworkStatusDisplay";
const DEFAULT_SPACE_IMAGE = "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200";
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function isUuidString(id: string | undefined): boolean {
    return Boolean(id && UUID_REGEX.test(id));
}
function mapSpaceResponseToDetailData(s: SpaceResponse) {
    const imgs = s.photo_urls && s.photo_urls.length > 0
        ? s.photo_urls
        : [DEFAULT_SPACE_IMAGE];
    const primary = imgs[0];
    const addr = s.address?.trim() || "";
    return {
        id: s.id,
        name: s.name,
        location: addr || "—",
        address: addr,
        facilityOverview: s.facility_type || "—",
        registeredDate: s.created_at
            ? new Date(s.created_at).toLocaleDateString("ja-JP")
            : "",
        lastUpdated: s.updated_at
            ? new Date(s.updated_at).toLocaleDateString("ja-JP")
            : new Date().toLocaleDateString("ja-JP"),
        artworksCount: s.current_artwork_id ? 1 : 0,
        current_artwork_id: s.current_artwork_id ?? null,
        wallSize: "未設定",
        lighting: "未設定",
        type: s.facility_type,
        image: primary,
        images: imgs,
        totalRevenue: 0,
        totalSales: 0,
        qr_code_id: s.qr_code_id ?? null,
        corporate_return_pending: s.corporate_return_pending ?? false,
        artist_recall_pending: s.artist_recall_pending ?? false,
        artist_recall_awaiting_artist_confirm: s.artist_recall_awaiting_artist_confirm ?? false,
        pending_exhibition_assignment_id: s.pending_exhibition_assignment_id ?? null,
        pending_exhibition_artwork_id: s.pending_exhibition_artwork_id ?? null,
        pending_exhibition_status: s.pending_exhibition_status ?? null,
        pending_exhibition_has_outbound_shipment: s.pending_exhibition_has_outbound_shipment ?? false,
        active_return_request_id: s.active_return_request_id ?? null,
        active_return_request_status: s.active_return_request_status ?? null,
    };
}
function formatDisplayPeriod(item: SpaceArtworkHistoryItem): string {
    const start = item.display_start_date ?? item.assigned_at ?? undefined;
    const end = item.display_end_date ?? item.removed_at ?? undefined;
    const fmt = (raw: string | undefined) => {
        if (!raw)
            return "";
        const d = new Date(raw);
        if (Number.isNaN(d.getTime()))
            return raw;
        return d.toLocaleDateString("ja-JP");
    };
    if (start && end)
        return `${fmt(start)} ～ ${fmt(end)}`;
    if (start && item.assignment_status === "displaying") {
        return `${fmt(start)} ～ 現在`;
    }
    if (start)
        return `${fmt(start)} ～`;
    return "—";
}
function assignmentStatusLabel(status: string): string {
    switch (status) {
        case "displaying":
            return "展示中";
        case "returned":
            return "展示終了";
        case "pending":
            return "承認待ち";
        case "approved":
            return "承認済";
        case "in_transit":
            return "発送済み（法人確認待ち）";
        case "cancelled":
            return "キャンセル";
        default:
            return status || "—";
    }
}
function formatQrChartDayLabel(isoDate: string): string {
    const d = new Date(`${isoDate}T12:00:00`);
    if (Number.isNaN(d.getTime()))
        return isoDate;
    return d.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
}
function qrAnalyticsChartRows(rows: QrAnalyticsResponse["scans_by_day"] | undefined): {
    label: string;
    date: string;
    scans: number;
}[] {
    if (!rows?.length)
        return [];
    return rows.map((r) => ({
        date: r.date,
        label: formatQrChartDayLabel(r.date),
        scans: r.scans,
    }));
}
function periodLabelJa(period: QrAnalyticsUiPeriod): string {
    switch (period) {
        case "week":
            return "直近7日間";
        case "month":
            return "直近30日間";
        case "quarter":
            return "直近90日間";
        default:
            return "この期間";
    }
}
function buildQrAnalyticsSummary(a: QrAnalyticsResponse, uiPeriod: QrAnalyticsUiPeriod): string {
    const range = periodLabelJa(uiPeriod);
    const total = a.total_scans;
    const prev = a.previous_period_total;
    let part = `${range}のQRスキャン（読み取りからリダイレクトまでを記録）は ${total} 回です。`;
    if (prev !== null && prev !== undefined) {
        const delta = total - prev;
        if (prev === 0 && total > 0) {
            part += ` 前期間（同じ日数）はスキャンがなく、この期間から計測が始まっています。`;
        }
        else if (prev > 0) {
            const pct = Math.round((delta / prev) * 100);
            part += ` 前期間は ${prev} 回（同じ日数）。前期比 ${delta >= 0 ? "+" : ""}${delta} 回（${pct >= 0 ? "+" : ""}${pct}%）。`;
        }
        else if (prev === 0 && total === 0) {
            part += ` 前期間もスキャンはありませんでした。`;
        }
    }
    if (a.current_artwork?.title) {
        part += ` 現在の展示作品は「${a.current_artwork.title}」です。`;
    }
    return part;
}
function artworkToCurrentDisplay(a: Artwork) {
    const img = a.main_image_url ||
        a.images?.find((i) => i.is_main)?.image_url ||
        a.images?.[0]?.image_url ||
        "";
    const start = a.published_at
        ? new Date(a.published_at)
        : new Date(a.created_at);
    const days = Math.max(0, Math.floor((Date.now() - start.getTime()) / 86400000));
    const { label, variant } = artworkStatusLabelJa(a.status);
    return {
        id: a.id,
        title: a.title,
        artist: a.artist?.name || "アーティスト",
        image: img,
        price: `¥${Number(a.price).toLocaleString("ja-JP")}`,
        startDate: start.toLocaleDateString("ja-JP"),
        days,
        views: a.view_count ?? 0,
        ctr: 0,
        conversion: 0,
        status: label,
        statusVariant: variant as ArtworkStatusDisplayVariant,
    };
}
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, } from "@/components/ui/breadcrumb";
const AUTH_INPUT_CLASS = "h-11 sm:h-12 text-sm sm:text-base bg-gray-100 border-gray-200 focus:bg-white focus:border-primary";
const AUTH_INPUT_READONLY_CLASS = "h-11 sm:h-12 text-sm sm:text-base bg-gray-100 border-gray-200 text-gray-700 cursor-default select-none";
const MOCK_SPACES_DATA: Record<string, any> = {
    "1": {
        id: "1",
        name: "1階エントランス",
        location: "東京本社 1F",
        address: "東京都渋谷区〇〇 1-2-3",
        registeredDate: "2024年7月15日",
        lastUpdated: "2024年12月20日",
        artworksCount: 1,
        wallSize: "3m × 2m",
        lighting: "自然光＋LED照明",
        type: "ロビー",
        image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200",
        images: ["https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200"],
        totalRevenue: 95000,
        totalSales: 6,
        corporate_return_pending: false,
        artist_recall_pending: false,
    },
    "2": {
        id: "2",
        name: "会議室A",
        location: "東京本社 3F",
        address: "東京都渋谷区〇〇 1-2-3",
        registeredDate: "2024年9月1日",
        lastUpdated: "2024年12月20日",
        artworksCount: 0,
        wallSize: "2m × 1.5m",
        lighting: "LED照明",
        type: "会議室",
        image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200",
        images: ["https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200"],
        totalRevenue: 0,
        totalSales: 0,
        corporate_return_pending: false,
        artist_recall_pending: false,
    }
};
const MOCK_CURRENT_ARTWORKS: Record<string, any> = {
    "1": {
        id: 1,
        title: "青の記憶",
        artist: "山田 花子",
        image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400",
        price: "¥42,000",
        startDate: "2024年10月1日",
        days: 82,
        views: 124,
        ctr: 28.2,
        conversion: 4.8,
        status: "展示中",
        statusVariant: "displaying" as const,
    }
};
const notifications = [
    {
        id: 1,
        type: "sale",
        message: "「都市の夕暮れ」（鈴木 美咲）が販売されました",
        time: "2時間前",
        icon: "🎉"
    },
    {
        id: 2,
        type: "reminder",
        message: "「青の記憶」の展示から90日が経過しました。次の作品を選びましょう",
        time: "1日前",
        icon: "🕓"
    },
    {
        id: 3,
        type: "recommendation",
        message: "AIが新しいおすすめを4点追加しました",
        time: "2日前",
        icon: "🖼️"
    }
];
export function CorporateSpaceDetailPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { spaceId } = useParams();
    const { currentUser } = useAuth();
    const { canEdit } = useCorporateOrgRole();
    const [timePeriod, setTimePeriod] = useState("month");
    const historyRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    const [spaceData, setSpaceData] = useState<any>(MOCK_SPACES_DATA["1"]);
    const [currentArtwork, setCurrentArtwork] = useState<any>(null);
    const [pendingExhibitionArtwork, setPendingExhibitionArtwork] = useState<any>(null);
    const [confirmExhibitionLoading, setConfirmExhibitionLoading] = useState(false);
    const [markReturnShippedLoading, setMarkReturnShippedLoading] = useState(false);
    const [markRecallShippedLoading, setMarkRecallShippedLoading] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editedSpace, setEditedSpace] = useState<{
        name: string;
        address: string;
        facilityOverview: string;
    }>({ name: "", address: "", facilityOverview: "" });
    const [isSavingSpaceEdit, setIsSavingSpaceEdit] = useState(false);
    const [isDeletingSpace, setIsDeletingSpace] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [artworkPlacementArea, setArtworkPlacementArea] = useState<{
        x: number;
        y: number;
        width: number;
        height: number;
    } | null>(null);
    const [areaSelectionDialogOpen, setAreaSelectionDialogOpen] = useState(false);
    const [isAreaJustSaved, setIsAreaJustSaved] = useState(false);
    const [isLoadingSpaceDetail, setIsLoadingSpaceDetail] = useState(true);
    const [spaceQrInfo, setSpaceQrInfo] = useState<SpaceQRCodeResponse | null>(null);
    const [qrMetaLoading, setQrMetaLoading] = useState(false);
    const [qrGenerating, setQrGenerating] = useState(false);
    const [qrDownloading, setQrDownloading] = useState(false);
    const [manualArtworkDialogOpen, setManualArtworkDialogOpen] = useState(false);
    const [exhibitionHistoryItems, setExhibitionHistoryItems] = useState<SpaceArtworkHistoryItem[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [reDisplayTarget, setReDisplayTarget] = useState<SpaceArtworkHistoryItem | null>(null);
    const [reDisplaySubmitting, setReDisplaySubmitting] = useState(false);
    const [qrAnalytics, setQrAnalytics] = useState<QrAnalyticsResponse | null>(null);
    const [qrAnalyticsLoading, setQrAnalyticsLoading] = useState(false);
    const [qrAnalyticsError, setQrAnalyticsError] = useState<string | null>(null);
    const loadExhibitionHistory = useCallback(async () => {
        if (!spaceId ||
            !isUuidString(spaceId) ||
            !localStorage.getItem("mgj_access_token")) {
            setExhibitionHistoryItems([]);
            return;
        }
        setHistoryLoading(true);
        try {
            const res = await getSpaceArtworkHistory(spaceId);
            setExhibitionHistoryItems(res.assignments ?? []);
        }
        catch (e) {
            console.warn("getSpaceArtworkHistory failed", e);
            setExhibitionHistoryItems([]);
        }
        finally {
            setHistoryLoading(false);
        }
    }, [spaceId]);
    useEffect(() => {
        if (!spaceId || !isUuidString(spaceId)) {
            setQrAnalytics(null);
            setQrAnalyticsError(null);
            return;
        }
        if (typeof window === "undefined" ||
            !localStorage.getItem("mgj_access_token")) {
            setQrAnalytics(null);
            setQrAnalyticsError(null);
            return;
        }
        const qrId = spaceData?.qr_code_id as string | null | undefined;
        if (!qrId) {
            setQrAnalytics(null);
            setQrAnalyticsError(null);
            return;
        }
        const period = timePeriod as QrAnalyticsUiPeriod;
        if (period !== "week" && period !== "month" && period !== "quarter") {
            return;
        }
        let cancelled = false;
        setQrAnalyticsLoading(true);
        setQrAnalyticsError(null);
        getQrAnalytics(qrId, period)
            .then((data) => {
            if (!cancelled)
                setQrAnalytics(data);
        })
            .catch((e: unknown) => {
            if (!cancelled) {
                setQrAnalytics(null);
                setQrAnalyticsError(e instanceof Error ? e.message : "取得に失敗しました");
            }
        })
            .finally(() => {
            if (!cancelled)
                setQrAnalyticsLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [spaceId, spaceData?.qr_code_id, timePeriod]);
    const qrChartRows = useMemo(() => qrAnalyticsChartRows(qrAnalytics?.scans_by_day), [qrAnalytics]);
    const loggedInUuidSpace = Boolean(spaceId && isUuidString(spaceId)) &&
        Boolean(typeof window !== "undefined" && localStorage.getItem("mgj_access_token"));
    const canManageSpaceQr = loggedInUuidSpace;
    const canEditSpace = loggedInUuidSpace && canEdit;
    const canAssignArtwork = canEditSpace;
    const hasActiveExhibitionPipeline = Boolean(spaceData?.pending_exhibition_artwork_id ||
        spaceData?.pending_exhibition_assignment_id ||
        spaceData?.pending_exhibition_status === "pending" ||
        spaceData?.pending_exhibition_status === "approved" ||
        spaceData?.pending_exhibition_status === "in_transit");
    const spaceHasArtworkInvolvement = Boolean(spaceData?.current_artwork_id ||
        hasActiveExhibitionPipeline ||
        spaceData?.corporate_return_pending ||
        spaceData?.artist_recall_pending ||
        spaceData?.artist_recall_awaiting_artist_confirm ||
        (Boolean(spaceData?.active_return_request_id) &&
            spaceData?.active_return_request_status !== "completed" &&
            spaceData?.active_return_request_status !== "rejected"));
    const canRequestNewExhibition = canAssignArtwork && !spaceHasArtworkInvolvement;
    const artworkSelectionBlockedTitle = "このスペースに作品が割り当てられているか、展示・返送・回収の手続きが進行中のときは利用できません。";
    const canUseExhibitedArtworkActions = useMemo(() => {
        const wid = spaceData?.current_artwork_id;
        if (!wid || !currentArtwork)
            return false;
        if (loggedInUuidSpace) {
            if (historyLoading)
                return false;
            const row = exhibitionHistoryItems.find((it) => String(it.artwork_id) === String(wid));
            if (row)
                return row.assignment_status === "displaying";
            if (exhibitionHistoryItems.length === 0 && !hasActiveExhibitionPipeline) {
                return true;
            }
            return false;
        }
        return (currentArtwork.statusVariant === "displaying" ||
            currentArtwork.status === "展示中");
    }, [
        spaceData?.current_artwork_id,
        currentArtwork,
        loggedInUuidSpace,
        historyLoading,
        exhibitionHistoryItems,
        hasActiveExhibitionPipeline,
    ]);
    const exhibitedArtworkActionsDisabledTitle = "展示中（スペースに設置済み）の作品があるときのみ利用できます";
    const reloadSpaceAndDisplayedArtwork = useCallback(async () => {
        if (!spaceId ||
            !isUuidString(spaceId) ||
            !localStorage.getItem("mgj_access_token")) {
            return;
        }
        try {
            const s = await getSpace(spaceId);
            setSpaceData(mapSpaceResponseToDetailData(s));
            if (s.pending_exhibition_artwork_id) {
                try {
                    const pa = await artworkService.getArtwork(s.pending_exhibition_artwork_id);
                    setPendingExhibitionArtwork(artworkToCurrentDisplay(pa));
                }
                catch {
                    setPendingExhibitionArtwork(null);
                }
            }
            else {
                setPendingExhibitionArtwork(null);
            }
            if (s.current_artwork_id) {
                try {
                    const a = await artworkService.getArtwork(s.current_artwork_id);
                    setCurrentArtwork(artworkToCurrentDisplay(a));
                }
                catch {
                    setCurrentArtwork(null);
                }
            }
            else {
                setCurrentArtwork(null);
            }
            await loadExhibitionHistory();
        }
        catch (e) {
            console.error(e);
        }
    }, [spaceId, loadExhibitionHistory]);
    useRefreshOnInterval(() => {
        void reloadSpaceAndDisplayedArtwork();
    }, Boolean(loggedInUuidSpace &&
        !isLoadingSpaceDetail &&
        (spaceData?.pending_exhibition_artwork_id ||
            spaceData?.pending_exhibition_assignment_id ||
            spaceData?.pending_exhibition_status === "pending" ||
            spaceData?.pending_exhibition_status === "approved" ||
            spaceData?.pending_exhibition_status === "in_transit" ||
            spaceData?.artist_recall_pending ||
            spaceData?.artist_recall_awaiting_artist_confirm)), 45000);
    useEffect(() => {
        if (spaceHasArtworkInvolvement && manualArtworkDialogOpen) {
            setManualArtworkDialogOpen(false);
        }
    }, [spaceHasArtworkInvolvement, manualArtworkDialogOpen]);
    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            if (!spaceId) {
                setIsLoadingSpaceDetail(false);
                return;
            }
            setIsLoadingSpaceDetail(true);
            if (isUuidString(spaceId) &&
                localStorage.getItem("mgj_access_token")) {
                try {
                    const s = await getSpace(spaceId);
                    if (cancelled)
                        return;
                    setSpaceData(mapSpaceResponseToDetailData(s));
                    if (s.pending_exhibition_artwork_id) {
                        try {
                            const pa = await artworkService.getArtwork(s.pending_exhibition_artwork_id);
                            if (!cancelled)
                                setPendingExhibitionArtwork(artworkToCurrentDisplay(pa));
                        }
                        catch {
                            if (!cancelled)
                                setPendingExhibitionArtwork(null);
                        }
                    }
                    else {
                        if (!cancelled)
                            setPendingExhibitionArtwork(null);
                    }
                    if (s.current_artwork_id) {
                        try {
                            const a = await artworkService.getArtwork(s.current_artwork_id);
                            if (!cancelled)
                                setCurrentArtwork(artworkToCurrentDisplay(a));
                        }
                        catch {
                            if (!cancelled)
                                setCurrentArtwork(null);
                        }
                    }
                    else {
                        if (!cancelled)
                            setCurrentArtwork(null);
                    }
                    if (!cancelled)
                        await loadExhibitionHistory();
                    if (!cancelled)
                        setIsLoadingSpaceDetail(false);
                    return;
                }
                catch (e) {
                    console.warn("getSpace failed, falling back to cache", e);
                }
            }
            if (!cancelled)
                setExhibitionHistoryItems([]);
            if (cancelled)
                return;
            let space: any = null;
            let artwork: any = null;
            if (location.state?.space) {
                const stateSpace = location.state.space;
                const facilityOverview = [stateSpace.facilityType, stateSpace.subType].filter(Boolean).join(" / ") ||
                    stateSpace.facility_type ||
                    stateSpace.type ||
                    "未設定";
                const addr = stateSpace.address || stateSpace.location || "";
                space = {
                    id: stateSpace.id,
                    name: stateSpace.name,
                    location: addr,
                    address: addr,
                    facilityOverview,
                    registeredDate: stateSpace.registeredAt
                        ? new Date(stateSpace.registeredAt).toLocaleDateString("ja-JP")
                        : "",
                    lastUpdated: new Date().toLocaleDateString("ja-JP"),
                    artworksCount: stateSpace.currentArtwork ? 1 : 0,
                    wallSize: "未設定",
                    lighting: "未設定",
                    type: stateSpace.subType || stateSpace.facilityType || "未設定",
                    image: stateSpace.image ||
                        stateSpace.images?.[0] ||
                        DEFAULT_SPACE_IMAGE,
                    images: stateSpace.images ||
                        (stateSpace.image ? [stateSpace.image] : [DEFAULT_SPACE_IMAGE]),
                    totalRevenue: typeof stateSpace.totalRevenue === "string"
                        ? parseInt(stateSpace.totalRevenue.replace(/[^0-9]/g, ""), 10)
                        : stateSpace.totalRevenue || 0,
                    totalSales: stateSpace.totalSales || 0,
                };
                if (stateSpace.currentArtwork) {
                    artwork = {
                        id: stateSpace.currentArtwork.id,
                        title: stateSpace.currentArtwork.title,
                        artist: stateSpace.currentArtwork.artist,
                        image: stateSpace.currentArtwork.image,
                        price: stateSpace.currentArtwork.price,
                        startDate: stateSpace.currentArtwork.displayedSince,
                        days: Math.floor((new Date().getTime() -
                            new Date(stateSpace.currentArtwork.displayedSince).getTime()) /
                            (1000 * 60 * 60 * 24)),
                        views: stateSpace.currentArtwork.views || 0,
                        ctr: 0,
                        conversion: 0,
                        status: "展示中",
                        statusVariant: "displaying" as const,
                    };
                }
            }
            if (!space) {
                space = MOCK_SPACES_DATA[spaceId || "1"];
                artwork = MOCK_CURRENT_ARTWORKS[spaceId || "1"] || null;
                if (space && !space.facilityOverview) {
                    space = {
                        ...space,
                        facilityOverview: space.type ? `${space.type}` : "未設定",
                        address: space.address || space.location || "",
                    };
                }
            }
            if (!space) {
                const savedSpaces = JSON.parse(localStorage.getItem("mgj_registered_spaces") || "[]");
                const foundSpace = savedSpaces.find((s: any) => String(s.id) === String(spaceId));
                if (foundSpace) {
                    const fo = [foundSpace.facilityType, foundSpace.subType]
                        .filter(Boolean)
                        .join(" / ") ||
                        foundSpace.facility_type ||
                        "未設定";
                    const addr = foundSpace.address || foundSpace.location || "未設定";
                    space = {
                        id: foundSpace.id,
                        name: foundSpace.name || "未設定",
                        location: addr,
                        address: addr,
                        facilityOverview: fo,
                        registeredDate: foundSpace.registeredAt
                            ? new Date(foundSpace.registeredAt).toLocaleDateString("ja-JP")
                            : "",
                        lastUpdated: new Date().toLocaleDateString("ja-JP"),
                        artworksCount: 0,
                        wallSize: foundSpace.wallSize || "未設定",
                        lighting: foundSpace.lighting || "未設定",
                        type: foundSpace.subType || foundSpace.facilityType || "未設定",
                        image: foundSpace.image || foundSpace.images?.[0] || DEFAULT_SPACE_IMAGE,
                        images: foundSpace.images ||
                            (foundSpace.image ? [foundSpace.image] : [DEFAULT_SPACE_IMAGE]),
                        totalRevenue: 0,
                        totalSales: 0,
                    };
                }
            }
            if (!space) {
                space = {
                    ...MOCK_SPACES_DATA["1"],
                    facilityOverview: MOCK_SPACES_DATA["1"].type,
                    address: MOCK_SPACES_DATA["1"].address || MOCK_SPACES_DATA["1"].location,
                };
                artwork = MOCK_CURRENT_ARTWORKS["1"] || null;
            }
            if (!cancelled) {
                setSpaceData(space);
                setCurrentArtwork(artwork);
            }
            if (!cancelled)
                setIsLoadingSpaceDetail(false);
        };
        void load();
        return () => {
            cancelled = true;
        };
    }, [spaceId, location.state, location.key, currentUser, loadExhibitionHistory]);
    useEffect(() => {
        if (!canManageSpaceQr || isLoadingSpaceDetail || !spaceId) {
            setSpaceQrInfo(null);
            setQrMetaLoading(false);
            return;
        }
        let cancelled = false;
        const run = async () => {
            setQrMetaLoading(true);
            try {
                const qr = await getSpaceQRCode(spaceId);
                if (!cancelled)
                    setSpaceQrInfo(qr);
            }
            catch {
                if (!cancelled)
                    setSpaceQrInfo(null);
            }
            finally {
                if (!cancelled)
                    setQrMetaLoading(false);
            }
        };
        void run();
        return () => {
            cancelled = true;
        };
    }, [spaceId, canManageSpaceQr, isLoadingSpaceDetail]);
    useEffect(() => {
        if (!canManageSpaceQr || !spaceId || !isUuidString(spaceId))
            return;
        const refreshQrMeta = () => {
            if (document.visibilityState !== "visible")
                return;
            void (async () => {
                try {
                    const qr = await getSpaceQRCode(spaceId);
                    setSpaceQrInfo(qr);
                }
                catch {
                }
            })();
        };
        document.addEventListener("visibilitychange", refreshQrMeta);
        window.addEventListener("focus", refreshQrMeta);
        return () => {
            document.removeEventListener("visibilitychange", refreshQrMeta);
            window.removeEventListener("focus", refreshQrMeta);
        };
    }, [canManageSpaceQr, spaceId]);
    const handleGenerateSpaceQr = useCallback(async () => {
        if (!spaceId || !isUuidString(spaceId))
            return;
        if (!canEdit) {
            toast.error("この操作には編集者以上の権限が必要です。");
            return;
        }
        setQrGenerating(true);
        try {
            const qr = await generateSpaceQRCode(spaceId);
            setSpaceQrInfo(qr);
            toast.success("QRコードを発行しました");
        }
        catch (e) {
            console.error(e);
            toast.error(e instanceof Error ? e.message : "QRコードの発行に失敗しました");
        }
        finally {
            setQrGenerating(false);
        }
    }, [spaceId, canEdit]);
    const handleDownloadSpaceQr = useCallback(async () => {
        if (!spaceId || !isUuidString(spaceId))
            return;
        setQrDownloading(true);
        try {
            const blob = await downloadSpaceQRCodeImage(spaceId);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `qr-space-${spaceId.slice(0, 8)}.png`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success("QRコード画像をダウンロードしました");
        }
        catch (e) {
            console.error(e);
            toast.error(e instanceof Error ? e.message : "ダウンロードに失敗しました");
        }
        finally {
            setQrDownloading(false);
        }
    }, [spaceId]);
    const scrollToHistory = () => {
        historyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const handleConfirmReDisplay = useCallback(async () => {
        if (!spaceId || !isUuidString(spaceId) || !reDisplayTarget?.artwork_id) {
            return;
        }
        if (!canEdit) {
            toast.error("この操作には編集者以上の権限が必要です。");
            return;
        }
        setReDisplaySubmitting(true);
        try {
            const res = await assignSpaceArtwork(spaceId, {
                artwork_id: reDisplayTarget.artwork_id,
                assignment_reason: "展示履歴から再展示",
            });
            toast.success(res.message || "展示依頼を送信しました");
            setReDisplayTarget(null);
            await reloadSpaceAndDisplayedArtwork();
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : "再展示に失敗しました";
            toast.error(msg);
        }
        finally {
            setReDisplaySubmitting(false);
        }
    }, [spaceId, reDisplayTarget, reloadSpaceAndDisplayedArtwork, canEdit]);
    const handleAIProposal = () => {
        if (!canEdit) {
            toast.error("この操作には編集者以上の権限が必要です。");
            return;
        }
        if (spaceHasArtworkInvolvement) {
            toast.error("このスペースに作品が割り当てられているか、展示・返送・回収の手続きが進行中です。完了してから作品を選び直してください。");
            return;
        }
        if (!artworkPlacementArea) {
            toast.error("作品を飾る位置を指定してください");
            setAreaSelectionDialogOpen(true);
            return;
        }
        const params = new URLSearchParams({
            spaceName: spaceData.name,
            spaceImage: spaceData.images?.[selectedImageIndex] || spaceData.image || '',
            areaX: artworkPlacementArea.x.toString(),
            areaY: artworkPlacementArea.y.toString(),
            areaWidth: artworkPlacementArea.width.toString(),
            areaHeight: artworkPlacementArea.height.toString(),
            spaceId: spaceData.id
        });
        navigate(`/ai-artwork-preview?${params.toString()}`);
    };
    const handleConfirmExhibition = async () => {
        if (!canEdit) {
            toast.error("この操作には編集者以上の権限が必要です。");
            return;
        }
        const sid = spaceData?.id ?? spaceId;
        const assignmentId = spaceData?.pending_exhibition_assignment_id;
        if (!sid || !assignmentId)
            return;
        setConfirmExhibitionLoading(true);
        try {
            await confirmExhibitionDisplay(String(sid), String(assignmentId));
            toast.success("展示を開始しました");
            await reloadSpaceAndDisplayedArtwork();
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : "展示開始の確認に失敗しました";
            toast.error(msg);
        }
        finally {
            setConfirmExhibitionLoading(false);
        }
    };
    const handleMarkReturnShipped = useCallback(async () => {
        if (!spaceId || !isUuidString(spaceId))
            return;
        if (!canEdit) {
            toast.error("この操作には編集者以上の権限が必要です。");
            return;
        }
        setMarkReturnShippedLoading(true);
        try {
            const res = await markReturnRequestShipped(spaceId, {
                return_request_id: spaceData.active_return_request_id ?? undefined,
            });
            toast.success(res.message || "返送発送済みとして登録しました");
            await reloadSpaceAndDisplayedArtwork();
        }
        catch (e) {
            toast.error(e instanceof Error ? e.message : "登録に失敗しました");
        }
        finally {
            setMarkReturnShippedLoading(false);
        }
    }, [
        spaceId,
        canEdit,
        spaceData.active_return_request_id,
        reloadSpaceAndDisplayedArtwork,
    ]);
    const handleMarkRecallShipped = useCallback(async () => {
        if (!spaceId || !isUuidString(spaceId))
            return;
        if (!canEdit) {
            toast.error("この操作には編集者以上の権限が必要です。");
            return;
        }
        setMarkRecallShippedLoading(true);
        try {
            const res = await markRecallShipped(spaceId);
            toast.success(res.message || "回収向け発送済みとして登録しました");
            await reloadSpaceAndDisplayedArtwork();
        }
        catch (e) {
            toast.error(e instanceof Error ? e.message : "登録に失敗しました");
        }
        finally {
            setMarkRecallShippedLoading(false);
        }
    }, [spaceId, canEdit, reloadSpaceAndDisplayedArtwork]);
    const handleAreaSave = (area: {
        x: number;
        y: number;
        width: number;
        height: number;
    }) => {
        setArtworkPlacementArea(area);
        toast.success("作品配置エリアを設定しました", {
            description: "次はAIに作品を提案させましょう！",
            duration: 5000,
        });
        setIsAreaJustSaved(true);
        setTimeout(() => {
            setIsAreaJustSaved(false);
        }, 8000);
    };
    const handleEditSpace = () => {
        setEditedSpace({
            name: spaceData.name || "",
            address: spaceData.address || spaceData.location || "",
            facilityOverview: spaceData.facilityOverview || spaceData.type || "—",
        });
        setEditDialogOpen(true);
    };
    const handleSaveEdit = async () => {
        if (!canEdit) {
            toast.error("この操作には編集者以上の権限が必要です。");
            return;
        }
        const name = editedSpace.name.trim();
        const address = editedSpace.address.trim();
        if (!name) {
            toast.error("スペース名を入力してください");
            return;
        }
        if (!address) {
            toast.error("所在地を入力してください");
            return;
        }
        const idStr = String(spaceData.id);
        const looksLikeUuid = isUuidString(idStr);
        setIsSavingSpaceEdit(true);
        try {
            let next = {
                ...spaceData,
                name,
                address,
                location: address,
            };
            if (looksLikeUuid) {
                const updated = await updateSpaceApi(idStr, { name, address });
                next = {
                    ...mapSpaceResponseToDetailData(updated),
                    totalRevenue: spaceData.totalRevenue,
                    totalSales: spaceData.totalSales,
                };
            }
            setSpaceData(next);
            const raw = JSON.parse(localStorage.getItem("mgj_registered_spaces") || "[]");
            const idx = raw.findIndex((s: any) => String(s.id) === idStr);
            if (idx >= 0) {
                raw[idx] = { ...raw[idx], name, location: address };
                localStorage.setItem("mgj_registered_spaces", JSON.stringify(raw));
            }
            toast.success("スペース情報を更新しました");
            setEditDialogOpen(false);
        }
        catch (e) {
            console.error(e);
            toast.error(e instanceof Error ? e.message : "更新に失敗しました");
        }
        finally {
            setIsSavingSpaceEdit(false);
        }
    };
    const handleDeleteSpace = async () => {
        if (!canEdit) {
            toast.error("この操作には編集者以上の権限が必要です。");
            return;
        }
        const idStr = String(spaceId ?? spaceData?.id ?? "");
        if (!idStr) {
            toast.error("スペースIDが取得できません");
            return;
        }
        setIsDeletingSpace(true);
        try {
            if (isUuidString(idStr) && localStorage.getItem("mgj_access_token")) {
                await deleteSpaceApi(idStr);
            }
            try {
                const raw = JSON.parse(localStorage.getItem("mgj_registered_spaces") || "[]");
                const next = raw.filter((s: any) => String(s.id) !== idStr);
                localStorage.setItem("mgj_registered_spaces", JSON.stringify(next));
            }
            catch {
            }
            toast.success("スペースを削除しました");
            setDeleteDialogOpen(false);
            navigate("/corporate-dashboard");
        }
        catch (e) {
            console.error(e);
            toast.error(e instanceof Error ? e.message : "削除に失敗しました");
        }
        finally {
            setIsDeletingSpace(false);
        }
    };
    return (<div className="min-h-screen bg-gray-50">
      <Header />

      {isLoadingSpaceDetail && spaceId ? (<div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 pt-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" aria-hidden/>
          <p className="text-sm text-muted-foreground">スペース情報を読み込んでいます…</p>
        </div>) : (<>
      
      <div className="bg-white border-b pt-16">
        <div className="container mx-auto px-4 sm:px-6 py-3">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/corporate-dashboard">ダッシュボード</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/corporate-dashboard">スペース管理</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{spaceData.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
        </div>
      </div>

      
      <div className="container mx-auto px-4 sm:px-6 py-4">
        {(spaceData.corporate_return_pending || spaceData.artist_recall_pending) && (<div className="mb-4 space-y-2">
            {spaceData.corporate_return_pending && (<div className="flex flex-wrap items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950" role="status">
                <Truck className="w-5 h-5 shrink-0 text-amber-700 mt-0.5" aria-hidden/>
                <div>
                  <p className="font-semibold">返却申請が進行中です</p>
                  <p className="text-xs text-amber-900/90 mt-1">
                    このスペースの展示作品について、返送手続きが進んでいます。梱包・発送の準備を進めてください。
                  </p>
                </div>
              </div>)}
            {spaceData.artist_recall_pending && (<div className="flex flex-wrap items-start gap-3 rounded-lg border border-blue-300 bg-blue-50 px-4 py-3 text-sm text-blue-950" role="status">
                <Package className="w-5 h-5 shrink-0 text-blue-700 mt-0.5" aria-hidden/>
                <div>
                  <p className="font-semibold">アーティストが回収を依頼しています</p>
                  <p className="text-xs text-blue-900/90 mt-1">
                    作品の返送・返却対応が必要です。ご連絡までにご対応ください。
                  </p>
                </div>
              </div>)}
          </div>)}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between flex-col sm:flex-row gap-3 sm:gap-0">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <Home className="w-5 h-5 sm:w-6 sm:h-6 text-primary"/>
                        {spaceData.name}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        {spaceData.facilityOverview || spaceData.type} • {spaceData.location}
                      </CardDescription>
                    </div>
                    {canEditSpace ? (<div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleEditSpace} className="gap-2">
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4"/>
                          <span className="text-xs sm:text-sm">編集</span>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setDeleteDialogOpen(true)} className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4"/>
                          <span className="text-xs sm:text-sm">削除</span>
                        </Button>
                      </div>) : null}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  {spaceData.images && spaceData.images.length > 1 ? (<div className="space-y-3">
                      
                      <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-100 group">
                        <AnimatePresence mode="wait">
                          <motion.div key={selectedImageIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="w-full h-full">
                            <ImageWithFallback src={spaceData.images[selectedImageIndex]} alt={`${spaceData.name} - ${selectedImageIndex + 1}`} className="w-full h-full object-cover"/>
                          </motion.div>
                        </AnimatePresence>
                        
                        
                        {artworkPlacementArea && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute border-4 border-accent border-dashed bg-accent/10 backdrop-blur-sm" style={{
                        left: `${artworkPlacementArea.x}%`,
                        top: `${artworkPlacementArea.y}%`,
                        width: `${artworkPlacementArea.width}%`,
                        height: `${artworkPlacementArea.height}%`,
                    }}>
                            <div className="absolute -top-6 sm:-top-8 left-0 bg-accent text-white px-2 sm:px-3 py-1 rounded-md text-[10px] sm:text-xs shadow-lg whitespace-nowrap">
                              <Frame className="w-2 h-2 sm:w-3 sm:h-3 inline mr-1"/>
                              作品配置エリア
                            </div>
                          </motion.div>)}
                        
                        
                        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm backdrop-blur-sm flex items-center gap-1.5">
                          <Image className="w-3 h-3 sm:w-3.5 sm:h-3.5"/>
                          {selectedImageIndex + 1} / {spaceData.images.length}
                        </div>

                        
                        {canEditSpace ? (<Button onClick={() => setAreaSelectionDialogOpen(true)} className="absolute bottom-4 left-4 bg-white/90 hover:bg-white text-gray-800 backdrop-blur-sm shadow-lg gap-2 text-xs sm:text-sm" size="sm">
                            <Frame className="w-3 h-3 sm:w-4 sm:h-4"/>
                            <span className="hidden sm:inline">{artworkPlacementArea ? "配置エリアを変更" : "作品を展示するエリアを指定"}</span>
                            <span className="sm:hidden">エリア指定</span>
                          </Button>) : null}
                        
                        
                        {spaceData.images.length > 1 && (<>
                            {selectedImageIndex > 0 && (<button onClick={() => setSelectedImageIndex(selectedImageIndex - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100">
                                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5"/>
                              </button>)}
                            {selectedImageIndex < spaceData.images.length - 1 && (<button onClick={() => setSelectedImageIndex(selectedImageIndex + 1)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100">
                                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5"/>
                              </button>)}
                          </>)}
                      </div>
                      
                      
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {spaceData.images.map((img: string, index: number) => (<motion.button key={index} onClick={() => setSelectedImageIndex(index)} className={`relative flex-shrink-0 w-20 h-14 sm:w-24 sm:h-16 overflow-hidden rounded-lg transition-all ${selectedImageIndex === index
                        ? 'ring-2 sm:ring-3 ring-primary ring-offset-2 scale-105'
                        : 'ring-2 ring-gray-200 hover:ring-primary/50 opacity-70 hover:opacity-100'}`} whileHover={{ scale: selectedImageIndex === index ? 1.05 : 1.02 }} whileTap={{ scale: 0.98 }}>
                            <ImageWithFallback src={img} alt={`${spaceData.name} サムネイル ${index + 1}`} className="w-full h-full object-cover"/>
                            {selectedImageIndex === index && (<motion.div layoutId="selected-indicator" className="absolute inset-0 border-2 border-primary rounded-lg" initial={false} transition={{ type: "spring", stiffness: 500, damping: 30 }}/>)}
                          </motion.button>))}
                      </div>
                    </div>) : (<div className="relative aspect-video overflow-hidden rounded-xl bg-gray-100 group">
                      <ImageWithFallback src={spaceData.image} alt={spaceData.name} className="w-full h-full object-cover"/>
                      
                      
                      {artworkPlacementArea && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute border-4 border-accent border-dashed bg-accent/10 backdrop-blur-sm" style={{
                        left: `${artworkPlacementArea.x}%`,
                        top: `${artworkPlacementArea.y}%`,
                        width: `${artworkPlacementArea.width}%`,
                        height: `${artworkPlacementArea.height}%`,
                    }}>
                          <div className="absolute -top-6 sm:-top-8 left-0 bg-accent text-white px-2 sm:px-3 py-1 rounded-md text-[10px] sm:text-xs shadow-lg whitespace-nowrap">
                            <Frame className="w-2 h-2 sm:w-3 sm:h-3 inline mr-1"/>
                            作品配置エリア
                          </div>
                        </motion.div>)}
                      
                      
                      <Button onClick={() => setAreaSelectionDialogOpen(true)} className="absolute bottom-4 left-4 bg-white/90 hover:bg-white text-gray-800 backdrop-blur-sm shadow-lg gap-2 text-xs sm:text-sm" size="sm">
                        <Frame className="w-3 h-3 sm:w-4 sm:h-4"/>
                        <span className="hidden sm:inline">{artworkPlacementArea ? "配置エリアを変更" : "作品を展示するエリアを指定"}</span>
                        <span className="sm:hidden">エリア指定</span>
                      </Button>
                    </div>)}
                  
                  
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">登録日</p>
                      <p className="text-xs sm:text-sm text-gray-700">{spaceData.registeredDate}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <p className="text-xs text-gray-500 mb-1">累計売上</p>
                      <p className="text-sm sm:text-base text-green-700">¥{spaceData.totalRevenue.toLocaleString()}</p>
                    </div>
                  </div>

                  
                  <div className="rounded-xl border border-border/70 bg-muted/25 p-4 sm:p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-primary shrink-0"/>
                      <h3 className="font-semibold text-sm sm:text-base">
                        スペース用QRコード
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      スペース登録後、ここからQRを発行できます。高解像度画像を印刷して設置すると、来場者は現在展示中の作品ページへ誘導されます（作品を入れ替えても同じQRのままです）。
                    </p>
                    {!loggedInUuidSpace ? (<p className="text-xs text-muted-foreground">
                        ログイン済みの登録スペースでのみQRコードを発行・表示できます。
                      </p>) : qrMetaLoading ? (<div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden/>
                        QR情報を読み込んでいます…
                      </div>) : spaceQrInfo ? (<div className="flex flex-col sm:flex-row gap-4 items-start pt-1">
                        <div className="bg-white p-3 rounded-lg border shadow-sm shrink-0 mx-auto sm:mx-0">
                          <img src={spaceQrInfo.qr_code_url} alt="スペースQRコード" className="w-36 h-36 sm:w-40 sm:h-40 object-contain"/>
                        </div>
                        <div className="space-y-3 flex-1 w-full min-w-0">
                          <div className="space-y-1">
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">
                                スペースQRの累計スキャン
                              </span>
                              ：{" "}
                              <span className="font-medium text-foreground tabular-nums">
                                {spaceQrInfo.total_scans}
                              </span>
                            </p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground leading-snug">
                              このQRを読み取って遷移した回数のみ（作品ページの全閲覧数とは別です）
                            </p>
                          </div>
                          <Button type="button" variant="outline" size="sm" className="gap-2 w-full sm:w-auto" disabled={qrDownloading} onClick={() => void handleDownloadSpaceQr()}>
                            {qrDownloading ? (<Loader2 className="w-4 h-4 animate-spin"/>) : (<Download className="w-4 h-4"/>)}
                            高解像度PNGをダウンロード
                          </Button>
                        </div>
                      </div>) : canEditSpace ? (<Button type="button" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 gap-2" disabled={qrGenerating} onClick={() => void handleGenerateSpaceQr()}>
                        {qrGenerating ? (<>
                            <Loader2 className="w-4 h-4 animate-spin"/>
                            発行中…
                          </>) : (<>
                            <QrCode className="w-4 h-4"/>
                            QRコードを発行
                          </>)}
                      </Button>) : (<p className="text-xs text-muted-foreground">
                        QRコードの発行は編集者以上の権限が必要です。閲覧者はダウンロードのみ（発行済みの場合）が可能です。
                      </p>)}
                  </div>

                  
                  <div className="pt-4 relative">
                    
                    <AnimatePresence>
                      {isAreaJustSaved && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                          <Badge className="bg-accent text-white border-0 shadow-lg px-2 sm:px-3 py-1 animate-bounce text-xs sm:text-sm">
                            👇 次のステップ
                          </Badge>
                        </motion.div>)}
                    </AnimatePresence>
                    
                    <motion.div animate={isAreaJustSaved ? {
                scale: [1, 1.05, 1],
                boxShadow: [
                    "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    "0 20px 25px -5px rgba(217, 119, 6, 0.3)",
                    "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                ]
            } : {}} transition={{
                duration: 2,
                repeat: isAreaJustSaved ? Infinity : 0,
                repeatType: "loop"
            }}>
                      {canEditSpace ? (<Button disabled={!canRequestNewExhibition} title={!canRequestNewExhibition
                    ? artworkSelectionBlockedTitle
                    : undefined} className={`w-full bg-gradient-to-r from-accent to-purple-500 hover:from-accent/90 hover:to-purple-600 text-white h-10 sm:h-12 shadow-lg hover:shadow-xl transition-all text-sm sm:text-base disabled:opacity-50 ${isAreaJustSaved ? 'ring-4 ring-accent/50 ring-offset-2' : ''}`} onClick={handleAIProposal}>
                          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2"/>
                          AIに作品を提案させる
                        </Button>) : null}
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {pendingExhibitionArtwork &&
                spaceData.pending_exhibition_status &&
                (spaceData.pending_exhibition_status === "pending" ||
                    spaceData.pending_exhibition_status === "approved" ||
                    spaceData.pending_exhibition_status === "in_transit") && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }} className="mb-6">
                <Card className="border-amber-200 bg-amber-50/60">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">展示の準備中</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      {spaceData.pending_exhibition_status === "pending"
                    ? "展示依頼を送信済みです。アーティストの発送をお待ちください。"
                    : spaceData.pending_exhibition_status === "approved"
                        ? "展示依頼が承認されました。次の手続きに進みます。"
                        : "作品が発送されました。受領後に展示開始を確認してください。"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border bg-white/80">
                      <div className="w-full sm:w-28 h-40 sm:h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 mx-auto sm:mx-0">
                        <ImageWithFallback src={pendingExhibitionArtwork.image} alt={pendingExhibitionArtwork.title} className="w-full h-full object-cover"/>
                      </div>
                      <div className="flex-grow min-w-0 space-y-2">
                        <h3 className="text-base font-medium text-primary">
                          {pendingExhibitionArtwork.title}
                        </h3>
                        <p className="text-xs text-gray-600">{pendingExhibitionArtwork.artist}</p>
                        <Badge variant="outline" className="w-fit border-amber-300 text-amber-900">
                          {assignmentStatusLabel(spaceData.pending_exhibition_status)}
                        </Badge>
                      </div>
                    </div>
                    {spaceData.pending_exhibition_status === "in_transit" &&
                    canEdit &&
                    spaceData.pending_exhibition_has_outbound_shipment && (<Button type="button" className="w-full sm:w-auto bg-primary hover:bg-primary/90" disabled={confirmExhibitionLoading} onClick={() => void handleConfirmExhibition()}>
                        {confirmExhibitionLoading ? (<Loader2 className="w-4 h-4 animate-spin mr-2"/>) : (<Package className="w-4 h-4 mr-2"/>)}
                        受領済み — 展示を開始する
                      </Button>)}
                    {spaceData.pending_exhibition_status === "in_transit" &&
                    canEdit &&
                    !spaceData.pending_exhibition_has_outbound_shipment && (<p className="text-xs text-amber-900/90">
                        発送レコード（モック含む）がまだありません。アーティストが「発送済み」を登録してから受領・展示開始ができます。
                      </p>)}
                    {spaceData.pending_exhibition_status === "pending" && (<p className="text-xs text-amber-900/90">
                        この作品はまだ「展示中」としてカウントされません。発送・受領確認後に表示されます。
                      </p>)}
                  </CardContent>
                </Card>
              </motion.div>)}

            {spaceData.active_return_request_id &&
                (spaceData.active_return_request_status === "pending" ||
                    spaceData.active_return_request_status === "approved") &&
                currentArtwork && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.06 }} className="mb-6">
                  <Card className="border-rose-200 bg-rose-50/70">
                    <CardHeader>
                      <CardTitle className="text-lg sm:text-xl">
                        返却 — 作品をアーティストへ発送
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        返却申請が有効です。実際に発送したら「発送済みにする」を押してください。アーティストが受領確認後、手続きが完了します。
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border border-rose-200/80 bg-white/90">
                        <div className="w-full sm:w-28 h-40 sm:h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 mx-auto sm:mx-0">
                          <ImageWithFallback src={currentArtwork.image} alt={currentArtwork.title} className="w-full h-full object-cover"/>
                        </div>
                        <div className="flex-grow min-w-0 space-y-2">
                          <h3 className="text-base font-medium text-primary">
                            {currentArtwork.title}
                          </h3>
                          <p className="text-xs text-gray-600">{currentArtwork.artist}</p>
                          <Badge variant="outline" className="w-fit border-rose-300 text-rose-900">
                            {assignmentStatusLabel(spaceData.active_return_request_status || "pending")}
                          </Badge>
                        </div>
                      </div>
                      {canEdit ? (<Button type="button" className="w-full sm:w-auto bg-rose-700 hover:bg-rose-800 text-white" disabled={markReturnShippedLoading} onClick={() => void handleMarkReturnShipped()}>
                          {markReturnShippedLoading ? (<Loader2 className="w-4 h-4 animate-spin mr-2"/>) : (<Truck className="w-4 h-4 mr-2"/>)}
                          返送を発送済みにする
                        </Button>) : null}
                    </CardContent>
                  </Card>
                </motion.div>)}

            {spaceData.active_return_request_status === "in_transit" && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.06 }} className="mb-6">
                <Card className="border-amber-200 bg-amber-50/60">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">
                      返却 — アーティスト受領待ち
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      返送を発送済みとして登録しました。アーティストが作品を受領・確認するまでお待ちください。
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>)}

            {spaceData.artist_recall_pending && currentArtwork && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.06 }} className="mb-6">
                <Card className="border-blue-200 bg-blue-50/80">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">
                      回収依頼 — 作品をアーティストへ発送
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      アーティストが回収を依頼しています。実際に発送したら「回収向け発送済みにする」を押してください。アーティストが受領確認後、手続きが完了します。
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border border-blue-200/80 bg-white/90">
                      <div className="w-full sm:w-28 h-40 sm:h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 mx-auto sm:mx-0">
                        <ImageWithFallback src={currentArtwork.image} alt={currentArtwork.title} className="w-full h-full object-cover"/>
                      </div>
                      <div className="flex-grow min-w-0 space-y-2">
                        <h3 className="text-base font-medium text-primary">
                          {currentArtwork.title}
                        </h3>
                        <p className="text-xs text-gray-600">{currentArtwork.artist}</p>
                        <Badge variant="outline" className="w-fit border-blue-400 text-blue-950">
                          回収依頼中
                        </Badge>
                      </div>
                    </div>
                    {canEdit ? (<Button type="button" className="w-full sm:w-auto bg-blue-800 hover:bg-blue-900 text-white" disabled={markRecallShippedLoading} onClick={() => void handleMarkRecallShipped()}>
                        {markRecallShippedLoading ? (<Loader2 className="w-4 h-4 animate-spin mr-2"/>) : (<Truck className="w-4 h-4 mr-2"/>)}
                        回収向け発送済みにする
                      </Button>) : null}
                  </CardContent>
                </Card>
              </motion.div>)}

            {spaceData.artist_recall_awaiting_artist_confirm && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.06 }} className="mb-6">
                <Card className="border-sky-200 bg-sky-50/70">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">
                      回収 — アーティスト受領待ち
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      回収向け返送を発送済みとして登録しました。アーティストが作品を受領・確認するまでお待ちください。
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>)}

            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between flex-col sm:flex-row gap-3 sm:gap-0">
                    <div>
                      <CardTitle className="text-lg sm:text-xl">現在の作品</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        {currentArtwork?.statusVariant === "in_transit"
                ? "返送手続き中の作品です（法人からの発送後、受領確認まで）。"
                : "作品のパフォーマンスデータ"}
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={scrollToHistory} className="w-full sm:w-auto">
                      <span className="text-xs sm:text-sm">展示履歴を見る</span>
                      <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 ml-2"/>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentArtwork ? (<motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border hover:shadow-lg transition-all">
                        <div className="w-full sm:w-32 h-48 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 mx-auto sm:mx-0">
                          <ImageWithFallback src={currentArtwork.image} alt={currentArtwork.title} className="w-full h-full object-cover"/>
                        </div>
                        <div className="flex-grow min-w-0 flex flex-col">
                          <div className="flex items-start justify-between mb-3 flex-col sm:flex-row gap-2 sm:gap-3">
                            <div className="min-w-0">
                              <h3 className="text-base sm:text-lg text-primary mb-1">{currentArtwork.title}</h3>
                              <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2 mb-1">
                                <Users className="w-3 h-3 shrink-0"/>
                                {currentArtwork.artist}
                              </p>
                              <p className="text-xs text-gray-500">
                                展示開始：{currentArtwork.startDate} （{currentArtwork.days}日経過）
                              </p>
                              <p className="text-sm sm:text-base text-accent mt-1">{currentArtwork.price}</p>
                            </div>
                            <Badge className={`w-fit shrink-0 border ${badgeClassForArtworkStatusVariant(currentArtwork.statusVariant ?? "displaying")}`}>
                              {currentArtwork.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className={canAssignArtwork || canEditSpace
                    ? "grid w-full max-w-2xl mx-auto grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5 sm:items-stretch"
                    : "grid w-full max-w-2xl mx-auto grid-cols-1 gap-2"}>
                        {canAssignArtwork && (<Button type="button" size="sm" variant="outline" disabled={!canRequestNewExhibition} title={!canRequestNewExhibition
                        ? artworkSelectionBlockedTitle
                        : undefined} className="w-full h-9 sm:h-9 justify-center text-[11px] sm:text-xs px-3 border-gray-200 bg-gray-50/80 hover:bg-gray-100 disabled:opacity-50" onClick={() => {
                        if (!canRequestNewExhibition)
                            return;
                        setManualArtworkDialogOpen(true);
                    }}>
                            手動で作品を選ぶ
                          </Button>)}
                        {canEditSpace && (<Button type="button" size="sm" disabled={!canRequestNewExhibition} title={!canRequestNewExhibition
                        ? artworkSelectionBlockedTitle
                        : undefined} className="w-full h-9 sm:h-9 justify-center text-[11px] sm:text-xs px-3 bg-gradient-to-r from-accent to-purple-500 hover:from-accent/90 hover:to-purple-600 text-white disabled:opacity-50" onClick={handleAIProposal}>
                            <Sparkles className="w-3 h-3 mr-1.5 shrink-0"/>
                            AIに別の作品を提案させる
                          </Button>)}
                      </div>
                    </motion.div>) : (<div className="p-6 sm:p-8 text-center border-2 border-dashed rounded-lg bg-gray-50">
                      <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-400 mb-3"/>
                      <p className="text-sm sm:text-base text-gray-600 mb-4">現在展示中の作品はありません</p>
                      <div className={canAssignArtwork || canEditSpace
                    ? "grid w-full max-w-2xl mx-auto grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 sm:items-stretch"
                    : "grid w-full max-w-2xl mx-auto grid-cols-1 gap-2"}>
                        {canAssignArtwork && (<Button type="button" variant="outline" disabled={!canRequestNewExhibition} title={!canRequestNewExhibition
                        ? artworkSelectionBlockedTitle
                        : undefined} className="w-full h-9 sm:h-9 justify-center text-[11px] sm:text-xs px-3 border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50" onClick={() => {
                        if (!canRequestNewExhibition)
                            return;
                        setManualArtworkDialogOpen(true);
                    }}>
                            手動で作品を選ぶ
                          </Button>)}
                        {canEditSpace && (<Button type="button" disabled={!canRequestNewExhibition} title={!canRequestNewExhibition
                        ? artworkSelectionBlockedTitle
                        : undefined} className="w-full h-9 sm:h-9 justify-center text-[11px] sm:text-xs px-3 bg-gradient-to-r from-accent to-purple-500 hover:from-accent/90 hover:to-purple-600 text-white disabled:opacity-50" onClick={handleAIProposal}>
                            <Sparkles className="w-3 h-3 mr-1.5 shrink-0"/>
                            AIに作品を提案させる
                          </Button>)}
                      </div>
                    </div>)}
                </CardContent>
              </Card>
            </motion.div>

            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
              <Card>
                <CardHeader>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <CardTitle className="text-lg sm:text-xl">閲覧データとトレンド分析</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        QRコード読み取り時にサーバーへ記録されたスキャン数の推移です（作品ページの閲覧数とは別指標です）。
                      </CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 w-full sm:w-auto">
                      {canEditSpace && canRequestNewExhibition ? (<Button type="button" size="sm" className="w-full sm:w-auto justify-center h-9 sm:h-9 text-[11px] sm:text-xs px-3 bg-gradient-to-r from-accent to-purple-500 hover:from-accent/90 hover:to-purple-600 text-white" onClick={handleAIProposal}>
                          <Sparkles className="w-3 h-3 mr-1.5 shrink-0"/>
                          AIに作品を提案する
                        </Button>) : null}
                      <Select value={timePeriod} onValueChange={setTimePeriod}>
                        <SelectTrigger className="w-full sm:w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="week">週次</SelectItem>
                          <SelectItem value="month">月次</SelectItem>
                          <SelectItem value="quarter">四半期</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {!spaceData?.qr_code_id ? (<p className="text-sm text-muted-foreground py-8 text-center px-2">
                      このスペースにQRコードがまだありません。ページ内の「QRコード」から発行すると、ここにスキャン数の推移が表示されます。
                    </p>) : qrAnalyticsLoading ? (<div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                      <Loader2 className="w-9 h-9 animate-spin" aria-hidden/>
                      <span className="text-sm">分析データを読み込んでいます…</span>
                    </div>) : qrAnalyticsError ? (<p className="text-sm text-destructive py-8 text-center px-2">
                      {qrAnalyticsError}
                    </p>) : (<>
                      <div className="w-full h-[250px] sm:h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={qrChartRows}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                            <XAxis dataKey="label" stroke="#888" tick={{ fontSize: 10 }} interval={timePeriod === "quarter"
                    ? 6
                    : timePeriod === "month"
                        ? 2
                        : 0} angle={timePeriod === "quarter" ? -32 : 0} textAnchor={timePeriod === "quarter" ? "end" : "middle"} height={timePeriod === "quarter" ? 52 : 28}/>
                            <YAxis stroke="#888" allowDecimals={false} width={40}/>
                            <Tooltip contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                }} formatter={(value: number | undefined) => [
                    `${value ?? 0} 回`,
                    "QRスキャン",
                ]} labelFormatter={(_, payload) => {
                    const row = payload?.[0]?.payload as {
                        date?: string;
                    } | undefined;
                    return row?.date ? `日付: ${row.date}` : "";
                }}/>
                            <Line type="monotone" dataKey="scans" stroke="#3b82f6" strokeWidth={2} name="QRスキャン数" dot={{ r: 3 }} connectNulls/>
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      {qrAnalytics && (<>
                          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground border-t pt-3">
                            <span>
                              モバイル: {qrAnalytics.device_breakdown?.mobile ?? 0}
                            </span>
                            <span>
                              デスクトップ:{" "}
                              {qrAnalytics.device_breakdown?.desktop ?? 0}
                            </span>
                            <span>
                              その他: {qrAnalytics.device_breakdown?.unknown ?? 0}
                            </span>
                          </div>

                          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-accent/5 border border-accent/20 rounded-lg">
                            <div className="flex items-start gap-2">
                              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0 mt-0.5"/>
                              <div className="min-w-0 space-y-1">
                                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                                  <span className="text-accent font-medium">
                                    AIによる分析：
                                  </span>{" "}
                                  {buildQrAnalyticsSummary(qrAnalytics, timePeriod as QrAnalyticsUiPeriod)}
                                </p>
                                <p className="text-[11px] sm:text-xs text-muted-foreground">
                                  ※
                                  上記はQRスキャンの記録データから自動生成した要約です（大規模言語モデルによる文章生成ではありません）。
                                </p>
                              </div>
                            </div>
                          </div>
                        </>)}
                    </>)}
                </CardContent>
              </Card>
            </motion.div>

            
            <motion.div ref={historyRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">展示履歴</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">過去の展示・販売データ</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {historyLoading ? (<div className="flex items-center justify-center gap-2 py-10 text-gray-600">
                      <Loader2 className="w-5 h-5 animate-spin"/>
                      <span className="text-sm">読み込み中…</span>
                    </div>) : exhibitionHistoryItems.length === 0 ? (<p className="text-sm text-gray-600 text-center py-8">
                      まだ展示履歴がありません。作品を割り当てると、ここに記録されます。
                    </p>) : (exhibitionHistoryItems.map((item, index) => {
                const sold = item.artwork_status === "sold";
                const img = item.main_image_url ||
                    item.artwork?.main_image_url ||
                    DEFAULT_SPACE_IMAGE;
                const revenue = sold && item.price != null
                    ? Math.round(Number(item.price))
                    : 0;
                const showReDisplay = canRequestNewExhibition &&
                    !sold &&
                    item.assignment_status !== "displaying";
                return (<motion.div key={item.assignment_id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.05 * index }} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:shadow-md transition-all">
                          <div className="w-full sm:w-20 h-32 sm:h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <ImageWithFallback src={img} alt={item.title || "作品"} className="w-full h-full object-cover"/>
                          </div>
                          <div className="flex-grow min-w-0">
                            <h3 className="text-base sm:text-lg text-primary mb-1 truncate">
                              {item.title || "（無題）"}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 mb-1">
                              {item.artist_name || "—"}
                            </p>
                            <p className="text-xs text-gray-500 mb-1">
                              {formatDisplayPeriod(item)}
                            </p>
                            {item.scan_count > 0 && (<p className="text-xs text-gray-400">
                                QRスキャン {item.scan_count} 回
                              </p>)}
                          </div>
                          <div className="text-left sm:text-right w-full sm:w-auto flex flex-col gap-2 items-start sm:items-end">
                            <Badge variant="outline" className={item.assignment_status === "displaying"
                        ? "border-green-200 bg-green-50 text-green-800"
                        : ""}>
                              {assignmentStatusLabel(item.assignment_status)}
                            </Badge>
                            {sold ? (<>
                                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                  販売済
                                </Badge>
                                {revenue > 0 && (<p className="text-sm text-accent">
                                    ¥{revenue.toLocaleString("ja-JP")}
                                  </p>)}
                              </>) : (<>
                                <Badge variant="secondary" className="font-normal">
                                  展示のみ
                                </Badge>
                                {showReDisplay && (<Button type="button" variant="ghost" size="sm" className="h-auto py-1" onClick={() => setReDisplayTarget(item)}>
                                    <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-2"/>
                                    <span className="text-xs sm:text-sm">
                                      再展示する
                                    </span>
                                  </Button>)}
                              </>)}
                          </div>
                        </motion.div>);
            }))}
                </CardContent>
              </Card>
            </motion.div>

            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">管理アクション</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">スペースに関する操作</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    {canEditSpace ? (<Button variant="outline" className="h-auto py-3 sm:py-4 flex-col gap-2" disabled={!canUseExhibitedArtworkActions} title={!canUseExhibitedArtworkActions
                    ? exhibitedArtworkActionsDisabledTitle
                    : undefined} onClick={() => {
                    if (!canUseExhibitedArtworkActions)
                        return;
                    navigate(`/artwork-return-request/${spaceId}`);
                }}>
                        <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6"/>
                        <span className="text-xs sm:text-sm">作品の返却を申請</span>
                      </Button>) : null}
                    <Button variant="outline" className="h-auto py-3 sm:py-4 flex-col gap-2" onClick={() => navigate("/corporate-dashboard#shipping")}>
                      <Package className="w-5 h-5 sm:w-6 sm:h-6"/>
                      <span className="text-xs sm:text-sm">配送状況を確認</span>
                    </Button>
                    {canEditSpace ? (<Button variant="outline" className="h-auto py-3 sm:py-4 flex-col gap-2" disabled={!canUseExhibitedArtworkActions} title={!canUseExhibitedArtworkActions
                    ? exhibitedArtworkActionsDisabledTitle
                    : undefined} onClick={() => {
                    if (!canUseExhibitedArtworkActions)
                        return;
                    navigate(`/artwork-issue-report/${spaceId}`);
                }}>
                        <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6"/>
                        <span className="text-xs sm:text-sm">破損・不具合を報告</span>
                      </Button>) : null}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          
          <div className="space-y-4 sm:space-y-6">
            
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.7 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-accent"/>
                    通知
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {notifications.map((notification, index) => (<motion.div key={notification.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }} className="p-3 bg-gray-50 rounded-lg border hover:shadow-md transition-all cursor-pointer">
                      <div className="flex items-start gap-2">
                        <span className="text-base sm:text-lg flex-shrink-0">{notification.icon}</span>
                        <div className="flex-grow">
                          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500">{notification.time}</p>
                        </div>
                      </div>
                    </motion.div>))}
                  <Button variant="ghost" className="w-full text-xs sm:text-sm" size="sm">
                    すべて表示
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1"/>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.8 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">クイックリンク</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link to="/corporate-profile?tab=payment">
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      <Wallet className="w-3 h-3 sm:w-4 sm:h-4 mr-2"/>
                      <span className="text-xs sm:text-sm">報酬受取設定</span>
                      <ExternalLink className="w-3 h-3 ml-auto"/>
                    </Button>
                  </Link>
                  <Link to="/corporate-sales-history">
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-2"/>
                      <span className="text-xs sm:text-sm">売上履歴</span>
                      <ExternalLink className="w-3 h-3 ml-auto"/>
                    </Button>
                  </Link>
                  <Button variant="ghost" className="w-full justify-start" size="sm" onClick={() => navigate("/corporate-dashboard#support")}>
                    <LifeBuoy className="w-3 h-3 sm:w-4 sm:h-4 mr-2"/>
                    <span className="text-xs sm:text-sm">問い合わせ</span>
                    <ExternalLink className="w-3 h-3 ml-auto"/>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        
        <div className="mt-6 sm:mt-8">
          <Button variant="outline" onClick={() => navigate("/corporate-dashboard")} className="gap-2 text-xs sm:text-sm">
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4"/>
            ダッシュボードに戻る
          </Button>
        </div>
      </div>

      <Footer />

      
      <Dialog open={editDialogOpen} onOpenChange={(open) => {
                if (!open && isSavingSpaceEdit)
                    return;
                setEditDialogOpen(open);
            }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto sm:rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-primary"/>
              スペース情報の編集
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-left">
              スペース名と所在地を変更できます。施設概要は登録時の内容のため変更できません。
            </DialogDescription>
          </DialogHeader>

          <form id="corporate-space-edit-form" onSubmit={(e) => {
                e.preventDefault();
                void handleSaveEdit();
            }} className="flex flex-col gap-0">
            <div className="space-y-5 sm:space-y-6 py-2">
              <div className="space-y-2">
                <Label htmlFor="space-name-edit" className="text-sm text-foreground">
                  スペース名（自分用）
                </Label>
                <Input id="space-name-edit" value={editedSpace.name} onChange={(e) => setEditedSpace({ ...editedSpace, name: e.target.value })} placeholder="例：1階エントランス" className={AUTH_INPUT_CLASS} autoComplete="off"/>
              </div>

              <div className="space-y-2">
                <Label htmlFor="facility-overview-ro" className="text-sm text-foreground">
                  施設概要
                </Label>
                <Input id="facility-overview-ro" readOnly tabIndex={-1} value={editedSpace.facilityOverview} className={AUTH_INPUT_READONLY_CLASS} aria-readonly="true"/>
                <p className="text-xs text-muted-foreground">登録時に設定した内容です（変更不可）</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="space-address-edit" className="text-sm text-foreground">
                  所在地
                </Label>
                <Input id="space-address-edit" value={editedSpace.address} onChange={(e) => setEditedSpace({ ...editedSpace, address: e.target.value })} placeholder="例：東京都渋谷区〇〇 1-2-3 ○○ビル4F" className={AUTH_INPUT_CLASS} autoComplete="street-address"/>
              </div>
            </div>

            <DialogFooter className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-3 pt-2 border-t border-border/60">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} className="text-sm w-full sm:w-auto" disabled={isSavingSpaceEdit}>
                キャンセル
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-sm min-w-[100px] w-full sm:w-auto" disabled={isSavingSpaceEdit}>
                {isSavingSpaceEdit ? (<>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                    保存中...
                  </>) : ("保存")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      
      <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => {
                if (!open && isDeletingSpace)
                    return;
                setDeleteDialogOpen(open);
            }}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600 text-base sm:text-lg">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5"/>
              スペースを削除しますか？
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p className="text-xs sm:text-sm">
                  「{spaceData.name}」を削除すると、このスペースに関連するすべてのデータが削除されます。
                </p>
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs sm:text-sm text-red-800">
                    <strong>注意：</strong> この操作は取り消せません。削除されたデータは復元できません。
                  </p>
                </div>
                {currentArtwork && (<div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs sm:text-sm text-amber-800">
                      <strong>展示中の作品：</strong> 現在「{currentArtwork.title}」が展示されています。削除する前に作品の返却手続きを完了してください。
                    </p>
                  </div>)}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs sm:text-sm" disabled={isDeletingSpace}>
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm" disabled={isDeletingSpace} onClick={(e) => {
                e.preventDefault();
                void handleDeleteSpace();
            }}>
              {isDeletingSpace ? (<>
                  <Loader2 className="w-4 h-4 mr-2 inline animate-spin"/>
                  削除中...
                </>) : ("削除する")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={reDisplayTarget !== null} onOpenChange={(open) => {
                if (!open && reDisplaySubmitting)
                    return;
                if (!open)
                    setReDisplayTarget(null);
            }}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">
              この作品を再展示しますか？
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <p>
                  「
                  <span className="font-medium text-foreground">
                    {reDisplayTarget?.title || "（無題）"}
                  </span>
                  」をこのスペースに再度割り当てます。
                </p>
                {currentArtwork &&
                currentArtwork.id !== reDisplayTarget?.artwork_id && (<p>
                      現在展示中の「{currentArtwork.title}
                      」の展示は終了し、入れ替わります。
                    </p>)}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs sm:text-sm" disabled={reDisplaySubmitting}>
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction className="bg-[#C3A36D] hover:bg-[#C3A36D]/90 text-white text-xs sm:text-sm" disabled={reDisplaySubmitting} onClick={(e) => {
                e.preventDefault();
                void handleConfirmReDisplay();
            }}>
              {reDisplaySubmitting ? (<>
                  <Loader2 className="w-4 h-4 mr-2 inline animate-spin"/>
                  処理中…
                </>) : ("再展示する")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {canAssignArtwork && spaceId ? (<ManualArtworkSelectDialog open={manualArtworkDialogOpen} onOpenChange={setManualArtworkDialogOpen} spaceId={spaceId} currentArtworkId={spaceData.current_artwork_id ?? currentArtwork?.id ?? null} currentArtworkTitle={currentArtwork?.title ?? null} pendingExhibitionArtworkId={spaceData.pending_exhibition_artwork_id ?? null} pendingExhibitionTitle={pendingExhibitionArtwork?.title ?? null} spaceBlocksNewExhibitionRequest={spaceHasArtworkInvolvement} onAssigned={reloadSpaceAndDisplayedArtwork}/>) : null}

      
      <ArtworkAreaSelectionDialog open={areaSelectionDialogOpen} onOpenChange={setAreaSelectionDialogOpen} spaceImage={spaceData.images?.[selectedImageIndex] || spaceData.image} spaceName={spaceData.name} currentArea={artworkPlacementArea || undefined} onSave={handleAreaSave}/>
        </>)}
    </div>);
}
