import { useState, useMemo } from "react";
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
import {
  Package,
  Calendar,
  Truck,
  Download,
  QrCode,
  CheckCircle2,
  MapPin,
  User,
  Phone,
  Home,
  AlertCircle,
  Printer
} from "lucide-react";

interface Artwork {
  id: number;
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
}

// モックデータ - アーティスト情報
const MOCK_ARTIST = {
  name: "山田太郎",
  postalCode: "150-0001",
  address: "東京都渋谷区神宮前1-2-3 アートマンション405号室",
  phone: "090-1234-5678",
  email: "yamada@example.com"
};

export function ArtworkReturnDialog({ open, onOpenChange, artwork }: ArtworkReturnDialogProps) {
  const [step, setStep] = useState<"reason" | "label">("reason");
  const [returnReason, setReturnReason] = useState("");
  const [additionalComments, setAdditionalComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 展示日数と送料負担者を計算
  const { displayDays, shippingCostBearer, rentalDurationMonths } = useMemo(() => {
    if (!artwork) return { displayDays: 0, shippingCostBearer: "corporate", rentalDurationMonths: 0 };
    
    const startDate = new Date(artwork.displayedSince);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30);
    
    return {
      displayDays: diffDays,
      rentalDurationMonths: months,
      shippingCostBearer: months >= 6 ? "artist" : "corporate"
    };
  }, [artwork]);

  const handleSubmit = async () => {
    if (!returnReason) {
      toast.error("返却理由を選択してください");
      return;
    }

    setIsSubmitting(true);
    
    // TODO: API呼び出し
    setTimeout(() => {
      setIsSubmitting(false);
      setStep("label");
      toast.success("返却ラベルを発行しました");
    }, 1000);
  };

  const handleClose = () => {
    setStep("reason");
    setReturnReason("");
    setAdditionalComments("");
    onOpenChange(false);
  };

  const handleDownloadLabel = () => {
    toast.success("ラベルをダウンロードしました");
    // TODO: PDF生成処理
  };

  const handleRequestPickup = () => {
    toast.success("集荷依頼を送信しました");
    // TODO: ヤマトAPI連携
  };

  if (!artwork) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <AnimatePresence mode="wait">
          {step === "reason" ? (
            <motion.div
              key="reason"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl">
                  <Package className="w-6 h-6 text-accent" />
                  作品の返却申請
                </DialogTitle>
                <DialogDescription>
                  返却理由を選択してください。自動で返送ラベルを発行します。
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-6">
                {/* 作品情報 */}
                <Card className="border-2 border-gray-200">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={artwork.image}
                          alt={artwork.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-grow space-y-2">
                        <div>
                          <h3 className="text-lg text-primary">{artwork.title}</h3>
                          <p className="text-sm text-gray-600">{artwork.artist}</p>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {artwork.displayedSince}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
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

                {/* 送料負担情報 */}
                <Card className={shippingCostBearer === "corporate" ? "border-accent/30 bg-accent/5" : "border-orange-200 bg-orange-50/30"}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Truck className={`w-5 h-5 mt-0.5 flex-shrink-0 ${shippingCostBearer === "corporate" ? "text-accent" : "text-orange-600"}`} />
                      <div className="flex-grow">
                        <p className="text-sm mb-2">
                          {shippingCostBearer === "corporate" ? (
                            <>
                              <strong className="text-accent">送料：法人様のご負担（元払い）</strong>
                              <br />
                              <span className="text-gray-600">展示期間が6ヶ月未満のため</span>
                            </>
                          ) : (
                            <>
                              <strong className="text-orange-700">送料：アーティストのご負担（着払い）</strong>
                              <br />
                              <span className="text-gray-600">展示期間が6ヶ月以上のため</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 返却理由 */}
                <div>
                  <Label className="text-base mb-3 block">返却理由を選択してください</Label>
                  <RadioGroup value={returnReason} onValueChange={setReturnReason}>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer">
                        <RadioGroupItem value="artist-request" id="artist-request" />
                        <Label htmlFor="artist-request" className="flex-grow cursor-pointer">
                          アーティストに依頼されたため
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer">
                        <RadioGroupItem value="end" id="end" />
                        <Label htmlFor="end" className="flex-grow cursor-pointer">
                          展示を終了する
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer">
                        <RadioGroupItem value="change" id="change" />
                        <Label htmlFor="change" className="flex-grow cursor-pointer">
                          別の作品に交換したい
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer">
                        <RadioGroupItem value="season" id="season" />
                        <Label htmlFor="season" className="flex-grow cursor-pointer">
                          季節やイベントに合わせて変更
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other" className="flex-grow cursor-pointer">
                          その他
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* 追加コメント */}
                <div>
                  <Label className="text-base mb-2 block">追加コメント（任意）</Label>
                  <Textarea
                    value={additionalComments}
                    onChange={(e) => setAdditionalComments(e.target.value)}
                    placeholder="例：次回は明るい色調の作品を希望します"
                    className="min-h-[80px] resize-none"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                  キャンセル
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={!returnReason || isSubmitting}
                  className="bg-accent hover:bg-accent/90 min-w-[180px]"
                >
                  {isSubmitting ? "処理中..." : "返却手続きを完了"}
                </Button>
              </DialogFooter>
            </motion.div>
          ) : (
            <motion.div
              key="label"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  返却手続きが完了しました
                </DialogTitle>
                <DialogDescription>
                  配送ラベルを発行し、集荷を自動で手配しました
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-6">
                {/* ステータス */}
                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-grow">
                      <p className="text-sm">
                        <strong className="text-green-700">申請ID: RTN-{Date.now().toString().slice(-8)}</strong>
                        <br />
                        <span className="text-gray-600">
                          {new Date().toLocaleDateString('ja-JP')} 発行
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* 返送ラベル */}
                <Card className="border-2 border-accent/30">
                  <CardContent className="pt-6 space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg mb-4">返送ラベル</h3>
                      
                      {/* QRコード表示 */}
                      <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                        <QrCode className="w-24 h-24 text-gray-400" />
                      </div>
                      
                      <div className="space-y-2">
                        <Button 
                          onClick={handleDownloadLabel}
                          className="w-full gap-2"
                          variant="outline"
                        >
                          <Download className="w-4 h-4" />
                          PDFラベルをダウンロード
                        </Button>
                        <Button 
                          onClick={handleDownloadLabel}
                          className="w-full gap-2"
                          variant="outline"
                        >
                          <Printer className="w-4 h-4" />
                          ラベルを印刷
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* 配送情報 */}
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
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">追跡番号</span>
                        <span className="text-primary font-mono">MGJ-{Date.now().toString().slice(-10)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 返送先住所 */}
                <Card className="border-2 border-gray-200">
                  <CardContent className="pt-6">
                    <h3 className="text-base mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-accent" />
                      返送先（アーティスト住所）
                    </h3>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 mt-0.5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">お名前</p>
                          <p className="text-primary">{MOCK_ARTIST.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <Home className="w-4 h-4 mt-0.5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">郵便番号</p>
                          <p className="text-primary">〒{MOCK_ARTIST.postalCode}</p>
                          <p className="text-xs text-gray-500 mt-2">住所</p>
                          <p className="text-primary">{MOCK_ARTIST.address}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <Phone className="w-4 h-4 mt-0.5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">電話番号</p>
                          <p className="text-primary">{MOCK_ARTIST.phone}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 集荷予約完了 */}
                <Card className="border-2 border-green-200 bg-green-50/30">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
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

                {/* 注意事項 */}
                <Card className="border-2 border-orange-200 bg-orange-50/30">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
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
                <Button 
                  onClick={handleClose}
                  className="bg-accent hover:bg-accent/90"
                >
                  完了
                </Button>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

