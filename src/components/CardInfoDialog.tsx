import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Lock } from "lucide-react";
import { toast } from "sonner";

interface CardInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CardInfoDialog({ open, onOpenChange }: CardInfoDialogProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(" ") : cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, "");
    if (value.length <= 16 && /^\d*$/.test(value)) {
      setCardNumber(formatCardNumber(value));
    }
  };

  const handleExpiryMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 2 && /^\d*$/.test(value)) {
      const num = parseInt(value);
      if (value === "" || (num >= 1 && num <= 12)) {
        setExpiryMonth(value);
      }
    }
  };

  const handleExpiryYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 2 && /^\d*$/.test(value)) {
      setExpiryYear(value);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setCvv(value);
    }
  };

  const handleSave = () => {
    // バリデーション
    if (!cardNumber || !cardHolder || !expiryMonth || !expiryYear || !cvv) {
      toast.error("すべての項目を入力してください");
      return;
    }

    if (cardNumber.replace(/\s/g, "").length !== 16) {
      toast.error("カード番号は16桁で入力してください");
      return;
    }

    if (cvv.length < 3) {
      toast.error("セキュリティコードを正しく入力してください");
      return;
    }

    // 保存処理（モック）
    toast.success("カード情報を更新しました");
    onOpenChange(false);
    
    // フォームをクリア
    setCardNumber("");
    setCardHolder("");
    setExpiryMonth("");
    setExpiryYear("");
    setCvv("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            クレジットカード情報の変更
          </DialogTitle>
          <DialogDescription>
            返送料などの支払いに使用するカードを登録してください
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* カード番号 */}
          <div className="space-y-2">
            <Label htmlFor="cardNumber">カード番号</Label>
            <Input
              id="cardNumber"
              value={cardNumber}
              onChange={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
            />
          </div>

          {/* カード名義 */}
          <div className="space-y-2">
            <Label htmlFor="cardHolder">カード名義人（ローマ字）</Label>
            <Input
              id="cardHolder"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
              placeholder="TARO YAMADA"
            />
          </div>

          {/* 有効期限とCVV */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>有効期限</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={expiryMonth}
                  onChange={handleExpiryMonthChange}
                  placeholder="MM"
                  maxLength={2}
                  className="text-center"
                />
                <span className="text-gray-400">/</span>
                <Input
                  value={expiryYear}
                  onChange={handleExpiryYearChange}
                  placeholder="YY"
                  maxLength={2}
                  className="text-center"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvv">セキュリティコード</Label>
              <Input
                id="cvv"
                type="password"
                value={cvv}
                onChange={handleCvvChange}
                placeholder="123"
                maxLength={4}
              />
            </div>
          </div>

          {/* セキュリティ情報 */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Lock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-900">
                <p className="mb-1">安全な決済</p>
                <p className="text-xs text-green-700">
                  カード情報は暗号化されて安全に保存されます。MGJがカード番号を保存することはありません。
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              onOpenChange(false);
              // フォームをクリア
              setCardNumber("");
              setCardHolder("");
              setExpiryMonth("");
              setExpiryYear("");
              setCvv("");
            }}
          >
            キャンセル
          </Button>
          <Button
            className="flex-1 bg-primary hover:bg-primary/90"
            onClick={handleSave}
          >
            保存する
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

