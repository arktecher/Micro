import React, { useState, useEffect } from "react";
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
import { artistService, type ArtistProfile } from "@/services/artist.service";
import { userService } from "@/services/user.service";
import { artworkService, type Artwork as ArtworkAPI } from "@/services/artwork.service";
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

// モックデータ
const mockStats = {
  publishedArtworks: 12,
  exhibitedArtworks: 3,
  soldArtworks: 2,
  monthlyRevenue: 160000,
  totalScans: 124,
  monthlyScans: 45,
};

const mockArtworks = [
  {
    id: "1",
    name: "夏の思い出",
    status: "exhibited",
    price: 50000,
    location: "The Tokyo Hotel",
    scans: 23,
    exhibitStart: "2024-12-01",
    hasImage: true,
    isVideo: false,
    tags: ["風景", "モダン"],
  },
  {
    id: "2",
    name: "都市の夜",
    status: "exhibited",
    price: 80000,
    location: "渋谷オフィスビル",
    scans: 18,
    exhibitStart: "2024-11-15",
    hasImage: true,
    isVideo: false,
    tags: ["都市", "抽象"],
  },
  {
    id: "3",
    name: "静寂",
    status: "published",
    price: 120000,
    scans: 34,
    hasImage: true,
    isVideo: true,
    tags: ["抽象", "モダン"],
  },
  {
    id: "4",
    name: "朝の光",
    status: "published",
    price: 65000,
    scans: 12,
    hasImage: true,
    isVideo: false,
    tags: ["風景"],
  },
  {
    id: "5",
    name: "冬の詩",
    status: "sold",
    price: 95000,
    soldDate: "2024-10-20",
    buyer: "株式会社ABC",
    paymentStatus: "paid",
    hasImage: true,
    isVideo: false,
    tags: ["風景", "季節"],
  },
  {
    id: "6",
    name: "記憶の断片",
    status: "returned",
    price: 70000,
    exhibitEnd: "2024-10-31",
    hasImage: true,
    isVideo: false,
    tags: ["抽象"],
  },
  {
    id: "7",
    name: "春の訪れ",
    status: "draft",
    price: 55000,
    hasImage: true,
    isVideo: false,
    tags: ["風景", "季節"],
  },
  {
    id: "8",
    name: "都会の静寂",
    status: "draft",
    price: 75000,
    hasImage: true,
    isVideo: false,
    tags: ["都市", "夜景"],
  },
];

const mockSalesHistory = [
  { month: "2024-10", revenue: 95000, count: 1 },
  { month: "2024-09", revenue: 65000, count: 1 },
  { month: "2024-08", revenue: 0, count: 0 },
  { month: "2024-07", revenue: 120000, count: 2 },
];

const mockProfile = {
  name: "山田太郎",
  birthDate: "1995-04-15",
  email: "yamada@example.com",
  phone: "090-1234-5678",
  bio: "自然と都市の対比をテーマに作品を制作しています。色彩と光の表現を大切にしながら、見る人の心に響く作品づくりを心がけています。",
  career: "2020年 東京藝術大学卒業\n2021年 新人賞受賞\n2022年 個展開催（銀座）",
  instagram: "@yamada_art",
  twitter: "@yamada_artist",
  website: "https://yamada-art.com",
};

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
  });
  // Track original profile data to detect changes
  const [originalProfileData, setOriginalProfileData] = useState({
    name: "",
    phone_number: "",
    biography: "",
    career: "",
    instagram: "",
    website: "",
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

    // Status filter
    if (artworkFilter && artworkFilter !== "all") {
      const statusParam = artworkFilter === "returned" ? "recalled" : artworkFilter;
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
      const filter =
        statusParam === "recalled" ? "returned" : statusParam;
      if (
        ["all", "draft", "published", "exhibited", "sold", "returned"].includes(
          filter
        )
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
      profileFormData.website !== originalProfileData.website
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
        filterParams.status = artworkFilter === "returned" ? "recalled" : artworkFilter;
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

      // Fetch artworks with filters
      const response = await artworkService.listArtworks(filterParams);

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
          price: Number(artwork.price),
          location: undefined, // Will be populated from space assignments later
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
    } finally {
      setIsLoadingArtworks(false);
    }
  };
  
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
      
      const formData = {
        name: artistProfile.name || "",
        phone_number: artistProfile.phone_number || "",
        biography: artistProfile.biography || "",
        career: careerText,
        instagram: "",
        website: "",
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

  const exhibitedArtworks = artworks.filter((a) => a.status === "exhibited");

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
              公開中の作品は{mockStats.publishedArtworks}点、展示中の作品は{mockStats.exhibitedArtworks}点です
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
                    <p className="text-3xl text-[#3A3A3A] mb-1">{mockStats.publishedArtworks}点</p>
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
                    <p className="text-3xl text-[#3A3A3A] mb-1">{mockStats.exhibitedArtworks}点</p>
                    <p className="text-sm text-gray-600">展示中の作品</p>
                    {exhibitedArtworks.length > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        {exhibitedArtworks[0].location} 他
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
                    <p className="text-3xl text-[#3A3A3A] mb-1">{mockStats.soldArtworks}点</p>
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
                    <p className="text-3xl mb-1">¥{mockStats.monthlyRevenue.toLocaleString()}</p>
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
                      <span className="text-sm text-gray-600">今月のスキャン数</span>
                      <span className="text-sm text-[#3A3A3A]">{mockStats.monthlyScans}回</span>
                    </div>
                    <Progress value={36} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">累計スキャン数</span>
                      <span className="text-sm text-[#3A3A3A]">{mockStats.totalScans}回</span>
                    </div>
                    <Progress value={62} className="h-2" />
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-3">📍 最も読まれた場所</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-[#F8F6F1] rounded-lg">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#C3A36D]" />
                          <span className="text-sm">The Tokyo Hotel</span>
                        </div>
                        <Badge variant="outline" className="border-[#C3A36D]/30 text-[#C3A36D]">
                          23回
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-[#F8F6F1] rounded-lg">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#C3A36D]" />
                          <span className="text-sm">渋谷オフィスビル</span>
                        </div>
                        <Badge variant="outline" className="border-[#C3A36D]/30 text-[#C3A36D]">
                          18回
                        </Badge>
                      </div>
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
                      あなたの作品は現在、<strong className="text-[#C3A36D]">{mockStats.exhibitedArtworks}つの場所</strong>で展示されています。
                    </p>
                    <p className="text-sm text-gray-500">
                      合計QRスキャン：<strong>{mockStats.totalScans}回</strong>（過去30日：{mockStats.monthlyScans}回）
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
                    </Button>
                    <Button
                      variant={artworkFilter === "returned" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setArtworkFilter("returned");
                        setArtworkPage(1);
                      }}
                      className={artworkFilter === "returned" ? "bg-gray-500 hover:bg-gray-600" : ""}
                    >
                      回収済み
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
                const config = statusConfig[artwork.status as keyof typeof statusConfig];
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
                        {/* ステータスバッジを右上に統一 */}
                        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
                          <Badge className={`${config.color} text-white border-0 shadow-md`}>
                            {config.label}
                          </Badge>
                          {/* QRスキャン数バッジ */}
                          {artwork.scans !== undefined && artwork.scans > 0 && (
                            <Badge variant="outline" className="bg-white/95 border-gray-300 shadow-sm">
                              <QrCode className="w-3 h-3 mr-1" />
                              {artwork.scans}回
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
                  <p className="text-3xl">¥{(mockStats.monthlyRevenue * 2).toLocaleString()}</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-2 border-[#C3A36D]/30">
                <CardContent className="pt-6">
                  <TrendingUp className="w-8 h-8 mb-3 text-[#C3A36D]" />
                  <p className="text-sm text-gray-600 mb-1">今月売上</p>
                  <p className="text-3xl text-[#3A3A3A]">¥{mockStats.monthlyRevenue.toLocaleString()}</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-2 border-gray-200">
                <CardContent className="pt-6">
                  <Calendar className="w-8 h-8 mb-3 text-gray-500" />
                  <p className="text-sm text-gray-600 mb-1">次回振込予定</p>
                  <p className="text-xl text-[#3A3A3A]">2025年1月末</p>
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
                <div className="space-y-4">
                  {mockSalesHistory.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.month}</span>
                        <span className="text-[#3A3A3A]">
                          ¥{item.revenue.toLocaleString()} ({item.count}点)
                        </span>
                      </div>
                      <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.revenue / 120000) * 100}%` }}
                          transition={{ delay: index * 0.1, duration: 0.8 }}
                          className="h-full bg-gradient-to-r from-[#C3A36D] to-[#D4B478]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 販売済み作品一覧 */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>販売済み作品</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockArtworks
                    .filter((a) => a.status === "sold")
                    .map((artwork) => (
                      <div key={artwork.id} className="flex items-center justify-between p-4 bg-[#F8F6F1] rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-base text-[#3A3A3A] mb-1">{artwork.name}</p>
                            <p className="text-sm text-gray-600">{artwork.buyer}</p>
                            <p className="text-xs text-gray-500">{artwork.soldDate}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg text-[#C3A36D] mb-1">¥{artwork.price.toLocaleString()}</p>
                          <Badge className="bg-green-500 text-white text-xs">
                            {artwork.paymentStatus === "paid" ? "振込済み" : "振込待ち"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* 振込履歴 */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>振込履歴</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border-b">
                    <div>
                      <p className="text-sm text-[#3A3A3A]">2024年10月分</p>
                      <p className="text-xs text-gray-500">振込日：2024-11-30</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base text-[#3A3A3A]">¥95,000</p>
                      <Badge className="bg-green-500 text-white text-xs mt-1">完了</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border-b">
                    <div>
                      <p className="text-sm text-[#3A3A3A]">2024年9月分</p>
                      <p className="text-xs text-gray-500">振込日：2024-10-31</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base text-[#3A3A3A]">¥65,000</p>
                      <Badge className="bg-green-500 text-white text-xs mt-1">完了</Badge>
                    </div>
                  </div>
                </div>
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

