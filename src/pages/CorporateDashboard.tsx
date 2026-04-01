import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCorporateOrgRole } from "@/hooks/useCorporateOrgRole";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Building2,
  TrendingUp,
  Eye,
  ShoppingCart,
  MapPin,
  Plus,
  Bell,
  Settings,
  LogOut,
  Sparkles,
  Calendar,
  ChevronRight,
  Image as ImageIcon,
  Users,
  BarChart3,
  Home,
  LifeBuoy,
  Wallet,
  ChevronDown,
  Brain,
  Loader2,
  Zap,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  QrCode,
  RotateCcw,
  Trash2,
  Heart,
  Layers,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { ArtworkReturnDialog } from "@/components/ArtworkReturnDialog";
import { BankAccountDialog } from "@/components/BankAccountDialog";
import { CardInfoDialog } from "@/components/CardInfoDialog";
import {
  listSpaces,
  getCorporateShippingDashboard,
  type SpaceResponse,
  type CorporateShippingIncomingItem,
  type CorporateShippingReturnItem,
  type CorporateShippingRecallItem,
  type CorporateShippingDisplayItem,
} from "@/services/space.service";
import { artworkService, type Artwork } from "@/services/artwork.service";
import {
  fetchFavoriteIds,
  fetchFavorites,
  removeFavorite as removeFavoriteApi,
} from "@/services/corporateFavorites.service";

/** 展示中一覧から返却ダイアログを開くときのペイロード（ArtworkReturnDialog と整合） */
type CorporateDashboardReturnSelection = {
  spaceId: string;
  artwork: {
    id: string;
    title: string;
    artist: string;
    image: string;
    displayedSince: string;
    location: string;
    price: string;
  };
};

// モックデータ
const revenueData = [
  { month: "7月", revenue: 45000, sales: 3 },
  { month: "8月", revenue: 62000, sales: 4 },
  { month: "9月", revenue: 38000, sales: 2 },
  { month: "10月", revenue: 85000, sales: 5 },
  { month: "11月", revenue: 120000, sales: 7 },
  { month: "12月", revenue: 95000, sales: 6 },
];

const trendData = [
  { date: "12/1", views: 45, clicks: 12, sales: 2 },
  { date: "12/8", views: 68, clicks: 18, sales: 3 },
  { date: "12/15", views: 82, clicks: 24, sales: 4 },
  { date: "12/22", views: 95, clicks: 28, sales: 5 },
  { date: "12/29", views: 124, clicks: 35, sales: 6 },
];

const pastSalesArtworks = [
  {
    id: 101,
    title: "夕暮れの街",
    artist: "佐々木 健",
    spaceId: 1,
    spaceName: "1階エントランス",
    image: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=400",
    price: "¥38,000",
    soldDate: "2024年8月15日",
    displayPeriod: "2024年7月〜8月",
    revenue: "¥3,800",
  },
  {
    id: 102,
    title: "静かな森",
    artist: "渡辺 さくら",
    spaceId: 2,
    spaceName: "会議室A",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400",
    price: "¥35,000",
    soldDate: "2024年9月20日",
    displayPeriod: "2024年8月〜9月",
    revenue: "¥3,500",
  },
];

const recommendedArtworks = [
  {
    id: 1,
    title: "静寂の湖畔",
    artist: "田中 一郎",
    image: "https://images.unsplash.com/photo-1533158326339-7f3cf2404354?w=400",
    price: "¥45,000",
    reason: "貴社の過去の傾向から、自然風景画が高い反応を得ています",
    tags: ["風景画", "落ち着いた"],
  },
  {
    id: 2,
    title: "抽象の調和",
    artist: "高橋 由美",
    image: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=400",
    price: "¥52,000",
    reason: "会議室Aの雰囲気に最適な現代アート",
    tags: ["抽象画", "モダン"],
  },
  {
    id: 3,
    title: "朝の光",
    artist: "中村 健",
    image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=400",
    price: "¥48,000",
    reason: "エントランスの明るい雰囲気を引き立てます",
    tags: ["明るい", "風景画"],
  },
];

const SPACE_CARD_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800";

/** スペース管理タブのカード表示用（API / ローカル双方で整形） */
type CorporateDashboardSpaceCard = {
  id: string;
  name: string;
  location: string;
  artworks: number;
  revenue: number;
  status: string;
  image: string;
};

function mapSpaceResponseToCard(s: SpaceResponse): CorporateDashboardSpaceCard {
  const hasArtwork = Boolean(s.current_artwork_id);
  const inReturnOrRecall =
    hasArtwork &&
    Boolean(s.corporate_return_pending || s.artist_recall_pending);
  return {
    id: s.id,
    name: s.name,
    location: s.address?.trim() || "—",
    artworks: hasArtwork ? 1 : 0,
    revenue: 0,
    status: !hasArtwork ? "未選択" : inReturnOrRecall ? "返送中" : "展示中",
    image: s.photo_urls?.[0] || SPACE_CARD_FALLBACK_IMAGE,
  };
}

function mapLocalSavedToCard(
  saved: Record<string, unknown>,
): CorporateDashboardSpaceCard {
  const images = saved.images as string[] | undefined;
  const hasArtwork =
    saved.currentArtwork != null && saved.currentArtwork !== false;
  return {
    id: String(saved.id),
    name: String(saved.name ?? ""),
    location: typeof saved.location === "string" ? saved.location : "—",
    artworks: hasArtwork ? 1 : 0,
    revenue: typeof saved.totalRevenue === "number" ? saved.totalRevenue : 0,
    status: typeof saved.status === "string" ? saved.status : "未選択",
    image:
      (typeof saved.image === "string" && saved.image) ||
      images?.[0] ||
      SPACE_CARD_FALLBACK_IMAGE,
  };
}

const notifications = [
  {
    id: 1,
    type: "sale",
    message: "「青の記憶」（山田 花子）が販売されました",
    time: "2時間前",
    icon: "🎉",
  },
  {
    id: 2,
    type: "milestone",
    message: "「Forest Light」が閲覧100回を突破しました",
    time: "5時間前",
    icon: "🖼️",
  },
  {
    id: 3,
    type: "recommendation",
    message: "新しいおすすめ作品が3点追加されました",
    time: "1日前",
    icon: "✨",
  },
];

/** Tab ids for CorporateDashboard — must match TabsTrigger / TabsContent `value` */
const CORPORATE_DASHBOARD_TABS = [
  "dashboard",
  "spaces",
  "recommended",
  "favorites",
  "shipping",
  "payment",
  "support",
] as const;

type CorporateDashboardTab = (typeof CORPORATE_DASHBOARD_TABS)[number];

function isCorporateDashboardTab(s: string): s is CorporateDashboardTab {
  return (CORPORATE_DASHBOARD_TABS as readonly string[]).includes(s);
}

/** Legacy hash names and aliases → current tab id */
function normalizeCorporateTab(raw: string): CorporateDashboardTab {
  const legacy: Record<string, CorporateDashboardTab> = {
    artworks: "recommended",
    exhibitions: "recommended",
    revenue: "payment",
    account: "dashboard",
  };
  const mapped = legacy[raw] ?? raw;
  return isCorporateDashboardTab(mapped) ? mapped : "dashboard";
}

function getCorporateTabFromHash(): CorporateDashboardTab {
  const hash = window.location.hash;
  const parts = hash.split("#").filter((p) => p.length > 0);
  if (parts.length > 1) {
    const lastPart = parts[parts.length - 1];
    const [tabHash] = lastPart.split("?");
    return normalizeCorporateTab(tabHash);
  }
  return "dashboard";
}

const CORPORATE_TAB_HASH_ALIASES = new Set([
  ...CORPORATE_DASHBOARD_TABS,
  "artworks",
  "exhibitions",
  "revenue",
  "account",
]);

const SHIPPING_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400";

function formatShippingDashDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ja-JP");
}

export function CorporateDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, userType, isInitialized } = useAuth();
  const { canEdit: canEditCorporate, canAdmin: canAdminCorporate } =
    useCorporateOrgRole();
  const [activeTab, setActiveTab] = useState<CorporateDashboardTab>(() =>
    typeof window !== "undefined" ? getCorporateTabFromHash() : "dashboard",
  );
  const [sortBy, setSortBy] = useState("views");
  const [timePeriod, setTimePeriod] = useState("week");

  // 認証チェック：未ログインまたは法人以外はリダイレクト
  // Wait for auth initialization before checking
  useEffect(() => {
    // Don't check auth until initialization is complete
    if (!isInitialized) {
      return;
    }

    if (!isAuthenticated) {
      // 未ログインの場合、ログインページへ
      navigate("/login/corporate");
      return;
    }

    if (userType !== "corporate") {
      // 法人以外（購入者・アーティスト）の場合、ホームへ
      toast.error("このページは法人専用です");
      navigate("/");
      return;
    }
  }, [isAuthenticated, userType, isInitialized, navigate]);

  // Artist ダッシュボードと同様: #/corporate-dashboard#<tab> でタブを保持（リロード・共有URL対応）
  const handleTabChange = useCallback((value: string) => {
    const tab = normalizeCorporateTab(value);
    setActiveTab(tab);
    const currentHash = window.location.hash;
    const parts = currentHash.split("#").filter((p) => p.length > 0);
    if (parts.length > 1) {
      const lastPart = parts[parts.length - 1];
      const [tabPart] = lastPart.split("?");
      if (CORPORATE_TAB_HASH_ALIASES.has(tabPart)) {
        parts.pop();
      }
    }
    const routeHash =
      parts.length > 0 ? `#${parts.join("#")}` : "#/corporate-dashboard";
    window.history.replaceState(null, "", `${routeHash}#${tab}`);
    window.scrollTo(0, 0);
  }, []);

  // AI推薦ダイアログの状態
  const [aiDialogOpen, setAiDialogOpen] = useState(false);

  // 返却ダイアログ（展示中の作品一覧・詳細ページと同じ ArtworkReturnDialog）
  const [returnSelection, setReturnSelection] =
    useState<CorporateDashboardReturnSelection | null>(null);

  // 入出金管理ダイアログの状態
  const [bankAccountDialogOpen, setBankAccountDialogOpen] = useState(false);
  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [cardDeleteConfirmOpen, setCardDeleteConfirmOpen] = useState(false);

  // お気に入りの状態管理
  const [favorites, setFavorites] = useState<string[]>([]);
  const [aiFavorites, setAiFavorites] = useState<any[]>([]);

  const [shippingIncoming, setShippingIncoming] = useState<
    CorporateShippingIncomingItem[]
  >([]);
  const [shippingReturns, setShippingReturns] = useState<
    CorporateShippingReturnItem[]
  >([]);
  const [shippingRecalls, setShippingRecalls] = useState<
    CorporateShippingRecallItem[]
  >([]);
  const [shippingDisplayOverview, setShippingDisplayOverview] = useState<
    CorporateShippingDisplayItem[]
  >([]);
  const [shippingLoading, setShippingLoading] = useState(false);

  /** 作品一覧タブ: 展示中（API） / お気に入り（API） */
  const [recommendedLoading, setRecommendedLoading] = useState(false);
  const [recommendedDisplayRows, setRecommendedDisplayRows] = useState<
    CorporateShippingDisplayItem[]
  >([]);
  const [recommendedFavoriteArtworks, setRecommendedFavoriteArtworks] =
    useState<Artwork[]>([]);

  /** お気に入りタブ: localStorage の ID を API で作品に解決 */
  const [favoritesTabLoading, setFavoritesTabLoading] = useState(false);
  const [favoritesTabArtworks, setFavoritesTabArtworks] = useState<Artwork[]>(
    [],
  );

  const loadRecommendedTabData = useCallback(async () => {
    if (!localStorage.getItem("mgj_access_token")) {
      setRecommendedDisplayRows([]);
      setRecommendedFavoriteArtworks([]);
      return;
    }
    setRecommendedLoading(true);
    try {
      const dash = await getCorporateShippingDashboard();
      setRecommendedDisplayRows(dash.display_overview ?? []);
      // Load favorites from API
      const favItems = await fetchFavorites();
      setRecommendedFavoriteArtworks(
        favItems.map(
          (f) =>
            ({
              id: f.id,
              title: f.title ?? "",
              artist: f.artist_name ? { id: "", name: f.artist_name } : undefined,
              main_image_url: f.main_image_url ?? "",
              price: f.price ?? 0,
              size: f.size ?? "",
              status: (f.status as Artwork["status"]) ?? "published",
              dimensions: { width: 0, height: 0, depth: 0 },
              year: 0,
            }) as unknown as Artwork,
        ),
      );
    } catch (e) {
      console.error("作品一覧タブの読み込みに失敗しました", e);
      toast.error("作品一覧の読み込みに失敗しました");
      setRecommendedDisplayRows([]);
    } finally {
      setRecommendedLoading(false);
    }
  }, []);

  const loadFavoritesTabData = useCallback(async () => {
    if (!localStorage.getItem("mgj_access_token")) {
      setFavoritesTabArtworks([]);
      return;
    }
    setFavoritesTabLoading(true);
    try {
      const favItems = await fetchFavorites();
      if (favItems.length === 0) {
        setFavoritesTabArtworks([]);
        return;
      }
      setFavoritesTabArtworks(
        favItems.map(
          (f) =>
            ({
              id: f.id,
              title: f.title ?? "",
              artist: f.artist_name ? { id: "", name: f.artist_name } : undefined,
              main_image_url: f.main_image_url ?? "",
              price: f.price ?? 0,
              size: f.size ?? "",
              status: (f.status as Artwork["status"]) ?? "published",
              dimensions: { width: 0, height: 0, depth: 0 },
              year: 0,
            }) as unknown as Artwork,
        ),
      );
    } catch (e) {
      console.error("お気に入りタブの読み込みに失敗しました", e);
      toast.error("お気に入りの読み込みに失敗しました");
      setFavoritesTabArtworks([]);
    } finally {
      setFavoritesTabLoading(false);
    }
  }, []);

  // お気に入り削除ハンドラー
  const handleRemoveFavorite = (artworkId: string) => {
    const sid = String(artworkId);
    // Optimistic UI update
    setFavorites((prev) => prev.filter((id) => String(id) !== sid));
    setFavoritesTabArtworks((prev) => prev.filter((a) => String(a.id) !== sid));
    // Persist to DB via API (also updates localStorage + dispatches event)
    removeFavoriteApi(sid)
      .then(() => toast.success("お気に入りから削除しました"))
      .catch(() => {
        toast.error("削除に失敗しました");
        void loadFavoritesTabData();
      });
  };

  // カード削除ハンドラー
  const handleCardDelete = () => {
    toast.success("カード情報を削除しました");
    setCardDeleteConfirmOpen(false);
  };

  const [allSpaces, setAllSpaces] = useState<CorporateDashboardSpaceCard[]>([]);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState(false);

  const loadSpaces = async () => {
    if (!localStorage.getItem("mgj_access_token")) {
      setAllSpaces([]);
      return;
    }
    setIsLoadingSpaces(true);
    try {
      const res = await listSpaces({ page: 1, page_size: 100 });
      setAllSpaces(res.items.map(mapSpaceResponseToCard));
    } catch (e) {
      console.error("スペース一覧の取得に失敗しました", e);
      const raw = JSON.parse(
        localStorage.getItem("mgj_registered_spaces") || "[]",
      ) as Record<string, unknown>[];
      setAllSpaces(raw.map(mapLocalSavedToCard));
    } finally {
      setIsLoadingSpaces(false);
    }
  };

  useEffect(() => {
    if (!isInitialized || !isAuthenticated || userType !== "corporate") return;
    void loadSpaces();
    // Load favorite IDs from API (also syncs localStorage)
    fetchFavoriteIds()
      .then((ids) => setFavorites(ids))
      .catch(() => {
        const saved = JSON.parse(
          localStorage.getItem("mgj_corporate_favorites") || "[]",
        ) as string[];
        setFavorites(saved);
      });
  }, [isInitialized, isAuthenticated, userType]);

  // activeTabに応じたデータ再取得（法人ログイン後のみ）
  useEffect(() => {
    if (!isInitialized || !isAuthenticated || userType !== "corporate") return;
    if (activeTab === "spaces") {
      void loadSpaces();
    }
    if (activeTab === "favorites") {
      fetchFavoriteIds()
        .then((ids) => setFavorites(ids))
        .catch(() => {});
      void loadFavoritesTabData();
    }
    if (activeTab === "recommended") {
      void loadRecommendedTabData();
    }
  }, [
    activeTab,
    loadRecommendedTabData,
    loadFavoritesTabData,
    isInitialized,
    isAuthenticated,
    userType,
  ]);

  // お気に入り更新イベントをリスン (localStorage is kept in sync by the service layer)
  useEffect(() => {
    const handleFavoritesUpdate = () => {
      const savedFavorites = JSON.parse(
        localStorage.getItem("mgj_corporate_favorites") || "[]",
      ) as string[];
      setFavorites(savedFavorites);
      if (activeTab === "favorites") {
        void loadFavoritesTabData();
      }
    };

    window.addEventListener("favoritesUpdated", handleFavoritesUpdate);
    return () => {
      window.removeEventListener("favoritesUpdated", handleFavoritesUpdate);
    };
  }, [activeTab, loadFavoritesTabData]);

  // URLハッシュ（#/corporate-dashboard#<tab>）に基づいてタブを同期
  useEffect(() => {
    const tab = getCorporateTabFromHash();
    setActiveTab(tab);

    const currentHash = window.location.hash;
    const parts = currentHash.split("#").filter((p) => p.length > 0);
    const lastPart = parts.length > 1 ? parts[parts.length - 1] : "";
    const [tabPartRaw] = lastPart.split("?");
    const hasTabHash =
      parts.length > 1 && CORPORATE_TAB_HASH_ALIASES.has(tabPartRaw);

    if (!hasTabHash) {
      const routeHash =
        parts.length > 0 ? `#${parts.join("#")}` : "#/corporate-dashboard";
      window.history.replaceState(null, "", `${routeHash}#${tab}`);
    }
    window.scrollTo(0, 0);
  }, [location]);

  useEffect(() => {
    const onHashChange = () => {
      setActiveTab(getCorporateTabFromHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // activeTabが変更されたときに上部にスクロール
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  // 配送状況 / スペース管理タブへの自動遷移（URL ハッシュも更新）
  useEffect(() => {
    if (location.state?.scrollTo === "delivery") {
      handleTabChange("shipping");
      window.history.replaceState({}, document.title);
    }
    if (location.state?.openTab === "spaces") {
      handleTabChange("spaces");
      window.history.replaceState({}, document.title);
    }
  }, [location, handleTabChange]);

  useEffect(() => {
    if (!isInitialized || !isAuthenticated || userType !== "corporate") {
      return;
    }
    let cancelled = false;
    setShippingLoading(true);
    getCorporateShippingDashboard()
      .then((data) => {
        if (!cancelled) {
          setShippingIncoming(data.incoming ?? []);
          setShippingReturns(data.returns ?? []);
          setShippingRecalls(data.recalls ?? []);
          setShippingDisplayOverview(data.display_overview ?? []);
        }
      })
      .catch((e) => {
        console.warn("getCorporateShippingDashboard failed", e);
        if (!cancelled) {
          setShippingIncoming([]);
          setShippingReturns([]);
          setShippingRecalls([]);
          setShippingDisplayOverview([]);
        }
      })
      .finally(() => {
        if (!cancelled) setShippingLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isInitialized, isAuthenticated, userType]);

  const prevCorporateTabRef = useRef<CorporateDashboardTab | null>(null);
  // 他タブから「配送状況」へ切り替えたときだけ再取得（スペースで返却申請の直後など）
  useEffect(() => {
    if (!isInitialized || !isAuthenticated || userType !== "corporate") return;
    const prev = prevCorporateTabRef.current;
    prevCorporateTabRef.current = activeTab;
    if (activeTab !== "shipping") return;
    if (prev === null || prev === "shipping") return;
    let cancelled = false;
    setShippingLoading(true);
    getCorporateShippingDashboard()
      .then((data) => {
        if (!cancelled) {
          setShippingIncoming(data.incoming ?? []);
          setShippingReturns(data.returns ?? []);
          setShippingRecalls(data.recalls ?? []);
          setShippingDisplayOverview(data.display_overview ?? []);
        }
      })
      .catch((e) => {
        console.warn("getCorporateShippingDashboard failed", e);
        if (!cancelled) {
          setShippingIncoming([]);
          setShippingReturns([]);
          setShippingRecalls([]);
          setShippingDisplayOverview([]);
        }
      })
      .finally(() => {
        if (!cancelled) setShippingLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab, isInitialized, isAuthenticated, userType]);

  // 配送タブ表示中に別タブで作業して戻ったとき、発送ステータスを再取得（アーティスト発送直後など）
  useEffect(() => {
    if (!isInitialized || !isAuthenticated || userType !== "corporate") return;
    if (activeTab !== "shipping") return;
    let cancelled = false;
    const onVis = () => {
      if (document.visibilityState !== "visible") return;
      getCorporateShippingDashboard()
        .then((data) => {
          if (!cancelled) {
            setShippingIncoming(data.incoming ?? []);
            setShippingReturns(data.returns ?? []);
            setShippingRecalls(data.recalls ?? []);
            setShippingDisplayOverview(data.display_overview ?? []);
          }
        })
        .catch((e) => {
          console.warn("getCorporateShippingDashboard failed (visibility)", e);
        });
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [activeTab, isInitialized, isAuthenticated, userType]);

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const monthRevenue = revenueData[revenueData.length - 1].revenue;
  const expectedRevenue = monthRevenue * 0.1; // 10%コミッション

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />

      {/* カスタムヘッダー */}
      <div className="shrink-0 bg-white border-b sticky top-0 z-40 pt-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-3 sm:py-4">
            {/* ロゴ */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl text-primary truncate">
                  MGJ for Business
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  マイクロギャラリー法人ダッシュボード
                </p>
              </div>
            </div>

            {/* プロフィール */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Link to="/corporate-profile">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3"
                >
                  <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">設定</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* タブナビゲーション */}
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent min-w-max sm:min-w-0">
                <TabsTrigger
                  value="dashboard"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3"
                >
                  <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">ダッシュボード</span>
                </TabsTrigger>
                <TabsTrigger
                  value="spaces"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3"
                >
                  <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">スペース管理</span>
                </TabsTrigger>
                <TabsTrigger
                  value="recommended"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3"
                >
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">作品一覧</span>
                </TabsTrigger>
                <TabsTrigger
                  value="favorites"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3"
                >
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">お気に入り</span>
                </TabsTrigger>
                <TabsTrigger
                  value="shipping"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3"
                >
                  <Truck className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">配送状況</span>
                  {shippingIncoming.length +
                    shippingReturns.length +
                    shippingRecalls.length >
                    0 && (
                    <Badge className="ml-1 sm:ml-2 bg-accent text-white text-[10px] sm:text-xs px-1 sm:px-1.5 py-0">
                      {shippingIncoming.length +
                        shippingReturns.length +
                        shippingRecalls.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="payment"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3"
                >
                  <Wallet className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">入出金管理</span>
                </TabsTrigger>
                <TabsTrigger
                  value="support"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3"
                >
                  <LifeBuoy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">サポート</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        </div>
      </div>

      {/* メインコンテンツ — flex-1 でフッター手前まで伸ばし、短いコンテンツでもフッターを画面下に固定 */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="container mx-auto flex min-h-0 flex-1 flex-col px-4 py-4 sm:px-6 sm:py-8">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="flex min-h-0 w-full flex-1 flex-col"
          >
            {/* ダッシュボードタブ */}
            <TabsContent
              value="dashboard"
              className="mt-0 flex min-h-0 flex-1 flex-col outline-none"
            >
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* メインエリア */}
                <div className="lg:col-span-3 space-y-4 sm:space-y-6">
                  {/* 全体収益カード */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-white">
                        <CardHeader className="pb-3">
                          <CardDescription className="text-xs sm:text-sm">
                            今月の収益
                          </CardDescription>
                          <CardTitle className="text-2xl sm:text-3xl text-primary">
                            ¥{monthRevenue.toLocaleString()}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-green-600">
                            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                            +24.5% vs 先月
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      <Card>
                        <CardHeader className="pb-3">
                          <CardDescription className="text-xs sm:text-sm">
                            累計収益（6ヶ月）
                          </CardDescription>
                          <CardTitle className="text-2xl sm:text-3xl">
                            ¥{totalRevenue.toLocaleString()}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                            <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                            27件の販売実績
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <Card className="border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-white">
                        <CardHeader className="pb-3">
                          <CardDescription className="text-xs sm:text-sm">
                            見込み報酬（10%）
                          </CardDescription>
                          <CardTitle className="text-2xl sm:text-3xl text-accent">
                            ¥{expectedRevenue.toLocaleString()}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                            次回振込: 2026/1/31
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>

                  {/* 月別推移グラフ */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>月別収益推移</CardTitle>
                        <CardDescription>過去6ヶ月の販売実績</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={revenueData}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#f0f0f0"
                            />
                            <XAxis dataKey="month" stroke="#888" />
                            <YAxis stroke="#888" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                              }}
                            />
                            <Legend />
                            <Bar
                              dataKey="revenue"
                              fill="#6B5B4A"
                              name="収益（円）"
                              radius={[8, 8, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* トレンド分析 */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>トレンド分析</CardTitle>
                            <CardDescription>
                              期間別の閲覧・購入データ
                            </CardDescription>
                          </div>
                          <Select
                            value={timePeriod}
                            onValueChange={setTimePeriod}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="week">週次</SelectItem>
                              <SelectItem value="month">月次</SelectItem>
                              <SelectItem value="quarter">四半期</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={trendData}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#f0f0f0"
                            />
                            <XAxis dataKey="date" stroke="#888" />
                            <YAxis stroke="#888" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                              }}
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="views"
                              stroke="#3b82f6"
                              strokeWidth={2}
                              name="QR閲覧数"
                              dot={{ r: 4 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="clicks"
                              stroke="#8b5cf6"
                              strokeWidth={2}
                              name="クリック数"
                              dot={{ r: 4 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="sales"
                              stroke="#10b981"
                              strokeWidth={2}
                              name="購入数"
                              dot={{ r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                        <div className="mt-4 p-4 bg-accent/5 border border-accent/20 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Sparkles className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-gray-700">
                              <span className="text-accent">
                                AIによる分析：
                              </span>{" "}
                              この1ヶ月で人気が上昇したのは「鈴木
                              美咲」の作品です。自然光が入るエントランスでの展示が好評です。
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* サイドバー */}
                <div className="space-y-6">
                  {/* 通知カード */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Bell className="w-5 h-5 text-accent" />
                          通知
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {notifications.map((notification, index) => (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.3,
                              delay: 0.6 + index * 0.1,
                            }}
                            className="p-3 bg-gray-50 rounded-lg border hover:shadow-md transition-all cursor-pointer"
                          >
                            <div className="flex items-start gap-2">
                              <span className="text-lg flex-shrink-0">
                                {notification.icon}
                              </span>
                              <div className="flex-grow">
                                <p className="text-sm text-gray-700 leading-relaxed mb-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {notification.time}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        <Button
                          variant="ghost"
                          className="w-full text-sm"
                          size="sm"
                        >
                          すべて表示
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>

              {/* 売上履歴セクション */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mt-8"
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-accent" />
                          売上履歴
                        </CardTitle>
                        <CardDescription>過去に販売された作品</CardDescription>
                      </div>
                      <Link to="/corporate-sales-history">
                        <Button variant="outline" size="sm">
                          すべて表示
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {pastSalesArtworks.map((artwork, index) => (
                        <motion.div
                          key={artwork.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: 0.7 + index * 0.1,
                          }}
                          className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-all"
                        >
                          <ImageWithFallback
                            src={artwork.image}
                            alt={artwork.title}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                          <div className="flex-grow">
                            <h4 className="text-sm mb-1">{artwork.title}</h4>
                            <p className="text-xs text-gray-500 mb-2">
                              {artwork.artist}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-gray-600">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {artwork.spaceName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {artwork.soldDate}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600 mb-1">
                              販売価格
                            </p>
                            <p className="text-lg text-primary">
                              {artwork.price}
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                              報酬: {artwork.revenue}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* スペース管理タブ */}
            <TabsContent
              value="spaces"
              className="mt-0 flex min-h-0 flex-1 flex-col outline-none"
            >
              <div className="space-y-6">
                {/* タイトルとボタン */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl text-primary mb-2">
                      登録済みスペース
                    </h2>
                    <p className="text-gray-600">展示中の空間を管理</p>
                  </div>
                  {canEditCorporate ? (
                    <Link to="/signup/corporate?addSpace=true">
                      <Button className="bg-primary hover:bg-primary/90">
                        <Plus className="w-4 h-4" />
                        <span>スペース追加</span>
                      </Button>
                    </Link>
                  ) : null}
                </div>

                {isLoadingSpaces && (
                  <div className="flex min-h-[min(28rem,calc(100vh-16rem))] flex-1 flex-col items-center justify-center gap-2 py-16 text-gray-600">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span>スペースを読み込み中...</span>
                  </div>
                )}

                {!isLoadingSpaces && allSpaces.length === 0 && (
                  <Card className="border-dashed border-2 border-gray-200 bg-gray-50/50">
                    <CardContent className="py-10 text-center text-gray-600">
                      <Home className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-base mb-1">
                        登録済みのスペースはまだありません
                      </p>
                      <p className="text-sm text-gray-500">
                        {canEditCorporate
                          ? "「スペース追加」から展示スペースを登録してください。"
                          : "スペースの新規登録は編集者以上の権限が必要です。"}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* カードグリッド */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allSpaces.map((space, index) => (
                    <motion.div
                      key={space.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex"
                    >
                      <Card
                        className="bg-white hover:shadow-lg transition-all group overflow-hidden border-2 border-gray-200 hover:border-primary flex flex-col w-full cursor-pointer h-full"
                        onClick={() => {
                          // localStorageから完全なスペースデータを取得
                          const savedSpaces = JSON.parse(
                            localStorage.getItem("mgj_registered_spaces") ||
                              "[]",
                          );
                          const fullSpace = savedSpaces.find(
                            (s: any) => s.id === space.id,
                          );
                          navigate(`/corporate-space/${space.id}`, {
                            state: { space: fullSpace || space },
                          });
                        }}
                      >
                        <div className="relative aspect-video overflow-hidden">
                          <ImageWithFallback
                            src={space.image || SPACE_CARD_FALLBACK_IMAGE}
                            alt={space.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-3 right-3">
                            <Badge
                              className={
                                space.status === "展示中"
                                  ? "bg-green-500"
                                  : "bg-gray-500"
                              }
                            >
                              {space.status}
                            </Badge>
                          </div>
                        </div>
                        <CardHeader className="flex-grow">
                          <CardTitle className="text-xl">
                            {space.name}
                          </CardTitle>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {space.location}
                            </p>
                            {space.artworks > 0 && (
                              <div className="flex items-center gap-2 pt-2">
                                <Badge
                                  variant="outline"
                                  className="text-green-600 border-green-600"
                                >
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                  展示中: {space.artworks}点
                                </Badge>
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-2">
                          {/* 売上情報 */}
                          {space.revenue > 0 && (
                            <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                              <p className="text-xs text-gray-600 mb-1">
                                累計売上
                              </p>
                              <p className="text-xl text-green-700">
                                ¥{space.revenue.toLocaleString()}
                              </p>
                            </div>
                          )}

                          {/* 詳細を見る表示 */}
                          <div className="w-full border-2 border-gray-300 hover:border-primary hover:bg-primary/5 rounded-md p-2 flex items-center justify-center transition-colors">
                            <ChevronRight className="w-4 h-4 mr-2" />
                            詳細を見る
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}

                  {/* 新しいスペースを追加カード */}
                  {canEditCorporate ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: allSpaces.length * 0.1 }}
                      className="flex"
                    >
                      <Card
                        className="bg-white border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer flex flex-col items-center justify-center w-full"
                        onClick={() =>
                          navigate("/signup/corporate?addSpace=true")
                        }
                      >
                        <CardContent className="text-center py-16">
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                            <Plus className="w-8 h-8 text-primary" />
                          </div>
                          <h3 className="text-lg text-primary mb-2">
                            新しいスペースを追加
                          </h3>
                          <p className="text-sm text-gray-600">
                            別の場所にもアートを飾りませんか？
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ) : null}
                </div>
              </div>
            </TabsContent>

            {/* 作品一覧タブ */}
            <TabsContent
              value="recommended"
              className="mt-0 flex min-h-0 flex-1 flex-col outline-none"
            >
              {recommendedLoading ? (
                <div className="flex min-h-[min(28rem,calc(100vh-16rem))] flex-1 flex-col items-center justify-center gap-3 py-16">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-sm text-gray-600">
                    作品一覧を読み込み中...
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-3 space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.05 }}
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle>展示中の作品一覧</CardTitle>
                          <CardDescription>
                            自社スペースに現在割り当てられている作品（API連携）
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {recommendedDisplayRows.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 text-sm">
                              <p className="mb-2">
                                展示中の作品はまだありません。
                              </p>
                              <p>
                                スペースに作品を割り当てると、ここに表示されます。
                              </p>
                              <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => handleTabChange("spaces")}
                              >
                                スペース管理へ
                              </Button>
                            </div>
                          ) : (
                            recommendedDisplayRows.map((row, index) => (
                              <motion.div
                                key={`${row.assignment_id}-${row.artwork_id}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  duration: 0.5,
                                  delay: index * 0.05,
                                }}
                                className="flex gap-4 p-4 rounded-lg border hover:shadow-lg transition-all cursor-pointer hover:border-primary"
                                onClick={() =>
                                  navigate(
                                    `/corporate-artwork/${row.artwork_id}`,
                                  )
                                }
                              >
                                <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                  <ImageWithFallback
                                    src={row.image || ""}
                                    alt={row.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-grow min-w-0">
                                  <div className="flex items-start justify-between mb-2 gap-2">
                                    <div className="min-w-0">
                                      <h3 className="text-lg text-primary mb-1 truncate">
                                        {row.title}
                                      </h3>
                                      <p className="text-sm text-gray-600">
                                        {row.artist}
                                      </p>
                                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                        <MapPin className="w-3 h-3 shrink-0" />
                                        {row.space_name}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                        {row.detail}
                                      </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <Badge
                                        variant="outline"
                                        className="mb-2 border-amber-200 bg-amber-50 text-amber-900"
                                      >
                                        {row.pipeline_label}
                                      </Badge>
                                      <p className="text-lg text-accent mb-3">
                                        {row.price}
                                      </p>
                                      {canEditCorporate ? (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          disabled={
                                            row.pipeline_label !== "展示中"
                                          }
                                          title={
                                            row.pipeline_label !== "展示中"
                                              ? "この状態では返却申請できません（返却手続き中・返送中等）"
                                              : undefined
                                          }
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setReturnSelection({
                                              spaceId: row.space_id,
                                              artwork: {
                                                id: row.artwork_id,
                                                title: row.title,
                                                artist: row.artist,
                                                image: row.image ?? "",
                                                displayedSince:
                                                  new Date().toISOString(),
                                                location: row.space_name,
                                                price: row.price,
                                              },
                                            });
                                          }}
                                          className="gap-2 w-full"
                                        >
                                          <RotateCcw className="w-4 h-4" />
                                          返却
                                        </Button>
                                      ) : null}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle>過去の販売一覧</CardTitle>
                          <CardDescription>
                            販売済み作品の履歴（今後、注文データと連携予定）
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-10 text-gray-500 text-sm">
                            表示できる販売履歴はまだありません。
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.15 }}
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Heart className="w-6 h-6 text-pink-500" />
                            お気に入り作品
                          </CardTitle>
                          <CardDescription>
                            カタログ・作品詳細でハートを押すとここに表示されます（お気に入りタブと同じ）
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {recommendedFavoriteArtworks.length === 0 ? (
                            <div className="text-center py-10 text-gray-500 text-sm space-y-3">
                              <p>まだお気に入りがありません。</p>
                              <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                                「作品カタログ」で各カード右下のハートを押すか、作品を開いて「お気に入り」をタップすると追加されます。
                              </p>
                              <div className="flex flex-col sm:flex-row gap-2 justify-center pt-1">
                                <Link to="/artworks">
                                  <Button variant="default" className="gap-2">
                                    <Layers className="w-4 h-4" />
                                    作品カタログへ
                                  </Button>
                                </Link>
                                <Button
                                  variant="outline"
                                  onClick={() => handleTabChange("favorites")}
                                >
                                  お気に入りタブへ
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {recommendedFavoriteArtworks.map(
                                (artwork, index) => {
                                  const img =
                                    artwork.main_image_url ||
                                    artwork.images?.[0]?.image_url ||
                                    "";
                                  const priceStr = `¥${Math.round(Number(artwork.price) || 0).toLocaleString()}`;
                                  return (
                                    <motion.div
                                      key={artwork.id}
                                      initial={{ opacity: 0, scale: 0.98 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{
                                        duration: 0.4,
                                        delay: index * 0.05,
                                      }}
                                      className="border rounded-lg overflow-hidden hover:shadow-xl transition-all group cursor-pointer relative"
                                      onClick={() =>
                                        navigate(
                                          `/artwork/${artwork.id}?source=site`,
                                        )
                                      }
                                    >
                                      <div className="aspect-square bg-gray-100 overflow-hidden relative">
                                        <ImageWithFallback
                                          src={img}
                                          alt={artwork.title}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                      </div>
                                      <div className="p-4 space-y-2">
                                        <h3 className="text-lg text-primary mb-1 line-clamp-2">
                                          {artwork.title}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                          {artwork.artist?.name ?? "—"}
                                        </p>
                                        <p className="text-lg text-accent">
                                          {priceStr}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                          {(artwork.style_tags || [])
                                            .slice(0, 5)
                                            .map((tag) => (
                                              <Badge
                                                key={tag}
                                                variant="secondary"
                                                className="text-xs"
                                              >
                                                {tag}
                                              </Badge>
                                            ))}
                                        </div>
                                      </div>
                                    </motion.div>
                                  );
                                },
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>

                  <div className="lg:col-span-1 space-y-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-[#C3A36D]" />
                          作品を探す
                        </CardTitle>
                        <CardDescription className="text-xs leading-relaxed">
                          公開カタログで作品を開き、ハートアイコンまたは作品詳細の「お気に入り」で候補に保存できます。
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Link to="/artworks">
                          <Button variant="outline" className="w-full gap-2">
                            <Layers className="w-4 h-4" />
                            作品カタログを見る
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Brain className="w-5 h-5 text-violet-600" />
                          AIおすすめ
                        </CardTitle>
                        <CardDescription className="text-xs">
                          スペースに合う作品のヒント（参考）
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {recommendedArtworks.slice(0, 3).map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            className="w-full text-left rounded-lg border p-2 hover:bg-muted/50 transition-colors"
                            onClick={() =>
                              navigate(`/artwork/${a.id}?source=site`)
                            }
                          >
                            <div className="flex gap-2">
                              <div className="w-14 h-14 rounded overflow-hidden bg-gray-100 shrink-0">
                                <img
                                  src={a.image}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-primary truncate">
                                  {a.title}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {a.artist}
                                </p>
                                <p className="text-xs text-accent mt-0.5">
                                  {a.price}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                        {canEditCorporate ? (
                          <Button
                            variant="secondary"
                            className="w-full"
                            size="sm"
                            onClick={() => setAiDialogOpen(true)}
                          >
                            AI推薦の詳細
                          </Button>
                        ) : null}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* お気に入りタブ */}
            <TabsContent
              value="favorites"
              className="mt-0 flex min-h-0 flex-1 flex-col outline-none"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    お気に入り作品
                  </CardTitle>
                  <CardDescription>
                    カタログのハートまたは作品ページの「お気に入り」で保存した作品を表示します。
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {favorites.length === 0 ? (
                    <div className="text-center py-12 space-y-4">
                      <Heart className="w-16 h-16 text-gray-300 mx-auto" />
                      <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
                        まだお気に入りがありません。カタログでハートを押すか、作品詳細で「お気に入り」を選んで候補を保存してください。
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <Link to="/artworks">
                          <Button className="gap-2">
                            <Layers className="w-4 h-4" />
                            作品カタログを開く
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          onClick={() => handleTabChange("recommended")}
                        >
                          作品一覧タブへ
                        </Button>
                      </div>
                    </div>
                  ) : favoritesTabLoading ? (
                    <div className="flex min-h-[min(20rem,calc(100vh-20rem))] flex-col items-center justify-center gap-3 py-16">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      <p className="text-sm text-gray-600">
                        お気に入りを読み込み中…
                      </p>
                    </div>
                  ) : favoritesTabArtworks.length === 0 ? (
                    <div className="text-center py-12 space-y-4">
                      <Heart className="w-16 h-16 text-gray-300 mx-auto" />
                      <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
                        お気に入りの作品をAPIから取得できませんでした。IDが古い、または非公開・削除された可能性があります。
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <Button
                          variant="outline"
                          onClick={() => void loadFavoritesTabData()}
                        >
                          再読み込み
                        </Button>
                        <Link to="/artworks">
                          <Button variant="default" className="gap-2">
                            <Layers className="w-4 h-4" />
                            作品カタログを開く
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {favoritesTabArtworks.map((artwork) => {
                        const img =
                          artwork.main_image_url ||
                          artwork.images?.find((i) => i.is_main)?.image_url ||
                          artwork.images?.sort(
                            (a, b) => a.image_order - b.image_order,
                          )[0]?.image_url ||
                          "";
                        const priceStr = `¥${Math.round(Number(artwork.price) || 0).toLocaleString("ja-JP")}`;
                        return (
                          <Card
                            key={artwork.id}
                            className="cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
                            onClick={() =>
                              navigate(`/artwork/${artwork.id}?source=site`)
                            }
                          >
                            <div className="aspect-square relative overflow-hidden bg-gray-100">
                              <ImageWithFallback
                                src={img}
                                alt={artwork.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <CardContent className="p-4">
                              <h3 className="font-medium text-primary mb-1 line-clamp-2">
                                {artwork.title}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {artwork.artist?.name ?? "—"}
                              </p>
                              <p className="text-lg font-medium text-primary mb-3">
                                {priceStr}
                              </p>
                              {(artwork.style_tags || []).length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {(artwork.style_tags || [])
                                    .slice(0, 5)
                                    .map((tag) => (
                                      <Badge
                                        key={tag}
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {tag}
                                      </Badge>
                                    ))}
                                </div>
                              )}
                              {canEditCorporate ? (
                                <Button
                                  variant="outline"
                                  className="w-full"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveFavorite(String(artwork.id));
                                  }}
                                >
                                  お気に入りから削除
                                </Button>
                              ) : null}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 配送状況タブ */}
            <TabsContent
              value="shipping"
              className="mt-0 flex min-h-0 flex-1 flex-col outline-none"
            >
              {shippingLoading ? (
                <div className="flex min-h-[min(28rem,calc(100vh-16rem))] flex-1 flex-col items-center justify-center gap-3 py-16">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-sm text-gray-600">
                    配送情報を読み込み中...
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* メインエリア */}
                  <div className="lg:col-span-3 space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45 }}
                    >
                      <Card>
                        <CardHeader>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                              <Layers className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <CardTitle>スペースの展示状況</CardTitle>
                              <CardDescription>
                                各スペースに現在展示されている作品です（ヤマトの出荷情報が未登録でも表示されます）
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {shippingDisplayOverview.length === 0 ? (
                            <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                              <p className="text-gray-600 text-sm mb-1">
                                展示中として紐づいている作品がありません
                              </p>
                              <p className="text-xs text-gray-500 max-w-md mx-auto">
                                スペースに作品を割り当て、展示が有効な状態になるとここに表示されます。上段の「配送状況」は出荷（ヤマト）がシステムに登録された案件のみ表示されます。
                              </p>
                            </div>
                          ) : (
                            shippingDisplayOverview.map((item, index) => (
                              <motion.div
                                key={`${item.space_id}-${item.assignment_id}`}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  duration: 0.4,
                                  delay: index * 0.06,
                                }}
                                className="border-2 rounded-xl overflow-hidden hover:shadow-md transition-all border-violet-100"
                              >
                                <div className="flex gap-4 p-4 bg-gradient-to-r from-violet-50 to-indigo-50">
                                  <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border-2 border-white shadow">
                                    <ImageWithFallback
                                      src={
                                        item.image ?? SHIPPING_FALLBACK_IMAGE
                                      }
                                      alt={item.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-grow min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                      <div>
                                        <p className="text-xs text-violet-700 font-medium mb-0.5">
                                          {item.space_name}
                                        </p>
                                        <h3 className="text-lg text-primary font-medium truncate">
                                          {item.title}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                          {item.artist}
                                        </p>
                                      </div>
                                      <div className="text-left sm:text-right flex-shrink-0">
                                        <Badge
                                          className={
                                            item.pipeline_label === "返送中"
                                              ? "bg-amber-500 text-white"
                                              : item.pipeline_label ===
                                                  "返却手続き中"
                                                ? "bg-orange-500 text-white"
                                                : "bg-emerald-600 text-white"
                                          }
                                        >
                                          {item.pipeline_label}
                                        </Badge>
                                        <p className="text-lg text-accent mt-1">
                                          {item.price}
                                        </p>
                                      </div>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-3 leading-relaxed">
                                      {item.detail}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            ))
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Card>
                        <CardHeader>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                              <Truck className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <CardTitle>配送状況</CardTitle>
                              <CardDescription>
                                展示確定した作品の配送状況を確認できます
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {shippingIncoming.length === 0 ? (
                            <div className="text-center py-12">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package className="w-8 h-8 text-gray-400" />
                              </div>
                              <p className="text-gray-600 mb-2">
                                配送待ちの作品はありません
                              </p>
                              <p className="text-sm text-gray-500">
                                作品を展示確定すると、こちらに表示されます（ヤマト連携の出荷が登録されると詳細が表示されます）
                              </p>
                            </div>
                          ) : (
                            shippingIncoming.map((item, index) => (
                              <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  duration: 0.5,
                                  delay: index * 0.1,
                                }}
                                className="border-2 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                              >
                                {/* 上部：作品情報 */}
                                <div className="flex gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50">
                                  <div className="w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border-2 border-white shadow-md">
                                    <ImageWithFallback
                                      src={
                                        item.image ?? SHIPPING_FALLBACK_IMAGE
                                      }
                                      alt={item.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-grow">
                                    <div className="flex items-start justify-between mb-2">
                                      <div>
                                        <h3 className="text-xl text-primary mb-1">
                                          {item.title}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                          {item.artist}
                                        </p>
                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-2">
                                          <MapPin className="w-3 h-3" />
                                          展示予定: {item.location}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <Badge
                                          className={
                                            item.status === "配送中"
                                              ? "bg-blue-500 text-white"
                                              : item.status === "配送準備中"
                                                ? "bg-orange-500 text-white"
                                                : "bg-green-500 text-white"
                                          }
                                        >
                                          {item.status}
                                        </Badge>
                                        <p className="text-lg text-accent mt-2">
                                          {item.price}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* 下部：配送状況詳細 */}
                                <div className="p-4 bg-white space-y-3">
                                  {/* 配送ステータス */}
                                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <div
                                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        item.status === "配送中"
                                          ? "bg-blue-500"
                                          : item.status === "配送準備中"
                                            ? "bg-orange-500"
                                            : "bg-green-500"
                                      }`}
                                    >
                                      {item.status === "配送中" ? (
                                        <Truck className="w-5 h-5 text-white" />
                                      ) : item.status === "配送準備中" ? (
                                        <Package className="w-5 h-5 text-white" />
                                      ) : (
                                        <CheckCircle2 className="w-5 h-5 text-white" />
                                      )}
                                    </div>
                                    <div className="flex-grow">
                                      <p className="text-sm text-gray-700">
                                        {item.shipping_status}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        追跡番号: {item.tracking_number ?? "—"}
                                      </p>
                                    </div>
                                  </div>

                                  {/* 配送日程 */}
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <p className="text-xs text-gray-500">
                                          登録日
                                        </p>
                                      </div>
                                      <p className="text-sm text-gray-700">
                                        {formatShippingDashDate(
                                          item.order_date,
                                        )}
                                      </p>
                                    </div>
                                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                      <div className="flex items-center gap-2 mb-1">
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                        <p className="text-xs text-green-700">
                                          到着予定日
                                        </p>
                                      </div>
                                      <p className="text-sm text-green-700">
                                        {formatShippingDashDate(
                                          item.estimated_arrival,
                                        )}
                                      </p>
                                    </div>
                                  </div>

                                  {/* 注意事項 */}
                                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <p className="text-xs text-amber-800 flex items-start gap-2">
                                      <Package className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                      <span>
                                        <strong>作品到着後のステップ：</strong>
                                        <br />
                                        ①
                                        同封の展示マニュアルに従って設置してください
                                        <br />
                                        ②
                                        作品の近くにQRコード（同封）を設置してください
                                        <br />③
                                        マイページから「展示開始」ボタンを押すと、訪問者が作品を購入できるようになります
                                      </span>
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            ))
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* 回収返送（アーティスト依頼）— 展示向け incoming とは別 */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.12 }}
                    >
                      <Card>
                        <CardHeader>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center">
                              <Package className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <CardTitle>
                                回収返送（アーティスト依頼）
                              </CardTitle>
                              <CardDescription>
                                アーティストから回収を依頼された作品を、法人からアーティストへ発送した場合の配送状況を確認できます
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {shippingRecalls.length === 0 ? (
                            <div className="text-center py-12">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package className="w-8 h-8 text-gray-400" />
                              </div>
                              <p className="text-gray-600 mb-2">
                                回収向けの返送はありません
                              </p>
                              <p className="text-sm text-gray-500 max-w-md mx-auto">
                                アーティストが回収を依頼し、こちらで「回収向け発送済み」に登録するとここに表示されます
                              </p>
                            </div>
                          ) : (
                            shippingRecalls.map((item, index) => (
                              <motion.div
                                key={item.shipment_id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  duration: 0.5,
                                  delay: index * 0.1,
                                }}
                                className="border-2 rounded-xl overflow-hidden hover:shadow-lg transition-all border-sky-100"
                              >
                                <div className="flex gap-4 p-4 bg-gradient-to-r from-sky-50 to-blue-50">
                                  <div className="w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border-2 border-white shadow-md">
                                    <ImageWithFallback
                                      src={
                                        item.image ?? SHIPPING_FALLBACK_IMAGE
                                      }
                                      alt={item.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-grow">
                                    <div className="flex items-start justify-between mb-2">
                                      <div>
                                        <h3 className="text-xl text-primary mb-1">
                                          {item.title}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                          {item.artist}
                                        </p>
                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-2">
                                          <MapPin className="w-3 h-3" />
                                          発送元: {item.location}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <Badge
                                          className={
                                            item.status === "配送中"
                                              ? "bg-sky-600 text-white"
                                              : "bg-amber-500 text-white"
                                          }
                                        >
                                          {item.status}
                                        </Badge>
                                        <p className="text-lg text-accent mt-2">
                                          {item.price}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="p-4 bg-white space-y-3">
                                  <div className="flex items-center gap-3 p-3 bg-sky-50 rounded-lg border border-sky-200">
                                    <div
                                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        item.status === "配送中"
                                          ? "bg-sky-600"
                                          : "bg-amber-500"
                                      }`}
                                    >
                                      {item.status === "配送中" ? (
                                        <Truck className="w-5 h-5 text-white" />
                                      ) : (
                                        <Package className="w-5 h-5 text-white" />
                                      )}
                                    </div>
                                    <div className="flex-grow">
                                      <p className="text-sm text-gray-700">
                                        {item.shipping_status}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        追跡番号: {item.tracking_number ?? "—"}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <p className="text-xs text-gray-500">
                                          登録日
                                        </p>
                                      </div>
                                      <p className="text-sm text-gray-700">
                                        {formatShippingDashDate(
                                          item.order_date,
                                        )}
                                      </p>
                                    </div>
                                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                      <div className="flex items-center gap-2 mb-1">
                                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                                        <p className="text-xs text-blue-700">
                                          到着予定日
                                        </p>
                                      </div>
                                      <p className="text-sm text-blue-800">
                                        {formatShippingDashDate(
                                          item.estimated_return,
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg">
                                    <p className="text-xs text-sky-900 flex items-start gap-2">
                                      <Package className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                      <span>
                                        アーティストが作品を受領して確認すると、回収手続きが完了します。
                                      </span>
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            ))
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* 返却管理セクション */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <Card>
                        <CardHeader>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                              <RotateCcw className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <CardTitle>返却管理</CardTitle>
                              <CardDescription>
                                返却申請した作品の状況を確認できます
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {shippingReturns.length === 0 ? (
                            <div className="text-center py-12">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <RotateCcw className="w-8 h-8 text-gray-400" />
                              </div>
                              <p className="text-gray-600 mb-2">
                                返却中の作品はありません
                              </p>
                              <p className="text-sm text-gray-500">
                                展示中の作品から返却申請ができます
                              </p>
                            </div>
                          ) : (
                            shippingReturns.map((item, index) => (
                              <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  duration: 0.5,
                                  delay: index * 0.1,
                                }}
                                className="border-2 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                              >
                                {/* 上部：作品情報 */}
                                <div className="flex gap-4 p-4 bg-gradient-to-r from-orange-50 to-red-50">
                                  <div className="w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border-2 border-white shadow-md">
                                    <ImageWithFallback
                                      src={
                                        item.image ?? SHIPPING_FALLBACK_IMAGE
                                      }
                                      alt={item.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-grow">
                                    <div className="flex items-start justify-between mb-2">
                                      <div>
                                        <h3 className="text-xl text-primary mb-1">
                                          {item.title}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                          {item.artist}
                                        </p>
                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-2">
                                          <MapPin className="w-3 h-3" />
                                          返却元: {item.location}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <Badge
                                          className={
                                            item.status === "返送完了"
                                              ? "bg-green-500 text-white"
                                              : "bg-orange-500 text-white"
                                          }
                                        >
                                          {item.status}
                                        </Badge>
                                        <p className="text-lg text-accent mt-2">
                                          {item.price}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* 下部：返却状況詳細 */}
                                <div className="p-4 bg-white space-y-3">
                                  {/* 返却ステータス */}
                                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                                    <div
                                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        item.status === "返送完了"
                                          ? "bg-green-500"
                                          : "bg-orange-500"
                                      }`}
                                    >
                                      {item.status === "返送完了" ? (
                                        <CheckCircle2 className="w-5 h-5 text-white" />
                                      ) : (
                                        <RotateCcw className="w-5 h-5 text-white" />
                                      )}
                                    </div>
                                    <div className="flex-grow">
                                      <p className="text-sm text-gray-700">
                                        {item.shipping_status}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        追跡番号: {item.tracking_number ?? "—"}
                                      </p>
                                    </div>
                                  </div>

                                  {/* 返却情報 */}
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <p className="text-xs text-gray-500">
                                          返却申請日
                                        </p>
                                      </div>
                                      <p className="text-sm text-gray-700">
                                        {formatShippingDashDate(
                                          item.return_date,
                                        )}
                                      </p>
                                    </div>
                                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Truck className="w-4 h-4 text-orange-600" />
                                        <p className="text-xs text-orange-700">
                                          送料負担
                                        </p>
                                      </div>
                                      <p className="text-sm text-orange-700">
                                        {item.shipping_cost_bearer ===
                                        "corporate"
                                          ? "法人負担"
                                          : "アーティスト負担"}
                                      </p>
                                    </div>
                                  </div>

                                  {/* 返却理由 */}
                                  <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1">
                                      返却理由
                                    </p>
                                    <p className="text-sm text-gray-700">
                                      {item.return_reason ?? "—"}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            ))
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* 展示マニュアルガイド */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-white">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Package className="w-6 h-6 text-primary" />
                            作品梱包物のご案内
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <p className="text-sm text-gray-700">
                              作品が届くと、以下のものが同梱されています：
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-4 bg-white rounded-lg border hover:shadow-md transition-all">
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <ImageIcon className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <h4 className="text-sm text-primary mb-1">
                                      作品本体
                                    </h4>
                                    <p className="text-xs text-gray-600">
                                      専用の保護材で包装されています
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="p-4 bg-white rounded-lg border hover:shadow-md transition-all">
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                    <QrCode className="w-5 h-5 text-green-600" />
                                  </div>
                                  <div>
                                    <h4 className="text-sm text-primary mb-1">
                                      QRコード
                                    </h4>
                                    <p className="text-xs text-gray-600">
                                      訪問者が作品を購入するためのコード
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="p-4 bg-white rounded-lg border hover:shadow-md transition-all">
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                    <Package className="w-5 h-5 text-purple-600" />
                                  </div>
                                  <div>
                                    <h4 className="text-sm text-primary mb-1">
                                      展示マニュアル
                                    </h4>
                                    <p className="text-xs text-gray-600">
                                      設置方法とQRコード設置のガイド
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="p-4 bg-white rounded-lg border hover:shadow-md transition-all">
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                    <Truck className="w-5 h-5 text-orange-600" />
                                  </div>
                                  <div>
                                    <h4 className="text-sm text-primary mb-1">
                                      返送用の箱
                                    </h4>
                                    <p className="text-xs text-gray-600">
                                      作品返送時に使用する専用箱
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>

                  {/* サイドバー */}
                  <div className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">ヘルプ</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-gray-700">
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-xs text-blue-800">
                              <strong>
                                Q: 作品が届いたら何をすればよいですか？
                              </strong>
                              <br />
                              A:
                              同封の展示マニュアルに従って設置し、QRコードを作品の近くに設置してください。
                            </p>
                          </div>
                          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-xs text-green-800">
                              <strong>Q: QRコードはどこに設置しますか？</strong>
                              <br />
                              A:
                              作品の近く（壁面や台座など）に、訪問者が気づきやすい場所に設置してください。
                            </p>
                          </div>
                          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                            <p className="text-xs text-purple-800">
                              <strong>Q: 配送が遅れている場合は？</strong>
                              <br />
                              A:
                              サポートまでお問い合わせください。配送状況を確認いたします。
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* 入出金管理タブ */}
            <TabsContent
              value="payment"
              className="mt-0 flex min-h-0 flex-1 flex-col outline-none"
            >
              <div className="space-y-6">
                {/* タイトル */}
                <div>
                  <h2 className="text-2xl text-primary mb-2">入出金管理</h2>
                  <p className="text-gray-600">
                    報酬の受取口座とお支払い方法を管理
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 報酬受取口座 */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Wallet className="w-5 h-5 text-accent" />
                          報酬受取口座
                        </CardTitle>
                        <CardDescription>
                          作品販売の報酬を受け取る銀行口座
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg border">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">
                                登録済み口座
                              </p>
                              <p className="text-lg">みずほ銀行 渋谷支店</p>
                              <p className="text-sm text-gray-600">
                                普通 1234567
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200"
                            >
                              確認済み
                            </Badge>
                          </div>
                        </div>

                        {canAdminCorporate ? (
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setBankAccountDialogOpen(true)}
                          >
                            口座情報を変更
                          </Button>
                        ) : null}

                        <div className="pt-4 border-t">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-600">
                              次回振込予定日
                            </span>
                            <span>2026年1月31日</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              次回振込予定額
                            </span>
                            <span className="text-accent">
                              ¥{expectedRevenue.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* クレジットカード */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Wallet className="w-5 h-5 text-primary" />
                          お支払い方法
                        </CardTitle>
                        <CardDescription>
                          返送料などの支払いに使用されます
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg border">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">
                                登録済みカード
                              </p>
                              <p className="text-lg">VISA •••• 4242</p>
                              <p className="text-sm text-gray-600">
                                有効期限 12/28
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200"
                            >
                              有効
                            </Badge>
                          </div>
                        </div>

                        {canAdminCorporate ? (
                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => setCardDialogOpen(true)}
                            >
                              カード情報を変更
                            </Button>

                            <Button
                              variant="outline"
                              className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                              onClick={() => setCardDeleteConfirmOpen(true)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              カード情報を削除
                            </Button>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500">
                            口座・お支払い方法の変更は管理者のみが行えます。
                          </p>
                        )}

                        <div className="pt-4 border-t">
                          <p className="text-xs text-gray-500">
                            ※
                            クレジットカードは作品の返送料など、発生した費用のお支払いに使用されます。
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* 入出金履歴 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>入出金履歴</CardTitle>
                      <CardDescription>過去6ヶ月の取引履歴</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* 入金履歴（報酬） */}
                        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                              <TrendingUp className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm">販売報酬の振込</p>
                              <p className="text-xs text-gray-500">
                                2024年12月31日
                              </p>
                            </div>
                          </div>
                          <p className="text-green-600">+¥9,500</p>
                        </div>

                        {/* 出金履歴（返送料） */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <p className="text-sm">作品返送料</p>
                              <p className="text-xs text-gray-500">
                                2024年12月15日
                              </p>
                            </div>
                          </div>
                          <p className="text-gray-600">-¥1,500</p>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                              <TrendingUp className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm">販売報酬の振込</p>
                              <p className="text-xs text-gray-500">
                                2024年11月30日
                              </p>
                            </div>
                          </div>
                          <p className="text-green-600">+¥12,000</p>
                        </div>
                      </div>

                      <Link to="/payment-history" className="block">
                        <Button variant="ghost" className="w-full mt-4">
                          すべての履歴を表示
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            {/* サポートタブ */}
            <TabsContent
              value="support"
              className="mt-0 flex min-h-0 flex-1 flex-col outline-none"
            >
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* メインエリア */}
                <div className="lg:col-span-3 space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <LifeBuoy className="w-6 h-6 text-accent" />
                          サポート・ヘルプ
                        </CardTitle>
                        <CardDescription>
                          お困りの際はこちらをご確認ください
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer">
                            <h3 className="text-lg text-primary mb-2">
                              よくある質問
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                              展示・収益に関する疑問を解決
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              asChild
                            >
                              <Link to="/corporate-faq">
                                FAQを見る
                                <ChevronRight className="w-4 h-4" />
                              </Link>
                            </Button>
                          </div>
                          <div className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer">
                            <h3 className="text-lg text-primary mb-2">
                              お問い合わせ
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                              個別のご相談はこちら
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              asChild
                            >
                              <Link to="/contact">
                                問い合わせる
                                <ChevronRight className="w-4 h-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>

                        <div className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-primary/20">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Settings className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-lg text-primary mb-2">
                                アカウント設定
                              </h3>
                              <p className="text-sm text-gray-600 mb-3">
                                企業情報、報酬受取設定などを管理できます
                              </p>
                              <Button variant="outline" size="sm" asChild>
                                <Link to="/corporate-profile">
                                  設定画面へ
                                  <ChevronRight className="w-4 h-4" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="mt-auto shrink-0">
        <Footer />
      </div>

      {/* AIおすすめダイアログ */}
      {canEditCorporate ? (
        <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>AI作品推薦</DialogTitle>
              <DialogDescription>
                AIがあなたのスペースに最適な作品を推薦します
              </DialogDescription>
            </DialogHeader>
            <div className="p-4">
              <p className="text-sm text-gray-600">機能は準備中です</p>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}

      {/* 返却ダイアログ（法人作品詳細ページと同一コンポーネント・API連携） */}
      {canEditCorporate ? (
        <ArtworkReturnDialog
          open={returnSelection !== null}
          onOpenChange={(open) => {
            if (!open) setReturnSelection(null);
          }}
          spaceId={returnSelection?.spaceId}
          onSuccess={() => void loadRecommendedTabData()}
          artwork={returnSelection?.artwork ?? null}
        />
      ) : null}

      {/* 口座情報変更ダイアログ */}
      {canAdminCorporate ? (
        <BankAccountDialog
          open={bankAccountDialogOpen}
          onOpenChange={setBankAccountDialogOpen}
        />
      ) : null}

      {/* カード情報変更ダイアログ */}
      {canAdminCorporate ? (
        <CardInfoDialog
          open={cardDialogOpen}
          onOpenChange={setCardDialogOpen}
        />
      ) : null}

      {/* カード削除確認ダイアログ */}
      {canAdminCorporate ? (
        <AlertDialog
          open={cardDeleteConfirmOpen}
          onOpenChange={setCardDeleteConfirmOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>カード情報を削除しますか？</AlertDialogTitle>
              <AlertDialogDescription>
                このカード情報は削除され、返送料などの支払いに使用できなくなります。
                再度登録する場合は、カード情報を変更から登録してください。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => setCardDeleteConfirmOpen(false)}
              >
                キャンセル
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCardDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                削除する
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </div>
  );
}
