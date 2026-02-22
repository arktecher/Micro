import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
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
import { ArtistReturnRequestDialog } from "@/components/ArtistReturnRequestDialog";
import { artistService, type ArtistProfile } from "@/services/artist.service";
import { userService } from "@/services/user.service";
import { toast } from "sonner";

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
};

export function ArtistDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, userType, isInitialized } = useAuth();
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [artworkFilter, setArtworkFilter] = useState<string>("all");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [returnRequestDialogOpen, setReturnRequestDialogOpen] = useState(false);
  const [selectedArtworkForReturn, setSelectedArtworkForReturn] = useState<any>(null);
  
  // Profile state
  const [profileData, setProfileData] = useState<ArtistProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
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

  // URLハッシュに基づいてタブを設定
  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (hash === "profile") {
      setSelectedTab("profile");
    } else if (hash === "artworks") {
      setSelectedTab("artworks");
    } else if (hash === "dashboard") {
      setSelectedTab("dashboard");
    } else if (hash === "revenue") {
      setSelectedTab("revenue");
    }
    window.scrollTo(0, 0);
  }, [location]);

  // ハッシュが変更されたときにもタブを切り替える
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === "profile") {
        setSelectedTab("profile");
      } else if (hash === "artworks") {
        setSelectedTab("artworks");
      } else if (hash === "dashboard") {
        setSelectedTab("dashboard");
      } else if (hash === "revenue") {
        setSelectedTab("revenue");
      }
      window.scrollTo(0, 0);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

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

  const filteredArtworks =
    artworkFilter === "all"
      ? mockArtworks
      : mockArtworks.filter((a) => a.status === artworkFilter);

  const exhibitedArtworks = mockArtworks.filter((a) => a.status === "exhibited");

  const handleRequestReturn = (artwork: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedArtworkForReturn(artwork);
    setReturnRequestDialogOpen(true);
  };

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
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
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
            {/* フィルターバー */}
            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={artworkFilter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setArtworkFilter("all")}
                      className={artworkFilter === "all" ? "bg-[#C3A36D] hover:bg-[#C3A36D]/90" : ""}
                    >
                      すべて
                    </Button>
                    <Button
                      variant={artworkFilter === "draft" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setArtworkFilter("draft")}
                      className={artworkFilter === "draft" ? "bg-gray-500 hover:bg-gray-600" : "border-gray-300"}
                    >
                      未公開
                    </Button>
                    <Button
                      variant={artworkFilter === "published" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setArtworkFilter("published")}
                      className={artworkFilter === "published" ? "bg-green-500 hover:bg-green-600" : "border-green-200"}
                    >
                      オンライン公開中
                    </Button>
                    <Button
                      variant={artworkFilter === "exhibited" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setArtworkFilter("exhibited")}
                      className={artworkFilter === "exhibited" ? "bg-[#C3A36D] hover:bg-[#C3A36D]/90" : "border-[#C3A36D]/30"}
                    >
                      展示中
                    </Button>
                    <Button
                      variant={artworkFilter === "sold" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setArtworkFilter("sold")}
                      className={artworkFilter === "sold" ? "bg-blue-500 hover:bg-blue-600" : "border-blue-200"}
                    >
                      売却済み
                    </Button>
                    <Button
                      variant={artworkFilter === "returned" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setArtworkFilter("returned")}
                      className={artworkFilter === "returned" ? "bg-gray-500 hover:bg-gray-600" : ""}
                    >
                      回収済み
                    </Button>
                  </div>
                  <Button
                    className="bg-gradient-to-r from-[#C3A36D] to-[#D4B478] hover:opacity-90"
                    onClick={() => navigate("/signup/artist/artworks")}
                  >
                    <Plus className="w-4 h-4" />
                    <span>新しい作品を登録</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 作品グリッド */}
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
                      {/* 作品画像 */}
                      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative">
                        {/* ステータスバッジを右上に統一 */}
                        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
                          <Badge className={`${config.color} text-white border-0 shadow-md`}>
                            {config.label}
                          </Badge>
                          {/* QRスキャン数バッジ */}
                          {artwork.scans !== undefined && (
                            <Badge variant="outline" className="bg-white/95 border-gray-300 shadow-sm">
                              <QrCode className="w-3 h-3 mr-1" />
                              {artwork.scans}回
                            </Badge>
                          )}
                        </div>

                        {artwork.isVideo ? (
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

            {filteredArtworks.length === 0 && (
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById("profileImageInput")?.click()}
                          disabled={isSavingProfile}
                        >
                          <ImageIcon className="w-4 h-4" />
                          <span>写真を変更</span>
                        </Button>
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

      <Footer />
    </div>
  );
}

