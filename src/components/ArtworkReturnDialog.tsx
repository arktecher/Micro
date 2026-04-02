import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { getReturnRequestContext, createReturnRequest, type ReturnRequestContext, type ReturnRequestCreated, } from "@/services/space.service";
import { Package, Calendar, Truck, Download, QrCode, CheckCircle2, MapPin, User, Phone, Home, AlertCircle, Printer } from "lucide-react";
interface Artwork {
    id: string | number;
    title: string;
    artist: string;
    image: string;
    displayedSince: string;
    location: string;
    price: string;
}
interface ArtworkReturnDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    artwork: Artwork | null;
    spaceId?: string | null;
    onSuccess?: () => void;
}
const MOCK_ARTIST = {
    name: "山田太郎",
    postalCode: "150-0001",
    address: "東京都渋谷区神宮前1-2-3 アートマンション405号室",
    phone: "090-1234-5678",
    email: "yamada@example.com"
};
function mapUiReasonToReasonCode(ui: string): string {
    if (ui === "artist-request")
        return "other";
    return ui;
}
function buildAdditionalNotes(uiReason: string, comments: string): string | null {
    const parts: string[] = [];
    if (uiReason === "artist-request") {
        parts.push("アーティストに依頼されたため");
    }
    const c = comments.trim();
    if (c)
        parts.push(c);
    return parts.length ? parts.join("\n\n") : null;
}
export function ArtworkReturnDialog({ open, onOpenChange, artwork, spaceId, onSuccess, }: ArtworkReturnDialogProps) {
    const [step, setStep] = useState<"reason" | "label">("reason");
    const [returnReason, setReturnReason] = useState("");
    const [additionalComments, setAdditionalComments] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [ctx, setCtx] = useState<ReturnRequestContext | null>(null);
    const [ctxLoading, setCtxLoading] = useState(false);
    const [ctxError, setCtxError] = useState<string | null>(null);
    const [createdReturn, setCreatedReturn] = useState<ReturnRequestCreated | null>(null);
    useEffect(() => {
        if (!open || !spaceId) {
            setCtx(null);
            setCtxError(null);
            return;
        }
        let cancelled = false;
        setCtxLoading(true);
        setCtxError(null);
        getReturnRequestContext(spaceId)
            .then((c) => {
            if (!cancelled)
                setCtx(c);
        })
            .catch((e: unknown) => {
            if (!cancelled) {
                setCtxError(e instanceof Error ? e.message : "情報の取得に失敗しました");
                setCtx(null);
            }
        })
            .finally(() => {
            if (!cancelled)
                setCtxLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [open, spaceId]);
    useEffect(() => {
        if (!open) {
            setStep("reason");
            setReturnReason("");
            setAdditionalComments("");
            setCreatedReturn(null);
        }
    }, [open]);
    const { displayDays, shippingCostBearer, rentalDurationMonths } = useMemo(() => {
        if (!artwork) {
            return { displayDays: 0, shippingCostBearer: "corporate" as const, rentalDurationMonths: 0 };
        }
        if (ctx) {
            const months = Math.floor(ctx.display_days / 30);
            return {
                displayDays: ctx.display_days,
                rentalDurationMonths: months,
                shippingCostBearer: ctx.shipping_cost_bearer,
            };
        }
        const startDate = new Date(artwork.displayedSince);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const months = Math.floor(diffDays / 30);
        return {
            displayDays: diffDays,
            rentalDurationMonths: months,
            shippingCostBearer: (months >= 6 ? "artist" : "corporate") as const,
        };
    }, [artwork, ctx]);
    const displayDateLabel = useMemo(() => {
        if (!artwork)
            return "—";
        const raw = ctx?.display_start_date ?? artwork.displayedSince;
        if (!raw)
            return "—";
        const d = new Date(raw);
        if (Number.isNaN(d.getTime()))
            return String(raw);
        return d.toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }, [ctx?.display_start_date, artwork]);
    const handleSubmit = async () => {
        if (!returnReason) {
            toast.error("返却理由を選択してください");
            return;
        }
        if (spaceId) {
            if (ctxLoading) {
                toast.error("情報を読み込み中です。しばらくお待ちください。");
                return;
            }
            if (ctxError || !ctx) {
                toast.error("返却申請の情報を取得できませんでした");
                return;
            }
            if (!ctx.can_submit) {
                toast.error(ctx.pending_message || "返却申請を送信できません");
                return;
            }
        }
        setIsSubmitting(true);
        try {
            if (spaceId && ctx) {
                const reason_code = mapUiReasonToReasonCode(returnReason);
                const additional_notes = buildAdditionalNotes(returnReason, additionalComments);
                const res = await createReturnRequest(spaceId, {
                    reason_code,
                    additional_notes,
                });
                setCreatedReturn(res);
                setStep("label");
                toast.success("返却申請を受け付けました");
                onSuccess?.();
            }
            else {
                await new Promise((r) => setTimeout(r, 600));
                setStep("label");
                toast.success("返却ラベルを発行しました（デモ）");
            }
        }
        catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "返却申請に失敗しました";
            toast.error(msg);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleClose = () => {
        setStep("reason");
        setReturnReason("");
        setAdditionalComments("");
        setCreatedReturn(null);
        onOpenChange(false);
    };
    const handleDownloadLabel = () => {
        toast.success("ラベルをダウンロードしました");
    };
    const handleRequestPickup = () => {
        toast.success("集荷依頼を送信しました");
    };
    if (!artwork)
        return null;
    const canSubmitReason = !spaceId || (!ctxLoading && !ctxError && ctx !== null && ctx.can_submit);
    const isApiFlow = Boolean(spaceId && createdReturn);
    return (<Dialog open={open} onOpenChange={(next) => {
            if (!next)
                handleClose();
        }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {spaceId && ctxLoading ? (<div className="flex items-center justify-center gap-2 py-24 text-gray-600">
            <span className="text-sm">返却申請の情報を読み込み中…</span>
          </div>) : (<>
        {spaceId && ctxError && (<div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {ctxError}
          </div>)}
        {spaceId && ctx && !ctx.can_submit && ctx.pending_message && (<div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {ctx.pending_message}
          </div>)}
        <AnimatePresence mode="wait">
          {step === "reason" ? (<motion.div key="reason" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl">
                  <Package className="w-6 h-6 text-accent"/>
                  作品の返却申請
                </DialogTitle>
                <DialogDescription>
                  返却理由を選択してください。自動で返送ラベルを発行します。
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-6">
                
                <Card className="border-2 border-gray-200">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <ImageWithFallback src={artwork.image} alt={artwork.title} className="w-full h-full object-cover"/>
                      </div>
                      <div className="flex-grow space-y-2">
                        <div>
                          <h3 className="text-lg text-primary">{artwork.title}</h3>
                          <p className="text-sm text-gray-600">{artwork.artist}</p>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4"/>
                            {displayDateLabel}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4"/>
                            {artwork.location}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          展示期間：<strong>{displayDays}日間（約{rentalDurationMonths}ヶ月）</strong>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                
                <Card className={shippingCostBearer === "corporate" ? "border-accent/30 bg-accent/5" : "border-orange-200 bg-orange-50/30"}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Truck className={`w-5 h-5 mt-0.5 flex-shrink-0 ${shippingCostBearer === "corporate" ? "text-accent" : "text-orange-600"}`}/>
                      <div className="flex-grow">
                        <p className="text-sm mb-2">
                          {shippingCostBearer === "corporate" ? (<>
                              <strong className="text-accent">送料：法人様のご負担（元払い）</strong>
                              <br />
                              <span className="text-gray-600">展示期間が6ヶ月未満のため</span>
                            </>) : (<>
                              <strong className="text-orange-700">送料：アーティストのご負担（着払い）</strong>
                              <br />
                              <span className="text-gray-600">展示期間が6ヶ月以上のため</span>
                            </>)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                
                <div>
                  <Label className="text-base mb-3 block">返却理由を選択してください</Label>
                  <RadioGroup value={returnReason} onValueChange={setReturnReason}>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer">
                        <RadioGroupItem value="artist-request" id="artist-request"/>
                        <Label htmlFor="artist-request" className="flex-grow cursor-pointer">
                          アーティストに依頼されたため
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer">
                        <RadioGroupItem value="end" id="end"/>
                        <Label htmlFor="end" className="flex-grow cursor-pointer">
                          展示を終了する
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer">
                        <RadioGroupItem value="change" id="change"/>
                        <Label htmlFor="change" className="flex-grow cursor-pointer">
                          別の作品に交換したい
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer">
                        <RadioGroupItem value="season" id="season"/>
                        <Label htmlFor="season" className="flex-grow cursor-pointer">
                          季節やイベントに合わせて変更
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer">
                        <RadioGroupItem value="space" id="space"/>
                        <Label htmlFor="space" className="flex-grow cursor-pointer">
                          展示スペースを変更する予定
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer">
                        <RadioGroupItem value="other" id="other"/>
                        <Label htmlFor="other" className="flex-grow cursor-pointer">
                          その他
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                
                <div>
                  <Label className="text-base mb-2 block">追加コメント（任意）</Label>
                  <Textarea value={additionalComments} onChange={(e) => setAdditionalComments(e.target.value)} placeholder="例：次回は明るい色調の作品を希望します" className="min-h-[80px] resize-none"/>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                  キャンセル
                </Button>
                <Button onClick={handleSubmit} disabled={!returnReason || isSubmitting || !canSubmitReason} className="bg-accent hover:bg-accent/90 min-w-[180px]">
                  {isSubmitting ? "処理中..." : "返却手続きを完了"}
                </Button>
              </DialogFooter>
            </motion.div>) : (<motion.div key="label" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl">
                  <CheckCircle2 className="w-6 h-6 text-green-600"/>
                  返却手続きが完了しました
                </DialogTitle>
                <DialogDescription>
                  {isApiFlow
                    ? "返却申請を受け付けました。MGJとアーティストへ通知されます。"
                    : "配送ラベルを発行し、集荷を自動で手配しました（デモ）"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-6">
                
                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"/>
                    <div className="flex-grow">
                      <p className="text-sm">
                        <strong className="text-green-700">
                          申請ID:{" "}
                          {createdReturn?.id ?? `RTN-${Date.now().toString().slice(-8)}`}
                        </strong>
                        <br />
                        <span className="text-gray-600">
                          {createdReturn?.requested_date
                    ? new Date(createdReturn.requested_date).toLocaleString("ja-JP")
                    : `${new Date().toLocaleDateString("ja-JP")} 発行`}
                        </span>
                      </p>
                      {createdReturn && (<p className="text-xs text-gray-600 mt-1">
                          ステータス: {createdReturn.status} / 送料負担:{" "}
                          {createdReturn.shipping_cost_bearer === "corporate"
                        ? "法人"
                        : "アーティスト"}
                        </p>)}
                    </div>
                  </div>
                </div>

                
                <Card className="border-2 border-accent/30">
                  <CardContent className="pt-6 space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg mb-4">返送ラベル</h3>
                      
                      
                      <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                        <QrCode className="w-24 h-24 text-gray-400"/>
                      </div>
                      
                      <div className="space-y-2">
                        <Button onClick={handleDownloadLabel} className="w-full gap-2" variant="outline">
                          <Download className="w-4 h-4"/>
                          PDFラベルをダウンロード
                        </Button>
                        <Button onClick={handleDownloadLabel} className="w-full gap-2" variant="outline">
                          <Printer className="w-4 h-4"/>
                          ラベルを印刷
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">配送方法</span>
                        <span className="text-primary">ヤマト運輸</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">送料</span>
                        <span className="text-primary">
                          {shippingCostBearer === "corporate" ? "元払い（法人負担）" : "着払い（アーティスト負担）"}
                        </span>
                      </div>
                      {!isApiFlow && (<div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">追跡番号</span>
                          <span className="text-primary font-mono">
                            MGJ-{Date.now().toString().slice(-10)}
                          </span>
                        </div>)}
                      {isApiFlow && (<p className="text-xs text-gray-600">
                          ラベル・追跡番号は審査後にダッシュボードでご確認いただけます。
                        </p>)}
                    </div>
                  </CardContent>
                </Card>

                
                <Card className="border-2 border-gray-200">
                  <CardContent className="pt-6">
                    <h3 className="text-base mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-accent"/>
                      返送先（アーティスト住所）
                    </h3>
                    
                    <div className="space-y-3 text-sm">
                      {ctx ? (<>
                          <div className="flex items-start gap-2">
                            <User className="w-4 h-4 mt-0.5 text-gray-400"/>
                            <div>
                              <p className="text-xs text-gray-500">アーティスト</p>
                              <p className="text-primary">{ctx.artist_name ?? artwork.artist}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Home className="w-4 h-4 mt-0.5 text-gray-400"/>
                            <div>
                              <p className="text-xs text-gray-500">返送先</p>
                              <p className="text-primary whitespace-pre-wrap">
                                {ctx.artist_address_formatted ?? "—"}
                              </p>
                            </div>
                          </div>
                          {ctx.artist_phone && (<div className="flex items-start gap-2">
                              <Phone className="w-4 h-4 mt-0.5 text-gray-400"/>
                              <div>
                                <p className="text-xs text-gray-500">電話番号</p>
                                <p className="text-primary">{ctx.artist_phone}</p>
                              </div>
                            </div>)}
                        </>) : (<>
                          <div className="flex items-start gap-2">
                            <User className="w-4 h-4 mt-0.5 text-gray-400"/>
                            <div>
                              <p className="text-xs text-gray-500">お名前</p>
                              <p className="text-primary">{MOCK_ARTIST.name}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <Home className="w-4 h-4 mt-0.5 text-gray-400"/>
                            <div>
                              <p className="text-xs text-gray-500">郵便番号</p>
                              <p className="text-primary">〒{MOCK_ARTIST.postalCode}</p>
                              <p className="text-xs text-gray-500 mt-2">住所</p>
                              <p className="text-primary">{MOCK_ARTIST.address}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <Phone className="w-4 h-4 mt-0.5 text-gray-400"/>
                            <div>
                              <p className="text-xs text-gray-500">電話番号</p>
                              <p className="text-primary">{MOCK_ARTIST.phone}</p>
                            </div>
                          </div>
                        </>)}
                    </div>
                  </CardContent>
                </Card>

                
                <Card className="border-2 border-green-200 bg-green-50/30">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"/>
                      <div className="flex-grow">
                        <h3 className="text-base mb-2">集荷予約が完了しました</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          MGJシステムが自動で配送業者に集荷を依頼しました。2〜3営業日以内に配送業者が集荷に伺います。
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start gap-2">
                            <span className="text-green-600 mt-0.5">✓</span>
                            <span className="text-gray-700">作品到着時と同じ梱包箱で梱包してください</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-green-600 mt-0.5">✓</span>
                            <span className="text-gray-700">配送業者の集荷をお待ちください（事前連絡あり）</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-green-600 mt-0.5">✓</span>
                            <span className="text-gray-700">梱包済みの作品を配送業者にお渡しください</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                
                <Card className="border-2 border-orange-200 bg-orange-50/30">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5"/>
                      <div className="flex-grow space-y-2 text-sm text-gray-700">
                        <p className="text-orange-700"><strong>返送時の注意事項</strong></p>
                        <ul className="space-y-1 list-disc list-inside">
                          <li>到着時の梱包箱と梱包材をそのまま使用してください</li>
                          <li>作品に破損や汚れがある場合は、事前に「破損・不具合を報告」から連絡してください</li>
                          <li>集荷後、追跡番号はダッシュボードで自動表示されます</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <DialogFooter>
                <Button onClick={handleClose} className="bg-accent hover:bg-accent/90">
                  完了
                </Button>
              </DialogFooter>
            </motion.div>)}
        </AnimatePresence>
          </>)}
      </DialogContent>
    </Dialog>);
}
