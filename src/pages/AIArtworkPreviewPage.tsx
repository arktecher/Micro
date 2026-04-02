import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCorporateOrgRole } from "@/hooks/useCorporateOrgRole";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import {
  Brain,
  Sparkles,
  Zap,
  Heart,
  X,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Printer,
  Camera,
  Upload,
  Download,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { AIRecommendationReason } from "@/components/AIRecommendationReason";

// 型定義
type FlowStep =
  | "mode-selection"
  | "capture-guide"
  | "image-confirm"
  | "analyzing"
  | "recommendation";
type ScaleMode = "furniture" | "marker" | null;

interface ScaleResult {
  method: "furniture" | "marker";
  confidence: number;
  wallWidth: number;
  wallHeight: number;
}

interface Artwork {
  id: number;
  title: string;
  artist: string;
  image: string;
  price: string;
  reason: string;
  tags: string[];
}

// グローバルな作品マスターデータ（作品一覧ページと同じデータ）
const SAMPLE_ARTWORKS = [
  {
    id: "WRK-001",
    title: "静寂の朝",
    artist: "田中 美咲",
    price: "¥85,000",
    image:
      "https://images.unsplash.com/photo-1697257378991-b57497dddc69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGFydCUyMGdhbGxlcnl8ZW58MXx8fHwxNzYzNDUzMDEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "WRK-002",
    title: "都市の記憶",
    artist: "佐藤 健太",
    price: "¥120,000",
    image:
      "https://images.unsplash.com/photo-1706811833540-2a1054cddafb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcnQlMjBwYWludGluZ3xlbnwxfHx8fDE3NjM0NzE2OTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "WRK-003",
    title: "風の詩",
    artist: "山本 彩花",
    price: "¥45,000",
    image:
      "https://images.unsplash.com/photo-1683659635051-39336c5476b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwYXJ0fGVufDF8fHx8MTc2MzQ0OTkzNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "WRK-004",
    title: "時の流れ",
    artist: "鈴木 隆",
    price: "¥180,000",
    image:
      "https://images.unsplash.com/photo-1522878308970-972ec5eedc0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wb3JhcnklMjBhcnR8ZW58MXx8fHwxNzYzNDQ4MzgxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "WRK-005",
    title: "光と影",
    artist: "高橋 麻衣",
    price: "¥95,000",
    image:
      "https://images.unsplash.com/photo-1757332209950-03f3ccb4e4a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMGFydCUyMG1vZGVybnxlbnwxfHx8fDE3NjM0NTMxNzR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "WRK-006",
    title: "夏の思い出",
    artist: "伊藤 誠",
    price: "¥135,000",
    image:
      "https://images.unsplash.com/photo-1532540983331-3260f8487880?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGV4cHJlc3Npb25pc218ZW58MXx8fHwxNzYzNTA3MDk0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "WRK-007",
    title: "静かな午後",
    artist: "渡辺 優子",
    price: "¥52,000",
    image:
      "https://images.unsplash.com/photo-1580136607993-fd598cf5c4f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwcGFpbnRpbmd8ZW58MXx8fHwxNzYzMzk0OTA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "WRK-008",
    title: "夜の街角",
    artist: "中村 大輔",
    price: "¥78,000",
    image:
      "https://images.unsplash.com/photo-1487452066049-a710f7296400?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1cmJhbiUyMGFydHxlbnwxfHx8fDE3NjM1MDcwOTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "WRK-009",
    title: "春の訪れ",
    artist: "小林 さくら",
    price: "¥145,000",
    image:
      "https://images.unsplash.com/photo-1653919811590-959d2cdc163a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmUlMjBhcnQlMjBhYnN0cmFjdHxlbnwxfHx8fDE3NjM1MDcwOTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "WRK-010",
    title: "無限の空間",
    artist: "加藤 翔太",
    price: "¥220,000",
    image:
      "https://images.unsplash.com/photo-1704121113061-d174b9b9219b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnZW9tZXRyaWMlMjBhcnR8ZW58MXx8fHwxNzYzNDgyNjY0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "WRK-011",
    title: "月明かり",
    artist: "吉田 真理",
    price: "¥88,000",
    image:
      "https://images.unsplash.com/photo-1643756511497-b3e4701ea792?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wb3JhcnklMjBwYWludGluZ3xlbnwxfHx8fDE3NjM1MDExMzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "WRK-012",
    title: "秋の調べ",
    artist: "松本 和也",
    price: "¥48,000",
    image:
      "https://images.unsplash.com/photo-1680456265112-e4115432ef23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGFydCUyMHdhcm18ZW58MXx8fHwxNzYzNTA3MDk2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
];

// AIが提案する作品セット（初期提案）
const initialMockRecommendations: Artwork[] = [
  {
    id: 1,
    title: "静寂の湖畔",
    artist: "田中 一郎",
    image: "https://images.unsplash.com/photo-1533158326339-7f3cf2404354?w=400",
    price: "¥45,000",
    reason: "エントランスの明るい雰囲気に合う自然風景画です",
    tags: ["風景画", "落ち着いた"],
  },
  {
    id: 2,
    title: "抽象の調和",
    artist: "高橋 由美",
    image: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=400",
    price: "¥52,000",
    reason: "モダンな空間を引き立てる抽象アート",
    tags: ["抽象画", "モダン"],
  },
  {
    id: 3,
    title: "朝の光",
    artist: "中村 健",
    image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=400",
    price: "¥48,000",
    reason: "来訪者に爽やかな印象を与えます",
    tags: ["明るい", "風景画"],
  },
  {
    id: 4,
    title: "都市の響き",
    artist: "佐藤 美咲",
    image: "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=400",
    price: "¥58,000",
    reason: "現代的なオフィス空間にマッチします",
    tags: ["都市", "現代的"],
  },
  {
    id: 5,
    title: "夕暮れの詩",
    artist: "山本 太郎",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400",
    price: "¥42,000",
    reason: "温かみのある色彩が心地よい空間を作ります",
    tags: ["温かい", "自然"],
  },
  {
    id: 6,
    title: "静かな対話",
    artist: "伊藤 花子",
    image: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=400",
    price: "¥44,000",
    reason: "落ち着いた会議室に最適な作品です",
    tags: ["ミニマル", "静寂"],
  },
];

// AIが再提案する代替作品セット
const alternativeMockRecommendations: Artwork[] = [
  {
    id: 7,
    title: "森の記憶",
    artist: "鈴木 隆志",
    image: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=400",
    price: "¥49,000",
    reason: "自然の静けさを感じられる作品です",
    tags: ["自然", "癒し"],
  },
  {
    id: 8,
    title: "幾何学の美",
    artist: "加藤 恵子",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400",
    price: "¥55,000",
    reason: "シャープなデザインが空間を引き締めます",
    tags: ["幾何学", "クール"],
  },
  {
    id: 9,
    title: "色彩の交響曲",
    artist: "渡辺 翔太",
    image: "https://images.unsplash.com/photo-1555296534-e724e9ed9b15?w=400",
    price: "¥62,000",
    reason: "鮮やかな色彩が空間を活性化します",
    tags: ["カラフル", "エネルギッシュ"],
  },
  {
    id: 10,
    title: "水面の反射",
    artist: "小林 由美",
    image: "https://images.unsplash.com/photo-1533158628620-7e35717d36e8?w=400",
    price: "¥47,000",
    reason: "透明感のある作品が清潔な印象を与えます",
    tags: ["水", "透明感"],
  },
  {
    id: 11,
    title: "夜想曲",
    artist: "吉田 健",
    image: "https://images.unsplash.com/photo-1578926078-d3f2a17c8052?w=400",
    price: "¥51,000",
    reason: "深みのある色調が落ち着いた雰囲気を作ります",
    tags: ["深い", "落ち着き"],
  },
  {
    id: 12,
    title: "光の戯れ",
    artist: "松本 彩",
    image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400",
    price: "¥46,000",
    reason: "柔らかな光の表現が温かな空間を演出します",
    tags: ["光", "優しい"],
  },
];

export function AIArtworkPreviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, userType, isInitialized, corporateRole } = useAuth();
  const { canEdit } = useCorporateOrgRole();
  const isCorporateViewer =
    isAuthenticated &&
    userType === "corporate" &&
    corporateRole !== null &&
    !canEdit;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // URLパラメータから情報を取得
  const [params, setParams] = useState({
    spaceName: "このスペース",
    spaceImage:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
    areaX: 30,
    areaY: 20,
    areaWidth: 25,
    areaHeight: 40,
    spaceId: "",
  });

  const [aiLoading, setAiLoading] = useState(true);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiStep, setAiStep] = useState(0);
  const [selectedArtworkIndex, setSelectedArtworkIndex] = useState(0);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState("proposals");
  const [mockRecommendations, setMockRecommendations] = useState<Artwork[]>(
    initialMockRecommendations
  );
  const [isReproposing, setIsReproposing] = useState(false);
  const [selectedFavoriteArtwork, setSelectedFavoriteArtwork] =
    useState<Artwork | null>(null);

  // A4測定用紙フロー用のstate
  const [currentStep, setCurrentStep] = useState<FlowStep>("recommendation");
  const [scaleMode, setScaleMode] = useState<ScaleMode>("furniture");
  const [scaleResult, setScaleResult] = useState<ScaleResult | null>({
    method: "furniture",
    confidence: 65,
    wallWidth: 350,
    wallHeight: 240,
  });
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);

  // Refs for file inputs and camera
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // テイスト調整用のstate
  const [modernLevel, setModernLevel] = useState([50]);
  const [colorLevel, setColorLevel] = useState([50]);
  const [abstractLevel, setAbstractLevel] = useState([50]);
  const [sizeLevel, setSizeLevel] = useState([50]);
  const [preferenceText, setPreferenceText] = useState("");

  const aiSteps = [
    {
      icon: Brain,
      text: "スペースの雰囲気を分析中...",
      color: "text-blue-600",
    },
    {
      icon: Zap,
      text: "最適な作品をマッチング中...",
      color: "text-purple-600",
    },
    { icon: Sparkles, text: "プレビューを生成中...", color: "text-accent" },
  ];

  useEffect(() => {
    // URLパラメータを読み込む
    const newParams = {
      spaceName: searchParams.get("spaceName") || "このスペース",
      spaceImage:
        searchParams.get("spaceImage") ||
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
      areaX: parseFloat(searchParams.get("areaX") || "30"),
      areaY: parseFloat(searchParams.get("areaY") || "20"),
      areaWidth: parseFloat(searchParams.get("areaWidth") || "25"),
      areaHeight: parseFloat(searchParams.get("areaHeight") || "40"),
      spaceId: searchParams.get("spaceId") || "",
    };

    setParams(newParams);

    // タブパラメータがあればそのタブを開く
    const tabParam = searchParams.get("tab");
    if (tabParam === "favorites") {
      setActiveTab("favorites");
      setAiLoading(false);
    }

    // localStorageからお気に入りを復元（法人全体のお気に入りから）
    const savedFavorites = localStorage.getItem("mgj_corporate_favorites");
    if (savedFavorites) {
      try {
        const favoriteIds = JSON.parse(savedFavorites);
        const numericIds = favoriteIds.map((id: string) => {
          if (typeof id === "string" && id.startsWith("WRK-")) {
            return parseInt(id.replace("WRK-", "")) || 0;
          }
          return id;
        });
        setFavorites(numericIds);
      } catch (e) {
        console.error("Failed to load favorites:", e);
      }
    }
  }, [searchParams]);

  // ページ読み込み時にローディング開始
  useEffect(() => {
    if (!aiLoading) {
      return;
    }

    const progressInterval = setInterval(() => {
      setAiProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    const stepTimeouts = [
      setTimeout(() => setAiStep(1), 1000),
      setTimeout(() => setAiStep(2), 2000),
      setTimeout(() => {
        setAiLoading(false);
        if (params.spaceId) {
          const loadingCompleteKey = `ai-loading-complete-${params.spaceId}`;
          sessionStorage.setItem(loadingCompleteKey, "true");
        }
      }, 3000),
    ];

    return () => {
      clearInterval(progressInterval);
      stepTimeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [aiLoading, params.spaceId]);

  const toggleFavorite = (id: number, e?: React.MouseEvent) => {
    if (isCorporateViewer) return;
    e?.stopPropagation();

    const storageKey = "mgj_corporate_favorites";
    const savedFavorites = localStorage.getItem(storageKey);
    let favoriteIds: string[] = savedFavorites
      ? JSON.parse(savedFavorites)
      : [];

    const artworkId = `WRK-${String(id).padStart(3, "0")}`;
    const isCurrentlyFavorited = favoriteIds.includes(artworkId);

    if (isCurrentlyFavorited) {
      favoriteIds = favoriteIds.filter((fav) => fav !== artworkId);
      setFavorites((prev) => prev.filter((fav) => fav !== id));
    } else {
      favoriteIds.push(artworkId);
      setFavorites((prev) => [...prev, id]);
    }

    localStorage.setItem(storageKey, JSON.stringify(favoriteIds));
    window.dispatchEvent(new Event("favoritesUpdated"));
  };

  const handleArtworkSelect = (artwork: Artwork) => {
    if (isCorporateViewer) return;
    navigate(`/corporate-artwork/${artwork.id}`, {
      state: {
        artwork: artwork,
        spaceId: params.spaceId,
        fromAI: true,
      },
    });
  };

  const handleClose = () => {
    if (params.spaceId) {
      navigate(`/corporate-space/${params.spaceId}`);
    } else {
      navigate(-1);
    }
  };

  const handleRepropose = () => {
    if (isCorporateViewer) return;
    setIsReproposing(true);
    setAiLoading(true);
    setAiProgress(0);
    setAiStep(0);

    const progressInterval = setInterval(() => {
      setAiProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 3;
      });
    }, 30);

    const stepTimeouts = [
      setTimeout(() => setAiStep(1), 800),
      setTimeout(() => setAiStep(2), 1600),
      setTimeout(() => {
        setAiLoading(false);
        setIsReproposing(false);

        const useAlternative = Math.random() > 0.5;
        const newRecommendations = useAlternative
          ? alternativeMockRecommendations
          : [...initialMockRecommendations].sort(() => Math.random() - 0.5);

        setMockRecommendations(newRecommendations);
        setSelectedArtworkIndex(0);

        if (params.spaceId) {
          const loadingCompleteKey = `ai-loading-complete-${params.spaceId}`;
          sessionStorage.setItem(loadingCompleteKey, "true");
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 2400),
    ];

    return () => {
      clearInterval(progressInterval);
      stepTimeouts.forEach((timeout) => clearTimeout(timeout));
    };
  };

  const selectedArtwork = mockRecommendations[selectedArtworkIndex];

  const getFavoriteArtworks = () => {
    const allFavorites: Artwork[] = [];
    const addedIds = new Set<number | string>();

    const globalFavoritesKey = "mgj_corporate_favorites";
    const globalFavorites = localStorage.getItem(globalFavoritesKey);

    if (globalFavorites) {
      try {
        const favoriteIds = JSON.parse(globalFavorites);

        if (favoriteIds.length > 0 && typeof favoriteIds[0] === "string") {
          favoriteIds.forEach((id: string) => {
            const sampleArtwork = SAMPLE_ARTWORKS.find((a) => a.id === id);
            if (sampleArtwork && !addedIds.has(id)) {
              const artwork: Artwork = {
                id: parseInt(id.replace("WRK-", "")) || Date.now(),
                title: sampleArtwork.title,
                artist: sampleArtwork.artist,
                image: sampleArtwork.image,
                price: sampleArtwork.price,
                reason: `${sampleArtwork.title}は素晴らしい作品です`,
                tags: ["おすすめ", "人気"],
              };
              allFavorites.push(artwork);
              addedIds.add(id);
            }
          });
        } else if (
          favoriteIds.length > 0 &&
          typeof favoriteIds[0] === "object" &&
          favoriteIds[0].id
        ) {
          favoriteIds.forEach((fav: Artwork) => {
            if (!addedIds.has(fav.id)) {
              allFavorites.push(fav);
              addedIds.add(fav.id);
            }
          });
        }
      } catch (e) {
        console.error("Failed to load global favorites:", e);
      }
    }

    return allFavorites;
  };

  const favoriteArtworks = getFavoriteArtworks();

  const handleDownloadMarkerPDF = () => {
    const link = document.createElement("a");
    link.href = "/marker.pdf";
    link.download = "MicroGallery_A4測定用紙.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isCorporateViewer) return;
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setUploadedImage(imageUrl);
        setCurrentStep("image-confirm");
      };
      reader.readAsDataURL(file);
    }
    // Reset input value to allow selecting the same file again
    event.target.value = "";
  };

  // Detect if we're on a mobile device
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };

  const handleCameraCapture = async () => {
    if (isCorporateViewer) return;
    // For mobile devices (especially iOS), use file input with capture attribute
    // This is more reliable than getUserMedia on mobile browsers
    if (isMobileDevice()) {
      // On mobile, directly use the file input with capture attribute
      // This will open the native camera app on both Android and iPhone
      cameraInputRef.current?.click();
      return;
    }

    // For desktop/PC, use getUserMedia API for better UX
    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // Fallback to file input if getUserMedia is not available
        cameraInputRef.current?.click();
        return;
      }

      // Show camera modal first
      setShowCameraModal(true);

      // Wait a bit for modal to render before requesting camera
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Request camera access with mobile-friendly constraints
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: "environment", // Use back camera on mobile (rear camera)
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          // Mobile-specific optimizations
          aspectRatio: { ideal: 16 / 9 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      streamRef.current = stream;

      // Set video source and play
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Ensure video plays on mobile
        try {
          await videoRef.current.play();
        } catch (playError) {
          console.warn("Video play error:", playError);
          // Video should still work even if play() promise rejects
        }
      }
    } catch (error: any) {
      console.error("Error accessing camera:", error);
      setShowCameraModal(false);

      // Provide user-friendly error message
      if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        alert(
          "カメラへのアクセスが拒否されました。ブラウザの設定でカメラの許可を確認してください。"
        );
      } else if (
        error.name === "NotFoundError" ||
        error.name === "DevicesNotFoundError"
      ) {
        alert("カメラが見つかりませんでした。");
      } else if (
        error.name === "NotReadableError" ||
        error.name === "TrackStartError"
      ) {
        alert("カメラが他のアプリで使用中の可能性があります。");
      }

      // Fallback to file input if camera access fails
      cameraInputRef.current?.click();
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && streamRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const reader = new FileReader();
              reader.onload = (e) => {
                const imageUrl = e.target?.result as string;
                setUploadedImage(imageUrl);
                setCurrentStep("image-confirm");
              };
              reader.readAsDataURL(blob);
            }
          },
          "image/jpeg",
          0.9
        );
      }

      // Stop the stream
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setShowCameraModal(false);
    }
  };

  const cancelCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCameraModal(false);
  };

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  /** Viewers may open this URL from the space page; keep preview read-only (no capture / assign / favorites). */
  useEffect(() => {
    if (!isCorporateViewer) return;
    setAiLoading(false);
    setCurrentStep("recommendation");
  }, [isCorporateViewer]);

  useEffect(() => {
    if (!isCorporateViewer || activeTab !== "favorites") return;
    setActiveTab("proposals");
  }, [isCorporateViewer, activeTab]);

  const startAnalysis = () => {
    if (isCorporateViewer) return;
    setCurrentStep("analyzing");
    setAiLoading(true);
    setAiProgress(0);
    setAiStep(0);

    const progressInterval = setInterval(() => {
      setAiProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    setTimeout(() => setAiStep(1), 1000);
    setTimeout(() => setAiStep(2), 2000);
    setTimeout(() => {
      setAiLoading(false);

      // Update params with the captured photo if available
      if (uploadedImage) {
        setParams((prev) => ({
          ...prev,
          spaceImage: uploadedImage,
        }));
      }

      if (scaleMode === "marker") {
        setScaleResult({
          method: "marker",
          confidence: 95,
          wallWidth: 380,
          wallHeight: 250,
        });
      } else {
        setScaleResult({
          method: "furniture",
          confidence: 65,
          wallWidth: 350,
          wallHeight: 240,
        });
      }

      setCurrentStep("recommendation");
    }, 3000);
  };

  if (
    isInitialized &&
    isAuthenticated &&
    userType === "corporate" &&
    corporateRole === null
  ) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-gray-600">権限情報を読み込み中…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 戻るボタン（固定） */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          onClick={handleClose}
          variant="outline"
          className="bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-xl gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">スペース詳細に戻る</span>
          <span className="sm:hidden">戻る</span>
        </Button>
      </div>

      {/* 閉じるボタン（画面右上） */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={handleClose}
          className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:bg-gray-50"
          aria-label="閉じる"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* メインコンテンツ */}
      <div className="container mx-auto px-4 sm:px-6 py-6 pt-20">
        {currentStep === "capture-guide" ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep("recommendation")}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  戻る
                </Button>
                <h2 className="text-lg sm:text-xl">
                  📐 A4測定用紙を使って撮影
                </h2>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="border-2 border-amber-200 rounded-lg p-3 sm:p-4 bg-amber-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Printer className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700" />
                    <h3 className="text-xs sm:text-sm text-amber-900">
                      ステップ1: A4測定用紙を準備
                    </h3>
                  </div>
                  <p className="text-xs text-gray-700 mb-3">
                    下のボタンからA4測定用紙（PDFファイル）をダウンロードして、普通紙に印刷してください
                  </p>
                  <Button
                    onClick={handleDownloadMarkerPDF}
                    className="bg-amber-600 hover:bg-amber-700 text-white gap-2 text-xs sm:text-sm"
                  >
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                    A4測定用紙をダウンロード
                  </Button>
                  <p className="text-xs text-red-600 mt-2">
                    ※必ず100%のサイズで印刷してください（拡大・縮小なし）
                  </p>
                </div>

                <div className="border-2 border-blue-200 rounded-lg p-3 sm:p-4 bg-blue-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700" />
                    <h3 className="text-xs sm:text-sm text-blue-900">
                      ステップ2: 壁と一緒に撮影
                    </h3>
                  </div>
                  <p className="text-xs text-gray-700 mb-2">
                    印刷したA4用紙を、作品を展示したい壁に貼り付けるか、手で持って撮影してください。
                  </p>
                  <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
                    <li>A4用紙全体が写るように撮影</li>
                    <li>壁とA4用紙が同じ距離にあるように配置</li>
                    <li>できるだけ正面から撮影</li>
                  </ul>
                </div>

                <div className="border-2 border-green-200 rounded-lg p-3 sm:p-4 bg-green-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-green-700" />
                    <h3 className="text-xs sm:text-sm text-green-900">
                      ステップ3: 写真を撮影またはアップロード
                    </h3>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*,.heic,.heif"
                        capture="environment"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      <Button
                        onClick={handleCameraCapture}
                        className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 text-xs sm:text-sm"
                      >
                        <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>カメラで撮影</span>
                      </Button>
                    </div>
                    <div className="flex-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.heic,.heif"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="w-full border-green-600 text-green-700 hover:bg-green-50 gap-2 text-xs sm:text-sm"
                      >
                        <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>ファイルから選択</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : currentStep === "image-confirm" ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl flex items-center gap-2">
                <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                撮影した写真を確認
              </h2>

              {uploadedImage ? (
                <div className="relative rounded-lg overflow-hidden w-full h-auto max-h-[500px] flex items-center justify-center bg-gray-100 border-2 border-gray-200 shadow-sm">
                  <ImageWithFallback
                    src={uploadedImage}
                    alt="アップロードされた写真"
                    className="w-full h-auto max-h-[500px] object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="rounded-lg overflow-hidden max-h-96 flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 min-h-[300px]">
                  <div className="text-center text-gray-400">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">写真が読み込まれていません</p>
                  </div>
                </div>
              )}

              <p className="text-xs sm:text-sm text-gray-700">
                この写真でAI解析を行います。
                <br />
                A4用紙全体が写っていることを確認してください。
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentStep("capture-guide");
                    setUploadedImage(null);
                  }}
                  className="flex-1"
                >
                  撮り直す
                </Button>
                <Button
                  onClick={startAnalysis}
                  className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                >
                  この写真を使う
                </Button>
              </div>
            </div>
          </motion.div>
        ) : aiLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-16 sm:py-32 space-y-6"
          >
            <div className="flex flex-col items-center gap-4 sm:gap-6">
              <motion.div
                animate={{
                  rotate: 360,
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                }}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center shadow-2xl"
              >
                {(() => {
                  const IconComponent = aiSteps[aiStep].icon;
                  return (
                    <IconComponent className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                  );
                })()}
              </motion.div>

              <div className="text-center space-y-2">
                <motion.p
                  key={aiStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-lg sm:text-2xl ${aiSteps[aiStep].color}`}
                >
                  {aiSteps[aiStep].text}
                </motion.p>
                <p className="text-sm sm:text-base text-gray-500">
                  {params.spaceName}に最適な作品をプレビュー生成しています
                </p>
              </div>

              <div className="w-full max-w-lg space-y-2">
                <div className="h-3 sm:h-4 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-accent via-purple-500 to-pink-500"
                    initial={{ width: "0%" }}
                    animate={{ width: `${aiProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-xs sm:text-sm text-center text-gray-500">
                  {aiProgress}% 完了
                </p>
              </div>

              <div className="flex gap-2 sm:gap-3">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-accent"
                    animate={{
                      y: [0, -16, 0],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList
                className={`grid w-full mb-4 h-10 ${isCorporateViewer ? "grid-cols-1" : "grid-cols-2"}`}
              >
                <TabsTrigger value="proposals" className="text-xs sm:text-sm">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                  <span className="hidden sm:inline">AIによる提案</span>
                  <span className="sm:hidden">提案</span>
                  <span className="ml-1">({mockRecommendations.length})</span>
                </TabsTrigger>
                {!isCorporateViewer && (
                  <TabsTrigger
                    value="favorites"
                    className="relative text-xs sm:text-sm"
                  >
                    <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                    <span className="hidden sm:inline">お気に入り</span>
                    <span className="sm:hidden">お気に入り</span>
                    <span className="ml-1">({favorites.length})</span>
                    {favorites.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-pink-500 text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center">
                        {favorites.length}
                      </span>
                    )}
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="proposals" className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
                  <div className="lg:col-span-3 lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto space-y-4">
                    <div className="p-3 sm:p-4 bg-white border rounded-xl shadow-sm">
                      <h3 className="text-xs sm:text-sm text-gray-700 mb-3">
                        スペースプレビュー
                      </h3>
                      <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100 shadow-lg">
                        <ImageWithFallback
                          src={uploadedImage || params.spaceImage}
                          alt={params.spaceName}
                          className="w-full h-full object-cover"
                        />

                        <motion.div
                          key={selectedArtworkIndex}
                          drag={!isCorporateViewer}
                          dragMomentum={false}
                          dragElastic={0.1}
                          initial={{
                            opacity: 0,
                            scale: 0.9,
                            x: 0,
                            y: 0,
                          }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                          }}
                          transition={{ duration: 0.3 }}
                          className="absolute shadow-xl rounded-md overflow-hidden cursor-move hover:shadow-2xl group"
                          style={{
                            left: `${params.areaX}%`,
                            top: `${params.areaY}%`,
                            width: `${params.areaWidth}%`,
                            height: `${params.areaHeight}%`,
                          }}
                        >
                          <ImageWithFallback
                            src={selectedArtwork.image}
                            alt={selectedArtwork.title}
                            className="w-full h-full object-cover pointer-events-none"
                          />

                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 bg-black/60 text-white text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            ドラッグで移動
                          </div>
                        </motion.div>

                        <div className="absolute top-2 left-2 z-10">
                          <Badge className="bg-gradient-to-r from-accent to-purple-500 text-white border-0 shadow-md text-[10px] sm:text-xs py-0.5 px-1.5 sm:px-2">
                            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                            AI推薦
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {scaleResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3 sm:p-4 rounded-xl border-2 ${
                          scaleResult.method === "furniture"
                            ? "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300"
                            : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300"
                        }`}
                      >
                        <div className="flex items-start gap-2 sm:gap-3 mb-3">
                          {scaleResult.method === "furniture" ? (
                            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h4
                                className={`text-xs sm:text-sm ${
                                  scaleResult.method === "furniture"
                                    ? "text-amber-900"
                                    : "text-green-900"
                                }`}
                              >
                                {scaleResult.method === "furniture"
                                  ? "家具から推定中"
                                  : "A4測定用紙で測定済み"}
                              </h4>
                              <Badge
                                className={`${
                                  scaleResult.method === "furniture"
                                    ? "bg-amber-500"
                                    : "bg-green-600"
                                } text-white text-[10px] sm:text-xs`}
                              >
                                精度 {scaleResult.confidence}%
                              </Badge>
                            </div>
                            <p className="text-[10px] sm:text-xs text-gray-700 mb-3">
                              {scaleResult.method === "furniture" ? (
                                <>
                                  現在、家具から壁のサイズを推定しています。
                                  そのため、上のプレビューに表示されている作品のサイズは、実際の壁に展示した場合と異なる可能性があります（誤差±15〜40%程度）。
                                </>
                              ) : (
                                <>
                                  A4測定用紙を使用したため、上のプレビューに表示されている作品のサイズは、実際の壁に展示した場合とほぼ同じです。
                                  自信を持って作品をお選びいただけます！
                                </>
                              )}
                            </p>

                            {scaleResult.method === "furniture" && !isCorporateViewer && (
                              <div className="bg-white rounded-lg p-2 sm:p-3 space-y-2 sm:space-y-2.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs sm:text-sm">📐</span>
                                  <h5 className="text-[10px] sm:text-xs text-gray-900">
                                    A4測定用紙で精度95%以上にアップグレード
                                  </h5>
                                </div>
                                <p className="text-[10px] sm:text-xs text-gray-600 leading-relaxed">
                                  A4用紙を印刷して壁と一緒に撮影すると、AIが正確なスケールを計算できます。
                                  作品の実寸が正確にシミュレーションされ、「この作品は実際にこのサイズで見える」と自信を持って判断できます。
                                </p>
                                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDownloadMarkerPDF}
                                    className="flex-1 border-amber-400 text-amber-700 hover:bg-amber-50 h-7 sm:h-8 text-[10px] sm:text-xs"
                                  >
                                    <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    <span>A4測定用紙をダウンロード</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setScaleMode("marker");
                                      setCurrentStep("capture-guide");
                                      setUploadedImage(null);
                                    }}
                                    className="flex-1 h-7 sm:h-8 text-[10px] sm:text-xs"
                                    style={{ backgroundColor: "#C3A36D" }}
                                  >
                                    <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    <span>精度を上げて撮る</span>
                                  </Button>
                                </div>
                              </div>
                            )}

                            {scaleResult.method === "furniture" && (
                              <p className="text-[10px] sm:text-xs text-gray-500 mt-3">
                                💡
                                もちろん、このまま作品を選んでいただいても問題ありません。実際の展示時にサイズ調整も可能です。
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <AIRecommendationReason
                      artworkTitle={selectedArtwork.title}
                      artistName={selectedArtwork.artist}
                      spaceName={params.spaceName}
                    />

                    {!isCorporateViewer && (
                      <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                          <h4 className="text-xs sm:text-sm text-purple-900">
                            テイストで再提案
                          </h4>
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                          <div>
                            <div className="flex justify-between text-[10px] sm:text-xs text-gray-700 mb-1 sm:mb-1.5">
                              <span>クラシック</span>
                              <span>モダン</span>
                            </div>
                            <Slider
                              value={modernLevel}
                              onValueChange={setModernLevel}
                              max={100}
                              step={1}
                              className="w-full"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between text-[10px] sm:text-xs text-gray-700 mb-1 sm:mb-1.5">
                              <span>モノトーン</span>
                              <span>カラフル</span>
                            </div>
                            <Slider
                              value={colorLevel}
                              onValueChange={setColorLevel}
                              max={100}
                              step={1}
                              className="w-full"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between text-[10px] sm:text-xs text-gray-700 mb-1 sm:mb-1.5">
                              <span>具象的</span>
                              <span>抽象的</span>
                            </div>
                            <Slider
                              value={abstractLevel}
                              onValueChange={setAbstractLevel}
                              max={100}
                              step={1}
                              className="w-full"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between text-[10px] sm:text-xs text-gray-700 mb-1 sm:mb-1.5">
                              <span>小さめ作品</span>
                              <span>大きめ作品</span>
                            </div>
                            <Slider
                              value={sizeLevel}
                              onValueChange={setSizeLevel}
                              max={100}
                              step={1}
                              className="w-full"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] sm:text-xs text-gray-700 mb-1 sm:mb-1.5 block">
                              その他のご希望
                            </label>
                            <Textarea
                              value={preferenceText}
                              onChange={(e) => setPreferenceText(e.target.value)}
                              placeholder="例：明るい雰囲気、和の要素、青系など"
                              className="w-full min-h-[50px] sm:min-h-[60px] text-[10px] sm:text-xs resize-none"
                            />
                          </div>
                        </div>

                        <Button
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-8 sm:h-9 shadow-md hover:shadow-lg transition-all text-xs sm:text-sm"
                          onClick={handleRepropose}
                          disabled={isReproposing}
                        >
                          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>再提案</span>
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-2">
                    <h3 className="text-xs sm:text-sm text-gray-700 mb-3">
                      提案作品（クリックして選択）
                    </h3>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      {mockRecommendations.map((artwork, index) => (
                        <motion.div
                          key={artwork.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => setSelectedArtworkIndex(index)}
                          className={`border rounded-lg overflow-hidden hover:shadow-lg transition-all group cursor-pointer relative ${
                            selectedArtworkIndex === index
                              ? "border-accent border-2 shadow-md"
                              : "border-gray-200"
                          }`}
                        >
                          {selectedArtworkIndex === index && (
                            <div className="absolute top-1 sm:top-1.5 left-1 sm:left-1.5 z-10">
                              <Badge className="bg-accent text-white border-0 shadow-md text-[9px] sm:text-[10px] py-0 px-1 sm:px-1.5">
                                プレビュー中
                              </Badge>
                            </div>
                          )}

                          {!isCorporateViewer && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(artwork.id, e);
                              }}
                              className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 z-10 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-md"
                            >
                              <Heart
                                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                                  favorites.includes(artwork.id)
                                    ? "fill-pink-500 text-pink-500"
                                    : "text-gray-600"
                                }`}
                              />
                            </button>
                          )}

                          <div className="aspect-square bg-gray-100 overflow-hidden relative">
                            <ImageWithFallback
                              src={artwork.image}
                              alt={artwork.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>

                          <div className="p-1.5 sm:p-2 space-y-1 sm:space-y-1.5 bg-white">
                            <div>
                              <h4 className="text-[10px] sm:text-xs text-primary mb-0 leading-tight">
                                {artwork.title}
                              </h4>
                              <p className="text-[9px] sm:text-[10px] text-gray-600">
                                {artwork.artist}
                              </p>
                            </div>

                            <p className="text-[10px] sm:text-xs text-accent">
                              {artwork.price}
                            </p>

                            <div className="flex flex-wrap gap-0.5">
                              {artwork.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-[8px] sm:text-[9px] py-0 px-0.5 sm:px-1 h-3 sm:h-4"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            {!isCorporateViewer && (
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleArtworkSelect(artwork);
                                }}
                                size="sm"
                                className="w-full bg-gradient-to-r from-accent to-purple-500 hover:from-accent/90 hover:to-purple-600 text-white h-6 sm:h-7 text-[9px] sm:text-[10px]"
                              >
                                この作品を展示する
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {!isCorporateViewer && (
              <TabsContent value="favorites" className="mt-0">
                {favorites.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-12 sm:py-24 text-center"
                  >
                    <Heart className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-4 sm:mb-6" />
                    <p className="text-lg sm:text-xl text-gray-500 mb-2 sm:mb-3">
                      お気に入りの作品がありません
                    </p>
                    <p className="text-sm sm:text-base text-gray-400">
                      ハートアイコンをクリックして作品を保存しましょう
                    </p>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
                    <div className="lg:col-span-3 lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
                      <div className="p-3 sm:p-4 bg-white border rounded-xl shadow-sm">
                        <h3 className="text-xs sm:text-sm text-gray-700 mb-3">
                          スペースプレビュー
                        </h3>
                        <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100 shadow-lg">
                          <ImageWithFallback
                            src={uploadedImage || params.spaceImage}
                            alt={params.spaceName}
                            className="w-full h-full object-cover"
                          />

                          {(() => {
                            const artworkToDisplay =
                              selectedFavoriteArtwork || favoriteArtworks[0];

                            if (!artworkToDisplay) return null;

                            return (
                              <motion.div
                                key={artworkToDisplay.id}
                                drag
                                dragMomentum={false}
                                dragElastic={0.1}
                                initial={{
                                  opacity: 0,
                                  scale: 0.9,
                                  x: 0,
                                  y: 0,
                                }}
                                animate={{
                                  opacity: 1,
                                  scale: 1,
                                }}
                                transition={{ duration: 0.3 }}
                                className="absolute shadow-xl rounded-md overflow-hidden cursor-move hover:shadow-2xl group"
                                style={{
                                  left: `${params.areaX}%`,
                                  top: `${params.areaY}%`,
                                  width: `${params.areaWidth}%`,
                                  height: `${params.areaHeight}%`,
                                }}
                              >
                                <ImageWithFallback
                                  src={artworkToDisplay.image}
                                  alt={artworkToDisplay.title}
                                  className="w-full h-full object-cover pointer-events-none"
                                />

                                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 bg-black/60 text-white text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                  ドラッグで移動
                                </div>
                              </motion.div>
                            );
                          })()}

                          <div className="absolute top-2 left-2 z-10">
                            <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 shadow-md text-[10px] sm:text-xs py-0.5 px-1.5 sm:px-2">
                              <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 fill-white" />
                              お気に入り
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <h3 className="text-xs sm:text-sm text-gray-700 mb-3">
                        お気に入り作品（クリックして選択）
                      </h3>
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        {favoriteArtworks.map(
                          (artwork: Artwork, index: number) => (
                            <motion.div
                              key={`favorite-${artwork.id}-${index}`}
                              initial={{ opacity: 0, scale: 0.8, y: 20 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              transition={{
                                duration: 0.5,
                                delay: index * 0.05,
                              }}
                              onClick={() => {
                                setSelectedFavoriteArtwork(artwork);
                                const foundIndex =
                                  mockRecommendations.findIndex(
                                    (a) => a.id === artwork.id
                                  );
                                if (foundIndex >= 0) {
                                  setSelectedArtworkIndex(foundIndex);
                                }
                              }}
                              className={`border rounded-lg overflow-hidden hover:shadow-lg transition-all group cursor-pointer relative border-pink-200 bg-gradient-to-br from-pink-50 to-white ${
                                selectedFavoriteArtwork?.id === artwork.id ||
                                selectedArtwork.id === artwork.id
                                  ? "border-pink-500 border-2 shadow-md"
                                  : ""
                              }`}
                            >
                              {(selectedFavoriteArtwork?.id === artwork.id ||
                                selectedArtwork.id === artwork.id) && (
                                <div className="absolute top-1 sm:top-1.5 left-1 sm:left-1.5 z-10">
                                  <Badge className="bg-pink-500 text-white border-0 shadow-md text-[9px] sm:text-[10px] py-0 px-1 sm:px-1.5">
                                    プレビュー中
                                  </Badge>
                                </div>
                              )}

                              <button
                                onClick={(e) => toggleFavorite(artwork.id, e)}
                                className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 z-10 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                              >
                                <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-pink-500 text-pink-500" />
                              </button>

                              <div className="aspect-square bg-gray-100 overflow-hidden relative">
                                <ImageWithFallback
                                  src={artwork.image}
                                  alt={artwork.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>

                              <div className="p-1.5 sm:p-2 space-y-1 sm:space-y-1.5 bg-white">
                                <div>
                                  <h4 className="text-[10px] sm:text-xs text-primary mb-0 leading-tight">
                                    {artwork.title}
                                  </h4>
                                  <p className="text-[9px] sm:text-[10px] text-gray-600">
                                    {artwork.artist}
                                  </p>
                                </div>

                                <p className="text-[10px] sm:text-xs text-accent">
                                  {artwork.price}
                                </p>

                                <div className="flex flex-wrap gap-0.5">
                                  {artwork.tags.map((tag: string) => (
                                    <Badge
                                      key={tag}
                                      variant="secondary"
                                      className="text-[8px] sm:text-[9px] py-0 px-0.5 sm:px-1 h-3 sm:h-4"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>

                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleArtworkSelect(artwork);
                                  }}
                                  size="sm"
                                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white h-6 sm:h-7 text-[9px] sm:text-[10px]"
                                >
                                  この作品を展示する
                                </Button>
                              </div>
                            </motion.div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
              )}
            </Tabs>
          </motion.div>
        )}
      </div>

      {/* Camera Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 z-[9999] bg-black/90 flex flex-col items-center justify-center p-2 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-3 sm:p-6 max-w-2xl w-full max-h-[95vh] flex flex-col"
          >
            <h3 className="text-base sm:text-xl font-semibold mb-3 sm:mb-4 text-center">
              カメラで撮影
            </h3>
            <div
              className="relative w-full rounded-lg mb-3 sm:mb-4 bg-black overflow-hidden flex-1 flex items-center justify-center"
              style={{ minHeight: "200px", maxHeight: "calc(95vh - 180px)" }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain"
                style={{ maxHeight: "100%" }}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                onClick={capturePhoto}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 sm:py-3 h-auto text-sm sm:text-base sm:text-lg"
              >
                <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>撮影</span>
              </Button>
              <Button
                onClick={cancelCamera}
                variant="outline"
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2.5 sm:py-3 h-auto text-sm sm:text-base sm:text-lg"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>キャンセル</span>
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
