import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "motion/react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { ArtworkReturnDialog } from "@/components/ArtworkReturnDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useCorporateOrgRole } from "@/hooks/useCorporateOrgRole";
import { artworkService, type Artwork } from "@/services/artwork.service";
import {
  getCorporateDisplayArtworkContext,
  type CorporateDisplayArtworkContext,
} from "@/services/space.service";
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
  ChevronLeft,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/components/ui/utils";

function formatJaDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatJaDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function CorporateArtworkDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, userType, isInitialized, corporateRole } = useAuth();
  const { canEdit: canEditCorporate } = useCorporateOrgRole();

  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [ctx, setCtx] = useState<CorporateDisplayArtworkContext | null>(null);
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notOnDisplay, setNotOnDisplay] = useState(false);

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated || userType !== "corporate") {
      navigate("/login/corporate", {
        state: { from: location.pathname },
        replace: true,
      });
    }
  }, [isInitialized, isAuthenticated, userType, navigate, location.pathname]);

  const load = useCallback(async () => {
    if (!id || !isAuthenticated || userType !== "corporate") return;
    setLoading(true);
    setError(null);
    setNotOnDisplay(false);
    try {
      const [c, aw] = await Promise.all([
        getCorporateDisplayArtworkContext(id),
        artworkService.getArtwork(id),
      ]);
      setCtx(c);
      setArtwork(aw);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (
        msg.includes("展示されていません") ||
        msg.includes("自社のスペースが見つかりません") ||
        msg.includes("ステータスコード: 404")
      ) {
        setNotOnDisplay(true);
        try {
          const aw = await artworkService.getArtwork(id);
          setArtwork(aw);
        } catch {
          setArtwork(null);
        }
        setCtx(null);
      } else {
        setError(msg || "読み込みに失敗しました");
        setCtx(null);
        setArtwork(null);
      }
    } finally {
      setLoading(false);
    }
  }, [id, isAuthenticated, userType]);

  useEffect(() => {
    if (!isInitialized || !isAuthenticated || userType !== "corporate") return;
    void load();
  }, [isInitialized, isAuthenticated, userType, load]);

  const mainImage = useMemo(() => {
    if (!artwork) return "";
    if (artwork.images?.length) {
      const sorted = [...artwork.images].sort(
        (a, b) => a.image_order - b.image_order,
      );
      const main = sorted.find((i) => i.is_main) ?? sorted[0];
      return main?.image_url || artwork.main_image_url || "";
    }
    return artwork.main_image_url || "";
  }, [artwork]);

  /** Ordered URLs for gallery / return dialog primary image */
  const galleryImageUrls = useMemo(() => {
    if (!artwork) return [];
    if (artwork.images?.length) {
      const sorted = [...artwork.images].sort(
        (a, b) => a.image_order - b.image_order,
      );
      const urls = sorted
        .map((img) => img.image_url?.trim())
        .filter((u): u is string => Boolean(u));
      if (urls.length) return urls;
    }
    const m = artwork.main_image_url?.trim();
    return m ? [m] : [];
  }, [artwork]);

  useEffect(() => {
    setGalleryIndex(0);
  }, [artwork?.id]);

  const priceStr = useMemo(() => {
    if (!artwork) return "—";
    const n = Number(artwork.price);
    if (Number.isNaN(n)) return "—";
    return `¥${Math.round(n).toLocaleString("ja-JP")}`;
  }, [artwork]);

  const dimW = Number(artwork?.dimensions?.width) || 0;
  const dimH = Number(artwork?.dimensions?.height) || 0;

  const handleReturn = () => setReturnDialogOpen(true);

  const handleShare = async () => {
    if (!id) {
      toast.error("作品IDを取得できませんでした");
      return;
    }
    const url = `${window.location.origin}/#/artwork/${id}?source=site`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("作品ページのリンクをコピーしました");
    } catch {
      toast.error("コピーに失敗しました");
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-4 py-16">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-gray-600">初期化中…</p>
        </div>
        <div className="mt-auto shrink-0">
          <Footer />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || userType !== "corporate") {
    return null;
  }

  if (loading || (userType === "corporate" && corporateRole === null)) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-4 py-16 pt-24">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-gray-600">読み込み中…</p>
        </div>
        <div className="mt-auto shrink-0">
          <Footer />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="container mx-auto flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-16 pt-24 text-center max-w-lg">
            <p className="text-gray-800 mb-4">{error}</p>
            <Button variant="outline" onClick={() => navigate(-1)}>
              戻る
            </Button>
          </div>
        </div>
        <div className="mt-auto shrink-0">
          <Footer />
        </div>
      </div>
    );
  }

  if (notOnDisplay) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="container mx-auto flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-16 pt-24 max-w-lg text-center">
            <p className="text-gray-800 mb-2">
              この作品は現在、自社のスペースに展示されていません。
            </p>
            <p className="text-sm text-gray-600 mb-6">
              お気に入りやAIおすすめから開いた場合、まだスペースに割り当てていないことがあります。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate("/corporate-dashboard#recommended")}>
                ダッシュボードへ
              </Button>
              {artwork && (
                <Button onClick={() => navigate(`/artwork/${id}?source=site`)}>
                  作品ページを見る
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="mt-auto shrink-0">
          <Footer />
        </div>
      </div>
    );
  }

  if (!ctx || !artwork) {
    return null;
  }

  const showArtistRecallBanner =
    ctx.has_artist_recall_request && ctx.artist_recall_requested_at;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />

      <div className="flex min-h-0 flex-1 flex-col pt-16 sm:pt-24 pb-16">
        <div className="container mx-auto flex min-h-0 flex-1 flex-col px-4 sm:px-6">
          <div className="mb-6 flex items-center justify-between gap-3">
            <nav className="flex min-w-0 flex-1 items-center gap-2 text-sm text-gray-600">
              <Link
                to="/corporate-dashboard"
                className="shrink-0 hover:text-primary transition-colors"
              >
                ダッシュボード
              </Link>
              <ChevronRight className="w-4 h-4 shrink-0" />
              <span className="truncate text-gray-900">{artwork.title}</span>
            </nav>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="h-8 shrink-0 gap-1 px-2 text-xs sm:text-sm"
            >
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              戻る
            </Button>
          </div>

          {showArtistRecallBanner && (
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
                        {artwork.artist?.name ?? "アーティスト"}
                        様より、
                        {formatJaDateTime(ctx.artist_recall_requested_at)}
                        頃に作品の返却依頼がありました。
                        {canEditCorporate
                          ? "返却手続きを進める場合は、下記のボタンより手続きを開始してください。"
                          : "返却手続きは編集者以上の権限をお持ちのメンバーが行えます。"}
                      </p>
                      {canEditCorporate && (
                        <Button
                          onClick={handleReturn}
                          className="bg-orange-600 hover:bg-orange-700 text-white gap-2"
                        >
                          <RotateCcw className="w-4 h-4" />
                          返却手続きを進める
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-1 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="overflow-hidden p-0">
                  <div className="relative aspect-[4/5] w-full bg-muted/30">
                    <ImageWithFallback
                      src={
                        galleryImageUrls[galleryIndex] ??
                        mainImage
                      }
                      alt={artwork.title}
                      className="h-full w-full object-cover"
                    />
                    {galleryImageUrls.length > 1 && (
                      <>
                        <button
                          type="button"
                          aria-label="前の画像"
                          onClick={() =>
                            setGalleryIndex((i) =>
                              i <= 0
                                ? galleryImageUrls.length - 1
                                : i - 1,
                            )
                          }
                          className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200/80 bg-white/90 text-gray-800 shadow-sm backdrop-blur-sm transition hover:bg-white"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          aria-label="次の画像"
                          onClick={() =>
                            setGalleryIndex((i) =>
                              i >= galleryImageUrls.length - 1 ? 0 : i + 1,
                            )
                          }
                          className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200/80 bg-white/90 text-gray-800 shadow-sm backdrop-blur-sm transition hover:bg-white"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
                          {galleryImageUrls.map((_, i) => (
                            <button
                              key={i}
                              type="button"
                              aria-label={`画像 ${i + 1} を表示`}
                              aria-current={galleryIndex === i}
                              onClick={() => setGalleryIndex(i)}
                              className={cn(
                                "h-1.5 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80",
                                galleryIndex === i
                                  ? "w-5 bg-white shadow-sm"
                                  : "w-1.5 bg-white/55 hover:bg-white/80",
                              )}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  {galleryImageUrls.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto border-t border-gray-100 bg-gray-50/90 p-2">
                      {galleryImageUrls.map((url, i) => (
                        <button
                          key={`${url}-${i}`}
                          type="button"
                          onClick={() => setGalleryIndex(i)}
                          className={cn(
                            "relative h-14 w-14 shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                            galleryIndex === i
                              ? "border-primary ring-1 ring-primary/30"
                              : "border-transparent opacity-80 hover:opacity-100",
                          )}
                        >
                          <ImageWithFallback
                            src={url}
                            alt={`${artwork.title} ${i + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">{artwork.title}</CardTitle>
                    <CardDescription className="text-base">
                      {artwork.artist?.name ?? "—"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">価格</span>
                      <span className="text-xl sm:text-2xl text-primary">{priceStr}</span>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      {(dimW > 0 || dimH > 0) && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">サイズ</span>
                          <span className="text-gray-900">
                            {dimW} × {dimH} cm
                          </span>
                        </div>
                      )}
                      {artwork.medium && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">技法</span>
                          <span className="text-gray-900">{artwork.medium}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">展示ステータス</span>
                        <Badge variant="default">{ctx.pipeline_label}</Badge>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <MapPin className="w-4 h-4 text-gray-500 shrink-0" />
                          <span className="text-gray-900 truncate">{ctx.space_name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/corporate-space/${ctx.space_id}`)}
                          className="text-xs h-7 shrink-0"
                        >
                          スペース詳細
                          <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                      {ctx.facility_type && (
                        <p className="text-xs text-gray-500 pl-6">{ctx.facility_type}</p>
                      )}
                      {ctx.space_address && (
                        <p className="text-xs text-gray-600 pl-6">{ctx.space_address}</p>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900">
                          展示開始: {formatJaDate(ctx.display_start_date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900">展示日数: {ctx.display_days}日</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

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
                    {canEditCorporate && (
                      <>
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
                          onClick={() =>
                            navigate(`/artwork-issue-report/${ctx.space_id}`)
                          }
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          問題を報告
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleShare}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      共有
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {artwork.description && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">作品について</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {artwork.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

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
                      このスペースのQRからこの作品が何回閲覧されたか（展示期間内）
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gradient-to-br from-[#C3A36D]/10 to-[#D4745E]/10 rounded-lg p-6 text-center">
                      <p className="text-4xl sm:text-5xl text-primary mb-2">
                        {ctx.qr_scan_count.toLocaleString("ja-JP")}
                      </p>
                      <p className="text-sm text-gray-600">回（QRスキャン）</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-3 text-center">
                      カタログ上の閲覧数: {ctx.view_count.toLocaleString("ja-JP")}{" "}
                      / お気に入り: {ctx.favorite_count.toLocaleString("ja-JP")}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Card className="border-[#C3A36D]/30 bg-[#F8F6F1]/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Package className="w-5 h-5 text-primary" />
                      返却について
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <p className="text-xs text-gray-600">{ctx.pipeline_detail}</p>
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 ${ctx.display_days >= 180 ? "bg-green-500" : "bg-orange-500"}`}
                      />
                      <div className="flex-1">
                        <p className="text-gray-900 mb-1">
                          {ctx.shipping_cost_bearer === "artist" ? (
                            <span className="text-green-700">
                              ✓ 返却送料：無料（展示期間6ヶ月以上）
                            </span>
                          ) : (
                            <span className="text-orange-700">
                              返却送料：法人負担（展示期間6ヶ月未満）
                            </span>
                          )}
                        </p>
                        <p className="text-gray-600 text-xs">
                          現在の展示日数: {ctx.display_days}日
                          {ctx.display_days < 180 &&
                            ` / あと${180 - ctx.display_days}日で無料`}
                        </p>
                      </div>
                    </div>
                    {canEditCorporate && (
                      <p className="text-gray-600 text-xs">
                        返却ボタンを押すだけで、MGJが返却ラベルを発行し、配送業者の集荷手配を行います。
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto shrink-0">
        <Footer />
      </div>

      {canEditCorporate && (
      <ArtworkReturnDialog
        open={returnDialogOpen}
        onOpenChange={setReturnDialogOpen}
        spaceId={ctx.space_id}
        onSuccess={load}
        artwork={{
          id: artwork.id,
          title: artwork.title,
          artist: artwork.artist?.name ?? "—",
          image: mainImage,
          displayedSince: ctx.display_start_date
            ? `${ctx.display_start_date}T12:00:00.000Z`
            : new Date().toISOString(),
          location: ctx.space_name,
          price: priceStr,
        }}
      />
      )}
    </div>
  );
}
