import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Legend
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
  ExternalLink,
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
  Heart
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

// モックデータ
const revenueData = [
  { month: "7月", revenue: 45000, sales: 3 },
  { month: "8月", revenue: 62000, sales: 4 },
  { month: "9月", revenue: 38000, sales: 2 },
  { month: "10月", revenue: 85000, sales: 5 },
  { month: "11月", revenue: 120000, sales: 7 },
  { month: "12月", revenue: 95000, sales: 6 }
];

const trendData = [
  { date: "12/1", views: 45, clicks: 12, sales: 2 },
  { date: "12/8", views: 68, clicks: 18, sales: 3 },
  { date: "12/15", views: 82, clicks: 24, sales: 4 },
  { date: "12/22", views: 95, clicks: 28, sales: 5 },
  { date: "12/29", views: 124, clicks: 35, sales: 6 }
];

const artworks = [
  {
    id: 1,
    title: "青の記憶",
    artist: "山田 花子",
    spaceId: 1,
    location: "1階エントランス",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400",
    price: "¥42,000",
    views: 124,
    ctr: 28.2,
    conversion: 4.8,
    status: "展示中",
    displayedSince: "2024年10月1日"
  },
  {
    id: 2,
    title: "Forest Light",
    artist: "佐藤 太郎",
    spaceId: 2,
    location: "会議室A",
    image: "https://images.unsplash.com/photo-1578926078722-e5c8f2e3b1f1?w=400",
    price: "¥38,000",
    views: 98,
    ctr: 22.4,
    conversion: 3.1,
    status: "展示中",
    displayedSince: "2024年11月5日"
  },
  {
    id: 3,
    title: "都市の夕暮れ",
    artist: "鈴木 美咲",
    spaceId: 3,
    location: "受付",
    image: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=400",
    price: "¥35,000",
    views: 156,
    ctr: 35.8,
    conversion: 6.4,
    status: "展示中",
    displayedSince: "2024年9月15日"
  }
];

// 配送待ち作品
const shippingArtworks = [
  {
    id: 4,
    title: "朝の光",
    artist: "中村 健",
    spaceId: 1,
    location: "1階エントランス",
    image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=400",
    price: "¥48,000",
    status: "配送準備中",
    orderDate: "2025年1月15日",
    estimatedArrival: "2025年1月20日",
    trackingNumber: "MGJ-2025-001234",
    shippingStatus: "アーティストが発送準備中",
    type: "incoming"
  },
  {
    id: 5,
    title: "夕焼けの丘",
    artist: "林 美和",
    spaceId: 2,
    location: "会議室A",
    image: "https://images.unsplash.com/photo-1520420097861-e4959843b682?w=400",
    price: "¥39,000",
    status: "配送中",
    orderDate: "2025年1月10日",
    estimatedArrival: "2025年1月18日",
    trackingNumber: "MGJ-2025-001123",
    shippingStatus: "配送業者に引き渡し済み",
    type: "incoming"
  },
  {
    id: 6,
    title: "静かな雨",
    artist: "吉田 梨花",
    spaceId: 3,
    location: "受付",
    image: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=400",
    price: "¥35,000",
    status: "展示確定",
    orderDate: "2025年1月17日",
    estimatedArrival: "2025年1月23日",
    trackingNumber: "MGJ-2025-001345",
    shippingStatus: "アーティストへ発送依頼を送信しました",
    type: "incoming"
  }
];

// 返却中の作品
const returningArtworks = [
  {
    id: 7,
    title: "秋の風景",
    artist: "小林 真理",
    spaceId: 1,
    location: "1階エントランス",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    price: "¥42,000",
    status: "返送中",
    returnDate: "2025年1月12日",
    estimatedReturn: "2025年1月18日",
    trackingNumber: "RTN-2025-000891",
    shippingStatus: "返送ラベル発行済み・集荷待ち",
    returnReason: "別の作品に交換したい",
    shippingCostBearer: "corporate",
    type: "returning"
  },
  {
    id: 8,
    title: "都市の夜",
    artist: "高橋 誠",
    spaceId: 2,
    location: "会議室A",
    image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400",
    price: "¥38,000",
    status: "返送完了",
    returnDate: "2025年1月8日",
    estimatedReturn: "2025年1月14日",
    trackingNumber: "RTN-2025-000832",
    shippingStatus: "アーティストが受領しました",
    returnReason: "展示を終了する",
    shippingCostBearer: "artist",
    type: "returning"
  }
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
    revenue: "¥3,800"
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
    revenue: "¥3,500"
  }
];

const favoritedArtworks = [
  {
    id: 201,
    title: "静寂の湖畔",
    artist: "田中 一郎",
    image: "https://images.unsplash.com/photo-1533158326339-7f3cf2404354?w=400",
    price: "¥45,000",
    tags: ["風景画", "落ち着いた"],
    status: "sold",
    statusText: "売却済み",
    statusDate: "2024年10月15日に売却"
  },
  {
    id: 202,
    title: "抽象の調和",
    artist: "高橋 由美",
    image: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=400",
    price: "¥52,000",
    tags: ["抽象画", "モダン"],
    status: "available",
    statusText: "展示可能",
    statusDate: null
  },
  {
    id: 203,
    title: "夕暮れの街",
    artist: "佐藤 健太",
    image: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=400",
    price: "¥38,000",
    tags: ["都市", "夜景"],
    status: "displayed",
    statusText: "他社で展示中",
    statusDate: "他の企業が展示中です"
  },
  {
    id: 204,
    title: "春の庭園",
    artist: "鈴木 美咲",
    image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400",
    price: "¥48,000",
    tags: ["自然", "明るい"],
    status: "sold",
    statusText: "売却済み",
    statusDate: "2024年9月28日に売却"
  },
  {
    id: 205,
    title: "モダンアート No.7",
    artist: "山本 裕子",
    image: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=400",
    price: "¥65,000",
    tags: ["抽象画", "カラフル"],
    status: "displayed",
    statusText: "他社で展示中",
    statusDate: "他の企業が展示中です"
  },
  {
    id: 206,
    title: "森の光",
    artist: "渡辺 誠",
    image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=400",
    price: "¥42,000",
    tags: ["自然", "癒し"],
    status: "available",
    statusText: "展示可能",
    statusDate: null
  }
];

const recommendedArtworks = [
  {
    id: 1,
    title: "静寂の湖畔",
    artist: "田中 一郎",
    image: "https://images.unsplash.com/photo-1533158326339-7f3cf2404354?w=400",
    price: "¥45,000",
    reason: "貴社の過去の傾向から、自然風景画が高い反応を得ています",
    tags: ["風景画", "落ち着いた"]
  },
  {
    id: 2,
    title: "抽象の調和",
    artist: "高橋 由美",
    image: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=400",
    price: "¥52,000",
    reason: "会議室Aの雰囲気に最適な現代アート",
    tags: ["抽象画", "モダン"]
  },
  {
    id: 3,
    title: "朝の光",
    artist: "中村 健",
    image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=400",
    price: "¥48,000",
    reason: "エントランスの明るい雰囲気を引き立てます",
    tags: ["明るい", "風景画"]
  }
];

// 法人向け全作品一覧（展示申請用）- ArtworkListPageと同じデータを使用
const allArtworksForCorporate = [
  { id: "WRK-001", title: "静寂の朝", artist: "田中 美咲", image: "https://images.unsplash.com/photo-1697257378991-b57497dddc69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGFydCUyMGdhbGxlcnl8ZW58MXx8fHwxNzYzNDUzMDEzfDA&ixlib=rb-4.1.0&q=80&w=1080", price: "¥85,000", size: { width: 60, height: 45 }, technique: "油彩", available: true, tags: ["抽象画", "青系"] },
  { id: "WRK-002", title: "都市の記憶", artist: "佐藤 健太", image: "https://images.unsplash.com/photo-1706811833540-2a1054cddafb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcnQlMjBwYWludGluZ3xlbnwxfHx8fDE3NjM0NzE2OTF8MA&ixlib=rb-4.1.0&q=80&w=1080", price: "¥120,000", size: { width: 90, height: 65 }, technique: "アクリル", available: true, tags: ["モダン", "都市"] },
  { id: "WRK-003", title: "風の詩", artist: "山本 彩花", image: "https://images.unsplash.com/photo-1683659635051-39336c5476b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwYXJ0fGVufDF8fHx8MTc2MzQ0OTkzNHww&ixlib=rb-4.1.0&q=80&w=1080", price: "¥45,000", size: { width: 30, height: 40 }, technique: "インク", available: false, tags: ["ミニマル", "和風"] },
  { id: "WRK-004", title: "時の流れ", artist: "鈴木 隆", image: "https://images.unsplash.com/photo-1522878308970-972ec5eedc0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wb3JhcnklMjBhcnR8ZW58MXx8fHwxNzYzNDQ4MzgxfDA&ixlib=rb-4.1.0&q=80&w=1080", price: "¥180,000", size: { width: 130, height: 97 }, technique: "油彩", available: true, tags: ["抽象画", "テラコッタ"] },
  { id: "WRK-005", title: "光と影", artist: "高橋 麻衣", image: "https://images.unsplash.com/photo-1757332209950-03f3ccb4e4a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMGFydCUyMG1vZGVybnxlbnwxfHx8fDE3NjM0NTMxNzR8MA&ixlib=rb-4.1.0&q=80&w=1080", price: "¥95,000", size: { width: 53, height: 53 }, technique: "アクリル", available: true, tags: ["明るい", "モダン"] },
  { id: "WRK-006", title: "夏の思い出", artist: "伊藤 誠", image: "https://images.unsplash.com/photo-1532540983331-3260f8487880?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGV4cHJlc3Npb25pc218ZW58MXx8fHwxNzYzNTA3MDk0fDA&ixlib=rb-4.1.0&q=80&w=1080", price: "¥135,000", size: { width: 80, height: 60 }, technique: "スプレー", available: true, tags: ["カラフル", "ダイナミック"] },
  { id: "WRK-007", title: "静かな午後", artist: "渡辺 優子", image: "https://images.unsplash.com/photo-1580136607993-fd598cf5c4f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwcGFpbnRpbmd8ZW58MXx8fHwxNzYzMzk0OTA2fDA&ixlib=rb-4.1.0&q=80&w=1080", price: "¥52,000", size: { width: 38, height: 27 }, technique: "油彩", available: true, tags: ["ミニマル", "ホワイト"] },
  { id: "WRK-008", title: "夜の街角", artist: "中村 大輔", image: "https://images.unsplash.com/photo-1487452066049-a710f7296400?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1cmJhbiUyMGFydHxlbnwxfHx8fDE3NjM1MDcwOTV8MA&ixlib=rb-4.1.0&q=80&w=1080", price: "¥78,000", size: { width: 65, height: 50 }, technique: "コラージュ", available: false, tags: ["都市", "ネイビー"] },
  { id: "WRK-009", title: "春の訪れ", artist: "小林 さくら", image: "https://images.unsplash.com/photo-1653919811590-959d2cdc163a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmUlMjBhcnQlMjBhYnN0cmFjdHxlbnwxfHx8fDE3NjM1MDcwOTV8MA&ixlib=rb-4.1.0&q=80&w=1080", price: "¥145,000", size: { width: 72, height: 91 }, technique: "アクリル", available: true, tags: ["自然", "グリーン"] },
  { id: "WRK-010", title: "無限の空間", artist: "加藤 翔太", image: "https://images.unsplash.com/photo-1704121113061-d174b9b9219b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnZW9tZXRyaWMlMjBhcnR8ZW58MXx8fHwxNzYzNDgyNjY0fDA&ixlib=rb-4.1.0&q=80&w=1080", price: "¥220,000", size: { width: 162, height: 112 }, technique: "油彩", available: true, tags: ["幾何学", "モダン"] },
  { id: "WRK-011", title: "月明かり", artist: "吉田 真理", image: "https://images.unsplash.com/photo-1643756511497-b3e4701ea792?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wb3JhcnklMjBwYWludGluZ3xlbnwxfHx8fDE3NjM1MDExMzN8MA&ixlib=rb-4.1.0&q=80&w=1080", price: "¥88,000", size: { width: 45, height: 60 }, technique: "インク", available: true, tags: ["ミステリアス", "パープル"] },
  { id: "WRK-012", title: "秋の調べ", artist: "松本 和也", image: "https://images.unsplash.com/photo-1680456265112-e4115432ef23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGFydCUyMHdhcm18ZW58MXx8fHwxNzYzNTA3MDk2fDA&ixlib=rb-4.1.0&q=80&w=1080", price: "¥48,000", size: { width: 33, height: 24 }, technique: "アクリル", available: true, tags: ["温かみ", "ピンク"] },
];

const spaces = [
  {
    id: 1,
    name: "1階エントランス",
    location: "東京本社",
    artworks: 1,
    revenue: 45000,
    status: "展示中"
  },
  {
    id: 2,
    name: "会議室A",
    location: "東京本社",
    artworks: 1,
    revenue: 38000,
    status: "展示中"
  },
  {
    id: 3,
    name: "受付",
    location: "東京本社",
    artworks: 1,
    revenue: 12000,
    status: "展示中"
  }
];

const notifications = [
  {
    id: 1,
    type: "sale",
    message: "「青の記憶」（山田 花子）が販売されました",
    time: "2時間前",
    icon: "🎉"
  },
  {
    id: 2,
    type: "milestone",
    message: "「Forest Light」が閲覧100回を突破しました",
    time: "5時間前",
    icon: "🖼️"
  },
  {
    id: 3,
    type: "recommendation",
    message: "新しいおすすめ作品が3点追加されました",
    time: "1日前",
    icon: "✨"
  }
];

export function CorporateDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, userType } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sortBy, setSortBy] = useState("views");
  const [timePeriod, setTimePeriod] = useState("week");
  
  // 認証チェック：未ログインまたは法人以外はリダイレクト
  useEffect(() => {
    // 初期レンダリング時の状態読み込みを待つため、少し遅延
    const timer = setTimeout(() => {
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
    }, 50); // 50ms待機
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, userType, navigate]);
  
  // AI推薦ダイアログの状態
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  
  // 返却ダイアログの状態
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedArtworkForReturn, setSelectedArtworkForReturn] = useState<any>(null);

  // 入出金管理ダイアログの状態
  const [bankAccountDialogOpen, setBankAccountDialogOpen] = useState(false);
  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [cardDeleteConfirmOpen, setCardDeleteConfirmOpen] = useState(false);

  // お気に入りの状態管理
  const [favorites, setFavorites] = useState<string[]>([]);
  const [aiFavorites, setAiFavorites] = useState<any[]>([]);

  // お気に入り削除ハンドラー
  const handleRemoveFavorite = (artworkId: string) => {
    const newFavorites = favorites.filter(id => id !== artworkId);
    setFavorites(newFavorites);
    localStorage.setItem("mgj_corporate_favorites", JSON.stringify(newFavorites));
    window.dispatchEvent(new Event("favoritesUpdated"));
    toast.success("お気に入りから削除しました");
  };

  // カード削除ハンドラー
  const handleCardDelete = () => {
    toast.success("カード情報を削除しました");
    setCardDeleteConfirmOpen(false);
  };

  // localStorageから登録済みスペースを読み込む
  const [allSpaces, setAllSpaces] = useState(spaces);
  
  // スペース一覧を更新する関数
  const loadSpaces = () => {
    const savedSpaces = JSON.parse(localStorage.getItem("mgj_registered_spaces") || "[]");
    
    // モックデータと統合（重複を避ける）
    const combined = [...spaces];
    savedSpaces.forEach((saved: any) => {
      if (!combined.find(space => space.id === saved.id)) {
        // 登録されたスペースデータをダッシュボード用に変換
        const spaceData = {
          id: saved.id,
          name: saved.name,
          location: saved.location,
          artworks: saved.currentArtwork ? 1 : 0,
          revenue: saved.totalRevenue || 0,
          status: saved.status || "未選択",
          image: saved.image || saved.images?.[0] || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"
        };
        combined.push(spaceData);
      }
    });
    
    // 最新登録順に並べ替え（registeredAtがあるものを優先��
    combined.sort((a, b) => {
      const aSpace = savedSpaces.find((s: any) => s.id === a.id);
      const bSpace = savedSpaces.find((s: any) => s.id === b.id);
      const dateA = aSpace?.registeredAt ? new Date(aSpace.registeredAt).getTime() : 0;
      const dateB = bSpace?.registeredAt ? new Date(bSpace.registeredAt).getTime() : 0;
      return dateB - dateA;
    });
    
    setAllSpaces(combined);
  };
  
  useEffect(() => {
    loadSpaces();
    // お気に入りを読み込む
    const savedFavorites = JSON.parse(localStorage.getItem("mgj_corporate_favorites") || "[]");
    console.log("🔵 CorporateDashboard初期化: お気に入り読み込み", savedFavorites);
    setFavorites(savedFavorites);
  }, []);
  
  // activeTabが'spaces'になったときにスペースを再読み込み
  useEffect(() => {
    if (activeTab === 'spaces') {
      loadSpaces();
    }
    // お気に入りタブの場合は最新のお気に入りを読み込む
    if (activeTab === 'favorites') {
      const savedFavorites = JSON.parse(localStorage.getItem("mgj_corporate_favorites") || "[]");
      console.log("🟢 お気に入りタブ切り替え: お気に入り読み込み", savedFavorites);
      setFavorites(savedFavorites);
    }
  }, [activeTab]);

  // お気に入り更新イベントをリスン
  useEffect(() => {
    const handleFavoritesUpdate = () => {
      const savedFavorites = JSON.parse(localStorage.getItem("mgj_corporate_favorites") || "[]");
      console.log("🟡 favoritesUpdatedイベント受信: お気に入り読み込み", savedFavorites);
      setFavorites(savedFavorites);
    };

    window.addEventListener("favoritesUpdated", handleFavoritesUpdate);
    return () => {
      window.removeEventListener("favoritesUpdated", handleFavoritesUpdate);
    };
  }, []);

  // URLハッシュに基づいてタブを設定
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash === "spaces") {
      setActiveTab("spaces");
    } else if (hash === "exhibitions") {
      setActiveTab("exhibitions");
    } else if (hash === "artworks" || hash === "recommended") {
      setActiveTab("recommended");
    } else if (hash === "dashboard") {
      setActiveTab("dashboard");
    } else if (hash === "shipping") {
      setActiveTab("shipping");
    } else if (hash === "revenue") {
      setActiveTab("revenue");
    } else if (hash === "account") {
      setActiveTab("account");
    } else if (hash === "favorites") {
      setActiveTab("favorites");
    }
    window.scrollTo(0, 0);
  }, [location]);

  // ハッシュが変更されたときにもタブを切り替える
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === "spaces") {
        setActiveTab("spaces");
      } else if (hash === "exhibitions") {
        setActiveTab("exhibitions");
      } else if (hash === "artworks" || hash === "recommended") {
        setActiveTab("recommended");
      } else if (hash === "dashboard") {
        setActiveTab("dashboard");
      } else if (hash === "shipping") {
        setActiveTab("shipping");
      } else if (hash === "revenue") {
        setActiveTab("revenue");
      } else if (hash === "account") {
        setActiveTab("account");
      } else if (hash === "favorites") {
        setActiveTab("favorites");
      }
      window.scrollTo(0, 0);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // activeTabが変更されたときに上部にスクロール
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  // 配送状況タブへの自動遷移
  useEffect(() => {
    if (location.state?.scrollTo === 'delivery') {
      setActiveTab('shipping');
      // stateをクリア
      window.history.replaceState({}, document.title);
    }
    // スペース管理タブへの自動遷移
    if (location.state?.openTab === 'spaces') {
      setActiveTab('spaces');
      // stateをクリア
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const monthRevenue = revenueData[revenueData.length - 1].revenue;
  const expectedRevenue = monthRevenue * 0.1; // 10%コミッション

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* カスタムヘッダー */}
      <div className="bg-white border-b sticky top-0 z-40 pt-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-3 sm:py-4">
            {/* ロゴ */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl text-primary truncate">MGJ for Business</h1>
                <p className="text-xs text-gray-500 hidden sm:block">マイクロギャラリー法人ダッシュボード</p>
              </div>
            </div>

            {/* プロフィール */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Link to="/corporate-profile">
                <Button variant="outline" size="sm" className="gap-1 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3">
                  <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">設定</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* タブナビゲーション */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                  {shippingArtworks.length > 0 && (
                    <Badge className="ml-1 sm:ml-2 bg-accent text-white text-[10px] sm:text-xs px-1 sm:px-1.5 py-0">{shippingArtworks.length}</Badge>
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

      {/* メインコンテンツ */}
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* ダッシュボードタブ */}
          <TabsContent value="dashboard" className="mt-0">
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
                        <CardDescription className="text-xs sm:text-sm">今月の収益</CardDescription>
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
                        <CardDescription className="text-xs sm:text-sm">累計収益（6ヶ月）</CardDescription>
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
                        <CardDescription className="text-xs sm:text-sm">見込み報酬（10%）</CardDescription>
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
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="month" stroke="#888" />
                          <YAxis stroke="#888" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px'
                            }}
                          />
                          <Legend />
                          <Bar dataKey="revenue" fill="#6B5B4A" name="収益（円）" radius={[8, 8, 0, 0]} />
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
                          <CardDescription>期間別の閲覧・購入データ</CardDescription>
                        </div>
                        <Select value={timePeriod} onValueChange={setTimePeriod}>
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
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="date" stroke="#888" />
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
                            <span className="text-accent">AIによる分析：</span> この1ヶ月で人気が上昇したのは「鈴木 美咲」の作品です。自然光が入るエントランスでの展示が好評です。
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
                          transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                          className="p-3 bg-gray-50 rounded-lg border hover:shadow-md transition-all cursor-pointer"
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-lg flex-shrink-0">{notification.icon}</span>
                            <div className="flex-grow">
                              <p className="text-sm text-gray-700 leading-relaxed mb-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500">{notification.time}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      <Button variant="ghost" className="w-full text-sm" size="sm">
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
                        transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-all"
                      >
                        <ImageWithFallback
                          src={artwork.image}
                          alt={artwork.title}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                        <div className="flex-grow">
                          <h4 className="text-sm mb-1">{artwork.title}</h4>
                          <p className="text-xs text-gray-500 mb-2">{artwork.artist}</p>
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
                          <p className="text-sm text-gray-600 mb-1">販売価格</p>
                          <p className="text-lg text-primary">{artwork.price}</p>
                          <p className="text-xs text-green-600 mt-1">報酬: {artwork.revenue}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* スペース管理タブ */}
          <TabsContent value="spaces" className="mt-0">
            <div className="space-y-6">
              {/* タイトルとボタン */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl text-primary mb-2">登録済みスペース</h2>
                  <p className="text-gray-600">展示中の空間を管理</p>
                </div>
                <Link to="/signup/corporate?addSpace=true">
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4" />
                    <span>スペース追加</span>
                  </Button>
                </Link>
              </div>

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
                        const savedSpaces = JSON.parse(localStorage.getItem("mgj_registered_spaces") || "[]");
                        const fullSpace = savedSpaces.find((s: any) => s.id === space.id);
                        navigate(`/corporate-space/${space.id}`, { 
                          state: { space: fullSpace || space } 
                        });
                      }}
                    >
                      <div className="relative aspect-video overflow-hidden">
                        <ImageWithFallback
                          src={space.image || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"}
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
                          <CardTitle className="text-xl">{space.name}</CardTitle>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {space.location}
                            </p>
                            {space.artworks > 0 && (
                              <div className="flex items-center gap-2 pt-2">
                                <Badge variant="outline" className="text-green-600 border-green-600">
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
                              <p className="text-xs text-gray-600 mb-1">累計売上</p>
                              <p className="text-xl text-green-700">¥{space.revenue.toLocaleString()}</p>
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
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: allSpaces.length * 0.1 }}
                  className="flex"
                >
                  <Card 
                    className="bg-white border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer flex flex-col items-center justify-center w-full"
                    onClick={() => navigate('/signup/corporate?addSpace=true')}
                  >
                    <CardContent className="text-center py-16">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-lg text-primary mb-2">新しいスペースを追加</h3>
                      <p className="text-sm text-gray-600">
                        別の場所にもアートを飾りませんか？
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </TabsContent>

          {/* 作品一覧タブ */}
          <TabsContent value="recommended" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* メインエリア */}
              <div className="lg:col-span-3 space-y-6">
              {/* 展示中の作品一覧 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>展示中の作品一覧</CardTitle>
                    <CardDescription>現在展示している作品</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {artworks.map((artwork, index) => (
                      <motion.div
                        key={artwork.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex gap-4 p-4 rounded-lg border hover:shadow-lg transition-all cursor-pointer hover:border-primary"
                        onClick={() => navigate(`/corporate-artwork/${artwork.id}`)}
                      >
                        <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          <ImageWithFallback
                            src={artwork.image}
                            alt={artwork.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg text-primary mb-1">{artwork.title}</h3>
                              <p className="text-sm text-gray-600">{artwork.artist}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3" />
                                {artwork.location}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                展示開始: {artwork.displayedSince}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-green-100 text-green-700 border-green-200 mb-2">
                                {artwork.status}
                              </Badge>
                              <p className="text-lg text-accent mb-3">{artwork.price}</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedArtworkForReturn(artwork);
                                  setReturnDialogOpen(true);
                                }}
                                className="gap-2 w-full"
                              >
                                <RotateCcw className="w-4 h-4" />
                                返却
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* 過去の販売一覧 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>過去の販売一覧</CardTitle>
                    <CardDescription>販売された作品の履歴</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {pastSalesArtworks.map((artwork, index) => (
                      <motion.div
                        key={artwork.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                        className="flex gap-4 p-4 rounded-lg border bg-gradient-to-r from-green-50 to-emerald-50 hover:shadow-lg transition-all cursor-pointer hover:border-primary"
                        onClick={() => navigate(`/corporate-artwork/${artwork.id}`)}
                      >
                        <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          <ImageWithFallback
                            src={artwork.image}
                            alt={artwork.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg text-primary mb-1">{artwork.title}</h3>
                              <p className="text-sm text-gray-600">{artwork.artist}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3" />
                                {artwork.spaceName}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                展示期間: {artwork.displayPeriod}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-green-500 text-white mb-2">
                                販売済
                              </Badge>
                              <p className="text-sm text-gray-600">販売価格: {artwork.price}</p>
                              <p className="text-lg text-green-600">収益: {artwork.revenue}</p>
                              <p className="text-xs text-gray-500 mt-1">{artwork.soldDate}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* お気に入り作品 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-pink-500" />
                      お気に入り作品
                    </CardTitle>
                    <CardDescription>保存した候補作品</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {favoritedArtworks.map((artwork, index) => (
                        <motion.div
                          key={artwork.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                          className="border rounded-lg overflow-hidden hover:shadow-xl transition-all group cursor-pointer relative"
                          onClick={() => navigate(`/corporate-artwork/${artwork.id}`)}
                        >
                          <div className="aspect-square bg-gray-100 overflow-hidden relative">
                            <ImageWithFallback
                              src={artwork.image}
                              alt={artwork.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            {/* ステータスオーバーレイ */}
                            {artwork.status !== 'available' && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <div className="text-center px-4">
                                  <Badge 
                                    className={`mb-2 ${
                                      artwork.status === 'sold' 
                                        ? 'bg-red-500 text-white' 
                                        : 'bg-orange-500 text-white'
                                    }`}
                                  >
                                    {artwork.statusText}
                                  </Badge>
                                  {artwork.statusDate && (
                                    <p className="text-xs text-white">{artwork.statusDate}</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="p-4 space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="flex-grow">
                                <h3 className="text-lg text-primary mb-1">{artwork.title}</h3>
                                <p className="text-sm text-gray-600">{artwork.artist}</p>
                              </div>
                              {artwork.status === 'available' && (
                                <Badge className="bg-green-100 text-green-700 border-green-200 shrink-0 ml-2">
                                  {artwork.statusText}
                                </Badge>
                              )}
                            </div>
                            <p className="text-lg text-accent">{artwork.price}</p>
                            <div className="flex flex-wrap gap-2">
                              {artwork.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              </div>
            </div>
          </TabsContent>

          {/* お気に入りタブ */}
          <TabsContent value="favorites" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  お気に入り作品
                </CardTitle>
                <CardDescription>お気に入りに追加した作品から展示する作品を選べます</CardDescription>
              </CardHeader>
              <CardContent>
                {favorites.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">お気に入りに追加された作品はありません</p>
                    <Button variant="outline" onClick={() => setActiveTab("recommended")}>
                      作品一覧を見る
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allArtworksForCorporate
                      .filter(artwork => favorites.includes(String(artwork.id)) || favorites.includes(artwork.id))
                      .map((artwork) => (
                        <Card key={artwork.id} className="overflow-hidden">
                          <div className="aspect-square relative overflow-hidden">
                            <ImageWithFallback
                              src={artwork.image}
                              alt={artwork.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-medium text-primary mb-1">{artwork.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">{artwork.artist}</p>
                            <p className="text-lg font-medium text-primary mb-3">{artwork.price}</p>
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => handleRemoveFavorite(String(artwork.id))}
                            >
                              お気に入りから削除
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 配送状況タブ */}
          <TabsContent value="shipping" className="mt-0">
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
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                          <Truck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle>配送状況</CardTitle>
                          <CardDescription>展示確定した作品の配送状況を確認できます</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {shippingArtworks.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-600 mb-2">配送待ちの作品はありません</p>
                          <p className="text-sm text-gray-500">作品を展示確定すると、こちらに表示されます</p>
                        </div>
                      ) : (
                        shippingArtworks.map((artwork, index) => (
                          <motion.div
                            key={artwork.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="border-2 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                          >
                            {/* 上部：作品情報 */}
                            <div className="flex gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50">
                              <div className="w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border-2 border-white shadow-md">
                                <ImageWithFallback
                                  src={artwork.image}
                                  alt={artwork.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-grow">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h3 className="text-xl text-primary mb-1">{artwork.title}</h3>
                                    <p className="text-sm text-gray-600">{artwork.artist}</p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-2">
                                      <MapPin className="w-3 h-3" />
                                      展示予定: {artwork.location}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <Badge 
                                      className={
                                        artwork.status === "配送中"
                                          ? "bg-blue-500 text-white"
                                          : artwork.status === "配送準備中"
                                          ? "bg-orange-500 text-white"
                                          : "bg-green-500 text-white"
                                      }
                                    >
                                      {artwork.status}
                                    </Badge>
                                    <p className="text-lg text-accent mt-2">{artwork.price}</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* 下部：配送状況詳細 */}
                            <div className="p-4 bg-white space-y-3">
                              {/* 配送ステータス */}
                              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  artwork.status === "配送中" ? "bg-blue-500" :
                                  artwork.status === "配送準備中" ? "bg-orange-500" :
                                  "bg-green-500"
                                }`}>
                                  {artwork.status === "配送中" ? (
                                    <Truck className="w-5 h-5 text-white" />
                                  ) : artwork.status === "配送準備中" ? (
                                    <Package className="w-5 h-5 text-white" />
                                  ) : (
                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                  )}
                                </div>
                                <div className="flex-grow">
                                  <p className="text-sm text-gray-700">{artwork.shippingStatus}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    追跡番号: {artwork.trackingNumber}
                                  </p>
                                </div>
                              </div>

                              {/* 配送日程 */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    <p className="text-xs text-gray-500">展示確定日</p>
                                  </div>
                                  <p className="text-sm text-gray-700">{artwork.orderDate}</p>
                                </div>
                                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                  <div className="flex items-center gap-2 mb-1">
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    <p className="text-xs text-green-700">到着予定日</p>
                                  </div>
                                  <p className="text-sm text-green-700">{artwork.estimatedArrival}</p>
                                </div>
                              </div>

                              {/* 注意事項 */}
                              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-xs text-amber-800 flex items-start gap-2">
                                  <Package className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                  <span>
                                    <strong>作品到着後のステップ：</strong>
                                    <br />
                                    ① 同封の展示マニュアルに従って設置してください
                                    <br />
                                    ② 作品の近くにQRコード（同封）を設置してください
                                    <br />
                                    ③ マイページから「展示開始」ボタンを押すと、訪問者が作品を購入できるようになります
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
                          <CardDescription>返却申請した作品の状況を確認できます</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {returningArtworks.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <RotateCcw className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-600 mb-2">返却中の作品はありません</p>
                          <p className="text-sm text-gray-500">展示中の作品から返却申請ができます</p>
                        </div>
                      ) : (
                        returningArtworks.map((artwork, index) => (
                          <motion.div
                            key={artwork.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="border-2 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                          >
                            {/* 上部：作品情報 */}
                            <div className="flex gap-4 p-4 bg-gradient-to-r from-orange-50 to-red-50">
                              <div className="w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border-2 border-white shadow-md">
                                <ImageWithFallback
                                  src={artwork.image}
                                  alt={artwork.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-grow">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h3 className="text-xl text-primary mb-1">{artwork.title}</h3>
                                    <p className="text-sm text-gray-600">{artwork.artist}</p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-2">
                                      <MapPin className="w-3 h-3" />
                                      返却元: {artwork.location}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <Badge 
                                      className={
                                        artwork.status === "返送完了"
                                          ? "bg-green-500 text-white"
                                          : "bg-orange-500 text-white"
                                      }
                                    >
                                      {artwork.status}
                                    </Badge>
                                    <p className="text-lg text-accent mt-2">{artwork.price}</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* 下部：返却状況詳細 */}
                            <div className="p-4 bg-white space-y-3">
                              {/* 返却ステータス */}
                              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  artwork.status === "返送完了" ? "bg-green-500" : "bg-orange-500"
                                }`}>
                                  {artwork.status === "返送完了" ? (
                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                  ) : (
                                    <RotateCcw className="w-5 h-5 text-white" />
                                  )}
                                </div>
                                <div className="flex-grow">
                                  <p className="text-sm text-gray-700">{artwork.shippingStatus}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    追跡番号: {artwork.trackingNumber}
                                  </p>
                                </div>
                              </div>

                              {/* 返却情報 */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    <p className="text-xs text-gray-500">返却申請日</p>
                                  </div>
                                  <p className="text-sm text-gray-700">{artwork.returnDate}</p>
                                </div>
                                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Truck className="w-4 h-4 text-orange-600" />
                                    <p className="text-xs text-orange-700">送料負担</p>
                                  </div>
                                  <p className="text-sm text-orange-700">
                                    {artwork.shippingCostBearer === "corporate" ? "法人負担" : "アーティスト負担"}
                                  </p>
                                </div>
                              </div>

                              {/* 返却理由 */}
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">返却理由</p>
                                <p className="text-sm text-gray-700">{artwork.returnReason}</p>
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
                                <h4 className="text-sm text-primary mb-1">作品本体</h4>
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
                                <h4 className="text-sm text-primary mb-1">QRコード</h4>
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
                                <h4 className="text-sm text-primary mb-1">展示マニュアル</h4>
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
                                <h4 className="text-sm text-primary mb-1">返送用の箱</h4>
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
                          <strong>Q: 作品が届いたら何をすればよいですか？</strong>
                          <br />
                          A: 同封の展示マニュアルに従って設置し、QRコードを作品の近くに設置してください。
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-xs text-green-800">
                          <strong>Q: QRコードはどこに設置しますか？</strong>
                          <br />
                          A: 作品の近く（壁面や台座など）に、訪問者が気づきやすい場所に設置してください。
                        </p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-xs text-purple-800">
                          <strong>Q: 配送が遅れている場合は？</strong>
                          <br />
                          A: サポートまでお問い合わせください。配送状況を確認いたします。
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </TabsContent>

          {/* 入出金管理タブ */}
          <TabsContent value="payment" className="mt-0">
            <div className="space-y-6">
              {/* タイトル */}
              <div>
                <h2 className="text-2xl text-primary mb-2">入出金管理</h2>
                <p className="text-gray-600">報酬の受取口座とお支払い方法を管理</p>
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
                      <CardDescription>作品販売の報酬を受け取る銀行口座</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">登録済み口座</p>
                            <p className="text-lg">みずほ銀行 渋谷支店</p>
                            <p className="text-sm text-gray-600">普通 1234567</p>
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            確認済み
                          </Badge>
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setBankAccountDialogOpen(true)}
                      >
                        口座情報を変更
                      </Button>

                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">次回振込予定日</span>
                          <span>2026年1月31日</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">次回振込予定額</span>
                          <span className="text-accent">¥{expectedRevenue.toLocaleString()}</span>
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
                      <CardDescription>返送料などの支払いに使用されます</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">登録済みカード</p>
                            <p className="text-lg">VISA •••• 4242</p>
                            <p className="text-sm text-gray-600">有効期限 12/28</p>
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            有効
                          </Badge>
                        </div>
                      </div>
                      
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

                      <div className="pt-4 border-t">
                        <p className="text-xs text-gray-500">
                          ※ クレジットカードは作品の返送料など、発生した費用のお支払いに使用されます。
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
                            <p className="text-xs text-gray-500">2024年12月31日</p>
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
                            <p className="text-xs text-gray-500">2024年12月15日</p>
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
                            <p className="text-xs text-gray-500">2024年11月30日</p>
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
          <TabsContent value="support" className="mt-0">
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
                    <CardDescription>お困りの際はこちらをご確認ください</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer">
                        <h3 className="text-lg text-primary mb-2">よくある質問</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          展示・収益に関する疑問を解決
                        </p>
                        <Link to="/corporate-faq">
                          <Button variant="outline" size="sm" className="w-full">
                            FAQを見る
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                      <div className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer">
                        <h3 className="text-lg text-primary mb-2">お問い合わせ</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          個別のご相談はこちら
                        </p>
                        <Button variant="outline" size="sm" className="w-full">
                          問い合わせる
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-primary/20">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Settings className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg text-primary mb-2">アカウント設定</h3>
                          <p className="text-sm text-gray-600 mb-3">
                            企業情報、報酬受取設定などを管理できます
                          </p>
                          <Link to="/corporate-profile">
                            <Button variant="outline" size="sm">
                              設定画面へ
                            </Button>
                          </Link>
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

      <Footer />

      {/* AIおすすめダイアログ */}
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

      {/* 返却ダイアログ */}
      <ArtworkReturnDialog
        open={returnDialogOpen}
        onOpenChange={setReturnDialogOpen}
        artwork={selectedArtworkForReturn}
      />

      {/* 口座情報変更ダイアログ */}
      <BankAccountDialog
        open={bankAccountDialogOpen}
        onOpenChange={setBankAccountDialogOpen}
      />

      {/* カード情報変更ダイアログ */}
      <CardInfoDialog
        open={cardDialogOpen}
        onOpenChange={setCardDialogOpen}
      />

      {/* カード削除確認ダイアログ */}
      <AlertDialog open={cardDeleteConfirmOpen} onOpenChange={setCardDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>カード情報を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              このカード情報は削除され、返送料などの支払いに使用できなくなります。
              再度登録する場合は、カード情報を変更から登録してください。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCardDeleteConfirmOpen(false)}>
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
    </div>
  );
}
