import React, { useState, useEffect } from "react";
import { useRefreshOnInterval } from "@/hooks/useRefreshOnInterval";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ImageIcon,
  Video,
  Eye,
  MapPin,
  TrendingUp,
  Wallet,
  User,
  Edit,
  ExternalLink,
  Calendar,
  BarChart3,
  Sparkles,
  Heart,
  Package,
  CheckCircle,
  Clock,
  DollarSign,
  QrCode,
  Plus,
  Building2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { ArtistReturnRequestDialog } from "@/components/ArtistReturnRequestDialog";
import {
  artistService,
  type ArtistProfile,
  type ArtistStatistics,
  type RevenueAnalytics,
} from "@/services/artist.service";
import { userService } from "@/services/user.service";
import {
  artworkService,
  type Artwork as ArtworkAPI,
  type ArtistArtworkStatusCounts,
  isArtworkInTransitFamily,
} from "@/services/artwork.service";
import { toast } from "sonner";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * 作品タブのステータスフィルターID。
 * `in_transit_unified` = 輸送中（展示先へ向かう途中・法人からの返送・回収など、すべて「途中」の脚をまとめる）。
 * 一覧APIは当面 `status=in_transit` を流用。将来バックエンドで専用クエリに差し替え予定。
 */
const ARTWORK_FILTER_IN_TRANSIT_UNIFIED = "in_transit_unified" as const;

/** Corporate return flow (artist view) — map to GET /artworks status + status-counts. */
const ARTWORK_FILTER_RETURN_REQUESTED = "return_requested" as const;
const ARTWORK_FILTER_RETURNED_TO_ARTIST = "returned_to_artist" as const;

/** Artist-initiated recall — awaiting corporate ship only (on-the-way recall leg is under 輸送中). */
const ARTWORK_FILTER_RECALL_REQUESTED = "recall_requested" as const;

const statusConfig = {
  draft: {
    label: "未公開",
    color: "bg-gray-400",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-300",
    textColor: "text-gray-700",
  },
  published: {
    label: "オンライン公開中",
    color: "bg-green-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-700",
  },
  exhibited: {
    label: "展示中",
    color: "bg-[#C3A36D]",
    bgColor: "bg-[#C3A36D]/10",
    borderColor: "border-[#C3A36D]/30",
    textColor: "text-[#C3A36D]",
  },
  exhibition_requested: {
    label: "展示依頼中",
    color: "bg-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-300",
    textColor: "text-orange-900",
  },
  /** 輸送中（展示先へ向かう途中など）。返送・回収の細分化は `listBadgeConfig` + `in_transit_kind` */
  [ARTWORK_FILTER_IN_TRANSIT_UNIFIED]: {
    label: "輸送中",
    color: "bg-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-300",
    textColor: "text-violet-900",
  },
  [ARTWORK_FILTER_RETURN_REQUESTED]: {
    label: "返却申請中",
    color: "bg-teal-600",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-300",
    textColor: "text-teal-900",
  },
  [ARTWORK_FILTER_RETURNED_TO_ARTIST]: {
    label: "アーティストに返却済み",
    color: "bg-slate-600",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-300",
    textColor: "text-slate-800",
  },
  [ARTWORK_FILTER_RECALL_REQUESTED]: {
    label: "回収依頼中",
    color: "bg-rose-600",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-300",
    textColor: "text-rose-900",
  },
  sold: {
    label: "売却済み",
    color: "bg-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-700",
  },
  returned: {
    label: "回収済み",
    color: "bg-gray-500",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    textColor: "text-gray-700",
  },
  recalled: {
    label: "回収済み",
    color: "bg-gray-500",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    textColor: "text-gray-700",
  },
};

type StatusCardConfig = (typeof statusConfig)[keyof typeof statusConfig];

/**
 * Card badge: DB `artwork.status` is granular; labels align with dashboard filter chips.
 */
function listBadgeConfig(artwork: {
  status: string;
  in_transit_kind?: string | null;
  artist_pipeline_kind?: string | null;
}): StatusCardConfig {
  if (artwork.artist_pipeline_kind === "corporate_return_pending") {
    return statusConfig[ARTWORK_FILTER_RETURN_REQUESTED];
  }
  const s = artwork.status;
  if (s === "recall_pending") {
    return statusConfig[ARTWORK_FILTER_RECALL_REQUESTED];
  }
  if (s === "in_transit_corporate_return") {
    return {
      label: "法人からの返送中",
      color: "bg-violet-600",
      bgColor: "bg-violet-50",
      borderColor: "border-violet-300",
      textColor: "text-violet-900",
    };
  }
  if (s === "in_transit_recall") {
    return {
      label: "回収返送中",
      color: "bg-rose-600",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-300",
      textColor: "text-rose-900",
    };
  }
  if (isArtworkInTransitFamily(s)) {
    return statusConfig[ARTWORK_FILTER_IN_TRANSIT_UNIFIED];
  }
  if (s === "returned_corporate" || s === "returned_recall") {
    return statusConfig[ARTWORK_FILTER_RETURNED_TO_ARTIST];
  }
  if (s === "withdrawn") {
    return {
      label: "取り下げ",
      color: "bg-gray-500",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      textColor: "text-gray-700",
    };
  }
  const key = artwork.status as keyof typeof statusConfig;
  return statusConfig[key] ?? statusConfig.draft;
}

/** Numeric badge for status filter chips (aligned with GET /artworks/me/status-counts). */
function FilterChipCount({ n, active }: { n: number; active: boolean }) {
  const display = n > 99 ? "99+" : String(n);
  return (
    <span
      className={
        active
          ? "ml-1.5 inline-flex min-w-[1.25rem] h-5 items-center justify-center rounded-full bg-white/25 px-1 text-[10px] font-semibold tabular-nums text-white"
          : "ml-1.5 inline-flex min-w-[1.25rem] h-5 items-center justify-center rounded-full bg-gray-100 px-1 text-[10px] font-semibold tabular-nums text-gray-700"
      }
    >
      {display}
    </span>
  );
}

export function ArtistDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, userType, isInitialized, currentUser } = useAuth();
  // Initialize tab from URL hash, default to "dashboard"
  const getInitialTab = (): string => {
    const hash = window.location.hash;
    const parts = hash.split("#").filter((p) => p.length > 0);
    if (parts.length > 1) {
      const lastPart = parts[parts.length - 1];
      const [tabHash] = lastPart.split("?");
      if (["dashboard", "artworks", "profile", "revenue"].includes(tabHash)) {
        return tabHash;
      }
    }
    return "dashboard";
  };

  const [selectedTab, setSelectedTab] = useState(getInitialTab());
  const [artworkFilter, setArtworkFilter] = useState<string>("all");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  // Filter state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    // Date ranges
    dateType: "created_at" as "created_at" | "published_at" | "updated_at",
    dateFrom: "",
    dateTo: "",
    // Price ranges
    minPrice: "",
    maxPrice: "",
    minLeasePrice: "",
    maxLeasePrice: "",
    // Size & dimensions
    sizeClass: [] as string[],
    minWidth: "",
    maxWidth: "",
    minHeight: "",
    maxHeight: "",
    minDepth: "",
    maxDepth: "",
    minWeight: "",
    maxWeight: "",
    // Technique
    medium: [] as string[],
    support: [] as string[],
    // Year
    yearFrom: "",
    yearTo: "",
    // Properties
    hasFrame: undefined as boolean | undefined,
    isAIGenerated: undefined as boolean | undefined,
    // Style tags
    styleTags: [] as string[],
    // Engagement
    minViewCount: "",
    maxViewCount: "",
    minFavoriteCount: "",
    maxFavoriteCount: "",
    minInquiryCount: "",
    maxInquiryCount: "",
    // Sort
    sortBy: "created_at",
    sortOrder: "desc" as "asc" | "desc",
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [returnRequestDialogOpen, setReturnRequestDialogOpen] = useState(false);
  const [selectedArtworkForReturn, setSelectedArtworkForReturn] = useState<any>(null);
  const [artworks, setArtworks] = useState<any[]>([]);
  const [isLoadingArtworks, setIsLoadingArtworks] = useState(false);
  // Pagination state for artworks list
  const [artworkPage, setArtworkPage] = useState(1);
  const [artworkPageSize, setArtworkPageSize] = useState(20);
  const [artworkTotal, setArtworkTotal] = useState(0);
  // URL/filters initialization flag to avoid overwriting URL params before reading them
  const [artworkFiltersInitialized, setArtworkFiltersInitialized] = useState(false);
  
  // Carousel state for each artwork (key: artwork.id, value: { currentIndex, isAutoPlaying, isHovering })
  const [artworkCarousels, setArtworkCarousels] = useState<Map<string, { currentIndex: number; isAutoPlaying: boolean; isHovering: boolean }>>(new Map());
  /** Open / investigating issue report counts per artwork (法人からの不具合報告) */
  const [issueOpenCounts, setIssueOpenCounts] = useState<Record<string, number>>({});
  /** Per status chip counts (GET /artworks/me/status-counts); loaded with artwork list + dashboard bootstrap */
  const [statusCounts, setStatusCounts] = useState<ArtistArtworkStatusCounts | null>(null);
  /** GET /artists/me/statistics — dashboard + QR + revenue summary */
  const [artistStatistics, setArtistStatistics] = useState<ArtistStatistics | null>(null);
  const [isLoadingDashboardStats, setIsLoadingDashboardStats] = useState(false);
  /** GET /artists/me/analytics/revenue — revenue tab charts & sold list */
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics | null>(null);
  const [revenueAnalyticsLoading, setRevenueAnalyticsLoading] = useState(false);

  // 旧「回収済み」フィルター（returned）が状態に残っている場合はすべてに戻す
  useEffect(() => {
    if (selectedTab !== "artworks" || artworkFilter !== "returned") return;
    setArtworkFilter("all");
    setArtworkPage(1);
  }, [selectedTab, artworkFilter]);

  // Debounced search state - must be defined before useEffect that uses it
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // Profile state
  const [profileData, setProfileData] = useState<ArtistProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [deleteImageDialogOpen, setDeleteImageDialogOpen] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    name: "",
    phone_number: "",
    biography: "",
    career: "",
    instagram: "",
    website: "",
    shipping_postal_code: "",
    shipping_prefecture: "",
    shipping_city: "",
    shipping_street_address: "",
    shipping_building_name: "",
    shipping_phone: "",
  });
  // Track original profile data to detect changes
  const [originalProfileData, setOriginalProfileData] = useState({
    name: "",
    phone_number: "",
    biography: "",
    career: "",
    instagram: "",
    website: "",
    shipping_postal_code: "",
    shipping_prefecture: "",
    shipping_city: "",
    shipping_street_address: "",
    shipping_building_name: "",
    shipping_phone: "",
  });
  const [userProfile, setUserProfile] = useState<any>(null);

  // 認証チェック：未ログインまたはアーティスト以外はリダイレクト
  // Wait for auth initialization before checking
  useEffect(() => {
    // Don't check auth until initialization is complete
    if (!isInitialized) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login/artist");
      return;
    }

    if (userType !== "artist") {
      alert("このページはアーティスト専用です");
      navigate("/");
      return;
    }
  }, [isAuthenticated, userType, isInitialized, navigate]);

  // Dashboard / global stats: align with API (not mock data)
  useEffect(() => {
    if (!isInitialized || !isAuthenticated || userType !== "artist") return;
    let cancelled = false;
    setIsLoadingDashboardStats(true);
    Promise.all([
      artistService.getStatistics(),
      artworkService.getMyArtworkStatusCounts().catch(() => null),
    ])
      .then(([stats, counts]) => {
        if (cancelled) return;
        setArtistStatistics(stats);
        if (counts) setStatusCounts(counts);
      })
      .catch((err) => {
        console.error("Artist dashboard statistics:", err);
        toast.error("統計情報の読み込みに失敗しました");
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDashboardStats(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isInitialized, isAuthenticated, userType]);

  useEffect(() => {
    if (selectedTab !== "revenue" || userType !== "artist" || !isAuthenticated) return;
    let cancelled = false;
    setRevenueAnalyticsLoading(true);
    artistService
      .getRevenueAnalytics("monthly")
      .then((data) => {
        if (!cancelled) setRevenueAnalytics(data);
      })
      .catch((err) => {
        console.error("Revenue analytics:", err);
        toast.error("収益データの読み込みに失敗しました");
      })
      .finally(() => {
        if (!cancelled) setRevenueAnalyticsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedTab, userType, isAuthenticated]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedTab]);

  // Extract tab hash from URL (handles #/dashboard#profile and query like #/dashboard#artworks?page=2)
  const getTabFromHash = (): string => {
    const hash = window.location.hash;
    // Check if there's a nested hash (e.g., #/dashboard#profile)
    // Split by # and get the last part (the tab name)
    const parts = hash.split("#").filter((p) => p.length > 0);
    if (parts.length > 1) {
      // Last part is the tab hash (after the route hash)
      const lastPart = parts[parts.length - 1];
      const [tabHash] = lastPart.split("?");
      if (["dashboard", "artworks", "profile", "revenue"].includes(tabHash)) {
        return tabHash;
      }
    }
    // Default to dashboard if no valid hash found
    return "dashboard";
  };

  // URLハッシュに基づいてタブを設定（初期化時とlocation変更時）
  useEffect(() => {
    const tab = getTabFromHash();
    setSelectedTab(tab);
    
    // If no tab hash exists, set default "dashboard" hash
    const currentHash = window.location.hash;
    const parts = currentHash.split("#").filter((p) => p.length > 0);
    const lastPart = parts.length > 1 ? parts[parts.length - 1] : "";
    const [tabPart] = lastPart.split("?");
    const hasTabHash =
      parts.length > 1 &&
      ["dashboard", "artworks", "profile", "revenue"].includes(tabPart);
    
    if (!hasTabHash) {
      const routeHash = parts.length > 0 ? `#${parts.join("#")}` : "#/dashboard";
      window.history.replaceState(null, "", `${routeHash}#dashboard`);
    }
    
    window.scrollTo(0, 0);
  }, [location]);

  // ハッシュが変更されたときにもタブを切り替える
  useEffect(() => {
    const handleHashChange = () => {
      const tab = getTabFromHash();
      setSelectedTab(tab);
      window.scrollTo(0, 0);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Handle tab change and update URL hash
  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    // Update URL hash while preserving the route hash
    const currentHash = window.location.hash;
    // Split by # and keep all parts except the last one (which is the tab)
    const parts = currentHash.split("#").filter((p) => p.length > 0);
    // Remove the last part if it's a valid tab name (ignore any query string)
    if (parts.length > 1) {
      const lastPart = parts[parts.length - 1];
      const [tabPart] = lastPart.split("?");
      if (["dashboard", "artworks", "profile", "revenue"].includes(tabPart)) {
        parts.pop();
      }
    }
    // Reconstruct hash with route + new tab
    const routeHash = parts.length > 0 ? `#${parts.join("#")}` : "#/dashboard";
    // Update hash using replaceState to avoid adding to history
    window.history.replaceState(null, "", `${routeHash}#${value}`);
    window.scrollTo(0, 0);
  };

  // Sync artwork filters & pagination to URL hash query so state is preserved on refresh
  useEffect(() => {
    if (selectedTab !== "artworks" || !artworkFiltersInitialized) return;

    const hash = window.location.hash;
    const parts = hash.split("#").filter((p) => p.length > 0);
    if (parts.length === 0) return;

    const routePart = parts[0] || "/dashboard";

    const params = new URLSearchParams();

    // Pagination
    if (artworkPage > 1) {
      params.set("page", String(artworkPage));
    }
    if (artworkPageSize && artworkPageSize !== 20) {
      params.set("page_size", String(artworkPageSize));
    }

    // Status filter（輸送中は URL では in_transit_unified）
    if (artworkFilter && artworkFilter !== "all") {
      const statusParam =
        artworkFilter === ARTWORK_FILTER_IN_TRANSIT_UNIFIED
          ? ARTWORK_FILTER_IN_TRANSIT_UNIFIED
          : artworkFilter;
      params.set("status", statusParam);
    }

    // Search
    if (searchQuery) {
      params.set("search", searchQuery);
    }

    // Date range
    if (filters.dateType) params.set("date_type", filters.dateType);
    if (filters.dateFrom) params.set("date_from", filters.dateFrom);
    if (filters.dateTo) params.set("date_to", filters.dateTo);

    // Numeric ranges
    const rangeMappings: [keyof typeof filters, string][] = [
      ["minPrice", "min_price"],
      ["maxPrice", "max_price"],
      ["minLeasePrice", "min_lease_price"],
      ["maxLeasePrice", "max_lease_price"],
      ["minWidth", "min_width"],
      ["maxWidth", "max_width"],
      ["minHeight", "min_height"],
      ["maxHeight", "max_height"],
      ["minDepth", "min_depth"],
      ["maxDepth", "max_depth"],
      ["minWeight", "min_weight"],
      ["maxWeight", "max_weight"],
      ["minViewCount", "min_view_count"],
      ["maxViewCount", "max_view_count"],
      ["minFavoriteCount", "min_favorite_count"],
      ["maxFavoriteCount", "max_favorite_count"],
      ["minInquiryCount", "min_inquiry_count"],
      ["maxInquiryCount", "max_inquiry_count"],
    ];
    rangeMappings.forEach(([field, key]) => {
      const value = (filters as any)[field];
      if (value) {
        params.set(key, String(value));
      }
    });

    // Year range
    if (filters.yearFrom) params.set("year_from", filters.yearFrom);
    if (filters.yearTo) params.set("year_to", filters.yearTo);

    // Multi-value filters
    if (filters.sizeClass?.length) {
      filters.sizeClass.forEach((v) => params.append("size_class", v));
    }
    if (filters.medium?.length) {
      filters.medium.forEach((v) => params.append("medium", v));
    }
    if (filters.support?.length) {
      filters.support.forEach((v) => params.append("support", v));
    }
    if (filters.styleTags?.length) {
      filters.styleTags.forEach((v) => params.append("style_tags", v));
    }

    // Boolean filters
    if (filters.hasFrame === true) params.set("has_frame", "true");
    if (filters.isAIGenerated === true) params.set("is_ai_generated", "true");

    // Sort
    if (filters.sortBy) params.set("sort_by", filters.sortBy);
    if (filters.sortOrder) params.set("sort_order", filters.sortOrder);

    const queryString = params.toString();
    const lastPart = queryString ? `artworks?${queryString}` : "artworks";
    const newHash = `#${[routePart, lastPart].join("#")}`;

    if (newHash !== hash) {
      window.history.replaceState(null, "", newHash);
    }
  }, [selectedTab, artworkPage, artworkPageSize, artworkFilter, searchQuery, filters, artworkFiltersInitialized]);

  // Initialize artwork filters & pagination from URL hash query (for refresh/back)
  useEffect(() => {
    if (selectedTab !== "artworks") {
      // Reset initialization flag when switching away from artworks tab
      setArtworkFiltersInitialized(false);
      return;
    }

    const hash = window.location.hash;
    const parts = hash.split("#").filter((p) => p.length > 0);
    if (parts.length < 2) {
      // No query string, but still mark as initialized so future changes sync to URL
      setArtworkFiltersInitialized(true);
      return;
    }

    const lastPart = parts[parts.length - 1];
    const [tabHash, queryString] = lastPart.split("?");
    if (tabHash !== "artworks") {
      setArtworkFiltersInitialized(true);
      return;
    }

    // If no query string, mark as initialized and use defaults
    if (!queryString) {
      setArtworkFiltersInitialized(true);
      return;
    }

    const params = new URLSearchParams(queryString);

    const pageParam = params.get("page");
    if (pageParam) {
      const p = parseInt(pageParam, 10);
      if (!isNaN(p) && p > 0) {
        setArtworkPage(p);
      }
    }

    const pageSizeParam = params.get("page_size");
    if (pageSizeParam) {
      const s = parseInt(pageSizeParam, 10);
      if (!isNaN(s) && s > 0) {
        setArtworkPageSize(s);
      }
    }

    const statusParam = params.get("status");
    if (statusParam) {
      const legacyTransit =
        statusParam === "on_the_way" ||
        statusParam === "in_transit_to_corporate" ||
        statusParam === "in_transit_return" ||
        statusParam === "return_in_transit" ||
        statusParam === "recall_in_transit";
      const filter =
        statusParam === "recalled"
          ? "all"
          : statusParam === "recall_returned_to_artist"
            ? ARTWORK_FILTER_RETURNED_TO_ARTIST
            : legacyTransit ||
                statusParam === "in_transit" ||
                statusParam === "in_transit_unified"
              ? ARTWORK_FILTER_IN_TRANSIT_UNIFIED
              : statusParam;
      if (
        [
          "all",
          "draft",
          "published",
          "exhibition_requested",
          "exhibited",
          ARTWORK_FILTER_IN_TRANSIT_UNIFIED,
          ARTWORK_FILTER_RETURN_REQUESTED,
          ARTWORK_FILTER_RETURNED_TO_ARTIST,
          ARTWORK_FILTER_RECALL_REQUESTED,
          "sold",
        ].includes(filter)
      ) {
        setArtworkFilter(filter);
      }
    }

    const searchParam = params.get("search");
    if (searchParam !== null) {
      setSearchQuery(searchParam);
    }

    setFilters((prev) => {
      const next = { ...prev };

      const dateTypeParam = params.get("date_type");
      if (
        dateTypeParam === "created_at" ||
        dateTypeParam === "published_at" ||
        dateTypeParam === "updated_at"
      ) {
        next.dateType = dateTypeParam as "created_at" | "published_at" | "updated_at";
      }

      const mapping: [string, keyof typeof next][] = [
        ["date_from", "dateFrom"],
        ["date_to", "dateTo"],
        ["min_price", "minPrice"],
        ["max_price", "maxPrice"],
        ["min_lease_price", "minLeasePrice"],
        ["max_lease_price", "maxLeasePrice"],
        ["min_width", "minWidth"],
        ["max_width", "maxWidth"],
        ["min_height", "minHeight"],
        ["max_height", "maxHeight"],
        ["min_depth", "minDepth"],
        ["max_depth", "maxDepth"],
        ["min_weight", "minWeight"],
        ["max_weight", "maxWeight"],
        ["min_view_count", "minViewCount"],
        ["max_view_count", "maxViewCount"],
        ["min_favorite_count", "minFavoriteCount"],
        ["max_favorite_count", "maxFavoriteCount"],
        ["min_inquiry_count", "minInquiryCount"],
        ["max_inquiry_count", "maxInquiryCount"],
        ["year_from", "yearFrom"],
        ["year_to", "yearTo"],
      ];
      mapping.forEach(([paramKey, field]) => {
        const v = params.get(paramKey);
        if (v !== null) {
          (next as any)[field] = v;
        }
      });

      next.sizeClass = params.getAll("size_class");
      next.medium = params.getAll("medium");
      next.support = params.getAll("support");
      next.styleTags = params.getAll("style_tags");

      const hasFrameParam = params.get("has_frame");
      next.hasFrame = hasFrameParam === "true" ? true : undefined;

      const aiParam = params.get("is_ai_generated");
      next.isAIGenerated = aiParam === "true" ? true : undefined;

      // Sort parameters
      const sortByParam = params.get("sort_by");
      if (sortByParam) {
        next.sortBy = sortByParam;
      }
      const sortOrderParam = params.get("sort_order");
      if (sortOrderParam === "asc" || sortOrderParam === "desc") {
        next.sortOrder = sortOrderParam;
      }

      return next;
    });

    // Mark filters as initialized so subsequent changes can safely sync back to URL
    setArtworkFiltersInitialized(true);
  }, [selectedTab, location]);

  // Check if profile has changes
  const hasProfileChanges = () => {
    return (
      profileFormData.name !== originalProfileData.name ||
      profileFormData.phone_number !== originalProfileData.phone_number ||
      profileFormData.biography !== originalProfileData.biography ||
      profileFormData.career !== originalProfileData.career ||
      profileFormData.instagram !== originalProfileData.instagram ||
      profileFormData.website !== originalProfileData.website ||
      profileFormData.shipping_postal_code !== originalProfileData.shipping_postal_code ||
      profileFormData.shipping_prefecture !== originalProfileData.shipping_prefecture ||
      profileFormData.shipping_city !== originalProfileData.shipping_city ||
      profileFormData.shipping_street_address !== originalProfileData.shipping_street_address ||
      profileFormData.shipping_building_name !== originalProfileData.shipping_building_name ||
      profileFormData.shipping_phone !== originalProfileData.shipping_phone
    );
  };

  // Load profile data when profile tab is selected
  useEffect(() => {
    if (selectedTab === "profile" && isAuthenticated) {
      loadProfileData();
    }
  }, [selectedTab, isAuthenticated]);

  // Debounced search effect - must be defined before useEffect that uses debouncedSearch
  useEffect(() => {
      const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
      return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load artworks when artworks tab is selected or filters change
  useEffect(() => {
    if (selectedTab === "artworks" && isAuthenticated && currentUser?.id) {
      loadArtworks();
    }
  }, [selectedTab, isAuthenticated, currentUser, artworkFilter, debouncedSearch, filters, artworkPage, artworkPageSize]);

  // Load artworks from backend with filters
  const loadArtworks = async () => {
    if (!currentUser?.id) {
      console.warn("Cannot load artworks: user ID not available");
      return;
    }

    const isInTransitUnifiedFilter =
      artworkFilter === ARTWORK_FILTER_IN_TRANSIT_UNIFIED;

    setIsLoadingArtworks(true);
    try {
      // Build filter parameters from filter state
      const filterParams: any = {
        page: artworkPage,
        page_size: artworkPageSize,
        artist_id: currentUser.id, // Filter by current artist
      };

      // Status filter (from artworkFilter state)
      if (artworkFilter !== "all") {
        if (isInTransitUnifiedFilter) {
          filterParams.status = "in_transit_unified";
        } else if (artworkFilter === ARTWORK_FILTER_RETURN_REQUESTED) {
          filterParams.status = "return_requested";
        } else if (artworkFilter === ARTWORK_FILTER_RETURNED_TO_ARTIST) {
          filterParams.status = "returned_to_artist";
        } else if (artworkFilter === ARTWORK_FILTER_RECALL_REQUESTED) {
          filterParams.status = "recall_requested";
        } else {
          filterParams.status = artworkFilter;
        }
      }

      // Search query
      if (debouncedSearch) {
        filterParams.search = debouncedSearch;
      }

      // Date range
      if (filters.dateFrom) {
        filterParams.date_from = filters.dateFrom;
        filterParams.date_type = filters.dateType;
      }
      if (filters.dateTo) {
        filterParams.date_to = filters.dateTo;
        filterParams.date_type = filters.dateType;
      }

      // Price ranges
      if (filters.minPrice) {
        filterParams.min_price = parseFloat(filters.minPrice);
      }
      if (filters.maxPrice) {
        filterParams.max_price = parseFloat(filters.maxPrice);
      }
      if (filters.minLeasePrice) {
        filterParams.min_lease_price = parseFloat(filters.minLeasePrice);
      }
      if (filters.maxLeasePrice) {
        filterParams.max_lease_price = parseFloat(filters.maxLeasePrice);
      }

      // Size class
      if (filters.sizeClass.length > 0) {
        filterParams.size_class = filters.sizeClass;
      }

      // Dimensions
      if (filters.minWidth) {
        filterParams.min_width = parseFloat(filters.minWidth);
      }
      if (filters.maxWidth) {
        filterParams.max_width = parseFloat(filters.maxWidth);
      }
      if (filters.minHeight) {
        filterParams.min_height = parseFloat(filters.minHeight);
      }
      if (filters.maxHeight) {
        filterParams.max_height = parseFloat(filters.maxHeight);
      }
      if (filters.minDepth) {
        filterParams.min_depth = parseFloat(filters.minDepth);
      }
      if (filters.maxDepth) {
        filterParams.max_depth = parseFloat(filters.maxDepth);
      }
      if (filters.minWeight) {
        filterParams.min_weight = parseFloat(filters.minWeight);
      }
      if (filters.maxWeight) {
        filterParams.max_weight = parseFloat(filters.maxWeight);
      }

      // Medium and support
      if (filters.medium.length > 0) {
        filterParams.medium = filters.medium;
      }
      if (filters.support.length > 0) {
        filterParams.support = filters.support;
      }

      // Year range
      if (filters.yearFrom) {
        filterParams.year_from = parseInt(filters.yearFrom);
      }
      if (filters.yearTo) {
        filterParams.year_to = parseInt(filters.yearTo);
      }

      // Properties
      if (filters.hasFrame !== undefined) {
        filterParams.has_frame = filters.hasFrame;
      }
      if (filters.isAIGenerated !== undefined) {
        filterParams.is_ai_generated = filters.isAIGenerated;
      }

      // Style tags
      if (filters.styleTags.length > 0) {
        filterParams.style_tags = filters.styleTags;
      }

      // Engagement metrics
      if (filters.minViewCount) {
        filterParams.min_view_count = parseInt(filters.minViewCount);
      }
      if (filters.maxViewCount) {
        filterParams.max_view_count = parseInt(filters.maxViewCount);
      }
      if (filters.minFavoriteCount) {
        filterParams.min_favorite_count = parseInt(filters.minFavoriteCount);
      }
      if (filters.maxFavoriteCount) {
        filterParams.max_favorite_count = parseInt(filters.maxFavoriteCount);
      }
      if (filters.minInquiryCount) {
        filterParams.min_inquiry_count = parseInt(filters.minInquiryCount);
      }
      if (filters.maxInquiryCount) {
        filterParams.max_inquiry_count = parseInt(filters.maxInquiryCount);
      }

      // Sort
      filterParams.sort_by = filters.sortBy;
      filterParams.sort_order = filters.sortOrder;

      // Fetch artworks + open issue summary + status chip counts in parallel
      const [response, issueSummary, counts] = await Promise.all([
        artworkService.listArtworks(filterParams),
        artworkService
          .getOpenIssueReportSummary()
          .catch((): { counts: Record<string, number> } => ({ counts: {} })),
        artworkService.getMyArtworkStatusCounts().catch(() => null),
      ]);

      setIssueOpenCounts(issueSummary.counts ?? {});
      if (counts) setStatusCounts(counts);

      // Map API response to match the expected format
      const mappedArtworks = response.items.map((artwork: ArtworkAPI) => {
        // Get all images for the artwork
        const artworkImages = artwork.images && artwork.images.length > 0
          ? artwork.images.map(img => img.image_url)
          : artwork.main_image_url
          ? [artwork.main_image_url]
          : [];

        return {
          id: artwork.id,
          name: artwork.title,
          status: artwork.status,
          in_transit_kind: artwork.in_transit_kind ?? null,
          artist_pipeline_kind: artwork.artist_pipeline_kind ?? null,
          price: Number(artwork.price),
          location: undefined, // Will be populated from space assignments later
          // API view_count = 作品ページ閲覧数（DBの実データ）。QR専用スキャン数ではない
          scans: artwork.view_count || 0,
          exhibitStart: undefined, // Will be populated from space assignments later
          hasImage: !!artwork.main_image_url,
          isVideo: false, // Can be determined from image URL or file type later
          tags: [], // Can be populated from style tags later
          buyer: undefined, // Will be populated from orders later
          soldDate: undefined, // Will be populated from orders later
          paymentStatus: undefined, // Will be populated from orders later
          exhibitEnd: undefined, // Will be populated from space assignments later
          main_image_url: artwork.main_image_url,
          images: artworkImages, // Array of all image URLs for carousel
          custom_id: artwork.custom_id,
        };
      });

      setArtworks(mappedArtworks);
      setArtworkTotal(response.total ?? 0);
      
      // Initialize carousel state for each artwork
      const newCarousels = new Map<string, { currentIndex: number; isAutoPlaying: boolean; isHovering: boolean }>();
      mappedArtworks.forEach((artwork: any) => {
        newCarousels.set(artwork.id, {
          currentIndex: 0,
          isAutoPlaying: true,
          isHovering: false,
        });
      });
      setArtworkCarousels(newCarousels);
    } catch (error: any) {
      console.error("Failed to load artworks:", error);
      toast.error("作品の読み込みに失敗しました");
      setArtworks([]);
      setIssueOpenCounts({});
    } finally {
      setIsLoadingArtworks(false);
    }
  };

  useRefreshOnInterval(
    () => {
      if (selectedTab !== "artworks" || !currentUser?.id) return;
      void loadArtworks();
    },
    selectedTab === "artworks" && Boolean(currentUser?.id),
    45_000,
  );

  // Auto-play carousel for each artwork
  useEffect(() => {
    const intervals: Map<string, NodeJS.Timeout> = new Map();
    
    artworkCarousels.forEach((carouselState, artworkId) => {
      const artwork = artworks.find(a => a.id === artworkId);
      if (!artwork || !artwork.images || artwork.images.length <= 1) return;
      
      if (carouselState.isAutoPlaying && !carouselState.isHovering) {
        const interval = setInterval(() => {
          setArtworkCarousels(prev => {
            const newMap = new Map(prev);
            const current = newMap.get(artworkId);
            if (current) {
              newMap.set(artworkId, {
                ...current,
                currentIndex: (current.currentIndex + 1) % artwork.images.length,
              });
            }
            return newMap;
          });
        }, 4000); // Change image every 4 seconds
        
        intervals.set(artworkId, interval);
      }
    });
    
    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [artworkCarousels, artworks]);
  
  // Helper functions for carousel control
  const handleCarouselHover = (artworkId: string, isHovering: boolean) => {
    setArtworkCarousels(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(artworkId);
      if (current) {
        newMap.set(artworkId, { ...current, isHovering });
      }
      return newMap;
    });
  };
  
  const handleCarouselNext = (artworkId: string) => {
    const artwork = artworks.find(a => a.id === artworkId);
    if (!artwork || !artwork.images) return;
    
    setArtworkCarousels(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(artworkId);
      if (current) {
        newMap.set(artworkId, {
          ...current,
          currentIndex: (current.currentIndex + 1) % artwork.images.length,
          isAutoPlaying: false, // Pause auto-play on manual interaction
        });
        // Resume auto-play after 10 seconds
        setTimeout(() => {
          setArtworkCarousels(prevMap => {
            const updatedMap = new Map(prevMap);
            const updated = updatedMap.get(artworkId);
            if (updated) {
              updatedMap.set(artworkId, { ...updated, isAutoPlaying: true });
            }
            return updatedMap;
          });
        }, 10000);
      }
      return newMap;
    });
  };
  
  const handleCarouselPrev = (artworkId: string) => {
    const artwork = artworks.find(a => a.id === artworkId);
    if (!artwork || !artwork.images) return;
    
    setArtworkCarousels(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(artworkId);
      if (current) {
        newMap.set(artworkId, {
          ...current,
          currentIndex: (current.currentIndex - 1 + artwork.images.length) % artwork.images.length,
          isAutoPlaying: false, // Pause auto-play on manual interaction
        });
        // Resume auto-play after 10 seconds
        setTimeout(() => {
          setArtworkCarousels(prevMap => {
            const updatedMap = new Map(prevMap);
            const updated = updatedMap.get(artworkId);
            if (updated) {
              updatedMap.set(artworkId, { ...updated, isAutoPlaying: true });
            }
            return updatedMap;
          });
        }, 10000);
      }
      return newMap;
    });
  };

  // Load profile data from backend
  const loadProfileData = async () => {
    setIsLoadingProfile(true);
    try {
      // Load artist profile
      const artistProfile = await artistService.getProfile();
      setProfileData(artistProfile);
      
      // Parse career history from array to text
      const careerText = artistProfile.career_history
        ? artistProfile.career_history.map((entry) => `${entry.year} ${entry.content}`).join("\n")
        : "";
      
      const sa = artistProfile.shipping_address;
      const formData = {
        name: artistProfile.name || "",
        phone_number: artistProfile.phone_number || "",
        biography: artistProfile.biography || "",
        career: careerText,
        instagram: "",
        website: "",
        shipping_postal_code: sa?.postal_code ?? "",
        shipping_prefecture: sa?.prefecture ?? "",
        shipping_city: sa?.city ?? "",
        shipping_street_address: sa?.street_address ?? "",
        shipping_building_name: sa?.building_name ?? "",
        shipping_phone: sa?.phone ?? "",
      };
      
      // Load user profile for SNS links
      try {
        const user = await userService.getCurrentUser();
        setUserProfile(user);
        formData.instagram = (user as any).instagram || "";
        formData.website = (user as any).website || "";
      } catch (err) {
        console.warn("Failed to load user profile for SNS links:", err);
      }
      
      // Set form data and original data (for change detection)
      setProfileFormData(formData);
      setOriginalProfileData({ ...formData });
      
      // Set profile image
      if (artistProfile.profile_image_url) {
        setProfileImage(artistProfile.profile_image_url);
      }
    } catch (error: any) {
      console.error("Failed to load profile:", error);
      toast.error("プロフィールの読み込みに失敗しました");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // プロフィール写真の変更
  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("画像ファイルを選択してください");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("ファイルサイズは5MB以下にしてください");
        return;
      }

      try {
        setIsSavingProfile(true);
        // Upload profile image
        const result = await userService.uploadProfileImage(file);
        setProfileImage(result.profile_image_url);
        toast.success("プロフィール写真を更新しました");
        
        // Reload profile data to get updated image URL
        await loadProfileData();
      } catch (error: any) {
        console.error("Failed to upload profile image:", error);
        toast.error("プロフィール写真のアップロードに失敗しました");
      } finally {
        setIsSavingProfile(false);
      }
    }
  };

  // プロフィール写真の削除確認ダイアログを開く
  const handleDeleteProfileImageClick = () => {
    if (!profileImage) {
      return;
    }
    setDeleteImageDialogOpen(true);
  };

  // プロフィール写真の削除実行
  const handleDeleteProfileImage = async () => {
    try {
      setIsSavingProfile(true);
      setDeleteImageDialogOpen(false);
      await userService.deleteProfileImage();
      setProfileImage(null);
      toast.success("プロフィール写真を削除しました");
      
      // Reload profile data to get updated image URL
      await loadProfileData();
    } catch (error: any) {
      console.error("Failed to delete profile image:", error);
      toast.error("プロフィール写真の削除に失敗しました");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      setIsSavingProfile(true);

      const shippingRequired = [
        profileFormData.shipping_postal_code,
        profileFormData.shipping_prefecture,
        profileFormData.shipping_city,
        profileFormData.shipping_street_address,
      ];
      const anyShippingFilled = [
        ...shippingRequired,
        profileFormData.shipping_building_name,
        profileFormData.shipping_phone,
      ].some((v) => (v || "").trim().length > 0);
      const allShippingRequiredFilled = shippingRequired.every(
        (v) => (v || "").trim().length > 0
      );
      if (anyShippingFilled && !allShippingRequiredFilled) {
        toast.error(
          "配送・返送先は、郵便番号・都道府県・市区町村・番地をすべて入力するか、すべて空にしてください。"
        );
        setIsSavingProfile(false);
        return;
      }

      if (allShippingRequiredFilled && !profileFormData.name.trim()) {
        toast.error(
          "配送先を保存するには、先に「名前（公開名）」を入力してください（宛名として使用されます）。"
        );
        setIsSavingProfile(false);
        return;
      }

      // Parse career text into array format
      const careerHistory = profileFormData.career
        ? profileFormData.career
            .split("\n")
            .filter((line) => line.trim())
            .map((line) => {
              // Try to extract year from line (format: "YYYY content" or "YYYY年 content")
              const yearMatch = line.match(/^(\d{4})/);
              const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();
              const content = line.replace(/^\d{4}年?\s*/, "").trim();
              return { year, content: content || line.trim() };
            })
        : [];
      
      // Update artist profile
      const updatedProfile = await artistService.updateProfile({
        name: profileFormData.name,
        biography: profileFormData.biography,
        career_history: careerHistory,
        phone_number: profileFormData.phone_number,
      });
      
      // Update SNS links via user service
      // Always send instagram and website (even if empty) to allow clearing fields
      const snsUpdates: any = {
        instagram: profileFormData.instagram?.trim() || "",
        website: profileFormData.website?.trim() || "",
      };
      
      try {
        await userService.updateProfile(snsUpdates);
      } catch (err) {
        console.warn("Failed to update SNS links:", err);
        toast.error("SNSリンクの更新に失敗しました");
      }

      if (allShippingRequiredFilled) {
        await artistService.upsertShippingAddress({
          postal_code: profileFormData.shipping_postal_code.trim(),
          prefecture: profileFormData.shipping_prefecture.trim(),
          city: profileFormData.shipping_city.trim(),
          street_address: profileFormData.shipping_street_address.trim(),
          building_name: profileFormData.shipping_building_name?.trim() || null,
          phone: profileFormData.shipping_phone?.trim() || null,
        });
      }

      // Reload profile data to get updated values (including SNS links)
      await loadProfileData();
      
      toast.success("プロフィールを保存しました");
    } catch (error: any) {
      console.error("Failed to save profile:", error);
      toast.error("プロフィールの保存に失敗しました");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Artworks are already filtered by the backend API, so we can use them directly
  const filteredArtworks = artworks;

  const publishedCount =
    statusCounts?.published ?? artistStatistics?.artwork_counts.published ?? 0;
  const exhibitedCount =
    statusCounts?.exhibited ?? artistStatistics?.artwork_counts.exhibited ?? 0;
  const soldCount = statusCounts?.sold ?? artistStatistics?.artwork_counts.sold ?? 0;
  const monthlyRevenue = artistStatistics?.revenue.monthly ?? 0;
  const totalRevenueAll = artistStatistics?.revenue.total ?? 0;
  const qrTotal = artistStatistics?.qr_scans.total ?? 0;
  const qrMonthly = artistStatistics?.qr_scans.monthly ?? 0;
  const qrTopLocations = artistStatistics?.qr_top_locations ?? [];
  const qrMonthlyPercent =
    qrTotal > 0 ? Math.min(100, Math.round((qrMonthly / qrTotal) * 100)) : 0;

  const revenueByMonth = revenueAnalytics?.revenue_by_period ?? [];
  const maxMonthRev = Math.max(
    ...revenueByMonth.map((r) => r.revenue),
    1,
  );

  const handleRequestReturn = (artwork: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedArtworkForReturn(artwork);
    setReturnRequestDialogOpen(true);
  };
  
  // Filter helper functions
  const resetFilters = () => {
    // Reset to first page when filters are cleared
    setArtworkPage(1);
    setSearchQuery("");
    setFilters({
      dateType: "created_at",
      dateFrom: "",
      dateTo: "",
      minPrice: "",
      maxPrice: "",
      minLeasePrice: "",
      maxLeasePrice: "",
      sizeClass: [],
      minWidth: "",
      maxWidth: "",
      minHeight: "",
      maxHeight: "",
      minDepth: "",
      maxDepth: "",
      minWeight: "",
      maxWeight: "",
      medium: [],
      support: [],
      yearFrom: "",
      yearTo: "",
      hasFrame: undefined,
      isAIGenerated: undefined,
      styleTags: [],
      minViewCount: "",
      maxViewCount: "",
      minFavoriteCount: "",
      maxFavoriteCount: "",
      minInquiryCount: "",
      maxInquiryCount: "",
      sortBy: "created_at",
      sortOrder: "desc",
    });
    setArtworkFilter("all");
  };
  
  const toggleSizeClass = (size: string) => {
    setFilters(prev => ({
      ...prev,
      sizeClass: prev.sizeClass.includes(size)
        ? prev.sizeClass.filter(s => s !== size)
        : [...prev.sizeClass, size],
    }));
  };
  
  const toggleMedium = (medium: string) => {
    setFilters(prev => ({
      ...prev,
      medium: prev.medium.includes(medium)
        ? prev.medium.filter(m => m !== medium)
        : [...prev.medium, medium],
    }));
  };
  
  const toggleSupport = (support: string) => {
    setFilters(prev => ({
      ...prev,
      support: prev.support.includes(support)
        ? prev.support.filter(s => s !== support)
        : [...prev.support, support],
    }));
  };
  
  const toggleStyleTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      styleTags: prev.styleTags.includes(tag)
        ? prev.styleTags.filter(t => t !== tag)
        : [...prev.styleTags, tag],
    }));
  };
  
  const applyDatePreset = (preset: string) => {
    const today = new Date();
    let from = "";
    let to = new Date().toISOString().split("T")[0];
    
    switch (preset) {
      case "today":
        from = today.toISOString().split("T")[0];
        break;
      case "week":
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        from = weekAgo.toISOString().split("T")[0];
        break;
      case "month":
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        from = monthAgo.toISOString().split("T")[0];
        break;
      case "3months":
        const threeMonthsAgo = new Date(today);
        threeMonthsAgo.setMonth(today.getMonth() - 3);
        from = threeMonthsAgo.toISOString().split("T")[0];
        break;
      case "6months":
        const sixMonthsAgo = new Date(today);
        sixMonthsAgo.setMonth(today.getMonth() - 6);
        from = sixMonthsAgo.toISOString().split("T")[0];
        break;
      case "year":
        const yearAgo = new Date(today);
        yearAgo.setFullYear(today.getFullYear() - 1);
        from = yearAgo.toISOString().split("T")[0];
        break;
    }
    
    setFilters(prev => ({ ...prev, dateFrom: from, dateTo: to }));
  };
  
  const applyYearPreset = (preset: string) => {
    const currentYear = new Date().getFullYear();
    let from = "";
    let to = String(currentYear);
    
    switch (preset) {
      case "thisYear":
        from = String(currentYear);
        break;
      case "lastYear":
        from = String(currentYear - 1);
        to = String(currentYear - 1);
        break;
      case "5years":
        from = String(currentYear - 5);
        break;
      case "10years":
        from = String(currentYear - 10);
        break;
    }
    
    setFilters(prev => ({ ...prev, yearFrom: from, yearTo: to }));
  };
  
  // Options for dropdowns
  const sizeClassOptions = ["XS", "S", "M", "L", "XL", "XXL"];
  const mediumOptions = [
    { value: "oil", label: "油彩" },
    { value: "acrylic", label: "アクリル" },
    { value: "watercolor", label: "水彩" },
    { value: "mixed-media", label: "ミクストメディア" },
    { value: "digital", label: "デジタル" },
    { value: "other", label: "その他" },
  ];
  const supportOptions = [
    { value: "canvas", label: "キャンバス" },
    { value: "paper", label: "紙" },
    { value: "board", label: "板" },
    { value: "other", label: "その他" },
  ];
  const styleTagOptions = [
    "抽象", "具象", "風景", "人物", "静物", "現代アート", "伝統", "ポップアート", "ミニマル", "シュールレアリスム"
  ];
  const sortOptions = [
    { value: "created_at_desc", label: "作成日順（新着順）" },
    { value: "created_at_asc", label: "作成日順（古い順）" },
    { value: "updated_at_desc", label: "更新日順（新着順）" },
    { value: "updated_at_asc", label: "更新日順（古い順）" },
    { value: "published_at_desc", label: "公開日順（新着順）" },
    { value: "published_at_asc", label: "公開日順（古い順）" },
    { value: "price_desc", label: "価格順（高い順）" },
    { value: "price_asc", label: "価格順（安い順）" },
    { value: "view_count_desc", label: "閲覧数順（多い順）" },
    { value: "view_count_asc", label: "閲覧数順（少ない順）" },
    { value: "favorite_count_desc", label: "お気に入り数順（多い順）" },
    { value: "favorite_count_asc", label: "お気に入り数順（少ない順）" },
  ];
  
  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split("_");
    const order = sortOrder === "desc" ? "desc" : "asc";
    setFilters(prev => ({
      ...prev,
      sortBy: sortBy === "published" ? "published_at" : sortBy === "view" ? "view_count" : sortBy === "favorite" ? "favorite_count" : sortBy,
      sortOrder: order,
    }));
    setArtworkPage(1);
  };
  
  const currentSortValue = `${filters.sortBy === "published_at" ? "published" : filters.sortBy === "view_count" ? "view" : filters.sortBy === "favorite_count" ? "favorite" : filters.sortBy}_${filters.sortOrder}`;

  return (
    <div className="min-h-screen bg-[#F8F6F1]">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-8 max-w-7xl">
        {/* ウェルカムメッセージ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl text-[#3A3A3A] mb-2 sm:mb-3">
            {profileData?.name || profileFormData.name || "アーティスト"}さんのマイページ
          </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 flex items-center gap-2 flex-wrap">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#C3A36D] flex-shrink-0" />
            <span>
              {isLoadingDashboardStats
                ? "統計を読み込み中…"
                : `公開中の作品は${publishedCount}点、展示中の作品は${exhibitedCount}点です`}
            </span>
          </p>
        </motion.div>

        {/* メインタブ */}
        <Tabs value={selectedTab} onValueChange={handleTabChange} className="w-full">
          <div className="mb-6 sm:mb-8 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="grid w-full grid-cols-4 sm:grid-cols-4 min-w-[600px] sm:min-w-0 bg-white p-1 rounded-2xl shadow-sm">
              <TabsTrigger
                value="dashboard"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#C3A36D] data-[state=active]:to-[#D4B478] data-[state=active]:text-white rounded-xl text-xs sm:text-sm"
              >
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="whitespace-nowrap">ダッシュボード</span>
              </TabsTrigger>
              <TabsTrigger
                value="artworks"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#C3A36D] data-[state=active]:to-[#D4B478] data-[state=active]:text-white rounded-xl text-xs sm:text-sm"
              >
                <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="whitespace-nowrap">作品一覧</span>
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#C3A36D] data-[state=active]:to-[#D4B478] data-[state=active]:text-white rounded-xl text-xs sm:text-sm"
              >
                <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="whitespace-nowrap">プロフィール</span>
              </TabsTrigger>
              <TabsTrigger
                value="revenue"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#C3A36D] data-[state=active]:to-[#D4B478] data-[state=active]:text-white rounded-xl text-xs sm:text-sm"
              >
                <Wallet className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="whitespace-nowrap">収益</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ダッシュボードタブ */}
          <TabsContent value="dashboard" className="space-y-8">
            {/* サマリーカード */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-white border-2 border-green-200 h-full">
                  <CardContent className="pt-6 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <Eye className="w-8 h-8 text-green-500" />
                      <Badge className="bg-green-500 text-white">オンライン公開中</Badge>
                    </div>
                    <p className="text-3xl text-[#3A3A3A] mb-1">{publishedCount}点</p>
                    <p className="text-sm text-gray-600">オンライン公開中の作品</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-white border-2 border-[#C3A36D]/30 h-full">
                  <CardContent className="pt-6 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <Building2 className="w-8 h-8 text-[#C3A36D]" />
                      <Badge className="bg-[#C3A36D] text-white">展示中</Badge>
                    </div>
                    <p className="text-3xl text-[#3A3A3A] mb-1">{exhibitedCount}点</p>
                    <p className="text-sm text-gray-600">展示中の作品</p>
                    {qrTopLocations.length > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        {qrTopLocations[0].space_name}
                        {qrTopLocations.length > 1 ? " 他" : ""}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-white border-2 border-blue-200 h-full">
                  <CardContent className="pt-6 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <CheckCircle className="w-8 h-8 text-blue-500" />
                      <Badge className="bg-blue-500 text-white">販売済み</Badge>
                    </div>
                    <p className="text-3xl text-[#3A3A3A] mb-1">{soldCount}点</p>
                    <p className="text-sm text-gray-600">販売済み作品</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-gradient-to-br from-[#C3A36D] to-[#D4B478] border-0 text-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <DollarSign className="w-8 h-8 text-white" />
                      <Badge className="bg-white/20 text-white border-0">今月</Badge>
                    </div>
                    <p className="text-3xl mb-1">¥{Math.round(monthlyRevenue).toLocaleString()}</p>
                    <p className="text-sm text-white/80">今月の収益</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* QRスキャン統計 */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-[#C3A36D]" />
                  QRスキャン統計
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">今月のスキャン数（過去30日）</span>
                      <span className="text-sm text-[#3A3A3A]">{qrMonthly}回</span>
                    </div>
                    <Progress value={qrMonthlyPercent} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">累計スキャン数</span>
                      <span className="text-sm text-[#3A3A3A]">{qrTotal}回</span>
                    </div>
                    <Progress
                      value={qrTotal > 0 ? 100 : 0}
                      className="h-2"
                    />
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-3">📍 スキャンが多い展示スペース</p>
                    <div className="space-y-2">
                      {qrTopLocations.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          まだQRスキャンがありません。展示が始まると集計されます。
                        </p>
                      ) : (
                        qrTopLocations.map((loc) => (
                          <div
                            key={loc.space_id}
                            className="flex items-center justify-between p-3 bg-[#F8F6F1] rounded-lg"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <MapPin className="w-4 h-4 text-[#C3A36D] flex-shrink-0" />
                              <span className="text-sm truncate">{loc.space_name}</span>
                            </div>
                            <Badge
                              variant="outline"
                              className="border-[#C3A36D]/30 text-[#C3A36D] flex-shrink-0"
                            >
                              {loc.scan_count}回
                            </Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 現在の状況メッセージ */}
            <Card className="bg-gradient-to-br from-[#F8F6F1] to-white border-2 border-[#C3A36D]/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#C3A36D]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="w-6 h-6 text-[#C3A36D]" />
                  </div>
                  <div>
                    <h3 className="text-xl text-[#3A3A3A] mb-2">現在の状況</h3>
                    <p className="text-base text-gray-600 leading-relaxed mb-3">
                      あなたの作品は現在、<strong className="text-[#C3A36D]">{exhibitedCount}点</strong>が展示スペースに展示されています。
                    </p>
                    <p className="text-sm text-gray-500">
                      合計QRスキャン：<strong>{qrTotal}回</strong>（過去30日：{qrMonthly}回）
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 作品一覧タブ */}
          <TabsContent value="artworks" className="space-y-6">
            {/* 検索・フィルターバー */}
            <Card className="bg-white">
              <CardContent className="pt-6">
                {/* Top bar: Search, Sort, Filter toggle, Reset, Add button */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    {/* Search input */}
                    <div className="flex-1 w-full sm:w-auto">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="作品名、説明、IDで検索..."
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setArtworkPage(1);
                          }}
                          className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary pl-10"
                        />
                      </div>
                    </div>
                    
                    {/* Sort dropdown */}
                    <Select value={currentSortValue} onValueChange={handleSortChange}>
                      <SelectTrigger className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary w-full sm:w-[200px]">
                        <SelectValue placeholder="並び替え" />
                      </SelectTrigger>
                      <SelectContent>
                        {sortOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {/* Filter toggle button */}
                    <Button
                      variant="outline"
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                      className="h-11 border-gray-200"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      <span>フィルター</span>
                      {isFilterOpen ? (
                        <ChevronUp className="w-4 h-4 ml-2" />
                      ) : (
                        <ChevronDown className="w-4 h-4 ml-2" />
                      )}
                    </Button>
                    
                    {/* Reset button */}
                    <Button
                      variant="outline"
                      onClick={resetFilters}
                      className="h-11 border-gray-200"
                    >
                      <X className="w-4 h-4 mr-2" />
                      <span>リセット</span>
                    </Button>
                    
                    {/* Add artwork button */}
                    <Button
                      className="bg-gradient-to-r from-[#C3A36D] to-[#D4B478] hover:opacity-90 h-11"
                      onClick={() => navigate("/signup/artist/artworks")}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">新しい作品を登録</span>
                      <span className="sm:hidden">登録</span>
                    </Button>
                  </div>
                  
                  {/* Status filter toggles */}
                  <div className="flex flex-wrap gap-2 pb-2 border-b">
                    <Button
                      variant={artworkFilter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setArtworkFilter("all");
                        setArtworkPage(1);
                      }}
                      className={artworkFilter === "all" ? "bg-[#C3A36D] hover:bg-[#C3A36D]/90" : ""}
                    >
                      すべて
                      {statusCounts != null && (
                        <FilterChipCount n={statusCounts.all} active={artworkFilter === "all"} />
                      )}
                    </Button>
                    <Button
                      variant={artworkFilter === "draft" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setArtworkFilter("draft");
                        setArtworkPage(1);
                      }}
                      className={artworkFilter === "draft" ? "bg-gray-500 hover:bg-gray-600" : "border-gray-300"}
                    >
                      未公開
                      {statusCounts != null && (
                        <FilterChipCount n={statusCounts.draft} active={artworkFilter === "draft"} />
                      )}
                    </Button>
                    <Button
                      variant={artworkFilter === "published" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setArtworkFilter("published");
                        setArtworkPage(1);
                      }}
                      className={artworkFilter === "published" ? "bg-green-500 hover:bg-green-600" : "border-green-200"}
                    >
                      オンライン公開中
                      {statusCounts != null && (
                        <FilterChipCount
                          n={statusCounts.published}
                          active={artworkFilter === "published"}
                        />
                      )}
                    </Button>
                    <Button
                      variant={artworkFilter === "exhibition_requested" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setArtworkFilter("exhibition_requested");
                        setArtworkPage(1);
                      }}
                      className={
                        artworkFilter === "exhibition_requested"
                          ? "bg-orange-600 hover:bg-orange-700 text-white"
                          : "border-orange-300"
                      }
                    >
                      展示依頼中
                      {statusCounts != null && (
                        <FilterChipCount
                          n={statusCounts.exhibition_requested}
                          active={artworkFilter === "exhibition_requested"}
                        />
                      )}
                    </Button>
                    <Button
                      variant={
                        artworkFilter === ARTWORK_FILTER_IN_TRANSIT_UNIFIED
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        setArtworkFilter(ARTWORK_FILTER_IN_TRANSIT_UNIFIED);
                        setArtworkPage(1);
                      }}
                      className={
                        artworkFilter === ARTWORK_FILTER_IN_TRANSIT_UNIFIED
                          ? "bg-violet-600 hover:bg-violet-700 text-white"
                          : "border-violet-300"
                      }
                      title="①展示向け（アーティスト発送後）②法人返送（法人発送後）③回収返送（法人発送後）— いずれも輸送中。詳細は in_transit_kind"
                    >
                      輸送中
                      {statusCounts != null && (
                        <FilterChipCount
                          n={statusCounts.in_transit}
                          active={artworkFilter === ARTWORK_FILTER_IN_TRANSIT_UNIFIED}
                        />
                      )}
                    </Button>
                    <Button
                      variant={artworkFilter === "exhibited" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setArtworkFilter("exhibited");
                        setArtworkPage(1);
                      }}
                      className={artworkFilter === "exhibited" ? "bg-[#C3A36D] hover:bg-[#C3A36D]/90" : "border-[#C3A36D]/30"}
                    >
                      展示中
                      {statusCounts != null && (
                        <FilterChipCount
                          n={statusCounts.exhibited}
                          active={artworkFilter === "exhibited"}
                        />
                      )}
                    </Button>
                    <Button
                      variant={
                        artworkFilter === ARTWORK_FILTER_RETURN_REQUESTED
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        setArtworkFilter(ARTWORK_FILTER_RETURN_REQUESTED);
                        setArtworkPage(1);
                      }}
                      className={
                        artworkFilter === ARTWORK_FILTER_RETURN_REQUESTED
                          ? "bg-teal-600 hover:bg-teal-700 text-white"
                          : "border-teal-300"
                      }
                      title="法人から返却が申請され、手続き中の作品（展示中のまま）"
                    >
                      返却申請中
                      {statusCounts != null && (
                        <FilterChipCount
                          n={statusCounts.return_requested ?? 0}
                          active={artworkFilter === ARTWORK_FILTER_RETURN_REQUESTED}
                        />
                      )}
                    </Button>
                    <Button
                      variant={
                        artworkFilter === ARTWORK_FILTER_RETURNED_TO_ARTIST
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        setArtworkFilter(ARTWORK_FILTER_RETURNED_TO_ARTIST);
                        setArtworkPage(1);
                      }}
                      className={
                        artworkFilter === ARTWORK_FILTER_RETURNED_TO_ARTIST
                          ? "bg-slate-600 hover:bg-slate-700 text-white"
                          : "border-slate-300"
                      }
                      title="アーティストに到着済み（法人返却完了または回収完了。DB: recalled）"
                    >
                      アーティストに返却済み
                      {statusCounts != null && (
                        <FilterChipCount
                          n={statusCounts.recalled}
                          active={artworkFilter === ARTWORK_FILTER_RETURNED_TO_ARTIST}
                        />
                      )}
                    </Button>
                    <Button
                      variant={
                        artworkFilter === ARTWORK_FILTER_RECALL_REQUESTED
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        setArtworkFilter(ARTWORK_FILTER_RECALL_REQUESTED);
                        setArtworkPage(1);
                      }}
                      className={
                        artworkFilter === ARTWORK_FILTER_RECALL_REQUESTED
                          ? "bg-rose-600 hover:bg-rose-700 text-white"
                          : "border-rose-300"
                      }
                      title="アーティストが回収を依頼し、法人の発送を待っている状態（展示中のまま）"
                    >
                      回収依頼中
                      {statusCounts != null && (
                        <FilterChipCount
                          n={statusCounts.recall_requested ?? 0}
                          active={artworkFilter === ARTWORK_FILTER_RECALL_REQUESTED}
                        />
                      )}
                    </Button>
                    <Button
                      variant={artworkFilter === "sold" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setArtworkFilter("sold");
                        setArtworkPage(1);
                      }}
                      className={artworkFilter === "sold" ? "bg-blue-500 hover:bg-blue-600" : "border-blue-200"}
                    >
                      売却済み
                      {statusCounts != null && (
                        <FilterChipCount n={statusCounts.sold} active={artworkFilter === "sold"} />
                      )}
                    </Button>
                  </div>
                  
                  {/* Collapsible Filter Panel */}
                  <AnimatePresence>
                    {isFilterOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="pt-4 space-y-6 border-t overflow-hidden"
                      >
                      {/* Date Range */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#C3A36D]" />
                          <Label className="text-sm font-semibold">日付範囲</Label>
                        </div>
                        <div className="grid sm:grid-cols-4 gap-3">
                          <Select value={filters.dateType} onValueChange={(value: any) => setFilters(prev => ({ ...prev, dateType: value }))}>
                            <SelectTrigger className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="created_at">作成日</SelectItem>
                              <SelectItem value="published_at">公開日</SelectItem>
                              <SelectItem value="updated_at">更新日</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                            className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary"
                            placeholder="開始日"
                          />
                          <Input
                            type="date"
                            value={filters.dateTo}
                            onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                            className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary"
                            placeholder="終了日"
                          />
                          <Select onValueChange={applyDatePreset}>
                            <SelectTrigger className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary">
                              <SelectValue placeholder="クイック選択" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="today">今日</SelectItem>
                              <SelectItem value="week">今週</SelectItem>
                              <SelectItem value="month">今月</SelectItem>
                              <SelectItem value="3months">過去3ヶ月</SelectItem>
                              <SelectItem value="6months">過去6ヶ月</SelectItem>
                              <SelectItem value="year">過去1年</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Price Range */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-[#C3A36D]" />
                          <Label className="text-sm font-semibold">価格範囲</Label>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs text-gray-600">販売価格（円）</Label>
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                type="number"
                                placeholder="最小"
                                value={filters.minPrice}
                                onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                                className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary"
                              />
                              <Input
                                type="number"
                                placeholder="最大"
                                value={filters.maxPrice}
                                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                                className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-gray-600">レンタル価格（円）</Label>
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                type="number"
                                placeholder="最小"
                                value={filters.minLeasePrice}
                                onChange={(e) => setFilters(prev => ({ ...prev, minLeasePrice: e.target.value }))}
                                className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary"
                              />
                              <Input
                                type="number"
                                placeholder="最大"
                                value={filters.maxLeasePrice}
                                onChange={(e) => setFilters(prev => ({ ...prev, maxLeasePrice: e.target.value }))}
                                className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Size & Dimensions */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-[#C3A36D]" />
                          <Label className="text-sm font-semibold">サイズ・寸法</Label>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-xs text-gray-600 mb-2 block">サイズクラス</Label>
                            <div className="flex flex-wrap gap-2">
                              {sizeClassOptions.map((size) => (
                                <div key={size} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`size-${size}`}
                                    checked={filters.sizeClass.includes(size)}
                                    onCheckedChange={() => toggleSizeClass(size)}
                                  />
                                  <Label htmlFor={`size-${size}`} className="text-sm cursor-pointer">
                                    {size}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="grid sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs text-gray-600">幅（cm）</Label>
                              <div className="grid grid-cols-2 gap-2">
                                <Input
                                  type="number"
                                  placeholder="最小"
                                  value={filters.minWidth}
                                  onChange={(e) => setFilters(prev => ({ ...prev, minWidth: e.target.value }))}
                                  className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary"
                                />
                                <Input
                                  type="number"
                                  placeholder="最大"
                                  value={filters.maxWidth}
                                  onChange={(e) => setFilters(prev => ({ ...prev, maxWidth: e.target.value }))}
                                  className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs text-gray-600">高さ（cm）</Label>
                              <div className="grid grid-cols-2 gap-2">
                                <Input
                                  type="number"
                                  placeholder="最小"
                                  value={filters.minHeight}
                                  onChange={(e) => setFilters(prev => ({ ...prev, minHeight: e.target.value }))}
                                  className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary"
                                />
                                <Input
                                  type="number"
                                  placeholder="最大"
                                  value={filters.maxHeight}
                                  onChange={(e) => setFilters(prev => ({ ...prev, maxHeight: e.target.value }))}
                                  className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs text-gray-600">奥行き（cm）</Label>
                              <div className="grid grid-cols-2 gap-2">
                                <Input
                                  type="number"
                                  placeholder="最小"
                                  value={filters.minDepth}
                                  onChange={(e) => setFilters(prev => ({ ...prev, minDepth: e.target.value }))}
                                  className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary"
                                />
                                <Input
                                  type="number"
                                  placeholder="最大"
                                  value={filters.maxDepth}
                                  onChange={(e) => setFilters(prev => ({ ...prev, maxDepth: e.target.value }))}
                                  className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-gray-600">重量（kg）</Label>
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                type="number"
                                placeholder="最小"
                                value={filters.minWeight}
                                onChange={(e) => setFilters(prev => ({ ...prev, minWeight: e.target.value }))}
                                className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary"
                              />
                              <Input
                                type="number"
                                placeholder="最大"
                                value={filters.maxWeight}
                                onChange={(e) => setFilters(prev => ({ ...prev, maxWeight: e.target.value }))}
                                className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Technique & Medium */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#C3A36D]" />
                          <Label className="text-sm font-semibold">技法・素材</Label>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs text-gray-600">技法</Label>
                            <div className="flex flex-wrap gap-2">
                              {mediumOptions.map((option) => (
                                <div key={option.value} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`medium-${option.value}`}
                                    checked={filters.medium.includes(option.value)}
                                    onCheckedChange={() => toggleMedium(option.value)}
                                  />
                                  <Label htmlFor={`medium-${option.value}`} className="text-sm cursor-pointer">
                                    {option.label}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-gray-600">支持体</Label>
                            <div className="flex flex-wrap gap-2">
                              {supportOptions.map((option) => (
                                <div key={option.value} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`support-${option.value}`}
                                    checked={filters.support.includes(option.value)}
                                    onCheckedChange={() => toggleSupport(option.value)}
                                  />
                                  <Label htmlFor={`support-${option.value}`} className="text-sm cursor-pointer">
                                    {option.label}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Year Range */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#C3A36D]" />
                          <Label className="text-sm font-semibold">制作年</Label>
                        </div>
                        <div className="grid sm:grid-cols-4 gap-3">
                          <Input
                            type="number"
                            placeholder="開始年"
                            value={filters.yearFrom}
                            onChange={(e) => setFilters(prev => ({ ...prev, yearFrom: e.target.value }))}
                            className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary"
                          />
                          <Input
                            type="number"
                            placeholder="終了年"
                            value={filters.yearTo}
                            onChange={(e) => setFilters(prev => ({ ...prev, yearTo: e.target.value }))}
                            className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary"
                          />
                          <Select onValueChange={applyYearPreset}>
                            <SelectTrigger className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary">
                              <SelectValue placeholder="クイック選択" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="thisYear">2024年</SelectItem>
                              <SelectItem value="lastYear">2023年</SelectItem>
                              <SelectItem value="5years">過去5年</SelectItem>
                              <SelectItem value="10years">過去10年</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Artwork Properties */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[#C3A36D]" />
                          <Label className="text-sm font-semibold">作品プロパティ</Label>
                        </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Label htmlFor="hasFrame" className="text-sm cursor-pointer">
                            額装あり
                          </Label>
                          <Switch
                            id="hasFrame"
                            checked={filters.hasFrame === true}
                            onCheckedChange={(checked) =>
                              setFilters((prev) => ({
                                ...prev,
                                hasFrame: checked ? true : undefined,
                              }))
                            }
                          />
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Label htmlFor="isAIGenerated" className="text-sm cursor-pointer">
                            AI生成作品
                          </Label>
                          <Switch
                            id="isAIGenerated"
                            checked={filters.isAIGenerated === true}
                            onCheckedChange={(checked) =>
                              setFilters((prev) => ({
                                ...prev,
                                isAIGenerated: checked ? true : undefined,
                              }))
                            }
                          />
                        </div>
                      </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Style Tags */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#C3A36D]" />
                          <Label className="text-sm font-semibold">スタイルタグ</Label>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {styleTagOptions.map((tag) => (
                            <div key={tag} className="flex items-center space-x-2">
                              <Checkbox
                                id={`tag-${tag}`}
                                checked={filters.styleTags.includes(tag)}
                                onCheckedChange={() => toggleStyleTag(tag)}
                              />
                              <Label htmlFor={`tag-${tag}`} className="text-sm cursor-pointer">
                                {tag}
                              </Label>
                            </div>
                          ))}
                        </div>
                        {filters.styleTags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {filters.styleTags.map((tag) => (
                              <Badge key={tag} variant="outline" className="border-[#C3A36D]/30 text-[#C3A36D]">
                                {tag}
                                <button
                                  onClick={() => toggleStyleTag(tag)}
                                  className="ml-2 hover:text-red-500"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <Separator />
                      
                      {/* Engagement Metrics */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-[#C3A36D]" />
                          <Label className="text-sm font-semibold">エンゲージメント</Label>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs text-gray-600">閲覧数</Label>
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                type="number"
                                placeholder="最小"
                                value={filters.minViewCount}
                                onChange={(e) => setFilters(prev => ({ ...prev, minViewCount: e.target.value }))}
                                className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary"
                              />
                              <Input
                                type="number"
                                placeholder="最大"
                                value={filters.maxViewCount}
                                onChange={(e) => setFilters(prev => ({ ...prev, maxViewCount: e.target.value }))}
                                className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-gray-600">お気に入り数</Label>
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                type="number"
                                placeholder="最小"
                                value={filters.minFavoriteCount}
                                onChange={(e) => setFilters(prev => ({ ...prev, minFavoriteCount: e.target.value }))}
                                className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary"
                              />
                              <Input
                                type="number"
                                placeholder="最大"
                                value={filters.maxFavoriteCount}
                                onChange={(e) => setFilters(prev => ({ ...prev, maxFavoriteCount: e.target.value }))}
                                className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-gray-600">問い合わせ数</Label>
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                type="number"
                                placeholder="最小"
                                value={filters.minInquiryCount}
                                onChange={(e) => setFilters(prev => ({ ...prev, minInquiryCount: e.target.value }))}
                                className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary"
                              />
                              <Input
                                type="number"
                                placeholder="最大"
                                value={filters.maxInquiryCount}
                                onChange={(e) => setFilters(prev => ({ ...prev, maxInquiryCount: e.target.value }))}
                                className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>

            {/* 作品グリッド */}
            {isLoadingArtworks ? (
              <Card className="bg-white">
                <CardContent className="py-16 text-center">
                  <Clock className="w-8 h-8 animate-spin text-[#C3A36D] mx-auto mb-4" />
                  <p className="text-gray-600">作品を読み込み中...</p>
                </CardContent>
              </Card>
            ) : (
            <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArtworks.map((artwork, index) => {
                const config = listBadgeConfig(artwork);
                return (
                  <motion.div
                    key={artwork.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="h-full"
                  >
                    <Card
                      className="bg-white border-2 border-gray-200 hover:shadow-xl transition-shadow overflow-hidden h-full flex flex-col relative cursor-pointer"
                      onClick={() => navigate(`/artwork-edit/${artwork.id}`)}
                    >
                      {/* 作品画像 - Carousel */}
                      <div 
                        className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden"
                        onMouseEnter={() => handleCarouselHover(artwork.id, true)}
                        onMouseLeave={() => handleCarouselHover(artwork.id, false)}
                      >
                        {/* ステータスバッジを右上 — z-30 でカルセル画像(z-10)より手前に描画 */}
                        <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 items-end">
                          <Badge className={`${config.color} text-white border-0 shadow-md`}>
                            {config.label}
                          </Badge>
                          {/* QRスキャン数バッジ */}
                          {artwork.scans !== undefined && artwork.scans > 0 && (
                            <Badge
                              variant="outline"
                              className="bg-white/95 border-gray-300 shadow-sm"
                              title="作品ページの閲覧数（公開中に他ユーザーが詳細を開いた回数）"
                            >
                              <Eye className="w-3 h-3 mr-1 shrink-0" />
                              閲覧 {artwork.scans}回
                            </Badge>
                          )}
                          {(issueOpenCounts[artwork.id] ?? 0) > 0 && (
                            <Badge className="bg-red-600 hover:bg-red-600 text-white border-0 shadow-md">
                              <AlertTriangle className="w-3 h-3 mr-1 shrink-0" />
                              不具合報告 {issueOpenCounts[artwork.id]}
                            </Badge>
                          )}
                        </div>

                        {artwork.images && artwork.images.length > 0 ? (
                          <>
                            {/* Image Carousel */}
                            <div className="relative w-full h-full">
                              {artwork.images.map((imageUrl: string, imgIndex: number) => {
                                const carouselState = artworkCarousels.get(artwork.id);
                                const isActive = carouselState?.currentIndex === imgIndex;
                                
                                return (
                                  <motion.div
                                    key={imgIndex}
                                    initial={false}
                                    animate={{
                                      opacity: isActive ? 1 : 0,
                                      scale: isActive ? 1 : 0.95,
                                    }}
                                    transition={{
                                      duration: 0.6,
                                      ease: "easeInOut",
                                    }}
                                    className={`absolute inset-0 ${isActive ? "z-10" : "z-0"}`}
                                  >
                                    <ImageWithFallback
                                      src={imageUrl}
                                      alt={`${artwork.name} - 画像 ${imgIndex + 1}`}
                                      className="w-full h-full object-cover"
                                      fallback={
                                        <div className="w-full h-full flex items-center justify-center">
                                          <ImageIcon className="w-20 h-20 text-gray-300" strokeWidth={1.5} />
                                        </div>
                                      }
                                    />
                                  </motion.div>
                                );
                              })}
                            </div>
                            
                            {/* Navigation arrows */}
                            {artwork.images.length > 1 && (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCarouselPrev(artwork.id);
                                  }}
                                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 sm:p-2 transition-all z-20"
                                  aria-label="前の画像"
                                >
                                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCarouselNext(artwork.id);
                                  }}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 sm:p-2 transition-all z-20"
                                  aria-label="次の画像"
                                >
                                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                              </>
                            )}
                            
                            {/* Image counter and auto-play indicator */}
                            {artwork.images.length > 1 && (
                              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                                <div className="bg-black/50 text-white px-2 sm:px-3 py-1 rounded-full text-xs">
                                  {(artworkCarousels.get(artwork.id)?.currentIndex ?? 0) + 1} / {artwork.images.length}
                                </div>
                                {artworkCarousels.get(artwork.id)?.isAutoPlaying && !artworkCarousels.get(artwork.id)?.isHovering && (
                                  <div className="bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></div>
                                    <span className="hidden sm:inline">自動再生</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        ) : artwork.isVideo ? (
                          <Video className="w-20 h-20 text-gray-300" strokeWidth={1.5} />
                        ) : (
                          <ImageIcon className="w-20 h-20 text-gray-300" strokeWidth={1.5} />
                        )}
                      </div>

                      <CardContent className="p-5 space-y-3 flex-1 flex flex-col">
                        <div>
                          <h3 className="text-xl text-[#3A3A3A] mb-1">{artwork.name}</h3>
                          <p className="text-lg text-[#C3A36D]">¥{artwork.price.toLocaleString()}</p>
                        </div>

                        {/* 展示情報 */}
                        {artwork.status === "exhibited" && artwork.location && (
                          <div className={`p-3 ${config.bgColor} rounded-lg`}>
                            <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              展示先
                            </p>
                            <p className="text-sm text-[#3A3A3A]">{artwork.location}</p>
                            {artwork.exhibitStart && (
                              <p className="text-xs text-gray-500 mt-1">{artwork.exhibitStart}〜</p>
                            )}
                          </div>
                        )}

                        {/* 販売情報 */}
                        {artwork.status === "sold" && (
                          <div className={`p-3 ${config.bgColor} rounded-lg`}>
                            <p className="text-sm text-gray-600 mb-1">購入者</p>
                            <p className="text-sm text-[#3A3A3A]">{artwork.buyer}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className="bg-green-500 text-white text-xs">支払済み</Badge>
                              <span className="text-xs text-gray-500">{artwork.soldDate}</span>
                            </div>
                          </div>
                        )}

                        {/* アクションボタン */}
                        <div className="flex gap-2 pt-2 mt-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/artwork-edit/${artwork.id}`);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                            <span>編集</span>
                          </Button>
                          {artwork.status === "exhibited" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={(e) => handleRequestReturn(artwork, e)}
                            >
                              <RotateCcw className="w-4 h-4" />
                              <span>回収依頼</span>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
            {/* Pagination controls */}
            {artworkTotal > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                <div className="text-xs sm:text-sm text-gray-600">
                  全 {artworkTotal} 件中{" "}
                  {Math.min((artworkPage - 1) * artworkPageSize + 1, artworkTotal)}–
                  {Math.min(artworkPage * artworkPageSize, artworkTotal)} 件を表示
                </div>
                <div className="flex items-center gap-4">
                  {/* Page size selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm text-gray-600">表示件数</span>
                    <Select
                      value={String(artworkPageSize)}
                      onValueChange={(value) => {
                        const size = parseInt(value, 10);
                        setArtworkPageSize(size);
                        setArtworkPage(1);
                      }}
                    >
                      <SelectTrigger className="h-9 w-[90px] bg-gray-100 border-gray-200 focus:bg-white focus:border-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5件</SelectItem>
                        <SelectItem value="10">10件</SelectItem>
                        <SelectItem value="20">20件</SelectItem>
                        <SelectItem value="50">50件</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Page navigation */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      disabled={artworkPage <= 1}
                      onClick={() => setArtworkPage((prev) => Math.max(1, prev - 1))}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-xs sm:text-sm text-gray-700 min-w-[80px] text-center">
                      {artworkPage} /{" "}
                      {Math.max(1, Math.ceil(artworkTotal / artworkPageSize))}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      disabled={
                        artworkPage >= Math.max(
                          1,
                          Math.ceil(artworkTotal / artworkPageSize)
                        )
                      }
                      onClick={() =>
                        setArtworkPage((prev) =>
                          prev + 1 > Math.ceil(artworkTotal / artworkPageSize)
                            ? prev
                            : prev + 1
                        )
                      }
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
            </>
            )}

            {!isLoadingArtworks && filteredArtworks.length === 0 && (
              <Card className="bg-white">
                <CardContent className="py-16 text-center">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg text-gray-600 mb-4">
                    {artworkFilter === "all"
                      ? "まだ作品が登録されていません"
                      : `${statusConfig[artworkFilter as keyof typeof statusConfig]?.label}の作品はありません`}
                  </p>
                  <Button
                    className="bg-gradient-to-r from-[#C3A36D] to-[#D4B478] hover:opacity-90"
                    onClick={() => navigate("/signup/artist/artworks")}
                  >
                    <Plus className="w-4 h-4" />
                    <span>作品を登録する</span>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* プロフィールタブ */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>基本情報</CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  あなたのプロフィールは、法人ギャラリーに紹介される情報です。<br />
                  更新するとすぐに反映されます。
                </p>
                {profileData && (
                  <div className="mt-2">
                    <Progress value={profileData.profile_completion} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">
                      プロフィール完成度: {profileData.profile_completion}%
                    </p>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoadingProfile ? (
                  <div className="flex items-center justify-center py-8">
                    <Clock className="w-6 h-6 animate-spin text-[#C3A36D]" />
                    <span className="ml-2 text-gray-600">読み込み中...</span>
                  </div>
                ) : (
                  <>
                {/* プロフィール写真 */}
                <div>
                  <Label>プロフィール写真</Label>
                  <div className="flex items-center gap-4 mt-2">
                        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      {profileImage ? (
                            <img src={profileImage} alt="プロフィール" className="w-24 h-24 rounded-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById("profileImageInput")?.click()}
                        disabled={isSavingProfile}
                      >
                        <ImageIcon className="w-4 h-4" />
                        <span>写真を変更</span>
                      </Button>
                      {profileImage && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDeleteProfileImageClick}
                          disabled={isSavingProfile}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          <X className="w-4 h-4" />
                          <span>写真を削除</span>
                        </Button>
                      )}
                    </div>
                    <input
                      type="file"
                      id="profileImageInput"
                      className="hidden"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                          disabled={isSavingProfile}
                    />
                  </div>
                </div>

                <Separator />

                {/* 名前 */}
                <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm">名前（公開名）</Label>
                      <Input
                        id="name"
                        value={profileFormData.name}
                        onChange={(e) => setProfileFormData({ ...profileFormData, name: e.target.value })}
                        className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary"
                      />
                </div>

                {/* メールアドレス */}
                <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm">メールアドレス（非公開）</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData?.email || ""}
                        disabled
                        className="h-11 bg-gray-100 border-gray-200"
                      />
                  <p className="text-xs text-gray-500">メールアドレスは公開されません</p>
                </div>

                {/* 電話番号 */}
                <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm">電話番号（非公開）</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profileFormData.phone_number}
                        onChange={(e) => setProfileFormData({ ...profileFormData, phone_number: e.target.value })}
                        className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary"
                      />
                  <p className="text-xs text-gray-500">電話番号は公開されません</p>
                </div>

                {/* 配送・返送先住所（addresses.shipping） */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg text-[#3A3A3A]">配送・返送先住所</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      宛名は上記の「名前（公開名）」を使用します。ギャラリーには表示されません。作品の発送・返送・返品手続きに使用します。
                      <span className="block mt-0.5">
                        Recipient name matches your public name above. Not shown publicly. Used for shipping and returns.
                      </span>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="shipping_postal_code" className="text-sm">
                        郵便番号
                      </Label>
                      <Input
                        id="shipping_postal_code"
                        value={profileFormData.shipping_postal_code}
                        onChange={(e) =>
                          setProfileFormData({
                            ...profileFormData,
                            shipping_postal_code: e.target.value,
                          })
                        }
                        className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary"
                        placeholder="123-4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shipping_prefecture" className="text-sm">
                        都道府県
                      </Label>
                      <Input
                        id="shipping_prefecture"
                        value={profileFormData.shipping_prefecture}
                        onChange={(e) =>
                          setProfileFormData({
                            ...profileFormData,
                            shipping_prefecture: e.target.value,
                          })
                        }
                        className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary"
                        placeholder="東京都"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shipping_city" className="text-sm">
                      市区町村
                    </Label>
                    <Input
                      id="shipping_city"
                      value={profileFormData.shipping_city}
                      onChange={(e) =>
                        setProfileFormData({ ...profileFormData, shipping_city: e.target.value })
                      }
                      className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shipping_street_address" className="text-sm">
                      番地
                    </Label>
                    <Input
                      id="shipping_street_address"
                      value={profileFormData.shipping_street_address}
                      onChange={(e) =>
                        setProfileFormData({
                          ...profileFormData,
                          shipping_street_address: e.target.value,
                        })
                      }
                      className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shipping_building_name" className="text-sm">
                      建物名・部屋番号（任意）
                    </Label>
                    <Input
                      id="shipping_building_name"
                      value={profileFormData.shipping_building_name}
                      onChange={(e) =>
                        setProfileFormData({
                          ...profileFormData,
                          shipping_building_name: e.target.value,
                        })
                      }
                      className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shipping_phone" className="text-sm">
                      配送先電話（任意）
                    </Label>
                    <Input
                      id="shipping_phone"
                      type="tel"
                      value={profileFormData.shipping_phone}
                      onChange={(e) =>
                        setProfileFormData({ ...profileFormData, shipping_phone: e.target.value })
                      }
                      className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary"
                    />
                    <p className="text-xs text-gray-500">
                      宅配担当者の連絡用。未入力の場合は上記の「電話番号（非公開）」を参照します。
                    </p>
                  </div>
                </div>

                {/* 自己紹介 */}
                <div className="space-y-2">
                      <Label htmlFor="bio" className="text-sm">自己紹介文</Label>
                  <Textarea
                    id="bio"
                    rows={4}
                        value={profileFormData.biography}
                        onChange={(e) => setProfileFormData({ ...profileFormData, biography: e.target.value })}
                    placeholder="あなたの作品について、制作のテーマやこだわりを教えてください"
                        className="bg-gray-100 border-gray-200 focus:bg-white focus:border-primary resize-none"
                  />
                </div>

                {/* 経歴 */}
                <div className="space-y-2">
                      <Label htmlFor="career" className="text-sm">経歴・展示歴</Label>
                  <Textarea
                    id="career"
                    rows={4}
                        value={profileFormData.career}
                        onChange={(e) => setProfileFormData({ ...profileFormData, career: e.target.value })}
                        placeholder="学歴、受賞歴、個展・グループ展の経歴など（例：2020年 東京藝術大学卒業）"
                        className="bg-gray-100 border-gray-200 focus:bg-white focus:border-primary resize-none"
                      />
                      <p className="text-xs text-gray-500">1行に1つの経歴を記載してください（例：2020年 東京藝術大学卒業）</p>
                </div>

                <Separator />

                {/* SNSリンク */}
                <div className="space-y-4">
                  <h3 className="text-lg text-[#3A3A3A]">SNS・Webサイト</h3>

                  <div className="space-y-2">
                        <Label htmlFor="instagram" className="text-sm">Instagram</Label>
                    <div className="flex gap-2">
                          <Input
                            id="instagram"
                            value={profileFormData.instagram}
                            onChange={(e) => setProfileFormData({ ...profileFormData, instagram: e.target.value })}
                            placeholder="@username"
                            className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary"
                          />
                          {profileFormData.instagram && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                const url = profileFormData.instagram.startsWith("http")
                                  ? profileFormData.instagram
                                  : `https://instagram.com/${profileFormData.instagram.replace("@", "")}`;
                                window.open(url, "_blank");
                              }}
                            >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                          )}
                    </div>
                  </div>

                  <div className="space-y-2">
                        <Label htmlFor="website" className="text-sm">Webサイト</Label>
                    <div className="flex gap-2">
                          <Input
                            id="website"
                            value={profileFormData.website}
                            onChange={(e) => setProfileFormData({ ...profileFormData, website: e.target.value })}
                            placeholder="https://"
                            className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary"
                          />
                          {profileFormData.website && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                const url = profileFormData.website.startsWith("http")
                                  ? profileFormData.website
                                  : `https://${profileFormData.website}`;
                                window.open(url, "_blank");
                              }}
                            >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                          )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 銀行口座情報 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg text-[#3A3A3A]">銀行口座情報</h3>
                    <Badge variant="outline" className="text-xs">
                      非公開
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    作品の売上金を受け取る口座情報です。この情報は公開されません。
                  </p>
                  <Button variant="outline" onClick={() => navigate("/bank-account-edit")}>
                    <Edit className="w-4 h-4" />
                    <span>口座情報を編集</span>
                  </Button>
                </div>

                {/* 保存ボタン */}
                <div className="flex gap-3 pt-4">
                  <Button
                        className="bg-gradient-to-r from-[#C3A36D] to-[#D4B478] hover:opacity-90 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleSaveProfile}
                        disabled={isSavingProfile || !hasProfileChanges()}
                  >
                    {isSavingProfile ? (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 animate-spin" />
                        <span>保存中...</span>
                      </div>
                    ) : (
                      "変更を保存"
                    )}
                  </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          // Reload profile data to reset form
                          loadProfileData();
                        }}
                        disabled={isSavingProfile || !hasProfileChanges()}
                      >
                        キャンセル
                      </Button>
                </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 収益タブ */}
          <TabsContent value="revenue" className="space-y-6">
            {/* 収益サマリー */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-[#C3A36D] to-[#D4B478] text-white border-0">
                <CardContent className="pt-6">
                  <DollarSign className="w-8 h-8 mb-3 text-white" />
                  <p className="text-sm text-white/80 mb-1">累計売上</p>
                  <p className="text-3xl">
                    ¥{Math.round(totalRevenueAll).toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-2 border-[#C3A36D]/30">
                <CardContent className="pt-6">
                  <TrendingUp className="w-8 h-8 mb-3 text-[#C3A36D]" />
                  <p className="text-sm text-gray-600 mb-1">今月売上</p>
                  <p className="text-3xl text-[#3A3A3A]">
                    ¥{Math.round(monthlyRevenue).toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-2 border-gray-200">
                <CardContent className="pt-6">
                  <Calendar className="w-8 h-8 mb-3 text-gray-500" />
                  <p className="text-sm text-gray-600 mb-1">次回振込予定</p>
                  <p className="text-xl text-[#3A3A3A]">—</p>
                </CardContent>
              </Card>
            </div>

            {/* 月別売上グラフ */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#C3A36D]" />
                  月別売上推移
                </CardTitle>
              </CardHeader>
              <CardContent>
                {revenueAnalyticsLoading ? (
                  <p className="text-sm text-gray-500">読み込み中…</p>
                ) : revenueByMonth.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    販売済みの作品がまだないか、売上データがありません。
                  </p>
                ) : (
                <div className="space-y-4">
                  {[...revenueByMonth].reverse().map((item, index) => (
                    <div key={item.period} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.period}</span>
                        <span className="text-[#3A3A3A]">
                          ¥{Math.round(item.revenue).toLocaleString()}
                        </span>
                      </div>
                      <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${maxMonthRev > 0 ? Math.min(100, (item.revenue / maxMonthRev) * 100) : 0}%`,
                          }}
                          transition={{ delay: index * 0.05, duration: 0.5 }}
                          className="h-full bg-gradient-to-r from-[#C3A36D] to-[#D4B478]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </CardContent>
            </Card>

            {/* 販売済み作品一覧 */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>販売済み作品</CardTitle>
              </CardHeader>
              <CardContent>
                {revenueAnalyticsLoading ? (
                  <p className="text-sm text-gray-500">読み込み中…</p>
                ) : !revenueAnalytics?.revenue_by_artwork?.length ? (
                  <p className="text-sm text-gray-500">販売済みの作品はまだありません。</p>
                ) : (
                <div className="space-y-4">
                  {revenueAnalytics.revenue_by_artwork.map((row) => (
                      <div
                        key={row.artwork_id}
                        className="flex items-center justify-between p-4 bg-[#F8F6F1] rounded-lg"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-base text-[#3A3A3A] mb-1 truncate">
                              {row.title}
                            </p>
                            <p className="text-xs text-gray-500 font-mono">{row.custom_id}</p>
                            {row.sold_at && (
                              <p className="text-xs text-gray-500">
                                {new Date(row.sold_at).toLocaleDateString("ja-JP")}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg text-[#C3A36D] mb-1">
                            ¥{Math.round(row.price).toLocaleString()}
                          </p>
                          <Badge className="bg-green-600 text-white text-xs">販売済み</Badge>
                        </div>
                      </div>
                    ))}
                </div>
                )}
              </CardContent>
            </Card>

            {/* 振込履歴 */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>振込履歴</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  振込の詳細は別途お知らせする予定です。現時点ではデータ連携していません。
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ArtistReturnRequestDialog
        open={returnRequestDialogOpen}
        onOpenChange={setReturnRequestDialogOpen}
        artwork={selectedArtworkForReturn}
      />

      {/* Delete Profile Image Confirmation Dialog */}
      <AlertDialog open={deleteImageDialogOpen} onOpenChange={setDeleteImageDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>プロフィール写真を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。プロフィール写真が削除され、デフォルトのアイコンが表示されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSavingProfile}>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProfileImage}
              disabled={isSavingProfile}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isSavingProfile ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  削除中...
                </>
              ) : (
                "削除する"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
}

