import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Building2,
  CreditCard,
  User,
  ArrowLeft,
  Shield,
  CheckCircle,
  AlertCircle,
  Palette,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function BankAccountEditPage() {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  // フォームの状態
  const [formData, setFormData] = useState({
    accountType: "普通",
    bankName: "",
    branchName: "",
    accountNumber: "",
    accountHolderKana: "",
  });

  // ページ遷移時に一番上にスクロール
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    // バリデーション
    if (
      !formData.bankName ||
      !formData.branchName ||
      !formData.accountNumber ||
      !formData.accountHolderKana
    ) {
      toast.error("すべての項目を入力してください。");
      return;
    }

    // 保存処理（実際にはAPIコール）
    console.log("Saving bank account info:", formData);
    setIsSaved(true);
    toast.success("口座情報を保存しました");

    // 2秒後にダッシュボードに戻る
    setTimeout(() => {
      navigate("/dashboard");
    }, 2000);
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  const isFormValid =
    formData.bankName &&
    formData.branchName &&
    formData.accountNumber &&
    formData.accountHolderKana;

  return (
    <div className="min-h-screen bg-[#F8F6F1]">
      <Header />

      <div className="container mx-auto px-4 py-12 sm:py-16 md:py-24 max-w-3xl">
        {/* 戻るボタン */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 sm:mb-6"
        >
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            マイページに戻る
          </Button>
        </motion.div>

        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-8"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#C3A36D] to-[#D4B478] rounded-full mb-3 sm:mb-4">
            <Palette className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <Badge className="bg-[#C3A36D] text-white text-xs sm:text-sm">
              アーティスト
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl text-[#3A3A3A] mb-2 sm:mb-3 px-2">
            銀行口座情報の編集
          </h1>
          <p className="text-base sm:text-lg text-gray-600 px-2">
            作品の売上金を受け取る口座情報を登録してください
          </p>
        </motion.div>

        {/* 保存完了メッセージ */}
        {isSaved && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 sm:mb-6"
          >
            <Card className="bg-green-50 border-2 border-green-500">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm sm:text-base text-green-900">
                      口座情報を保存しました！
                    </p>
                    <p className="text-xs sm:text-sm text-green-700">
                      マイページに戻ります...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* セキュリティ情報 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Card className="mb-4 sm:mb-6 bg-blue-50/50 border-2 border-blue-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-2 sm:gap-3">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm text-blue-900 mb-1">
                    <strong>この情報は安全に保護されます</strong>
                  </p>
                  <p className="text-xs sm:text-sm text-blue-700 leading-relaxed">
                    口座情報は暗号化され、MGJのシステム内で厳重に管理されます。作品が購入された際の入金にのみ使用され、第三者に公開されることはありません。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* フォーム */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Card className="shadow-xl border-2 border-[#C3A36D]/20">
            <CardHeader className="border-b bg-gradient-to-r from-white to-[#F8F6F1] px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl flex-wrap">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#C3A36D]" />
                口座情報
                <Badge variant="outline" className="ml-2 text-xs">
                  非公開
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
              {/* 口座種別 */}
              <div className="space-y-2">
                <Label htmlFor="accountType" className="text-sm sm:text-base">
                  口座種別 <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.accountType}
                  onValueChange={(value) => handleInputChange("accountType", value)}
                >
                  <SelectTrigger id="accountType" className="h-11 sm:h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="普通">普通</SelectItem>
                    <SelectItem value="当座">当座</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 銀行名 */}
              <div className="space-y-2">
                <Label htmlFor="bankName" className="text-sm sm:text-base">
                  銀行名 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="bankName"
                  type="text"
                  placeholder="例：三菱UFJ銀行"
                  value={formData.bankName}
                  onChange={(e) => handleInputChange("bankName", e.target.value)}
                  className="h-11 sm:h-12 text-sm sm:text-base"
                />
                <p className="text-xs sm:text-sm text-gray-500">
                  正式な銀行名を入力してください
                </p>
              </div>

              {/* 支店名 */}
              <div className="space-y-2">
                <Label htmlFor="branchName" className="text-sm sm:text-base">
                  支店名 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="branchName"
                  type="text"
                  placeholder="例：渋谷支店"
                  value={formData.branchName}
                  onChange={(e) => handleInputChange("branchName", e.target.value)}
                  className="h-11 sm:h-12 text-sm sm:text-base"
                />
              </div>

              {/* 口座番号 */}
              <div className="space-y-2">
                <Label htmlFor="accountNumber" className="text-sm sm:text-base">
                  口座番号 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="accountNumber"
                  type="text"
                  placeholder="例：1234567"
                  value={formData.accountNumber}
                  onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                  className="h-11 sm:h-12 text-sm sm:text-base"
                  maxLength={7}
                />
                <p className="text-xs sm:text-sm text-gray-500">
                  7桁の口座番号を入力してください
                </p>
              </div>

              {/* 口座名義（カナ） */}
              <div className="space-y-2">
                <Label htmlFor="accountHolderKana" className="text-sm sm:text-base">
                  口座名義（カナ） <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="accountHolderKana"
                  type="text"
                  placeholder="例：ヤマダタロウ"
                  value={formData.accountHolderKana}
                  onChange={(e) =>
                    handleInputChange("accountHolderKana", e.target.value.toUpperCase())
                  }
                  className="h-11 sm:h-12 text-sm sm:text-base"
                />
                <p className="text-xs sm:text-sm text-gray-500">
                  全角カタカナで入力してください（姓と名の間にスペースは不要です）
                </p>
              </div>

              {/* 注意事項 */}
              <div className="bg-orange-50 border-l-4 border-orange-500 p-3 sm:p-4 rounded">
                <div className="flex items-start gap-2 sm:gap-3">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm text-orange-900 mb-1">
                      <strong>入力前にご確認ください</strong>
                    </p>
                    <ul className="text-xs sm:text-sm text-orange-800 space-y-1 list-disc list-inside">
                      <li>
                        通帳やキャッシュカードに記載された情報と完全に一致するように入力してください
                      </li>
                      <li>口座名義は必ず全角カタカナで入力してください</li>
                      <li>入力ミスがあると入金できない場合があります</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* ボタン */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6">
                <Button
                  onClick={handleSave}
                  disabled={!isFormValid || isSaved}
                  className="bg-gradient-to-r from-[#C3A36D] to-[#D4B478] hover:opacity-90 flex-1 h-11 sm:h-12 text-sm sm:text-base disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  保存する
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaved}
                  className="flex-1 h-11 sm:h-12 text-sm sm:text-base"
                >
                  キャンセル
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* サポート情報 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-6 sm:mt-8 text-center"
        >
          <Card className="bg-white/50">
            <CardContent className="p-4 sm:p-6">
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                ご不明な点やご質問がございましたら、お気軽にお問い合わせください。
                <br className="hidden sm:block" />
                <a
                  href="mailto:support@microgalleryjapan.com"
                  className="text-[#C3A36D] hover:underline break-all sm:break-normal"
                >
                  support@microgalleryjapan.com
                </a>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}

