import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Package, Calendar, AlertCircle, Building2 } from "lucide-react";

interface Artwork {
  id: string;
  name: string;
  location: string;
  exhibitStart: string;
  price: number;
}

interface ArtistReturnRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artwork: Artwork | null;
}

export function ArtistReturnRequestDialog({ open, onOpenChange, artwork }: ArtistReturnRequestDialogProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("返却理由を入力してください");
      return;
    }

    setIsSubmitting(true);
    
    // TODO: API呼び出し
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("返却依頼を送信しました", {
        description: "法人様とMicro Galleryに通知メールが送信されました"
      });
      onOpenChange(false);
      setReason("");
    }, 1000);
  };

  const handleClose = () => {
    setReason("");
    onOpenChange(false);
  };

  if (!artwork) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-[#C3A36D]" />
            作品の返却依頼
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            展示中の作品の返却を法人様に依頼します。依頼後、法人様とMicro Galleryに通知メールが送信されます。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-4 sm:py-6">
          {/* 作品情報 */}
          <Card className="border-2 border-gray-200">
            <CardContent className="pt-4 sm:pt-6">
              <div className="space-y-3">
                <div>
                  <h3 className="text-base sm:text-lg text-[#3A3A3A] mb-1">{artwork.name}</h3>
                  <p className="text-sm text-gray-600">¥{artwork.price.toLocaleString()}</p>
                </div>
                <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 flex-shrink-0" />
                    <span className="break-words">{artwork.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    展示開始: {artwork.exhibitStart}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 注意事項 */}
          <Card className="border-2 border-blue-200 bg-blue-50/30">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-grow space-y-2 text-xs sm:text-sm text-gray-700">
                  <p className="text-blue-700 font-semibold">返却依頼について</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>返却依頼を送信すると、法人様とMicro Galleryに通知メールが送信されます</li>
                    <li>法人様が返却手続きを進めると、自動で返送ラベルが発行されます</li>
                    <li>返送費用は展示期間により法人負担または着払いとなります</li>
                    <li>返却の進捗状況はダッシュボードで確認できます</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 返却理由 */}
          <div>
            <Label className="text-sm sm:text-base mb-2 sm:mb-3 block">
              返却理由 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="返却理由を入力してください&#10;&#10;例：&#10;・新しい作品を展示したいため&#10;・作品の修正が必要なため&#10;・展示期間が十分だったため"
              className="min-h-[120px] sm:min-h-[150px] resize-none text-sm sm:text-base"
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              法人様とMicro Galleryに送信される内容です。具体的な理由を記載してください。
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting} className="text-sm sm:text-base">
            キャンセル
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!reason.trim() || isSubmitting}
            className="bg-[#C3A36D] hover:bg-[#C3A36D]/90 min-w-[160px] text-sm sm:text-base"
          >
            {isSubmitting ? "送信中..." : "返却依頼を送信"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

