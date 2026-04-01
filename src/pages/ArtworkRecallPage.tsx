import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { artworkService } from "@/services/artwork.service";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "motion/react";
import {
  X,
  Package,
  CheckCircle2,
  AlertCircle,
  Truck,
  Calendar,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// モックデータ - 実際にはartworkIdに基づいてAPIから取得
const getMockArtwork = (id: string) => {
  const artworks: Record<string, any> = {
    "1": {
      id: "1",
      title: "夏の思い出",
      price: 50000,
      image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=600&fit=crop",
      exhibition: {
        location: "The Tokyo Hotel",
        venueName: "株式会社サンプル　本社ビル",
        venueAddress: "東京都渋谷区渋谷1-1-1",
        startDate: "2024-12-01",
      },
    },
  };

  return artworks[id || "1"] || artworks["1"];
};

export function ArtworkRecallPage() {
  const navigate = useNavigate();
  const { artworkId } = useParams();
  const { isAuthenticated, userType, isInitialized } = useAuth();
  const mockArtwork = getMockArtwork(artworkId || "1");
  const [agreeToShipping, setAgreeToShipping] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loadedTitle, setLoadedTitle] = useState<string | null>(null);
  const [loadedImage, setLoadedImage] = useState<string | null>(null);
  const [loadedPrice, setLoadedPrice] = useState<number | null>(null);
  const [exhibitionDays, setExhibitionDays] = useState(0);
  const [venueLabel, setVenueLabel] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isInitialized || !artworkId) return;
    if (!isAuthenticated || userType !== "artist") {
      toast.error("アーティストのみ利用できます");
      navigate("/login/artist");
      return;
    }
    let cancelled = false;
    (async () => {
      setPageLoading(true);
      try {
        const a = await artworkService.getArtwork(artworkId);
        if (cancelled) return;
        setLoadedTitle(a.title);
        setLoadedImage(
          a.main_image_url ||
            a.images?.find((i) => i.is_main)?.image_url ||
            a.images?.[0]?.image_url ||
            "",
        );
        setLoadedPrice(Number(a.price) || 0);
        try {
          const ex = await artworkService.getExhibitionInfo(artworkId);
          if (cancelled) return;
          const onWall =
            ex.is_exhibited && ex.assignment?.status === "displaying";
          if (!onWall) {
            toast.info(
              "回収の申請は、法人が作品を受領して展示が開始されたあとに可能です。",
            );
            navigate(`/artwork-edit/${artworkId}`);
            return;
          }
          setExhibitionDays(ex.assignment?.exhibition_days || 0);
          const loc = ex.assignment?.space?.name || "";
          const corp = ex.assignment?.corporate?.company_name || "";
          setVenueLabel([loc, corp].filter(Boolean).join(" / ") || null);
        } catch {
          toast.info(
            "展示情報を確認できませんでした。作品編集ページからご確認ください。",
          );
          navigate(`/artwork-edit/${artworkId}`);
          return;
        }
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          toast.error("作品を読み込めませんでした");
          navigate("/dashboard#artworks");
        }
      } finally {
        if (!cancelled) setPageLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [artworkId, isAuthenticated, userType, isInitialized, navigate]);

  const displayTitle = loadedTitle ?? mockArtwork.title;
  const displayImage = loadedImage ?? mockArtwork.image;
  const displayPrice = loadedPrice ?? mockArtwork.price;

  const needsShippingFee = exhibitionDays < 180;

  const handleRecall = async () => {
    if (!artworkId) return;
    if (needsShippingFee && !agreeToShipping) {
      return;
    }
    setSubmitting(true);
    try {
      await artworkService.requestRecall(artworkId);
      toast.success("回収依頼を受け付けました");
      setIsCompleted(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "依頼に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    navigate("/dashboard");
  };

  if (pageLoading && !isCompleted) {
    return (
      <div className="min-h-screen bg-[#F8F6F1]">
        <Header />
        <div className="flex items-center justify-center pt-28 pb-16">
          <p className="text-sm text-gray-600">読み込み中…</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-[#F8F6F1]">
        <Header />
        <div className="flex items-center justify-center p-4 sm:p-6 pt-20 sm:pt-24 pb-8 sm:pb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl w-full"
          >
            <Card>
              <CardContent className="p-6 sm:p-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg"
                >
                  <CheckCircle2 className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                </motion.div>

                <h2 className="text-xl sm:text-2xl md:text-3xl text-[#3A3A3A] mb-3 sm:mb-4">
                  回収申請が完了しました
                </h2>

                <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                  「{displayTitle}」の回収申請を受け付けました。<br />
                  {needsShippingFee ? (
                    <>
                      回収手配が完了次第、郵送料の詳細をメールでお送りします。<br />
                      作品は1〜2週間以内にご登録の住所へ配送されます。
                    </>
                  ) : (
                    <>
                      展示先からご登録の住所へ無料で配送いたします。<br />
                      作品は1〜2週間以内に到着する予定です。
                    </>
                  )}
                </p>

                <div className="bg-[#C3A36D]/10 border border-[#C3A36D]/30 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 text-left">
                  <h3 className="text-sm sm:text-base text-[#3A3A3A] mb-2 sm:mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-[#C3A36D]" />
                    回収までの流れ
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-[#C3A36D] mt-0.5">1.</span>
                      <span>MGJが展示先へ回収を連絡</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#C3A36D] mt-0.5">2.</span>
                      <span>展示先が作品を梱包・発送準備</span>
                    </li>
                    {needsShippingFee && (
                      <li className="flex items-start gap-2">
                        <span className="text-[#C3A36D] mt-0.5">3.</span>
                        <span>郵送料のお支払い（メールで詳細をお送りします）</span>
                      </li>
                    )}
                    <li className="flex items-start gap-2">
                      <span className="text-[#C3A36D] mt-0.5">{needsShippingFee ? "4" : "3"}.</span>
                      <span>配送業者による集荷・配送</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#C3A36D] mt-0.5">{needsShippingFee ? "5" : "4"}.</span>
                      <span>ご登録の住所へお届け（1〜2週間以内）</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
                  <Button
                    size="lg"
                    variant="default"
                    onClick={() =>
                      artworkId && navigate(`/artwork-edit/${artworkId}`)
                    }
                    className="bg-[#C3A36D] hover:bg-[#C3A36D]/90 w-full sm:w-auto text-sm sm:text-base"
                  >
                    作品ページで状況を確認
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleClose}
                    className="w-full sm:w-auto text-sm sm:text-base"
                  >
                    ダッシュボードへ戻る
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F1]">
      <Header />

      {/* メインコンテンツ */}
      <div className="pt-20 sm:pt-24 pb-8 sm:pb-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-3xl space-y-4 sm:space-y-6">
          {/* 作品情報 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl text-[#3A3A3A] mb-3 sm:mb-4">回収する作品</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-32 h-48 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <ImageWithFallback
                      src={displayImage}
                      alt={displayTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-base sm:text-lg text-[#3A3A3A] mb-1">{displayTitle}</h3>
                    <p className="text-base sm:text-lg text-[#C3A36D] mb-2 sm:mb-3">
                      ¥{displayPrice.toLocaleString()}
                    </p>
                    <div className="space-y-1 text-xs sm:text-sm">
                      {venueLabel && (
                        <p className="text-gray-600 flex items-center gap-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="break-words">{venueLabel}</span>
                        </p>
                      )}
                      {exhibitionDays > 0 && (
                          <p className="text-gray-600 flex items-center gap-1">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            展示期間: {exhibitionDays}日
                          </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* MGJ承認メッセージ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="border-[#C3A36D]/30 bg-[#C3A36D]/5">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#C3A36D] flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm sm:text-base text-[#3A3A3A] mb-2">回収について</h3>
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                      Micro Gallery Japanでは、アーティストの皆様からの作品回収申請をいつでも受け付けております。
                      回収をご希望の場合、MGJが展示先へ連絡し、作品の返却手配を行います。
                      作品は丁寧に梱包され、ご登録の住所へ配送されます。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 郵送料について */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card
              className={
                needsShippingFee ? "border-orange-300 bg-orange-50" : "border-green-300 bg-green-50"
              }
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3">
                  {needsShippingFee ? (
                    <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-grow">
                    <h3 className="text-sm sm:text-base text-[#3A3A3A] mb-2 flex items-center gap-2">
                      <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                      郵送料について
                    </h3>

                    {needsShippingFee ? (
                      <div className="space-y-3">
                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                          展示期間が<span className="font-semibold">180日未満</span>のため、
                          回収時の郵送料はアーティスト様のご負担となります。
                        </p>
                        <div className="bg-white/60 rounded-lg p-3 sm:p-4 border border-orange-200">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs sm:text-sm text-gray-600">展示期間</span>
                            <span className="text-xs sm:text-sm text-[#3A3A3A]">{exhibitionDays}日</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs sm:text-sm text-gray-600">郵送料</span>
                            <Badge
                              variant="outline"
                              className="bg-orange-100 text-orange-700 border-orange-300 text-xs"
                            >
                              アーティスト負担
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600">
                          ※ 郵送料は作品のサイズと配送先により異なります（目安: 1,500円〜3,000円）
                          <br />
                          ※ 回収手配完了後、メールで詳細な金額をお知らせします
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                          展示期間が<span className="font-semibold">180日以上</span>のため、
                          郵送料は無料です。展示先からご登録の住所へ無料で配送いたします。
                        </p>
                        <div className="bg-white/60 rounded-lg p-3 sm:p-4 border border-green-200">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs sm:text-sm text-gray-600">展示期間</span>
                            <span className="text-xs sm:text-sm text-[#3A3A3A]">{exhibitionDays}日</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs sm:text-sm text-gray-600">郵送料</span>
                            <Badge
                              variant="outline"
                              className="bg-green-100 text-green-700 border-green-300 text-xs"
                            >
                              無料
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 郵送料同意（180日未満の場合） */}
          {needsShippingFee && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="border-2 border-orange-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="agree-shipping"
                      checked={agreeToShipping}
                      onCheckedChange={(checked) => setAgreeToShipping(checked as boolean)}
                      className="mt-1 flex-shrink-0"
                    />
                    <label
                      htmlFor="agree-shipping"
                      className="text-xs sm:text-sm text-gray-700 leading-relaxed cursor-pointer"
                    >
                      郵送料がアーティスト負担となることに同意します。
                      回収手配完了後、メールで郵送料の詳細をお知らせいたしますので、
                      お支払いをお願いいたします。
                    </label>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* 配送先情報 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-sm sm:text-base text-[#3A3A3A] mb-3 sm:mb-4">配送先</h3>
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2">
                  <p className="text-xs sm:text-sm text-gray-700">
                    作品はアーティスト登録時にご入力いただいた住所へ配送されます。
                  </p>
                  <Separator className="my-2" />
                  <div className="text-xs sm:text-sm text-gray-600">
                    <p>〒150-0001</p>
                    <p>東京都渋谷区神宮前1-1-1</p>
                    <p className="mt-2">アーティスト様名: 山田 太郎</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    ※ 住所を変更したい場合は、ダッシュボードのプロフィール設定から編集してください
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ボタン */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4"
          >
            <Button
              variant="outline"
              size="lg"
              onClick={handleClose}
              className="flex-1 w-full sm:w-auto text-sm sm:text-base"
            >
              キャンセル
            </Button>
            <Button
              size="lg"
              onClick={() => void handleRecall()}
              disabled={submitting || (needsShippingFee && !agreeToShipping)}
              className="flex-1 w-full sm:w-auto bg-[#C3A36D] hover:bg-[#C3A36D]/90 text-sm sm:text-base"
            >
              <Package className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span>{submitting ? "送信中…" : "作品の回収を申請する"}</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

