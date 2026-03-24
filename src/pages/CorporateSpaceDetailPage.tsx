import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import {
  Eye,
  Sparkles,
  ChevronRight,
  Edit,
  RefreshCw,
  Package,
  AlertCircle,
  Bell,
  Users,
  Home,
  Image as ImageIcon,
  ArrowLeft,
  ExternalLink,
  BarChart3,
  Wallet,
  LifeBuoy,
  Trash2,
  Settings,
  ChevronLeft,
  Image,
  Frame,
  Loader2,
  QrCode,
  Download,
} from "lucide-react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import {
  getSpace,
  updateSpace as updateSpaceApi,
  deleteSpace as deleteSpaceApi,
  type SpaceResponse,
} from "@/services/space.service";
import {
  getSpaceQRCode,
  generateSpaceQRCode,
  downloadSpaceQRCodeImage,
  type SpaceQRCodeResponse,
} from "@/services/qr.service";

const DEFAULT_SPACE_IMAGE =
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuidString(id: string | undefined): boolean {
  return Boolean(id && UUID_REGEX.test(id));
}

function mapSpaceResponseToDetailData(s: SpaceResponse) {
  const imgs =
    s.photo_urls && s.photo_urls.length > 0
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
    wallSize: "未設定",
    lighting: "未設定",
    type: s.facility_type,
    image: primary,
    images: imgs,
    totalRevenue: 0,
    totalSales: 0,
  };
}

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

/** Auth / signup forms と同じテキスト入力の見た目 */
const AUTH_INPUT_CLASS =
  "h-11 sm:h-12 text-sm sm:text-base bg-gray-100 border-gray-200 focus:bg-white focus:border-primary";
const AUTH_INPUT_READONLY_CLASS =
  "h-11 sm:h-12 text-sm sm:text-base bg-gray-100 border-gray-200 text-gray-700 cursor-default select-none";

// モックデータ
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
    totalSales: 6
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
    totalSales: 0
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
    status: "展示中"
  }
};

const trendData = [
  { week: "W1", views: 28, clicks: 8, sales: 1 },
  { week: "W2", views: 42, clicks: 12, sales: 1 },
  { week: "W3", views: 58, clicks: 16, sales: 2 },
  { week: "W4", views: 72, clicks: 20, sales: 3 }
];

const exhibitionHistory = [
  {
    id: 1,
    title: "春の庭",
    artist: "佐々木 翔",
    image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400",
    period: "2024年4月1日 - 2024年6月30日",
    sold: true,
    revenue: 28000
  },
  {
    id: 2,
    title: "赤い景",
    artist: "小林 麗子",
    image: "https://images.unsplash.com/photo-1533158628620-7e35717d36e8?w=400",
    period: "2024年1月10日 - 2024年3月31日",
    sold: false,
    revenue: 0
  }
];

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
  const [timePeriod, setTimePeriod] = useState("month");
  const historyRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const [spaceData, setSpaceData] = useState<any>(MOCK_SPACES_DATA["1"]);
  const [currentArtwork, setCurrentArtwork] = useState<any>(MOCK_CURRENT_ARTWORKS["1"]);
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
  const [spaceQrInfo, setSpaceQrInfo] = useState<SpaceQRCodeResponse | null>(
    null,
  );
  const [qrMetaLoading, setQrMetaLoading] = useState(false);
  const [qrGenerating, setQrGenerating] = useState(false);
  const [qrDownloading, setQrDownloading] = useState(false);

  const canManageSpaceQr =
    Boolean(spaceId && isUuidString(spaceId)) &&
    Boolean(
      typeof window !== "undefined" && localStorage.getItem("mgj_access_token"),
    );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!spaceId) {
        setIsLoadingSpaceDetail(false);
        return;
      }

      setIsLoadingSpaceDetail(true);

      if (
        isUuidString(spaceId) &&
        localStorage.getItem("mgj_access_token")
      ) {
        try {
          const s = await getSpace(spaceId);
          if (cancelled) return;
          setSpaceData(mapSpaceResponseToDetailData(s));
          setCurrentArtwork(null);
          setIsLoadingSpaceDetail(false);
          return;
        } catch (e) {
          console.warn("getSpace failed, falling back to cache", e);
        }
      }

      if (cancelled) return;

      let space: any = null;
      let artwork: any = null;

      if (location.state?.space) {
        const stateSpace = location.state.space;
        const facilityOverview =
          [stateSpace.facilityType, stateSpace.subType].filter(Boolean).join(" / ") ||
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
          image:
            stateSpace.image ||
            stateSpace.images?.[0] ||
            DEFAULT_SPACE_IMAGE,
          images:
            stateSpace.images ||
            (stateSpace.image ? [stateSpace.image] : [DEFAULT_SPACE_IMAGE]),
          totalRevenue:
            typeof stateSpace.totalRevenue === "string"
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
            days: Math.floor(
              (new Date().getTime() -
                new Date(stateSpace.currentArtwork.displayedSince).getTime()) /
                (1000 * 60 * 60 * 24)
            ),
            views: stateSpace.currentArtwork.views || 0,
            ctr: 0,
            conversion: 0,
            status: "展示中",
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
        const savedSpaces = JSON.parse(
          localStorage.getItem("mgj_registered_spaces") || "[]"
        );
        const foundSpace = savedSpaces.find(
          (s: any) => String(s.id) === String(spaceId)
        );

        if (foundSpace) {
          const fo =
            [foundSpace.facilityType, foundSpace.subType]
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
            image:
              foundSpace.image || foundSpace.images?.[0] || DEFAULT_SPACE_IMAGE,
            images:
              foundSpace.images ||
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
          address:
            MOCK_SPACES_DATA["1"].address || MOCK_SPACES_DATA["1"].location,
        };
        artwork = MOCK_CURRENT_ARTWORKS["1"] || null;
      }

      if (!cancelled) {
        setSpaceData(space);
        setCurrentArtwork(artwork);
      }
      if (!cancelled) setIsLoadingSpaceDetail(false);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [spaceId, location.state, currentUser]);

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
        if (!cancelled) setSpaceQrInfo(qr);
      } catch {
        if (!cancelled) setSpaceQrInfo(null);
      } finally {
        if (!cancelled) setQrMetaLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [spaceId, canManageSpaceQr, isLoadingSpaceDetail]);

  const handleGenerateSpaceQr = useCallback(async () => {
    if (!spaceId || !isUuidString(spaceId)) return;
    setQrGenerating(true);
    try {
      const qr = await generateSpaceQRCode(spaceId);
      setSpaceQrInfo(qr);
      toast.success("QRコードを発行しました");
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "QRコードの発行に失敗しました");
    } finally {
      setQrGenerating(false);
    }
  }, [spaceId]);

  const handleDownloadSpaceQr = useCallback(async () => {
    if (!spaceId || !isUuidString(spaceId)) return;
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
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "ダウンロードに失敗しました");
    } finally {
      setQrDownloading(false);
    }
  }, [spaceId]);

  const scrollToHistory = () => {
    historyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleAIProposal = () => {
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

  const handleAreaSave = (area: { x: number; y: number; width: number; height: number }) => {
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
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "更新に失敗しました");
    } finally {
      setIsSavingSpaceEdit(false);
    }
  };

  const handleDeleteSpace = async () => {
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
        const raw = JSON.parse(
          localStorage.getItem("mgj_registered_spaces") || "[]"
        );
        const next = raw.filter((s: any) => String(s.id) !== idStr);
        localStorage.setItem("mgj_registered_spaces", JSON.stringify(next));
      } catch {
        /* ignore */
      }

      toast.success("スペースを削除しました");
      setDeleteDialogOpen(false);
      navigate("/corporate-dashboard");
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "削除に失敗しました");
    } finally {
      setIsDeletingSpace(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {isLoadingSpaceDetail && spaceId ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 pt-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" aria-hidden />
          <p className="text-sm text-muted-foreground">スペース情報を読み込んでいます…</p>
        </div>
      ) : (
        <>
      {/* パンくず（アカウントはグローバル Header を使用） */}
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

      {/* メインコンテンツ */}
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* メインエリア */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            {/* セクション①：スペース情報（登録した写真） */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between flex-col sm:flex-row gap-3 sm:gap-0">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <Home className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        {spaceData.name}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        {spaceData.facilityOverview || spaceData.type} • {spaceData.location}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEditSpace}
                        className="gap-2"
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm">編集</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteDialogOpen(true)}
                        className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm">削除</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* スペース写真ギャラリー */}
                  {spaceData.images && spaceData.images.length > 1 ? (
                    <div className="space-y-3">
                      {/* メイン画像 */}
                      <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-100 group">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={selectedImageIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="w-full h-full"
                          >
                            <ImageWithFallback
                              src={spaceData.images[selectedImageIndex]}
                              alt={`${spaceData.name} - ${selectedImageIndex + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </motion.div>
                        </AnimatePresence>
                        
                        {/* 作品配置エリアの表示 */}
                        {artworkPlacementArea && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute border-4 border-accent border-dashed bg-accent/10 backdrop-blur-sm"
                            style={{
                              left: `${artworkPlacementArea.x}%`,
                              top: `${artworkPlacementArea.y}%`,
                              width: `${artworkPlacementArea.width}%`,
                              height: `${artworkPlacementArea.height}%`,
                            }}
                          >
                            <div className="absolute -top-6 sm:-top-8 left-0 bg-accent text-white px-2 sm:px-3 py-1 rounded-md text-[10px] sm:text-xs shadow-lg whitespace-nowrap">
                              <Frame className="w-2 h-2 sm:w-3 sm:h-3 inline mr-1" />
                              作品配置エリア
                            </div>
                          </motion.div>
                        )}
                        
                        {/* 画カウンター */}
                        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm backdrop-blur-sm flex items-center gap-1.5">
                          <Image className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          {selectedImageIndex + 1} / {spaceData.images.length}
                        </div>

                        {/* 作品エリア指定ボタン */}
                        <Button
                          onClick={() => setAreaSelectionDialogOpen(true)}
                          className="absolute bottom-4 left-4 bg-white/90 hover:bg-white text-gray-800 backdrop-blur-sm shadow-lg gap-2 text-xs sm:text-sm"
                          size="sm"
                        >
                          <Frame className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">{artworkPlacementArea ? "配置エリアを変更" : "作品を展示するエリアを指定"}</span>
                          <span className="sm:hidden">エリア指定</span>
                        </Button>
                        
                        {/* ナビゲーションボタン */}
                        {spaceData.images.length > 1 && (
                          <>
                            {selectedImageIndex > 0 && (
                              <button
                                onClick={() => setSelectedImageIndex(selectedImageIndex - 1)}
                                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                              >
                                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                              </button>
                            )}
                            {selectedImageIndex < spaceData.images.length - 1 && (
                              <button
                                onClick={() => setSelectedImageIndex(selectedImageIndex + 1)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                              >
                                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                      
                      {/* サムネイルギャラリー */}
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {spaceData.images.map((img: string, index: number) => (
                          <motion.button
                            key={index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`relative flex-shrink-0 w-20 h-14 sm:w-24 sm:h-16 overflow-hidden rounded-lg transition-all ${
                              selectedImageIndex === index
                                ? 'ring-2 sm:ring-3 ring-primary ring-offset-2 scale-105'
                                : 'ring-2 ring-gray-200 hover:ring-primary/50 opacity-70 hover:opacity-100'
                            }`}
                            whileHover={{ scale: selectedImageIndex === index ? 1.05 : 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <ImageWithFallback
                              src={img}
                              alt={`${spaceData.name} サムネイル ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {selectedImageIndex === index && (
                              <motion.div
                                layoutId="selected-indicator"
                                className="absolute inset-0 border-2 border-primary rounded-lg"
                                initial={false}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              />
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-100 group">
                      <ImageWithFallback
                        src={spaceData.image}
                        alt={spaceData.name}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* 作品配置エリアの表示 */}
                      {artworkPlacementArea && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute border-4 border-accent border-dashed bg-accent/10 backdrop-blur-sm"
                          style={{
                            left: `${artworkPlacementArea.x}%`,
                            top: `${artworkPlacementArea.y}%`,
                            width: `${artworkPlacementArea.width}%`,
                            height: `${artworkPlacementArea.height}%`,
                          }}
                        >
                          <div className="absolute -top-6 sm:-top-8 left-0 bg-accent text-white px-2 sm:px-3 py-1 rounded-md text-[10px] sm:text-xs shadow-lg whitespace-nowrap">
                            <Frame className="w-2 h-2 sm:w-3 sm:h-3 inline mr-1" />
                            作品配置エリア
                          </div>
                        </motion.div>
                      )}
                      
                      {/* 作品エリア指定ボタン */}
                      <Button
                        onClick={() => setAreaSelectionDialogOpen(true)}
                        className="absolute bottom-4 left-4 bg-white/90 hover:bg-white text-gray-800 backdrop-blur-sm shadow-lg gap-2 text-xs sm:text-sm"
                        size="sm"
                      >
                        <Frame className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">{artworkPlacementArea ? "配置エリアを変更" : "作品を展示するエリアを指定"}</span>
                        <span className="sm:hidden">エリア指定</span>
                      </Button>
                    </div>
                  )}
                  
                  {/* スペース詳細情報 */}
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

                  {/* スペース用QRコード（1スペース1コード・展示作品は差し替え可能） */}
                  <div className="rounded-xl border border-border/70 bg-muted/25 p-4 sm:p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-primary shrink-0" />
                      <h3 className="font-semibold text-sm sm:text-base">
                        スペース用QRコード
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      スペース登録後、ここからQRを発行できます。高解像度画像を印刷して設置すると、来場者は現在展示中の作品ページへ誘導されます（作品を入れ替えても同じQRのままです）。
                    </p>
                    {!canManageSpaceQr ? (
                      <p className="text-xs text-muted-foreground">
                        ログイン済みの登録スペースでのみQRコードを発行・表示できます。
                      </p>
                    ) : qrMetaLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                        QR情報を読み込んでいます…
                      </div>
                    ) : spaceQrInfo ? (
                      <div className="flex flex-col sm:flex-row gap-4 items-start pt-1">
                        <div className="bg-white p-3 rounded-lg border shadow-sm shrink-0 mx-auto sm:mx-0">
                          <img
                            src={spaceQrInfo.qr_code_url}
                            alt="スペースQRコード"
                            className="w-36 h-36 sm:w-40 sm:h-40 object-contain"
                          />
                        </div>
                        <div className="space-y-3 flex-1 w-full min-w-0">
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            累計スキャン回数:{" "}
                            <span className="font-medium text-foreground tabular-nums">
                              {spaceQrInfo.total_scans}
                            </span>
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-2 w-full sm:w-auto"
                            disabled={qrDownloading}
                            onClick={() => void handleDownloadSpaceQr()}
                          >
                            {qrDownloading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                            高解像度PNGをダウンロード
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        className="bg-gradient-to-r from-primary to-accent hover:opacity-90 gap-2"
                        disabled={qrGenerating}
                        onClick={() => void handleGenerateSpaceQr()}
                      >
                        {qrGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            発行中…
                          </>
                        ) : (
                          <>
                            <QrCode className="w-4 h-4" />
                            QRコードを発行
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* AIに作品を提案させるボタン（上部に配置） */}
                  <div className="pt-4 relative">
                    {/* 次のステップバッジ（エリア指定直後に表示） */}
                    <AnimatePresence>
                      {isAreaJustSaved && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute -top-2 left-1/2 -translate-x-1/2 z-10"
                        >
                          <Badge className="bg-accent text-white border-0 shadow-lg px-2 sm:px-3 py-1 animate-bounce text-xs sm:text-sm">
                            👇 次のステップ
                          </Badge>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <motion.div
                      animate={isAreaJustSaved ? {
                        scale: [1, 1.05, 1],
                        boxShadow: [
                          "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                          "0 20px 25px -5px rgba(217, 119, 6, 0.3)",
                          "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                        ]
                      } : {}}
                      transition={{
                        duration: 2,
                        repeat: isAreaJustSaved ? Infinity : 0,
                        repeatType: "loop"
                      }}
                    >
                      <Button 
                        className={`w-full bg-gradient-to-r from-accent to-purple-500 hover:from-accent/90 hover:to-purple-600 text-white h-10 sm:h-12 shadow-lg hover:shadow-xl transition-all text-sm sm:text-base ${
                          isAreaJustSaved ? 'ring-4 ring-accent/50 ring-offset-2' : ''
                        }`}
                        onClick={handleAIProposal}
                      >
                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        AIに作品を提案させる
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* セクション②：現在展示中の作品 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between flex-col sm:flex-row gap-3 sm:gap-0">
                    <div>
                      <CardTitle className="text-lg sm:text-xl">展示中の作品</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">品のパフォーマンスデータ</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={scrollToHistory} className="w-full sm:w-auto">
                      <span className="text-xs sm:text-sm">展示履歴を見る</span>
                      <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentArtwork ? (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border hover:shadow-lg transition-all"
                    >
                      <div className="w-full sm:w-32 h-48 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 mx-auto sm:mx-0">
                        <ImageWithFallback
                          src={currentArtwork.image}
                          alt={currentArtwork.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-start justify-between mb-3 flex-col sm:flex-row gap-2 sm:gap-0">
                          <div>
                            <h3 className="text-base sm:text-lg text-primary mb-1">{currentArtwork.title}</h3>
                            <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2 mb-1">
                              <Users className="w-3 h-3" />
                              {currentArtwork.artist}
                            </p>
                            <p className="text-xs text-gray-500">
                              展示開始：{currentArtwork.startDate} （{currentArtwork.days}日経過）
                            </p>
                            <p className="text-sm sm:text-base text-accent mt-1">{currentArtwork.price}</p>
                          </div>
                          <Badge className="bg-green-100 text-green-700 border-green-200 w-fit">
                            {currentArtwork.status}
                          </Badge>
                        </div>
                        <div className="flex justify-center">
                          <div className="text-center p-3 bg-blue-50 rounded-lg min-w-[120px]">
                            <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="text-xs">QR閲覧数</span>
                            </div>
                            <p className="text-xl sm:text-2xl text-blue-700">{currentArtwork.views}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <Button 
                            size="sm" 
                            className="w-full bg-gradient-to-r from-accent to-purple-500 hover:from-accent/90 hover:to-purple-600 text-white text-xs sm:text-sm"
                            onClick={handleAIProposal}
                          >
                            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                            AIに別の作品を提案させる
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="p-6 sm:p-8 text-center border-2 border-dashed rounded-lg bg-gray-50">
                      <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-sm sm:text-base text-gray-600 mb-4">現在展示中の作品はありません</p>
                      <Button 
                        className="bg-gradient-to-r from-accent to-purple-500 hover:from-accent/90 hover:to-purple-600 text-white text-xs sm:text-sm"
                        onClick={handleAIProposal}
                      >
                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        AIに作品を提案させる
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* セクション③：閲覧データとトレンド分析 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between flex-col sm:flex-row gap-3 sm:gap-0">
                    <div>
                      <CardTitle className="text-lg sm:text-xl">閲覧データとトレンド分析</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">スペース単位のパフォーマンス</CardDescription>
                    </div>
                    <Select value={timePeriod} onValueChange={setTimePeriod}>
                      <SelectTrigger className="w-28 sm:w-32">
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
                  <div className="w-full h-[250px] sm:h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="week" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="views" 
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          name="QR閲覧数"
                          dot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-accent/5 border border-accent/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0 mt-0.5" />
                      <p className="text-xs sm:text-sm text-gray-700">
                        <span className="text-accent">AIによる分析：</span> この1ヶ月で閲覧数が最も伸びたのは「青の記憶」です。エントランスの明るさが作品の色彩を引き立てています。
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* セクション④：展示履歴 */}
            <motion.div
              ref={historyRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">展示履歴</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">過去の展示・販売データ</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {exhibitionHistory.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 1.0 + index * 0.1 }}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:shadow-md transition-all"
                    >
                      <div className="w-full sm:w-20 h-32 sm:h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <ImageWithFallback
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-base sm:text-lg text-primary mb-1">{item.title}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">{item.artist}</p>
                        <p className="text-xs text-gray-500">{item.period}</p>
                      </div>
                      <div className="text-left sm:text-right w-full sm:w-auto">
                        {item.sold ? (
                          <>
                            <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-2">
                              買売済
                            </Badge>
                            <p className="text-sm text-accent">¥{item.revenue.toLocaleString()}</p>
                          </>
                        ) : (
                          <>
                            <Badge variant="outline" className="mb-2">展示のみ</Badge>
                            <Button variant="ghost" size="sm" className="block sm:ml-auto">
                              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                              <span className="text-xs sm:text-sm">再展示する</span>
                            </Button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  <Button variant="outline" className="w-full text-xs sm:text-sm">
                    すべての履歴を表示
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* セクション⑤：管理アクションエリア */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">管理アクション</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">スペースに関する操作</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <Button 
                      variant="outline" 
                      className="h-auto py-3 sm:py-4 flex-col gap-2"
                      onClick={() => {
                        if (currentArtwork) {
                          navigate(`/artwork-return-request/${spaceId}`);
                        } else {
                          toast.error("展示中の作品がありません");
                        }
                      }}
                    >
                      <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="text-xs sm:text-sm">作品の返却を申請</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto py-3 sm:py-4 flex-col gap-2"
                      onClick={() => navigate(`/corporate-dashboard?tab=shipping`)}
                    >
                      <Package className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="text-xs sm:text-sm">配送状況を確認</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto py-3 sm:py-4 flex-col gap-2"
                      onClick={() => {
                        if (currentArtwork) {
                          navigate(`/artwork-issue-report/${spaceId}`);
                        } else {
                          toast.error("展示中の作品がありません");
                        }
                      }}
                    >
                      <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="text-xs sm:text-sm">破損・不具合を報告</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* サイドバー */}
          <div className="space-y-4 sm:space-y-6">
            {/* セクション⑥：通知＆リマインダー */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                    通知
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                      className="p-3 bg-gray-50 rounded-lg border hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-base sm:text-lg flex-shrink-0">{notification.icon}</span>
                        <div className="flex-grow">
                          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500">{notification.time}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <Button variant="ghost" className="w-full text-xs sm:text-sm" size="sm">
                    すべて表示
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* クイックリンク */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">クイックリンク</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link to="/corporate-profile?tab=payment">
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      <Wallet className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      <span className="text-xs sm:text-sm">報酬受取設定</span>
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </Button>
                  </Link>
                  <Link to="/corporate-sales-history">
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      <span className="text-xs sm:text-sm">売上履歴</span>
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    size="sm"
                    onClick={() => navigate("/corporate-dashboard?tab=support")}
                  >
                    <LifeBuoy className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    <span className="text-xs sm:text-sm">問い合わせ</span>
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* 戻るボタン */}
        <div className="mt-6 sm:mt-8">
          <Button 
            variant="outline" 
            onClick={() => navigate("/corporate-dashboard")}
            className="gap-2 text-xs sm:text-sm"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            ダッシュボードに戻る
          </Button>
        </div>
      </div>

      <Footer />

      {/* スペース編集ダイアログ */}
      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          if (!open && isSavingSpaceEdit) return;
          setEditDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto sm:rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              スペース情報の編集
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-left">
              スペース名と所在地を変更できます。施設概要は登録時の内容のため変更できません。
            </DialogDescription>
          </DialogHeader>

          <form
            id="corporate-space-edit-form"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSaveEdit();
            }}
            className="flex flex-col gap-0"
          >
            <div className="space-y-5 sm:space-y-6 py-2">
              <div className="space-y-2">
                <Label htmlFor="space-name-edit" className="text-sm text-foreground">
                  スペース名（自分用）
                </Label>
                <Input
                  id="space-name-edit"
                  value={editedSpace.name}
                  onChange={(e) => setEditedSpace({ ...editedSpace, name: e.target.value })}
                  placeholder="例：1階エントランス"
                  className={AUTH_INPUT_CLASS}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="facility-overview-ro" className="text-sm text-foreground">
                  施設概要
                </Label>
                <Input
                  id="facility-overview-ro"
                  readOnly
                  tabIndex={-1}
                  value={editedSpace.facilityOverview}
                  className={AUTH_INPUT_READONLY_CLASS}
                  aria-readonly="true"
                />
                <p className="text-xs text-muted-foreground">登録時に設定した内容です（変更不可）</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="space-address-edit" className="text-sm text-foreground">
                  所在地
                </Label>
                <Input
                  id="space-address-edit"
                  value={editedSpace.address}
                  onChange={(e) => setEditedSpace({ ...editedSpace, address: e.target.value })}
                  placeholder="例：東京都渋谷区〇〇 1-2-3 ○○ビル4F"
                  className={AUTH_INPUT_CLASS}
                  autoComplete="street-address"
                />
              </div>
            </div>

            <DialogFooter className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-3 pt-2 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                className="text-sm w-full sm:w-auto"
                disabled={isSavingSpaceEdit}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-sm min-w-[100px] w-full sm:w-auto"
                disabled={isSavingSpaceEdit}
              >
                {isSavingSpaceEdit ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    保存中...
                  </>
                ) : (
                  "保存"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* スペース削除確認ダイアログ */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!open && isDeletingSpace) return;
          setDeleteDialogOpen(open);
        }}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600 text-base sm:text-lg">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
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
                {currentArtwork && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs sm:text-sm text-amber-800">
                      <strong>展示中の作品：</strong> 現在「{currentArtwork.title}」が展示されています。削除する前に作品の返却手続きを完了してください。
                    </p>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="text-xs sm:text-sm"
              disabled={isDeletingSpace}
            >
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm"
              disabled={isDeletingSpace}
              onClick={(e) => {
                e.preventDefault();
                void handleDeleteSpace();
              }}
            >
              {isDeletingSpace ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 inline animate-spin" />
                  削除中...
                </>
              ) : (
                "削除する"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 作品配置エリア選択ダイアログ */}
      <ArtworkAreaSelectionDialog
        open={areaSelectionDialogOpen}
        onOpenChange={setAreaSelectionDialogOpen}
        spaceImage={spaceData.images?.[selectedImageIndex] || spaceData.image}
        spaceName={spaceData.name}
        currentArea={artworkPlacementArea || undefined}
        onSave={handleAreaSave}
      />
        </>
      )}
    </div>
  );
}

