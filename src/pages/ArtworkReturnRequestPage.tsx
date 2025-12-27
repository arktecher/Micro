import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { ArrowLeft, Package, Calendar, AlertCircle, CheckCircle2, TruckIcon } from "lucide-react";

// モックデータ
const MOCK_ARTWORK = {
  id: "art-001",
  title: "青の記憶",
  artist: "山田太郎",
  image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop",
  displayStartDate: "2024-05-15", // ISO format for calculation
  displayStartDateFormatted: "2024年5月15日",
  location: "1階エントランス"
};

export function ArtworkReturnRequestPage() {
  const navigate = useNavigate();
  const { spaceId } = useParams();
  const [returnReason, setReturnReason] = useState("");
  const [additionalComments, setAdditionalComments] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 展示日数と送料負担者を計算
  const { displayDays, shippingCostBearer } = useMemo(() => {
    const startDate = new Date(MOCK_ARTWORK.displayStartDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      displayDays: diffDays,
      shippingCostBearer: diffDays <= 180 ? "corporate" : "artist"
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!returnReason) {
      toast.error("返却理由を選択してください");
      return;
    }
    
    if (!agreedToTerms) {
      toast.error("返却条件に同意してください");
      return;
    }

    setIsSubmitting(true);
    
    // TODO: API呼び出し
    setTimeout(() => {
      setIsSubmitting(false);
      // 確認ページに遷移
      navigate(`/artwork-return-confirmation/${spaceId}`, {
        state: {
          artwork: MOCK_ARTWORK,
          returnReason,
          additionalComments,
          displayDays,
          shippingCostBearer
        }
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* ヘッダー */}
        <div className="mb-6 sm:mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(`/corporate-space/${spaceId}`)}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            スペース詳細に戻る
          </Button>
          
          <h1 className="text-2xl sm:text-3xl text-[#3A3A3A] mb-2">作品の返却申請</h1>
          <p className="text-sm sm:text-base text-gray-600">
            展示中の作品を返却する申請を行います
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 現在の展示作品 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-accent" />
                  返却対象の作品
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <div className="w-full sm:w-40 h-40 rounded-lg overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={MOCK_ARTWORK.image}
                      alt={MOCK_ARTWORK.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-grow space-y-3">
                    <div>
                      <h3 className="text-base sm:text-lg text-[#3A3A3A] mb-1">{MOCK_ARTWORK.title}</h3>
                      <p className="text-sm sm:text-base text-gray-600">{MOCK_ARTWORK.artist}</p>
                    </div>
                    <div className="flex flex-wrap gap-3 sm:gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        展示開始：{MOCK_ARTWORK.displayStartDateFormatted}
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        場所：{MOCK_ARTWORK.location}
                      </div>
                    </div>
                    <div className="pt-3 border-t">
                      <p className="text-sm text-gray-600 mb-2">展示期間：<strong>{displayDays}日間</strong></p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 送料負担についての情報 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className={shippingCostBearer === "corporate" ? "border-accent/30 bg-accent/5" : "border-orange-200 bg-orange-50/30"}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TruckIcon className={`w-5 h-5 ${shippingCostBearer === "corporate" ? "text-accent" : "text-orange-600"}`} />
                  返送料について
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {shippingCostBearer === "corporate" ? (
                  <>
                    <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-accent/20">
                      <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <div className="flex-grow">
                        <p className="text-sm sm:text-base text-[#3A3A3A] mb-2">
                          <strong>返送料は法人様のご負担となります（元払い）</strong>
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          展示期間が180日以内のため、返送時の送料は貴社にてご負担いただきます。
                        </p>
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-700 space-y-2">
                      <p className="flex items-start gap-2">
                        <span className="text-accent mt-0.5">✓</span>
                        <span>返却申請後、MGJが配送業者に自動で集荷を手配します</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-accent mt-0.5">✓</span>
                        <span>作品到着時と同じ梱包箱をご使用ください</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-accent mt-0.5">✓</span>
                        <span>2〜3営業日以内に配送業者が集荷に伺います</span>
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-orange-200">
                      <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-grow">
                        <p className="text-sm sm:text-base text-[#3A3A3A] mb-2">
                          <strong>返送料はアーティストのご負担となります（着払い）</strong>
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          展示期間が180日を超えているため、返送時の送料はアーティストが負担いたします。
                        </p>
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-700 space-y-2">
                      <p className="flex items-start gap-2">
                        <span className="text-orange-600 mt-0.5">✓</span>
                        <span>返却申請後、MGJが配送業者に自動で集荷を手配します</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-orange-600 mt-0.5">✓</span>
                        <span>作品到着時と同じ梱包箱をご使用ください</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-orange-600 mt-0.5">✓</span>
                        <span>2〜3営業日以内に配送業者が集荷に伺います</span>
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* 返却理由 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>返却理由</CardTitle>
                <CardDescription>該当する理由を選択してください</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={returnReason} onValueChange={setReturnReason}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="change" id="change" />
                      <Label htmlFor="change" className="flex-grow cursor-pointer">
                        別の作品に変更したい
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="season" id="season" />
                      <Label htmlFor="season" className="flex-grow cursor-pointer">
                        季節やイベントに合わせて変更したい
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="space" id="space" />
                      <Label htmlFor="space" className="flex-grow cursor-pointer">
                        展示スペースを変更する予定
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="end" id="end" />
                      <Label htmlFor="end" className="flex-grow cursor-pointer">
                        展示を終了したい
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other" className="flex-grow cursor-pointer">
                        その他
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </motion.div>

          {/* 追加コメント */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>追加コメント（任意）</CardTitle>
                <CardDescription>返却に関する補足情報があればご記入ください</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={additionalComments}
                  onChange={(e) => setAdditionalComments(e.target.value)}
                  placeholder="例：次回は明るい色調の作品を希望します"
                  className="min-h-[120px] resize-none"
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* 返却条件の確認 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="border-accent/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-accent">
                  <AlertCircle className="w-5 h-5" />
                  返却条件の確認
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-xs sm:text-sm text-gray-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-accent flex-shrink-0" />
                    <p>作品は申請から<strong>7〜10営業日以内</strong>に返却手続きが完了します</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-accent flex-shrink-0" />
                    <p>返却時の梱包・配送はアーティストが手配します</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-accent flex-shrink-0" />
                    <p>作品に破損や汚れがある場合は、事前に「破損・不具合を報告」から連絡してください</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    />
                    <Label htmlFor="terms" className="cursor-pointer leading-relaxed text-sm">
                      上記の返却条件を確認し、同意します
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* アクションボタン */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-end"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/corporate-space/${spaceId}`)}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={!returnReason || !agreedToTerms || isSubmitting}
              className="bg-accent hover:bg-accent/90 min-w-[160px] w-full sm:w-auto"
            >
              {isSubmitting ? "送信中..." : "返却申請を送信"}
            </Button>
          </motion.div>
        </form>
      </main>

      <Footer />
    </div>
  );
}


