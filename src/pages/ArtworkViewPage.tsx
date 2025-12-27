import { toast } from "sonner";
import { Heart, ShoppingCart, Share2, MessageCircle, ChevronLeft, ChevronRight, X, Expand, Info, Package, Truck, Shield, Calendar, ZoomIn, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { SignupPromptDialog } from "@/components/common/SignupPromptDialog";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getFavoritesKey } from "@/lib/storageKeys";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { SpaceSelectionModal } from "@/components/common/SpaceSelectionModal";

// Mock data for current artwork
const mockArtwork = {
  id: "WRK-001",
  title: "静寂の朝",
  artist: {
    id: "ART-001",
    name: "田中 美咲",
    photo: "https://images.unsplash.com/photo-1625682103688-2ab73a4fb11a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc3QlMjBwb3J0cmFpdCUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NjM0OTc4NDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    bio: "東京藝術大学卒業。自然の中にある色彩や形からインスピレーションを得て、感情を色に変換する抽象画を制作しています。",
    education: "東京藝術大学 美術学部 絵画科 卒業",
    exhibitions: [
      "2024年「Colors of Silence」個展 / 銀座ギャラリー",
      "2023年「春の記憶」グループ展 / 六本木アートセンター",
      "2022年「新進作家展」/ 国立新美術館"
    ],
    awards: [
      "2023年 東京藝術大賞 優秀賞",
      "2022年 若手作家奨励賞"
    ],
    website: "https://tanaka-misaki.art",
    instagram: "@tanaka_misaki_art"
  },
  mainImage: "https://images.unsplash.com/photo-1748285279107-13e8799eab76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMHBhaW50aW5nJTIwYXJ0d29ya3xlbnwxfHx8fDE3NjM1MTE1OTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  thumbnails: [
    "https://images.unsplash.com/photo-1748285279107-13e8799eab76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMHBhaW50aW5nJTIwYXJ0d29ya3xlbnwxfHx8fDE3NjM1MTE1OTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1562785072-c65ab858fcbc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wb3JhcnklMjBhcnQlMjBjYW52YXN8ZW58MXx8fHwxNzYzNDg1MDc3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1683659635051-39336c5476b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMG1pbmltYWxpc3QlMjBhcnR8ZW58MXx8fHwxNzYzNTExNTk2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1716901548718-da465a9060fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMGFic3RyYWN0JTIwcGFpbnRpbmd8ZW58MXx8fHwxNzYzNTAyMDY5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  ],
  price: 180000,
  leasePrice: 12000,
  dimensions: {
    width: 80,
    height: 60,
    depth: 2
  },
  sizeClass: "L",
  year: 2024,
  medium: "アクリル",
  support: "キャンバス",
  weight: 3.2,
  hasFrame: true,
  coating: "UV保護ニス仕上げ",
  status: "available",
  exhibitedAt: null,
  dominantColor: "#7BA8C0",
  description: "海辺で過ごした夏の朝。穏やかな波の音と潮の香り、光が水面に反射する瞬間を抽象的に表現しました。ブルーとホワイトの対比が生み出す静寂と清涼感を感じていただけたら嬉しいです。",
  story: "この作品は、幼少期に訪れた海辺の記憶から着想を得ています。朝日が昇る瞬間の静けさと、波が岸に打ち寄せるリズムを色彩と形で表現しました。制作には約3ヶ月を要し、何層にもアクリル絵具を重ねることで、光の透明感と深みを追求しました。",
  packaging: "耐衝撃材使用・専用木製クレート梱包",
  maintenance: "直射日光を避けて展示してください。表面の埃は柔らかい布で優しく拭き取ってください。"
};

// Mock related artworks
const mockRelatedArtworks = [
  { id: "WRK-002", title: "午後の光", artist: "田中 美咲", price: 150000, image: "https://images.unsplash.com/photo-1562785072-c65ab858fcbc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wb3JhcnklMjBhcnQlMjBjYW52YXN8ZW58MXx8fHwxNzYzNDg1MDc3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
  { id: "WRK-003", title: "風の記憶", artist: "田中 美咲", price: 120000, image: "https://images.unsplash.com/photo-1683659635051-39336c5476b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMG1pbmltYWxpc3QlMjBhcnR8ZW58MXx8fHwxNjM1MTE1OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
  { id: "WRK-004", title: "夕暮れの詩", artist: "田中 美咲", price: 200000, image: "https://images.unsplash.com/photo-1716901548718-da465a9060fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMGFic3RyYWN0JTIwcGFpbnRpbmd8ZW58MXx8fHwxNzYzNTAyMDY5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
  { id: "WRK-005", title: "春の訪れ", artist: "田中 美咲", price: 160000, image: "https://images.unsplash.com/photo-1748285279107-13e8799eab76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMHBhaW50aW5nJTIwYXJ0d29ya3xlbnwxfHx8fDE3NjM1MTE1OTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
  { id: "WRK-006", title: "秋の調べ", artist: "田中 美咲", price: 175000, image: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGFydCUyMGNvbG9yZnVsfGVufDF8fHx8MTc2MzUxMTU5Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
  { id: "WRK-007", title: "冬の静寂", artist: "田中 美咲", price: 140000, image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwcGFpbnRpbmd8ZW58MXx8fHwxNzYzNTExNTk3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" }
];

// Mock similar taste artworks
const mockSimilarTasteArtworks = [
  { id: "WRK-101", title: "Ocean Waves", artist: "佐藤 健太", price: 185000, image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibHVlJTIwYWJzdHJhY3QlMjBhcnR8ZW58MXx8fHwxNzYzNTExNTk4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
  { id: "WRK-102", title: "Ethereal Blue", artist: "山本 由美", price: 165000, image: "https://images.unsplash.com/photo-1549887534-1541e9326642?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcXVhJTIwYWJzdHJhY3QlMjBhcnR8ZW58MXx8fHwxNzYzNTExNTk5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
  { id: "WRK-103", title: "Peaceful Waters", artist: "鈴木 一", price: 155000, image: "https://images.unsplash.com/photo-1515405295579-ba7b45403062?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWxtJTIwYWJzdHJhY3QlMjBhcnR8ZW58MXx8fHwxNzYzNTExNTk5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
  { id: "WRK-104", title: "Serenity", artist: "高橋 麻衣", price: 190000, image: "https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZXJlbmUlMjBhYnN0cmFjdCUyMGFydHxlbnwxfHx8fDE3NjM1MTE2MDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
  { id: "WRK-105", title: "Misty Morning", artist: "伊藤 和也", price: 145000, image: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaXN0eSUyMGFic3RyYWN0fGVufDF8fHx8MTc2MzUxMTYwMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
  { id: "WRK-106", title: "Tranquil Blue", artist: "渡辺 さくら", price: 170000, image: "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFucXVpbCUyMGFydHxlbnwxfHx8fDE3NjM1MTE2MDF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" }
];

export function ArtworkViewPage() {
  const { artworkId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, userType } = useAuth();
  
  const [selectedImage, setSelectedImage] = useState(mockArtwork.mainImage);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [signupPromptMode, setSignupPromptMode] = useState<"favorite" | "purchase">("favorite");
  const [showSpaceSelectionModal, setShowSpaceSelectionModal] = useState(false);

  const isCorporateUser = userType === "corporate";
  const isFromQR = searchParams.get("source") === "qr";

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const storageKey = getFavoritesKey(userType);
    const favorites = JSON.parse(localStorage.getItem(storageKey) || "[]");
    setIsLiked(favorites.includes(artworkId));
  }, [artworkId, userType]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showLightbox) {
        if (e.key === 'Escape') {
          setShowLightbox(false);
        } else if (e.key === 'ArrowLeft') {
          handlePrevImage();
        } else if (e.key === 'ArrowRight') {
          handleNextImage();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLightbox, currentImageIndex]);

  const handleThumbnailClick = (image: string, index: number) => {
    setSelectedImage(image);
    setCurrentImageIndex(index);
  };

  const handlePurchase = () => {
    if (!isAuthenticated) {
      setShowSignupPrompt(true);
      setSignupPromptMode("purchase");
      return;
    }
    
    if (isCorporateUser) {
      navigate(`/display/${artworkId}`);
    } else {
      navigate(`/purchase/${artworkId}`, { 
        state: { from: `/artwork/${artworkId}` }
      });
    }
  };

  const handleLeaseInquiry = () => {
    console.log("リース見積もり依頼");
  };

  const handleArtworkClick = (id: string) => {
    navigate(`/artwork/${id}?source=site`);
  };

  const handlePrevImage = () => {
    const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : mockArtwork.thumbnails.length - 1;
    setCurrentImageIndex(newIndex);
    setSelectedImage(mockArtwork.thumbnails[newIndex]);
  };

  const handleNextImage = () => {
    const newIndex = currentImageIndex < mockArtwork.thumbnails.length - 1 ? currentImageIndex + 1 : 0;
    setCurrentImageIndex(newIndex);
    setSelectedImage(mockArtwork.thumbnails[newIndex]);
  };

  const handleShare = async () => {
    const artworkUrl = `${window.location.origin}/artwork/${artworkId}`;
    
    try {
      const textArea = document.createElement("textarea");
      textArea.value = artworkUrl;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        textArea.remove();
        
        if (successful) {
          toast.success("リンクをコピーしました", {
            description: "作品のURLがクリップボードにコピーされました",
            duration: 3000,
          });
        } else {
          throw new Error("Copy command failed");
        }
      } catch (err) {
        textArea.remove();
        throw err;
      }
    } catch (err) {
      console.error("Failed to copy URL:", err);
      toast.error("コピーに失敗しました", {
        description: "もう一度お試しください",
        duration: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="pt-20 sm:pt-24 pb-12 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-[1600px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row gap-6 sm:gap-12 mb-12 sm:mb-20"
          >
            {/* Left Column - Thumbnail Carousel (hidden on mobile, shown on desktop) */}
            <div className="hidden lg:block w-32 flex-shrink-0">
              <div className="sticky top-24 space-y-3">
                {mockArtwork.thumbnails.map((thumb, index) => (
                  <button
                    key={index}
                    onClick={() => handleThumbnailClick(thumb, index)}
                    className={`w-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === index
                        ? "border-primary shadow-md scale-105"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <ImageWithFallback
                      src={thumb}
                      alt={`View ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Center - Main Image */}
            <div className="flex-1 max-w-3xl order-2 lg:order-1">
              <div className="relative group">
                <div 
                  className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-2xl cursor-zoom-in"
                  onClick={() => setShowLightbox(true)}
                >
                  <ImageWithFallback
                    src={selectedImage}
                    alt={mockArtwork.title}
                    className="w-full h-full object-cover"
                  />
                  
                  <div className="absolute top-2 sm:top-4 right-2 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                  </div>
                </div>
              </div>

              {/* Mobile Thumbnail Carousel */}
              <div className="lg:hidden mt-4 flex gap-2 overflow-x-auto pb-2">
                {mockArtwork.thumbnails.map((thumb, index) => (
                  <button
                    key={index}
                    onClick={() => handleThumbnailClick(thumb, index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === index
                        ? "border-primary shadow-md"
                        : "border-gray-200"
                    }`}
                  >
                    <ImageWithFallback
                      src={thumb}
                      alt={`View ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column - Fixed Info Panel */}
            <div className="w-full lg:w-[380px] flex-shrink-0 order-1 lg:order-2">
              <div className="lg:sticky lg:top-24">
                <Card className="border-gray-200 shadow-lg">
                  <CardContent className="p-4 sm:p-8 space-y-4 sm:space-y-6">
                    <div className="space-y-1.5 sm:space-y-2">
                      <h1 className="text-2xl sm:text-3xl text-primary">{mockArtwork.title}</h1>
                      <button
                        onClick={() => navigate(`/artists`)}
                        className="text-base sm:text-lg text-gray-600 hover:text-primary transition-colors"
                      >
                        {mockArtwork.artist.name}
                      </button>
                    </div>

                    <Separator />

                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-baseline gap-2 sm:gap-3">
                        <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">サイズ</span>
                        <Badge variant="secondary" className="text-xs sm:text-sm">
                          {mockArtwork.sizeClass}
                        </Badge>
                      </div>
                      <p className="text-sm sm:text-base text-gray-700">
                        {mockArtwork.dimensions.width} × {mockArtwork.dimensions.height} cm
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-1.5 sm:space-y-2">
                      <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">技法・素材</span>
                      <p className="text-sm sm:text-base text-gray-700">{mockArtwork.medium} / {mockArtwork.support}</p>
                    </div>

                    <Separator />

                    <div className="space-y-1.5 sm:space-y-2">
                      <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider block">額縁</span>
                      <p className="text-sm sm:text-base text-gray-700">{mockArtwork.hasFrame ? "あり" : "なし"}</p>
                    </div>

                    <Separator />

                    <div className="space-y-1.5 sm:space-y-2">
                      <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">制作年</span>
                      <p className="text-sm sm:text-base text-gray-700">{mockArtwork.year}</p>
                    </div>

                    <Separator />

                    <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
                      <div>
                        <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider block mb-1 sm:mb-2">販売価格</span>
                        <p className="text-2xl sm:text-3xl text-primary">
                          ¥{mockArtwork.price.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2 sm:space-y-3 pt-2 sm:pt-4">
                      <Button
                        onClick={handlePurchase}
                        size="lg"
                        className="w-full h-11 sm:h-12 bg-primary hover:bg-primary/90 text-sm sm:text-base"
                      >
                        {isAuthenticated && isCorporateUser ? "この作品を展示する" : "購入する"}
                      </Button>
                      
                      {isCorporateUser && (
                        <Button
                          onClick={() => setShowSpaceSelectionModal(true)}
                          size="lg"
                          variant="outline"
                          className="w-full h-11 sm:h-12 border-primary text-primary hover:bg-primary/5 text-sm sm:text-base"
                        >
                          <Eye className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          スペースでイメージを確認
                        </Button>
                      )}
                    </div>

                    <Separator />

                    <div className="flex items-center justify-around pt-1 sm:pt-2">
                      <button
                        onClick={() => {
                          if (!isAuthenticated) {
                            setShowSignupPrompt(true);
                            setSignupPromptMode("favorite");
                          } else {
                            const newIsLiked = !isLiked;
                            setIsLiked(newIsLiked);
                            
                            const storageKey = getFavoritesKey(userType);
                            const favorites = JSON.parse(localStorage.getItem(storageKey) || "[]");
                            if (newIsLiked) {
                              if (!favorites.includes(artworkId)) {
                                favorites.push(artworkId);
                                localStorage.setItem(storageKey, JSON.stringify(favorites));
                                toast.success("お気に入りに追加しました");
                              }
                            } else {
                              const index = favorites.indexOf(artworkId);
                              if (index > -1) {
                                favorites.splice(index, 1);
                                localStorage.setItem(storageKey, JSON.stringify(favorites));
                                toast.success("お気に入りから削除しました");
                              }
                            }
                            
                            window.dispatchEvent(new Event("favoritesUpdated"));
                          }
                        }}
                        className="flex flex-col items-center gap-1 text-gray-600 hover:text-red-500 transition-colors"
                      >
                        <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                        <span className="text-[10px] sm:text-xs">お気に入り</span>
                      </button>
                      <button
                        onClick={handleShare}
                        className="flex flex-col items-center gap-1 text-gray-600 hover:text-primary transition-colors"
                      >
                        <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-[10px] sm:text-xs">シェア</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 max-w-[1200px] space-y-16 sm:space-y-32">
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-8 sm:mb-12">
              <p className="text-[10px] sm:text-xs tracking-[0.4em] text-gray-400 uppercase mb-3 sm:mb-4">About</p>
              <h2 className="text-2xl sm:text-3xl text-primary">作品について</h2>
            </div>

            <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
              <div className="prose prose-sm sm:prose-lg max-w-none">
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{mockArtwork.description}</p>
              </div>

              <Separator />

              <div className="prose prose-sm sm:prose-lg max-w-none">
                <h3 className="text-lg sm:text-xl text-primary mb-3 sm:mb-4">ストーリー</h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{mockArtwork.story}</p>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-8 sm:mb-12">
              <p className="text-[10px] sm:text-xs tracking-[0.4em] text-gray-400 uppercase mb-3 sm:mb-4">Artist</p>
              <h2 className="text-2xl sm:text-3xl text-primary">作家について</h2>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 items-start">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden flex-shrink-0 shadow-lg mx-auto sm:mx-0">
                  <ImageWithFallback
                    src={mockArtwork.artist.photo}
                    alt={mockArtwork.artist.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="text-xl sm:text-2xl text-primary mb-1 sm:mb-2">{mockArtwork.artist.name}</h3>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{mockArtwork.artist.bio}</p>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">学歴</h4>
                    <p className="text-sm sm:text-base text-gray-700">{mockArtwork.artist.education}</p>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">展示歴</h4>
                    <ul className="space-y-1.5 sm:space-y-2">
                      {mockArtwork.artist.exhibitions.map((exhibition, index) => (
                        <li key={index} className="text-sm sm:text-base text-gray-700">{exhibition}</li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">受賞歴</h4>
                    <ul className="space-y-1.5 sm:space-y-2">
                      {mockArtwork.artist.awards.map((award, index) => (
                        <li key={index} className="text-sm sm:text-base text-gray-700">{award}</li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    <a href={mockArtwork.artist.website} target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm text-primary hover:underline">
                      Website
                    </a>
                    <a href={`https://instagram.com/${mockArtwork.artist.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm text-primary hover:underline">
                      Instagram
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          <RecommendationSection
            title="同じ作家の作品"
            subtitle="Related Works"
            artworks={mockRelatedArtworks}
            onArtworkClick={handleArtworkClick}
          />

          <RecommendationSection
            title="同じスタイルの作品"
            subtitle="Similar Taste"
            artworks={mockSimilarTasteArtworks}
            onArtworkClick={handleArtworkClick}
          />
        </div>
      </div>

      <Footer />

      {showLightbox && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 sm:p-6"
          onClick={() => setShowLightbox(false)}
        >
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 sm:top-6 right-4 sm:right-6 text-white text-3xl sm:text-4xl hover:text-gray-300 transition-colors z-10"
          >
            ×
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrevImage();
            }}
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all z-10"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNextImage();
            }}
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all z-10"
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </button>

          <ImageWithFallback
            src={selectedImage}
            alt={mockArtwork.title}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
            <span className="text-white text-xs sm:text-sm">
              {currentImageIndex + 1} / {mockArtwork.thumbnails.length}
            </span>
          </div>
        </div>
      )}

      <SignupPromptDialog
        isOpen={showSignupPrompt}
        onClose={() => setShowSignupPrompt(false)}
        artworkId={artworkId || "WRK-001"}
        artworkTitle={mockArtwork.title}
        mode={signupPromptMode}
      />

      <SpaceSelectionModal
        open={showSpaceSelectionModal}
        onOpenChange={setShowSpaceSelectionModal}
        artworkId={parseInt(artworkId || "1")}
      />
    </div>
  );
}

interface RecommendationSectionProps {
  title: string;
  subtitle: string;
  artworks: Array<{
    id: string;
    title: string;
    artist: string;
    price: number;
    image: string;
  }>;
  onArtworkClick: (id: string) => void;
}

function RecommendationSection({ title, subtitle, artworks, onArtworkClick }: RecommendationSectionProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const itemsPerView = 4;
  const maxScroll = Math.max(0, artworks.length - itemsPerView);

  const handlePrev = () => {
    setScrollPosition((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setScrollPosition((prev) => Math.min(maxScroll, prev + 1));
  };

  const translateX = -(scrollPosition * (100 / itemsPerView));

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative group/carousel"
    >
      <div className="mb-6 sm:mb-8">
        <p className="text-[10px] sm:text-xs tracking-[0.4em] text-gray-400 uppercase mb-1 sm:mb-2">{subtitle}</p>
        <h2 className="text-xl sm:text-2xl text-primary">{title}</h2>
      </div>

      <div className="relative overflow-hidden">
        {scrollPosition > 0 && (
          <button
            onClick={handlePrev}
            className="absolute -left-3 sm:-left-5 top-[calc(50%-4rem)] -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-md rounded-full border border-gray-200 flex items-center justify-center shadow-lg opacity-40 group-hover/carousel:opacity-100 hover:scale-105 hover:shadow-xl transition-all duration-300"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
          </button>
        )}

        {scrollPosition < maxScroll && (
          <button
            onClick={handleNext}
            className="absolute -right-3 sm:-right-5 top-[calc(50%-4rem)] -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-md rounded-full border border-gray-200 flex items-center justify-center shadow-lg opacity-40 group-hover/carousel:opacity-100 hover:scale-105 hover:shadow-xl transition-all duration-300"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
          </button>
        )}

        <motion.div
          className="flex gap-4 sm:gap-8"
          animate={{ x: `${translateX}%` }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          {artworks.map((artwork) => (
            <div
              key={artwork.id}
              className="flex-shrink-0 w-[calc(25%-0.75rem)] sm:w-[calc(25%-1.5rem)] cursor-pointer group"
              onClick={() => onArtworkClick(artwork.id)}
            >
              <div className="aspect-square rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 mb-3 sm:mb-4">
                <ImageWithFallback
                  src={artwork.image}
                  alt={artwork.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-sm sm:text-base text-primary group-hover:text-primary/80 transition-colors mb-1">
                {artwork.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">{artwork.artist}</p>
              <p className="text-base sm:text-lg text-gray-900">¥{artwork.price.toLocaleString()}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}



