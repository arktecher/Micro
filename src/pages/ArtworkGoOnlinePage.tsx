import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  type TouchEvent,
} from "react";
import { motion } from "motion/react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Globe,
  ImageIcon,
  Clock,
  Loader2,
  CheckCircle,
  Sparkles,
  Frame,
  Lightbulb,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  artworkService,
  type Artwork,
  type OnlineConfirmContext,
} from "@/services/artwork.service";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import {
  advanceGoOnlineQueue,
  addOnboardingPublishedArtworkId,
} from "@/lib/artworkGoOnlineFlow";
import { collectArtworkImageUrls } from "@/lib/artworkImageUrls";

/**
 * 新規登録直後の作品について「オンライン公開するか」を1件ずつ確認する。
 * ルート:
 * - /artist/works/:artworkId/online-confirm（既存・キュー連携）
 * - /artwork-selection/:artworkId（旧「作品選択」相当の導線用）
 *
 * 公開は POST /artworks/:id/publish-online。事前確認は GET …/online-confirm/context。
 */
export function ArtworkGoOnlinePage() {
  const navigate = useNavigate();
  const { artworkId } = useParams<{ artworkId: string }>();
  const { isAuthenticated, userType, currentUser, isInitialized } = useAuth();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  /** From GET …/online-confirm/context — when set, publishing via API would fail until fixed */
  const [publishHint, setPublishHint] = useState<string | null>(null);
  const [onlineContext, setOnlineContext] = useState<OnlineConfirmContext | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  /** Same behavior as ArtistDashboard artwork cards */
  const [carousel, setCarousel] = useState({
    currentIndex: 0,
    isAutoPlaying: true,
    isHovering: false,
  });
  const resumeAutoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  /** Ordered, deduped URLs for carousel (images by image_order, else thumbnail_urls, else main). */
  const imageUrls = useMemo(() => {
    if (!artwork) return [];
    return collectArtworkImageUrls(artwork);
  }, [artwork]);

  useEffect(() => {
    if (imageUrls.length === 0) return;
    setCarousel((c) => ({
      ...c,
      currentIndex: Math.min(c.currentIndex, imageUrls.length - 1),
    }));
  }, [imageUrls]);

  useEffect(() => {
    setCarousel({ currentIndex: 0, isAutoPlaying: true, isHovering: false });
  }, [artworkId, artwork?.id]);

  useEffect(() => {
    if (imageUrls.length <= 1) return;
    if (!carousel.isAutoPlaying || carousel.isHovering) return;
    const id = setInterval(() => {
      setCarousel((c) => ({
        ...c,
        currentIndex: (c.currentIndex + 1) % imageUrls.length,
      }));
    }, 4000);
    return () => clearInterval(id);
  }, [imageUrls, carousel.isAutoPlaying, carousel.isHovering]);

  const clearResumeTimer = () => {
    if (resumeAutoPlayTimerRef.current) {
      clearTimeout(resumeAutoPlayTimerRef.current);
      resumeAutoPlayTimerRef.current = null;
    }
  };

  const scheduleResumeAutoPlay = useCallback(() => {
    clearResumeTimer();
    resumeAutoPlayTimerRef.current = setTimeout(() => {
      setCarousel((c) => ({ ...c, isAutoPlaying: true }));
      resumeAutoPlayTimerRef.current = null;
    }, 10_000);
  }, []);

  const handleCarouselHover = useCallback((isHovering: boolean) => {
    setCarousel((c) => ({ ...c, isHovering }));
  }, []);

  const handleCarouselNext = useCallback(() => {
    if (imageUrls.length <= 1) return;
    setCarousel((c) => ({
      ...c,
      currentIndex: (c.currentIndex + 1) % imageUrls.length,
      isAutoPlaying: false,
    }));
    scheduleResumeAutoPlay();
  }, [imageUrls.length, scheduleResumeAutoPlay]);

  const handleCarouselPrev = useCallback(() => {
    if (imageUrls.length <= 1) return;
    setCarousel((c) => ({
      ...c,
      currentIndex:
        (c.currentIndex - 1 + imageUrls.length) % imageUrls.length,
      isAutoPlaying: false,
    }));
    scheduleResumeAutoPlay();
  }, [imageUrls.length, scheduleResumeAutoPlay]);

  const goToSlide = useCallback(
    (index: number) => {
      if (imageUrls.length <= 1) return;
      setCarousel((c) => ({
        ...c,
        currentIndex: Math.max(0, Math.min(index, imageUrls.length - 1)),
        isAutoPlaying: false,
      }));
      scheduleResumeAutoPlay();
    },
    [imageUrls.length, scheduleResumeAutoPlay]
  );

  const onCarouselTouchStart = useCallback((e: TouchEvent) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
  }, []);

  const onCarouselTouchEnd = useCallback(
    (e: TouchEvent) => {
      const start = touchStartXRef.current;
      touchStartXRef.current = null;
      if (start == null || imageUrls.length <= 1) return;
      const end = e.changedTouches[0]?.clientX;
      if (end == null) return;
      const dx = end - start;
      if (Math.abs(dx) < 48) return;
      if (dx < 0) handleCarouselNext();
      else handleCarouselPrev();
    },
    [imageUrls.length, handleCarouselNext, handleCarouselPrev]
  );

  useEffect(() => {
    return () => clearResumeTimer();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [artworkId]);

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated || userType !== "artist") {
      toast.error("このページはアーティスト専用です");
      navigate("/login/artist");
      return;
    }
    if (!artworkId || !currentUser?.id) {
      navigate("/dashboard");
      return;
    }

    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      setPublishHint(null);
      setOnlineContext(null);
      try {
        const [aw, ctx] = await Promise.all([
          artworkService.getArtwork(artworkId),
          artworkService.getOnlineConfirmContext(artworkId).catch(() => null),
        ]);
        if (cancelled) return;
        if (aw.artist_id !== currentUser.id) {
          setLoadError("この作品を表示する権限がありません");
          setArtwork(null);
          return;
        }
        setArtwork(aw);
        if (ctx) {
          setOnlineContext(ctx);
          if (!ctx.can_publish && ctx.message) {
            setPublishHint(ctx.message);
          }
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setLoadError("作品の読み込みに失敗しました");
          setArtwork(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    isInitialized,
    isAuthenticated,
    userType,
    currentUser?.id,
    artworkId,
    navigate,
  ]);

  const canPublishFromContext =
    !onlineContext ||
    onlineContext.can_publish ||
    artwork?.status === "published";

  const handleYes = async () => {
    if (!artworkId || !artwork) return;
    if (!canPublishFromContext) {
      toast.error(publishHint ?? "この作品はまだ公開できません");
      return;
    }
    setIsSubmitting(true);
    try {
      if (artwork.status === "published") {
        toast.success("この作品はすでに公開されています");
        advanceGoOnlineQueue(artworkId, navigate, { publishedThisStep: false });
        return;
      }
      const afterPost = await artworkService.publishArtwork(artworkId);
      let confirmed: Artwork = afterPost;
      if (String(confirmed.status) !== "published") {
        confirmed = await artworkService.getArtwork(artworkId);
      }
      if (String(confirmed.status) !== "published") {
        throw new Error(
          "オンライン公開の反映を確認できませんでした。ダッシュボードで作品の状態をご確認ください。"
        );
      }
      setArtwork(confirmed);
      addOnboardingPublishedArtworkId(artworkId);
      toast.success("作品をオンライン公開しました");
      advanceGoOnlineQueue(artworkId, navigate, { publishedThisStep: true });
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : "公開に失敗しました。もう一度お試しください";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNo = () => {
    if (!artworkId) return;
    setIsSubmitting(true);
    try {
      advanceGoOnlineQueue(artworkId, navigate, { publishedThisStep: false });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#F8F6F1] flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin text-[#C3A36D] mx-auto mb-4" />
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F1]">
      <Header />

      {/* ステップバー（旧「展示作品を選ぶ」相当 → 単一作品の公開確認） */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto max-w-6xl px-4 py-5 sm:py-6">
          <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#C3A36D] text-white flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="text-xs sm:text-sm text-gray-700">アーティスト登録</span>
            </div>
            <div className="w-6 sm:w-10 h-0.5 bg-[#C3A36D]" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#C3A36D] text-white flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="text-xs sm:text-sm text-gray-700">作品登録</span>
            </div>
            <div className="w-6 sm:w-10 h-0.5 bg-[#C3A36D]" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C3A36D] to-[#D4B478] text-white flex items-center justify-center shadow-lg shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-xs sm:text-sm text-[#C3A36D] font-medium">
                オンライン公開
              </span>
            </div>
            <div className="w-6 sm:w-10 h-0.5 bg-gray-300" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs shrink-0">
                4
              </div>
              <span className="text-xs sm:text-sm text-gray-400">次のステップ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero（旧 artwork-selection のトーンに合わせた文言） */}
      <section className="relative py-10 sm:py-16 px-4 overflow-hidden bg-gradient-to-b from-white via-[#F8F6F1]/50 to-[#F8F6F1]">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-72 h-72 bg-[#C3A36D]/15 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-[#D4B478]/15 rounded-full blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="container mx-auto max-w-3xl text-center relative z-10"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#C3A36D] to-[#D4B478] rounded-full mb-6 shadow-xl"
          >
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </motion.div>
          <h1 className="text-2xl sm:text-4xl text-[#3A3A3A] mb-3 sm:mb-4 leading-tight font-semibold">
            おめでとうございます！
          </h1>
          <p className="text-lg sm:text-xl text-[#3A3A3A] mb-2 leading-relaxed">
            作品の登録が完了しました。
          </p>
          <p className="text-base sm:text-lg text-gray-600 mb-2 leading-relaxed">
            次は、この作品を<span className="text-[#C3A36D] font-medium">「世界へ」</span>
            送り出しましょう。
          </p>
          <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto">
            MGJで公開すると、ギャラリーに掲載され、展示・販売の候補になります。
            <br className="hidden sm:block" />
            この画面では、<span className="text-[#3A3A3A]">今登録した作品だけ</span>
            について、オンライン公開するか選べます。
          </p>
        </motion.div>
      </section>

      {/* ヒント（旧ページの3カラムを単一作品向けに調整） */}
      <section className="py-8 px-4 bg-white border-y border-gray-200">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            <div className="flex items-start gap-3 p-5 bg-gradient-to-br from-[#F8F6F1] to-white rounded-2xl border border-[#C3A36D]/20">
              <div className="w-10 h-10 bg-[#C3A36D]/10 rounded-xl flex items-center justify-center shrink-0">
                <Lightbulb className="w-5 h-5 text-[#C3A36D]" />
              </div>
              <div>
                <h3 className="text-base text-[#3A3A3A] mb-1 font-medium">
                  この作品についてだけ
                </h3>
                <p className="text-sm text-gray-600">
                  一覧から選ぶ必要はありません。今登録した作品の公開の有無だけを決められます。
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-5 bg-gradient-to-br from-[#F8F6F1] to-white rounded-2xl border border-[#C3A36D]/20">
              <div className="w-10 h-10 bg-[#C3A36D]/10 rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 text-[#C3A36D]" />
              </div>
              <div>
                <h3 className="text-base text-[#3A3A3A] mb-1 font-medium">
                  いつでも変更できます
                </h3>
                <p className="text-sm text-gray-600">
                  後からダッシュボードで公開・非公開を変更することも可能です。
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-5 bg-gradient-to-br from-[#F8F6F1] to-white rounded-2xl border border-[#C3A36D]/20">
              <div className="w-10 h-10 bg-[#C3A36D]/10 rounded-xl flex items-center justify-center shrink-0">
                <Frame className="w-5 h-5 text-[#C3A36D]" />
              </div>
              <div>
                <h3 className="text-base text-[#3A3A3A] mb-1 font-medium">
                  公開するとギャラリーに掲載
                </h3>
                <p className="text-sm text-gray-600">
                  選んだ作品は、MGJのギャラリーに公開されます。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 確認＋作品カード */}
      <section className="relative py-10 sm:py-14 px-4 pb-28">
        <div className="container mx-auto max-w-lg">
          {isLoading ? (
            <Card className="p-10 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
              <CardContent className="p-0">
                <Loader2 className="w-10 h-10 text-[#C3A36D] mx-auto mb-4 animate-spin" />
                <p className="text-gray-600">作品を読み込んでいます…</p>
              </CardContent>
            </Card>
          ) : loadError || !artwork ? (
            <Card className="p-10 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
              <CardContent className="p-0 space-y-4">
                <p className="text-gray-700">{loadError ?? "作品が見つかりません"}</p>
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="rounded-xl"
                >
                  ダッシュボードへ
                </Button>
              </CardContent>
            </Card>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#C3A36D] to-[#D4B478] text-white mb-4 shadow-lg">
                  <Globe className="w-6 h-6" />
                </div>
                <h2 className="text-xl sm:text-2xl text-[#3A3A3A] font-semibold mb-2">
                  この作品をオンラインで公開しますか？
                </h2>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  「公開する」と、上記のとおりギャラリー候補として掲載されます。
                  <br />
                  「今は公開しない」を選んでも、あとからいつでも公開できます。
                </p>
              </div>

              <Card className="overflow-hidden bg-white rounded-2xl border-2 border-[#C3A36D]/20 shadow-xl mb-8">
                {/*
                  Card uses flex flex-col; aspect-square + only abspos children can collapse to 0 height.
                  Use padding-bottom square box so the media area always gets a real height.
                */}
                <div
                  key={artwork.id}
                  role={imageUrls.length > 1 ? "region" : undefined}
                  aria-roledescription={imageUrls.length > 1 ? "carousel" : undefined}
                  aria-label={imageUrls.length > 1 ? `${artwork.title}の画像ギャラリー` : undefined}
                  className="relative w-full max-w-[min(100%,min(56vh,420px))] overflow-hidden mx-auto touch-pan-y bg-gradient-to-br from-gray-50 to-gray-100"
                  onMouseEnter={() => handleCarouselHover(true)}
                  onMouseLeave={() => handleCarouselHover(false)}
                  onTouchStart={onCarouselTouchStart}
                  onTouchEnd={onCarouselTouchEnd}
                >
                  {imageUrls.length > 0 ? (
                    <>
                      <div className="relative w-full pb-[100%] h-0">
                        <div className="absolute inset-0">
                          {imageUrls.map((imageUrl, imgIndex) => {
                            const isActive = carousel.currentIndex === imgIndex;
                            return (
                              <motion.div
                                key={`${imageUrl}-${imgIndex}`}
                                initial={false}
                                animate={{
                                  opacity: isActive ? 1 : 0,
                                  scale: isActive ? 1 : 0.98,
                                }}
                                transition={{
                                  duration: 0.45,
                                  ease: "easeInOut",
                                }}
                                className={`absolute inset-0 ${
                                  isActive ? "z-10" : "z-0 pointer-events-none"
                                }`}
                                aria-hidden={!isActive}
                              >
                                <ImageWithFallback
                                  src={imageUrl}
                                  alt={`${artwork.title} - 画像 ${imgIndex + 1} / ${imageUrls.length}`}
                                  className="h-full w-full object-cover select-none"
                                  draggable={false}
                                />
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>

                      {imageUrls.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCarouselPrev();
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
                              handleCarouselNext();
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 sm:p-2 transition-all z-20"
                            aria-label="次の画像"
                          >
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20 max-w-[calc(100%-1rem)]">
                            <div
                              className="flex items-center justify-center gap-1.5 px-1"
                              role="tablist"
                              aria-label="画像の選択"
                            >
                              {imageUrls.map((_, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  role="tab"
                                  aria-selected={carousel.currentIndex === i}
                                  aria-label={`画像 ${i + 1} を表示`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    goToSlide(i);
                                  }}
                                  className={`h-2 rounded-full transition-all ${
                                    carousel.currentIndex === i
                                      ? "w-6 bg-white"
                                      : "w-2 bg-white/50 hover:bg-white/80"
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap justify-center">
                              <div className="bg-black/50 text-white px-2 sm:px-3 py-1 rounded-full text-xs tabular-nums">
                                {carousel.currentIndex + 1} / {imageUrls.length}
                              </div>
                              {carousel.isAutoPlaying && !carousel.isHovering && (
                                <div className="bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse" />
                                  <span className="hidden sm:inline">自動再生</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="flex min-h-[200px] items-center justify-center py-12">
                      <ImageIcon className="w-20 h-20 text-gray-300" strokeWidth={1.2} />
                    </div>
                  )}
                </div>
                <CardContent className="p-5 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-[#3A3A3A] mb-1 line-clamp-2">
                    {artwork.title}
                  </h3>
                  <p className="text-[#C3A36D]">¥{Number(artwork.price).toLocaleString()}</p>
                  {artwork.status === "published" && (
                    <p className="text-sm text-green-600 mt-2">すでに公開済みです</p>
                  )}
                  {publishHint && artwork.status !== "published" && (
                    <div
                      role="alert"
                      className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
                    >
                      <p className="font-medium">公開の条件を満たしていません</p>
                      <p className="mt-1 text-amber-800/90">{publishHint}</p>
                      {onlineContext?.missing_fields &&
                        onlineContext.missing_fields.length > 0 && (
                          <p className="mt-2 text-xs text-amber-800/80">
                            不足:{" "}
                            {onlineContext.missing_fields
                              .map((f) =>
                                f === "title"
                                  ? "タイトル"
                                  : f === "price"
                                    ? "価格"
                                    : f === "main_image_url"
                                      ? "画像"
                                      : f
                              )
                              .join("、")}
                          </p>
                        )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="flex-1 rounded-xl border-gray-300 h-12 sm:h-14 text-base"
                  disabled={isSubmitting}
                  onClick={handleNo}
                >
                  今は公開しない
                </Button>
                <Button
                  type="button"
                  size="lg"
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#C3A36D] to-[#D4B478] hover:opacity-90 text-white h-12 sm:h-14 text-base shadow-lg disabled:opacity-50"
                  disabled={isSubmitting || !canPublishFromContext}
                  onClick={handleYes}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      処理中…
                    </>
                  ) : (
                    <>
                      オンラインで公開する
                      <ArrowRight className="w-5 h-5 ml-2 inline" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
