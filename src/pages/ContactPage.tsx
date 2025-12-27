import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Check, Upload, X } from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RecaptchaBadge } from "@/components/common/RecaptchaBadge";

type ContactFormData = {
  category: string;
  name: string;
  email: string;
  message: string;
};

export function ContactPage() {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<ContactFormData>({
    category: "",
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleInputChange = (
    field: keyof ContactFormData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};

    if (!formData.category) {
      newErrors.category = "選択してください";
    }
    if (!formData.name) {
      newErrors.name = "必須項目です";
    }
    if (!formData.email) {
      newErrors.email = "必須項目です";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = "正しい形式で入力してください";
    }
    if (!formData.message) {
      newErrors.message = "必須項目です";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // モック送信処理（2秒待機）
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("Form data:", formData);
    console.log("Attached file:", selectedFile);

    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success("お問い合わせを送信しました");
  };

  // Helper function to check if file is an image (including HEIC)
  const isImageFile = (file: File): boolean => {
    // Check MIME type
    if (file.type.startsWith("image/")) {
      return true;
    }
    // Check file extension for HEIC/HEIF (some browsers don't set MIME type correctly)
    const fileName = file.name.toLowerCase();
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'];
    return validExtensions.some(ext => fileName.endsWith(ext));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 画像ファイルのみ許可（HEIC/HEIF含む）
      if (!isImageFile(file)) {
        toast.error("画像ファイルのみアップロード可能です（JPG, PNG, HEIC等）");
        return;
      }
      // 5MB以下
      if (file.size > 5 * 1024 * 1024) {
        toast.error("ファイルサイズは5MB以下にしてください");
        return;
      }
      setSelectedFile(file);
      
      // Create preview URL (with HEIC conversion if needed)
      try {
        const { createImagePreviewUrl } = await import("@/lib/heicConverter");
        const previewUrl = await createImagePreviewUrl(file);
        setImagePreview(previewUrl);
      } catch (error) {
        console.error("Error creating preview:", error);
        // Fallback to regular object URL
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
      }
    }
  };

  const removeFile = () => {
    // Clean up preview URL
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedFile(null);
    setImagePreview(null);
  };

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleBackToForm = () => {
    // Clean up preview URL
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setIsSubmitted(false);
    setFormData({
      category: "",
      name: "",
      email: "",
      message: "",
    });
    setSelectedFile(null);
    setImagePreview(null);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-24">
        <div className="max-w-[640px] mx-auto px-4 sm:px-6">
          {!isSubmitted ? (
            <>
              {/* ヘッダー */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8 sm:mb-12 text-center"
              >
                <h1 className="text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-3 text-primary">
                  お問い合わせ
                </h1>
                <p className="text-sm sm:text-base text-gray-500">
                  ご質問・ご相談など、お気軽にお問い合わせください。
                </p>
              </motion.div>

              {/* フォーム */}
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                onSubmit={handleSubmit}
                className="space-y-6 sm:space-y-8"
              >
                {/* お問い合わせ種別 */}
                <div>
                  <Label htmlFor="category" className="text-sm sm:text-base">
                    お問い合わせ内容を選択してください
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange("category", value)}
                  >
                    <SelectTrigger
                      id="category"
                      className={`h-11 sm:h-12 ${
                        errors.category ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">一般のお問い合わせ</SelectItem>
                      <SelectItem value="purchase">作品購入に関するお問い合わせ</SelectItem>
                      <SelectItem value="corporate">法人の方</SelectItem>
                      <SelectItem value="artist">アーティスト登録について</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="mt-1 text-xs sm:text-sm text-red-500">
                      {errors.category}
                    </p>
                  )}
                </div>

                {/* お名前 */}
                <div>
                  <Label htmlFor="name" className="text-sm sm:text-base">
                    お名前
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`h-11 sm:h-12 ${
                      errors.name ? "border-red-500" : ""
                    }`}
                    placeholder="山田 太郎"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs sm:text-sm text-red-500">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* メールアドレス */}
                <div>
                  <Label htmlFor="email" className="text-sm sm:text-base">
                    メールアドレス
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`h-11 sm:h-12 ${
                      errors.email ? "border-red-500" : ""
                    }`}
                    placeholder="example@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs sm:text-sm text-red-500">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* メッセージ */}
                <div>
                  <Label htmlFor="message" className="text-sm sm:text-base">
                    お問い合わせ内容
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    rows={6}
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    className={`resize-none ${
                      errors.message ? "border-red-500" : ""
                    }`}
                    placeholder="お問い合わせ内容をご記入ください"
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs sm:text-sm text-red-500">
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* 添付ファイル */}
                <div>
                  <Label className="text-sm sm:text-base">
                    添付ファイル（任意）
                  </Label>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 sm:p-8 text-center hover:border-gray-300 transition-colors">
                    {selectedFile && imagePreview ? (
                      <div className="space-y-3 sm:space-y-4">
                        {/* Image Preview */}
                        <div className="relative w-full max-w-md mx-auto">
                          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                            <img
                              src={imagePreview}
                              alt="アップロードされた画像"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          {/* Remove button overlay */}
                          <button
                            type="button"
                            onClick={removeFile}
                            className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-md text-gray-400 hover:text-red-500"
                            aria-label="ファイルを削除"
                          >
                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                        {/* File name */}
                        <div className="flex items-center justify-center gap-2 sm:gap-3 bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg">
                          <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                          <span className="text-xs sm:text-sm text-gray-700 truncate">
                            {selectedFile.name}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <label htmlFor="file" className="cursor-pointer">
                        <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-xs sm:text-sm text-gray-500 mb-1">
                          クリックしてファイルを選択
                        </p>
                        <p className="text-xs text-gray-400">
                          画像ファイル（JPG, PNG, HEIC等）のみ / 最大5MB
                        </p>
                        <input
                          id="file"
                          type="file"
                          accept="image/*,.heic,.heif"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* 送信ボタン */}
                <div className="pt-2 sm:pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 sm:px-12 py-3 bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {isSubmitting ? "送信中..." : "送信する"}
                  </Button>
                </div>
              </motion.form>
              <div className="mt-6 sm:mt-8">
                <RecaptchaBadge />
              </div>
            </>
          ) : (
            /* サンクス画面 */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center py-12 sm:py-16"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Check className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl mb-3 sm:mb-4 text-primary">
                お問い合わせを受け付けました
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                内容を確認の上、担当者よりご連絡いたします。
              </p>
              <Button
                onClick={handleBackToForm}
                variant="ghost"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                ← トップページに戻る
              </Button>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

