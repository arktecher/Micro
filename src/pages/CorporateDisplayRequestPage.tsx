import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight, CheckCircle2, Sparkles, Building2, MapPin, Info, Loader2, ChevronLeft, ChevronRight, } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useCorporateOrgRole } from "@/hooks/useCorporateOrgRole";
import { artworkService, type Artwork } from "@/services/artwork.service";
import { listSpaces, assignSpaceArtwork, type SpaceResponse, } from "@/services/space.service";
const SPACE_PLACEHOLDER = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800";
function buildArtworkImageUrls(a: Artwork): string[] {
    if (a.images && a.images.length > 0) {
        return [...a.images]
            .sort((x, y) => x.image_order - y.image_order)
            .map((i) => i.image_url)
            .filter(Boolean);
    }
    if (a.main_image_url?.trim())
        return [a.main_image_url];
    return [];
}
function buildSpaceImageUrls(s: SpaceResponse): string[] {
    const urls = (s.photo_urls ?? []).filter((u): u is string => typeof u === "string" && Boolean(u.trim()));
    return urls.length > 0 ? urls : [SPACE_PLACEHOLDER];
}
interface ImageCarouselProps {
    images: string[];
    altPrefix: string;
    aspectClass?: string;
    className?: string;
    compact?: boolean;
}
function ImageCarousel({ images, altPrefix, aspectClass = "aspect-square", className = "", compact = false, }: ImageCarouselProps) {
    const [idx, setIdx] = useState(0);
    const list = images.filter(Boolean);
    const n = list.length;
    const safeIdx = n > 0 ? ((idx % n) + n) % n : 0;
    const go = (delta: number) => {
        if (n <= 1)
            return;
        setIdx((i) => (i + delta + n) % n);
    };
    if (n === 0) {
        return (<div className={`rounded-lg bg-gray-100 ${aspectClass} ${className}`} aria-hidden/>);
    }
    return (<div className={`relative overflow-hidden rounded-lg bg-gray-100 ${aspectClass} ${className}`}>
      <ImageWithFallback src={list[safeIdx]} alt={`${altPrefix} ${safeIdx + 1}`} className="h-full w-full object-cover"/>
      {n > 1 && (<>
          <button type="button" onClick={(e) => {
                e.stopPropagation();
                go(-1);
            }} className={`absolute left-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/80 bg-white/90 text-gray-800 shadow hover:bg-white ${compact ? "p-0.5" : "p-1"}`} aria-label="前の画像">
            <ChevronLeft className={compact ? "h-4 w-4" : "h-5 w-5"}/>
          </button>
          <button type="button" onClick={(e) => {
                e.stopPropagation();
                go(1);
            }} className={`absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/80 bg-white/90 text-gray-800 shadow hover:bg-white ${compact ? "p-0.5" : "p-1"}`} aria-label="次の画像">
            <ChevronRight className={compact ? "h-4 w-4" : "h-5 w-5"}/>
          </button>
          <div className={`absolute bottom-1 left-0 right-0 flex justify-center gap-1 ${compact ? "px-1" : "px-2"}`}>
            {list.map((_, i) => (<button key={i} type="button" onClick={(e) => {
                    e.stopPropagation();
                    setIdx(i);
                }} className={`h-1.5 rounded-full transition-all ${i === safeIdx
                    ? "w-4 bg-white"
                    : "w-1.5 bg-white/60 hover:bg-white/80"}`} aria-label={`画像 ${i + 1}`}/>))}
          </div>
          <span className={`absolute right-1 top-1 rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white ${compact ? "text-[9px]" : ""}`}>
            {safeIdx + 1}/{n}
          </span>
        </>)}
    </div>);
}
function spaceHasActiveExhibitionPipeline(s: SpaceResponse): boolean {
    return Boolean(s.pending_exhibition_artwork_id ||
        s.pending_exhibition_assignment_id ||
        s.pending_exhibition_status === "pending" ||
        s.pending_exhibition_status === "approved" ||
        s.pending_exhibition_status === "in_transit");
}
export function CorporateDisplayRequestPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { artworkId } = useParams<{
        artworkId: string;
    }>();
    const { isAuthenticated, userType, isInitialized, corporateRole } = useAuth();
    const { canEdit } = useCorporateOrgRole();
    const preSelectedSpaceId = (location.state as {
        spaceId?: string;
    } | null)
        ?.spaceId;
    const [artwork, setArtwork] = useState<Artwork | null>(null);
    const [artworkLoading, setArtworkLoading] = useState(true);
    const [artworkError, setArtworkError] = useState<string | null>(null);
    const [spaces, setSpaces] = useState<SpaceResponse[]>([]);
    const [spacesLoading, setSpacesLoading] = useState(false);
    const [spacesError, setSpacesError] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedSpaceId, setSelectedSpaceId] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const selectedSpace = useMemo(() => spaces.find((s) => s.id === selectedSpaceId), [spaces, selectedSpaceId]);
    useEffect(() => {
        if (!selectedSpaceId || spaces.length === 0)
            return;
        const s = spaces.find((x) => x.id === selectedSpaceId);
        if (s && spaceHasActiveExhibitionPipeline(s)) {
            setSelectedSpaceId("");
        }
    }, [spaces, selectedSpaceId]);
    useEffect(() => {
        if (!artworkId) {
            setArtworkError("作品IDが無効です");
            setArtworkLoading(false);
            return;
        }
        let cancelled = false;
        setArtworkLoading(true);
        setArtworkError(null);
        artworkService
            .getArtwork(artworkId)
            .then((data) => {
            if (!cancelled)
                setArtwork(data);
        })
            .catch((e: unknown) => {
            if (!cancelled) {
                setArtworkError(e instanceof Error ? e.message : "作品を読み込めませんでした");
                setArtwork(null);
            }
        })
            .finally(() => {
            if (!cancelled)
                setArtworkLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [artworkId]);
    useEffect(() => {
        if (!isInitialized || !isAuthenticated || userType !== "corporate") {
            return;
        }
        let cancelled = false;
        setSpacesLoading(true);
        setSpacesError(null);
        listSpaces({ page: 1, page_size: 100, is_active: true })
            .then((res) => {
            if (!cancelled)
                setSpaces(res.items ?? []);
        })
            .catch((e: unknown) => {
            if (!cancelled) {
                setSpacesError(e instanceof Error ? e.message : "スペース一覧の取得に失敗しました");
                setSpaces([]);
            }
        })
            .finally(() => {
            if (!cancelled)
                setSpacesLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [isInitialized, isAuthenticated, userType]);
    useEffect(() => {
        if (!preSelectedSpaceId || !spaces.length)
            return;
        const exists = spaces.some((s) => s.id === preSelectedSpaceId);
        if (exists) {
            setSelectedSpaceId(preSelectedSpaceId);
        }
    }, [preSelectedSpaceId, spaces]);
    const dimW = Number(artwork?.dimensions?.width) || 0;
    const dimH = Number(artwork?.dimensions?.height) || 0;
    const artistName = artwork?.artist?.name ?? "—";
    const priceNum = artwork ? Number(artwork.price) : 0;
    const artworkImageUrls = useMemo(() => (artwork ? buildArtworkImageUrls(artwork) : []), [artwork]);
    const selectedSpaceImageUrls = useMemo(() => (selectedSpace ? buildSpaceImageUrls(selectedSpace) : []), [selectedSpace]);
    const onSubmitStep1 = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSpaceId)
            return;
        setCurrentStep(2);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    const onSubmitStep2 = async () => {
        if (!artworkId || !selectedSpaceId)
            return;
        const sp = spaces.find((x) => x.id === selectedSpaceId);
        if (sp && spaceHasActiveExhibitionPipeline(sp)) {
            toast.error("このスペースでは別の作品の展示手続きが進行中です。完了してから再度お試しください。");
            return;
        }
        setSubmitting(true);
        try {
            const res = await assignSpaceArtwork(selectedSpaceId, {
                artwork_id: artworkId,
                assignment_reason: "catalog_display_request",
            });
            setCurrentStep(3);
            window.scrollTo({ top: 0, behavior: "smooth" });
            toast.success(res.message || "展示依頼を送信しました");
        }
        catch (e) {
            toast.error(e instanceof Error ? e.message : "展示依頼の送信に失敗しました");
        }
        finally {
            setSubmitting(false);
        }
    };
    const handleClose = () => {
        navigate(-1);
    };
    const handleViewDashboard = () => {
        navigate("/corporate-dashboard");
    };
    if (!isInitialized) {
        return (<div className="flex min-h-screen flex-col items-center justify-center bg-[#FAFAFA]">
        <Loader2 className="h-10 w-10 animate-spin text-primary"/>
      </div>);
    }
    if (!isAuthenticated || userType !== "corporate") {
        return (<div className="min-h-screen bg-gradient-to-b from-[#FAFAFA] to-white px-4 py-24">
        <div className="container mx-auto max-w-lg text-center">
          <h1 className="text-xl text-primary mb-3">法人の方のみご利用いただけます</h1>
          <p className="text-sm text-gray-600 mb-6">
            作品をスペースに展示するには、法人アカウントでログインしてください。
          </p>
          <Button onClick={() => navigate("/login/corporate", {
                state: { from: location.pathname },
            })}>
            法人ログインへ
          </Button>
        </div>
      </div>);
    }
    if (corporateRole === null) {
        return (<div className="flex min-h-screen flex-col items-center justify-center bg-[#FAFAFA] gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary"/>
        <p className="text-sm text-gray-600">権限情報を読み込み中…</p>
      </div>);
    }
    if (!canEdit) {
        return (<div className="min-h-screen bg-gradient-to-b from-[#FAFAFA] to-white px-4 py-24">
        <div className="container mx-auto max-w-lg text-center">
          <h1 className="text-xl text-primary mb-3">この操作には編集者以上の権限が必要です</h1>
          <p className="text-sm text-gray-600 mb-6">
            作品のスペースへの割り当ては、編集者・管理者、またはプライマリユーザーのみ実行できます。
          </p>
          <Button onClick={() => navigate("/corporate-dashboard")}>
            ダッシュボードへ
          </Button>
        </div>
      </div>);
    }
    if (artworkLoading) {
        return (<div className="flex min-h-screen flex-col items-center justify-center bg-[#FAFAFA] gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary"/>
        <p className="text-sm text-gray-600">作品を読み込み中…</p>
      </div>);
    }
    if (artworkError || !artwork) {
        return (<div className="min-h-screen bg-white px-4 py-24 text-center">
        <p className="text-gray-800 mb-4">{artworkError ?? "作品が見つかりません"}</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          戻る
        </Button>
      </div>);
    }
    const canAssignToSpace = artwork.status === "published" || artwork.status === "exhibited";
    if (!canAssignToSpace) {
        return (<div className="min-h-screen bg-white px-4 py-24 text-center max-w-lg mx-auto">
        <p className="text-gray-800 mb-2">この作品はまだ公開されていません</p>
        <p className="text-sm text-gray-600 mb-6">
          公開済みの作品のみスペースに展示できます。
        </p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          戻る
        </Button>
      </div>);
    }
    return (<div className="min-h-screen bg-gradient-to-b from-[#FAFAFA] to-white">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentStep < 3 && (<h1 className="text-base text-gray-900 tracking-wide">
                展示申請の確認
              </h1>)}
          </div>

          {currentStep < 3 && (<Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full hover:bg-gray-100">
              <X className="w-5 h-5"/>
            </Button>)}
        </div>
      </motion.div>

      <div className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-5xl">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (<motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1">
                    <div className="sticky top-24">
                      <Card className="overflow-hidden">
                        <ImageCarousel images={artworkImageUrls} altPrefix={artwork.title} aspectClass="aspect-square"/>
                        <CardContent className="p-6">
                          <h2 className="text-2xl text-primary mb-2">{artwork.title}</h2>
                          <p className="text-sm text-gray-600 mb-4">{artistName}</p>

                          <div className="space-y-2 text-sm mb-4">
                            {(dimW > 0 || dimH > 0) && (<div className="flex justify-between">
                                <span className="text-gray-500">サイズ</span>
                                <span className="text-gray-900">
                                  {dimW} × {dimH} cm
                                </span>
                              </div>)}
                            {artwork.medium && (<div className="flex justify-between">
                                <span className="text-gray-500">技法</span>
                                <span className="text-gray-900">{artwork.medium}</span>
                              </div>)}
                            {artwork.year != null && (<div className="flex justify-between">
                                <span className="text-gray-500">制作年</span>
                                <span className="text-gray-900">{artwork.year}年</span>
                              </div>)}
                          </div>

                          {artwork.style_tags && artwork.style_tags.length > 0 && (<div className="flex flex-wrap gap-2 mb-4">
                              {artwork.style_tags.map((tag) => (<Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>))}
                            </div>)}

                          <Separator className="my-4"/>

                          <div className="text-center">
                            <p className="text-xs text-gray-500 mb-1">訪問者向け販売価格</p>
                            <p className="text-2xl text-accent">
                              ¥{priceNum.toLocaleString("ja-JP")}
                            </p>
                            <p className="text-xs text-green-600 mt-2">
                              作品が販売された場合、販売価格の10%があなたの収益になります
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                        <div className="flex items-start gap-2 mb-2">
                          <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"/>
                          <p className="text-sm text-green-900">展示は完全無料</p>
                        </div>
                        <p className="text-xs text-green-700 leading-relaxed pl-7">
                          展示にかかる費用は一切ありません。表示価格は訪問者が作品を購入する際の販売価格です。
                        </p>
                      </motion.div>
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <form onSubmit={onSubmitStep1} className="space-y-6">
                      {artwork.status === "exhibited" && (<div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                          <div className="flex gap-2">
                            <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-700"/>
                            <div>
                              <p className="font-medium text-amber-900">
                                この作品は現在展示中です
                              </p>
                              <p className="mt-1 text-xs leading-relaxed text-amber-900/90">
                                作品は同時に1スペースのみ展示できます。別のスペースを選ぶと、同じ法人のもとで展示中のスペースの展示は終了し、選んだスペースに移ります。別法人のスペースで展示中の場合は割り当てできません。
                              </p>
                            </div>
                          </div>
                        </div>)}
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                              <MapPin className="w-5 h-5 text-accent"/>
                              <h3 className="text-lg text-primary">展示スペースを選択</h3>
                            </div>

                            {spacesLoading && (<div className="flex items-center gap-2 text-sm text-gray-500 py-8 justify-center">
                                <Loader2 className="h-5 w-5 animate-spin"/>
                                スペースを読み込み中…
                              </div>)}

                            {spacesError && (<p className="text-sm text-red-600 py-4">{spacesError}</p>)}

                            {!spacesLoading && !spacesError && spaces.length === 0 && (<div className="text-center py-8">
                                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3"/>
                                <p className="text-sm text-gray-600 mb-4">
                                  登録済みのスペースがありません
                                </p>
                                <Button type="button" variant="outline" onClick={() => navigate("/signup/corporate?addSpace=true")}>
                                  スペースを登録する
                                </Button>
                              </div>)}

                            {!spacesLoading && spaces.length > 0 && (<div className="space-y-3">
                                {spaces.filter((space) => !space.current_artwork_id &&
                    !spaceHasActiveExhibitionPipeline(space)).length === 0 && (<div className="text-center py-8">
                                    <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3"/>
                                    <p className="text-sm text-gray-600">
                                      現在展示可能な空きスペースがありません
                                    </p>
                                  </div>)}
                                {spaces.filter((space) => !space.current_artwork_id &&
                    !spaceHasActiveExhibitionPipeline(space)).map((space) => {
                    return (<div key={space.id} role="button" tabIndex={0} onClick={() => setSelectedSpaceId(space.id)} onKeyDown={(ev) => {
                            if (ev.key === "Enter" || ev.key === " ") {
                                ev.preventDefault();
                                setSelectedSpaceId(space.id);
                            }
                        }} className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${selectedSpaceId === space.id
                            ? "border-accent bg-accent/5"
                            : "border-gray-200 hover:border-accent/50 hover:bg-gray-50"}`}>
                                      <div className="flex gap-4 sm:gap-5">
                                        <div className="h-28 w-40 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-36 sm:w-52">
                                          <ImageCarousel images={buildSpaceImageUrls(space)} altPrefix={space.name} aspectClass="h-full w-full" className="h-full w-full rounded-lg"/>
                                        </div>
                                        <div className="flex-grow min-w-0">
                                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <h4 className="text-base text-primary">
                                              {space.name}
                                            </h4>
                                            <Badge className="bg-green-100 text-green-700 border-green-200">
                                              空き
                                            </Badge>
                                          </div>
                                          <p className="text-sm text-gray-600 flex items-center gap-1">
                                            <Building2 className="w-3 h-3 flex-shrink-0"/>
                                            <span className="truncate">
                                              {space.address ||
                            space.facility_type ||
                            "—"}
                                            </span>
                                          </p>
                                        </div>
                                        {selectedSpaceId === space.id && (<CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0"/>)}
                                      </div>
                                    </div>);
                })}
                              </div>)}
                          </CardContent>
                        </Card>
                      </motion.div>

                      <div className="flex justify-end">
                        <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90 min-w-[200px]" disabled={!selectedSpaceId || spacesLoading}>
                          確認画面へ
                          <ArrowRight className="w-5 h-5 ml-2"/>
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </motion.div>)}

            {currentStep === 2 && selectedSpace && (<motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }}>
                <div className="max-w-3xl mx-auto space-y-6">
                  <div>
                    <h2 className="text-2xl text-primary mb-2">展示申請内容の確認</h2>
                    <p className="text-sm text-gray-600">
                      以下の内容でアーティストに展示依頼を送ります。発送・受領確認のあと壁の展示が始まります。内容をご確認ください。
                    </p>
                  </div>

                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-base text-primary mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-accent"/>
                        展示作品
                      </h3>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        <div className="mx-auto w-full max-w-[280px] flex-shrink-0 sm:mx-0 sm:w-40">
                          <ImageCarousel images={artworkImageUrls} altPrefix={artwork.title} aspectClass="aspect-square"/>
                        </div>
                        <div className="min-w-0 flex-grow">
                          <h4 className="text-lg text-primary mb-1">{artwork.title}</h4>
                          <p className="text-sm text-gray-600 mb-3">{artistName}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            {(dimW > 0 || dimH > 0) && (<div>
                                <span className="text-gray-500">サイズ:</span>{" "}
                                <span className="text-gray-900">
                                  {dimW} × {dimH} cm
                                </span>
                              </div>)}
                            {artwork.medium && (<div>
                                <span className="text-gray-500">技法:</span>{" "}
                                <span className="text-gray-900">{artwork.medium}</span>
                              </div>)}
                            <div>
                              <span className="text-gray-500">販売価格:</span>{" "}
                              <span className="text-accent">
                                ¥{priceNum.toLocaleString("ja-JP")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-base text-primary mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-accent"/>
                        展示スペース
                      </h3>
                      <div className="mb-4">
                        <p className="mb-2 text-xs text-gray-500">スペース画像</p>
                        <div className="mx-auto w-full max-w-[280px] flex-shrink-0 sm:mx-0 sm:w-40">
                          <ImageCarousel images={selectedSpaceImageUrls} altPrefix={selectedSpace.name} aspectClass="aspect-square"/>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between gap-4">
                          <span className="text-sm text-gray-600">スペース名</span>
                          <span className="text-sm text-gray-900 text-right">
                            {selectedSpace.name}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-sm text-gray-600">場所</span>
                          <span className="text-sm text-gray-900 text-right">
                            {selectedSpace.address || selectedSpace.facility_type || "—"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-6">
                      <h3 className="text-base text-primary mb-4">展示契約について</h3>
                      <ul className="space-y-3 text-sm text-gray-800">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600"/>
                          <span>
                            展示は完全無料。作品が売れた場合のみ販売価格の10%があなたの収益になります
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600"/>
                          <span>展示中の作品は弊社保険でカバーされております</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600"/>
                          <span>
                            QRコード付きプレートを設置し、オンラインでの販売促進を行います
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600"/>
                          <span>展示期間中でも、いつでも作品の交換が可能です</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button type="button" variant="outline" size="lg" className="flex-1" disabled={submitting} onClick={() => setCurrentStep(1)}>
                      戻る
                    </Button>
                    <Button size="lg" onClick={() => void onSubmitStep2()} disabled={submitting} className="flex-1 bg-primary hover:bg-primary/90">
                      {submitting ? (<>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin"/>
                          処理中…
                        </>) : (<>
                          この内容で展示依頼を送る
                          <ArrowRight className="w-5 h-5 ml-2"/>
                        </>)}
                    </Button>
                  </div>
                </div>
              </motion.div>)}

            {currentStep === 3 && (<motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="max-w-2xl mx-auto text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-12 h-12 text-white"/>
                </div>

                <h2 className="text-3xl text-primary mb-4">展示依頼を送信しました</h2>

                <p className="text-base text-gray-600 mb-8 leading-relaxed">
                  「{artwork.title}」について「{selectedSpace?.name ?? ""}
                  」への展示依頼を受け付けました。
                  <br />
                  アーティストの発送後、受領確認で展示が開始されます。ダッシュボードから進捗を確認できます。
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" onClick={handleViewDashboard} className="bg-primary hover:bg-primary/90 min-w-[200px]">
                    ダッシュボードへ
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => navigate("/artworks")} className="min-w-[200px]">
                    作品をさがす
                  </Button>
                </div>
              </motion.div>)}
          </AnimatePresence>
        </div>
      </div>
    </div>);
}
