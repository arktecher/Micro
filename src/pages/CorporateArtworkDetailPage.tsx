import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { ArtworkReturnDialog } from "@/components/ArtworkReturnDialog";
import {
  ArrowLeft,
  Eye,
  Calendar,
  MapPin,
  Package,
  AlertCircle,
  Clock,
  Share2,
  ChevronRight,
  RotateCcw
} from "lucide-react";

// モックデータ
const mockArtworks: Record<number, any> = {
  1: {
    id: 1,
    title: "青の記憶",
    artist: "山田 花子",
    artistId: 101,
    spaceId: 1,
    spaceName: "1階エントランス",
    spaceLocation: "東京本社",
    image: "https://images.unsplash.com/photo-1579541814924-49fef17c5be5?w=800",
    price: "¥45,000",
    priceValue: 45000,
    displayStartDate: "2024年9月1日",
    displayDays: 45,
    size: { width: 80.0, height: 60.0 },
    technique: "アクリル",
    description: "深い青色を基調とした抽象画。静謐な雰囲気が空間に落ち着きをもたらします。来訪者の記憶に残る印象的な作品です。",
    tags: ["抽象画", "青系", "落ち着いた"],
    status: "展示中",
    hasReturnRequest: true,
    returnRequestDate: "2024年10月25日",
    views: 1247,
    likes: 89,
    inquiries: 12,
    soldProbability: 78,
    estimatedRevenue: 4500,
  },
  2: {
    id: 2,
    title: "夏の光",
    artist: "佐藤 太郎",
    artistId: 102,
    spaceId: 2,
    spaceName: "会議室A",
    spaceLocation: "東京本社",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800",
    price: "¥38,000",
    priceValue: 38000,
    displayStartDate: "2024年8月15日",
    displayDays: 61,
    size: { width: 72.7, height: 53.0 },
    technique: "油彩",
    description: "夏の日差しを抽象的に表現した温かみのある作品。明るい色彩が会議室に活気をもたらします。",
    tags: ["風景画", "明るい", "暖色系"],
    status: "展示中",
    views: 856,
    likes: 64,
    inquiries: 8,
    soldProbability: 65,
    estimatedRevenue: 3800,
  },
  3: {
    id: 3,
    title: "静寂の森",
    artist: "鈴木 美咲",
    artistId: 103,
    spaceId: 3,
    spaceName: "受付",
    spaceLocation: "東京本社",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800",
    price: "¥42,000",
    priceValue: 42000,
    displayStartDate: "2024年9月20日",
    displayDays: 26,
    size: { width: 60.0, height: 80.0 },
    technique: "水彩",
    description: "静かな森の風景を繊細なタッチで描いた作品。来訪者に癒しの空間を提供します。",
    tags: ["風景画", "自然", "癒し"],
    status: "展示中",
    views: 534,
    likes: 42,
    inquiries: 5,
    soldProbability: 52,
    estimatedRevenue: 4200,
  }
};

export function CorporateArtworkDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [artwork, setArtwork] = useState<any>(null);

  useEffect(() => {
    const artworkId = parseInt(id || "1");
    const data = mockArtworks[artworkId] || mockArtworks[1];
    setArtwork(data);
  }, [id]);

  if (!artwork) {
    return null;
  }

  const handleReturn = () => {
    setReturnDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-16 sm:pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6">
          {/* パンくずリスト */}
          <div className="mb-6">
            <nav className="flex items-center gap-2 text-sm text-gray-600">
              <Link to="/corporate-dashboard" className="hover:text-primary transition-colors">
                ダッシュボード
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 truncate">{artwork.title}</span>
            </nav>
          </div>

          {/* 戻るボタン */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            戻る
          </Button>

          {/* アーティストからの返却依頼通知 */}
          {artwork.hasReturnRequest && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="border-2 border-orange-300 bg-orange-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg text-orange-900 mb-2">
                        アーティストから返却依頼が来ております
                      </h3>
                      <p className="text-sm text-orange-800 mb-4">
                        {artwork.artist}様より、{artwork.returnRequestDate}に作品の返却依頼がありました。
                        返却手続きを進める場合は、下記のボタンより手続きを開始してください。
                      </p>
                      <Button
                        onClick={handleReturn}
                        className="bg-orange-600 hover:bg-orange-700 text-white gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        返却手続きを進める
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* 左カラム - 作品画像と基本情報 */}
            <div className="lg:col-span-1 space-y-6">
              {/* 作品画像 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="overflow-hidden">
                  <ImageWithFallback
                    src={artwork.image}
                    alt={artwork.title}
                    className="w-full aspect-[4/5] object-cover"
                  />
                </Card>
              </motion.div>

              {/* 基本情報 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">{artwork.title}</CardTitle>
                    <CardDescription className="text-base">
                      {artwork.artist}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">価格</span>
                      <span className="text-xl sm:text-2xl text-primary">{artwork.price}</span>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">サイズ</span>
                        <span className="text-gray-900">{artwork.size.width} × {artwork.size.height} cm</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">技法</span>
                        <span className="text-gray-900">{artwork.technique}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">ステータス</span>
                        <Badge variant="default">{artwork.status}</Badge>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-900">{artwork.spaceName}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/corporate-space/${artwork.spaceId}`)}
                          className="text-xs h-7"
                        >
                          スペース詳細
                          <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900">展示開始: {artwork.displayStartDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900">展示日数: {artwork.displayDays}日</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* アクション */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">アクション</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={handleReturn}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      返却する
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/artwork-issue-report/${artwork.id}`)}
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      問題を報告
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {/* TODO: Share functionality */}}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      共有
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* 右カラム - QR閲覧数と返却情報 */}
            <div className="lg:col-span-2 space-y-6">
              {/* QR閲覧数 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-primary" />
                      QR閲覧数
                    </CardTitle>
                    <CardDescription>
                      この作品が何回見られているか
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gradient-to-br from-[#C3A36D]/10 to-[#D4745E]/10 rounded-lg p-6 text-center">
                      <p className="text-4xl sm:text-5xl text-primary mb-2">
                        {artwork.views.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        回閲覧されました
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* 返却ポリシー */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-[#C3A36D]/30 bg-[#F8F6F1]/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Package className="w-5 h-5 text-primary" />
                      返却について
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${artwork.displayDays >= 180 ? 'bg-green-500' : 'bg-orange-500'}`} />
                      <div className="flex-1">
                        <p className="text-gray-900 mb-1">
                          {artwork.displayDays >= 180 ? (
                            <span className="text-green-700">✓ 返却送料：無料（展示期間6ヶ月以上）</span>
                          ) : (
                            <span className="text-orange-700">返却送料：法人負担（展示期間6ヶ月未満）</span>
                          )}
                        </p>
                        <p className="text-gray-600 text-xs">
                          現在の展示日数: {artwork.displayDays}日 
                          {artwork.displayDays < 180 && ` / あと${180 - artwork.displayDays}日で無料`}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-600 text-xs">
                      返却ボタンを押すだけで、MGJが返却ラベルを発行し、配送業者の集荷手配を行います。
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* 返却ダイアログ */}
      <ArtworkReturnDialog
        open={returnDialogOpen}
        onOpenChange={setReturnDialogOpen}
        artwork={artwork ? {
          id: artwork.id,
          title: artwork.title,
          artist: artwork.artist,
          image: artwork.image,
          displayedSince: artwork.displayStartDate,
          location: artwork.spaceName,
          price: artwork.price
        } : null}
      />
    </div>
  );
}

