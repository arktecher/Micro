import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  ArrowRight,
  User,
  Mail,
  Phone,
  Lock,
  CheckCircle,
  ArrowLeft,
  Shield,
  Sparkles,
  AlertCircle,
  Flag,
  Loader2,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { RecaptchaBadge } from "@/components/common/RecaptchaBadge";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";

const STEPS = [
  { id: 1, title: "基本情報", description: "アカウント情報の入力" },
];

interface AgreementData {
  copyright: boolean;
  ai: boolean;
  commercial: boolean;
  report: boolean;
}

export function ArtistSignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Agreement checkboxes
  const [agreeCopyright, setAgreeCopyright] = useState(false);
  const [agreeAI, setAgreeAI] = useState(false);
  const [agreeCommercial, setAgreeCommercial] = useState(false);
  const [agreeReport, setAgreeReport] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

  const progress = (currentStep / STEPS.length) * 100;

  const isFormValid =
    agreeCopyright &&
    agreeAI &&
    agreeCommercial &&
    agreeReport &&
    name &&
    email &&
    password &&
    password === confirmPassword;

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid) {
      toast.error("すべての必須項目を入力してください");
      return;
    }

    setIsSubmitting(true);

    try {
      const registrationData = {
        name,
        birth_date: birthDate || null,
        email,
        phone: phone || null,
        password,
        agreements: {
          copyright: agreeCopyright,
          ai: agreeAI,
          commercial: agreeCommercial,
          report: agreeReport,
        },
      };

      // Call backend API
      const response = await api.post<{
        access_token: string;
        token_type: string;
        user: {
          id: string;
          email: string;
          user_type: string;
          name: string;
        };
      }>("/auth/signup/artist", registrationData);

      // Store access token
      if (response.access_token) {
        localStorage.setItem("mgj_access_token", response.access_token);
      }

      // Login user with AuthContext
      login("artist", {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
      });

      toast.success("アカウントが作成されました");
      navigate("/signup/artist/welcome");
    } catch (error: any) {
      console.error("Signup error:", error);
      
      // Handle specific error messages
      if (error.message.includes("already registered") || error.message.includes("already exists")) {
        toast.error("このメールアドレスは既に登録されています");
      } else if (error.message.includes("password")) {
        toast.error("パスワードは8文字以上である必要があります");
      } else {
        toast.error(error.message || "アカウント作成に失敗しました。もう一度お試しください。");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream/30 via-white to-gray-50">
      <Header />

      <div className="pt-20 sm:pt-24 pb-12 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          {/* Welcome Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8 sm:mb-12 text-center"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 mb-4 sm:mb-6">
              <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-primary mb-3 sm:mb-4 px-2">
              ようこそ、マイクロギャラリーへ
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto px-2">
              あなたの作品を待っている人がいます。<br className="hidden sm:block" />
              まずは、あなたのことを教えてください。
            </p>
          </motion.div>

          {/* Progress Bar */}
          <Card className="bg-white mb-6 sm:mb-8">
            <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
              <div className="mb-4 sm:mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-xs sm:text-sm text-gray-600">
                    ステップ {currentStep} / {STEPS.length}
                  </span>
                  <span className="text-xs sm:text-sm text-accent">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {STEPS.map((step) => (
                  <div
                    key={step.id}
                    className={`text-center transition-all ${
                      step.id === currentStep
                        ? "opacity-100"
                        : step.id < currentStep
                        ? "opacity-70"
                        : "opacity-40"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 transition-colors ${
                        step.id < currentStep
                          ? "bg-green-500 text-white"
                          : step.id === currentStep
                          ? "bg-accent text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {step.id < currentStep ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span>{step.id}</span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-primary mb-1">
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 hidden sm:block">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Form */}
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="bg-white shadow-xl border-2">
                  <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <User className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                      基本情報
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base mt-1">
                      アカウント作成に必要な情報を入力してください
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm sm:text-base flex items-center gap-2">
                        <User className="w-4 h-4 text-accent" />
                        お名前
                      </Label>
                      <input
                        id="name"
                        type="text"
                        placeholder="山田 太郎"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="flex h-10 sm:h-12 w-full rounded-md border border-input bg-white px-3 py-1 text-sm sm:text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>

                    {/* Birth Date */}
                    <div className="space-y-2">
                      <Label htmlFor="birthDate" className="text-sm sm:text-base">
                        生年月日
                      </Label>
                      <input
                        id="birthDate"
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="flex h-10 sm:h-12 w-full rounded-md border border-input bg-white px-3 py-1 text-sm sm:text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm sm:text-base flex items-center gap-2">
                        <Mail className="w-4 h-4 text-accent" />
                        メールアドレス
                      </Label>
                      <input
                        id="email"
                        type="email"
                        placeholder="example@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex h-10 sm:h-12 w-full rounded-md border border-input bg-white px-3 py-1 text-sm sm:text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      <p className="text-xs text-gray-500">
                        ※ サイト上では非公開です
                      </p>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm sm:text-base flex items-center gap-2">
                        <Phone className="w-4 h-4 text-accent" />
                        電話番号
                      </Label>
                      <input
                        id="phone"
                        type="tel"
                        placeholder="090-1234-5678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="flex h-10 sm:h-12 w-full rounded-md border border-input bg-white px-3 py-1 text-sm sm:text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      <p className="text-xs text-gray-500">
                        ※ サイト上では非公開です
                      </p>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm sm:text-base flex items-center gap-2">
                        <Lock className="w-4 h-4 text-accent" />
                        パスワード
                      </Label>
                      <input
                        id="password"
                        type="password"
                        placeholder="8文字以上"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="flex h-10 sm:h-12 w-full rounded-md border border-input bg-white px-3 py-1 text-sm sm:text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm sm:text-base flex items-center gap-2">
                        <Lock className="w-4 h-4 text-accent" />
                        パスワード（確認）
                      </Label>
                      <input
                        id="confirmPassword"
                        type="password"
                        placeholder="パスワードを再入力"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="flex h-10 sm:h-12 w-full rounded-md border border-input bg-white px-3 py-1 text-sm sm:text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      {confirmPassword && password !== confirmPassword && (
                        <p className="text-xs sm:text-sm text-red-500">
                          パスワードが一致しません
                        </p>
                      )}
                    </div>

                    {/* Terms Agreement */}
                    <div className="pt-4 sm:pt-6 border-t space-y-4 sm:space-y-6">
                      <h3 className="text-base sm:text-lg text-primary flex items-center gap-2">
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                        利用規約への同意（必須）
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600">
                        以下の項目について、内容を確認の上、同意いただく必要があります。
                      </p>

                      {/* Copyright Agreement */}
                      <div
                        className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-blue-50/50 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100/50 transition-colors"
                        onClick={() => setAgreeCopyright(!agreeCopyright)}
                      >
                        <Checkbox
                          id="agreeCopyright"
                          checked={agreeCopyright}
                          onCheckedChange={(checked) =>
                            setAgreeCopyright(checked as boolean)
                          }
                          className="mt-0.5 sm:mt-1 pointer-events-none flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <Label
                            htmlFor="agreeCopyright"
                            className="cursor-pointer text-sm sm:text-base flex items-center gap-2 pointer-events-none"
                          >
                            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                            <span className="break-words">著作権保証</span>
                          </Label>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                            登録する作品が自己のオリジナル作品であり、第三者の著作権・知的財産権を侵害していないことを保証します。
                          </p>
                        </div>
                      </div>

                      {/* AI Agreement */}
                      <div
                        className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-purple-50/50 rounded-lg border border-purple-200 cursor-pointer hover:bg-purple-100/50 transition-colors"
                        onClick={() => setAgreeAI(!agreeAI)}
                      >
                        <Checkbox
                          id="agreeAI"
                          checked={agreeAI}
                          onCheckedChange={(checked) =>
                            setAgreeAI(checked as boolean)
                          }
                          className="mt-0.5 sm:mt-1 pointer-events-none flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <Label
                            htmlFor="agreeAI"
                            className="cursor-pointer text-sm sm:text-base flex items-center gap-2 pointer-events-none"
                          >
                            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 flex-shrink-0" />
                            <span className="break-words">AI生成物の明示義務</span>
                          </Label>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                            AI技術を使用して生成・加工した作品を投稿する場合、必ず「AI生成作品」フラグをONにすることに同意します。
                          </p>
                        </div>
                      </div>

                      {/* Commercial Agreement */}
                      <div
                        className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-green-50/50 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100/50 transition-colors"
                        onClick={() => setAgreeCommercial(!agreeCommercial)}
                      >
                        <Checkbox
                          id="agreeCommercial"
                          checked={agreeCommercial}
                          onCheckedChange={(checked) =>
                            setAgreeCommercial(checked as boolean)
                          }
                          className="mt-0.5 sm:mt-1 pointer-events-none flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <Label
                            htmlFor="agreeCommercial"
                            className="cursor-pointer text-sm sm:text-base flex items-center gap-2 pointer-events-none"
                          >
                            <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                            <span className="break-words">商用利用許可</span>
                          </Label>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                            作品の販売・展示・リースを許可し、マイクロギャラリープラットフォーム上での作品画像掲載に同意します。
                          </p>
                        </div>
                      </div>

                      {/* Report Agreement */}
                      <div
                        className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-orange-50/50 rounded-lg border border-orange-200 cursor-pointer hover:bg-orange-100/50 transition-colors"
                        onClick={() => setAgreeReport(!agreeReport)}
                      >
                        <Checkbox
                          id="agreeReport"
                          checked={agreeReport}
                          onCheckedChange={(checked) =>
                            setAgreeReport(checked as boolean)
                          }
                          className="mt-0.5 sm:mt-1 pointer-events-none flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <Label
                            htmlFor="agreeReport"
                            className="cursor-pointer text-sm sm:text-base flex items-center gap-2 pointer-events-none"
                          >
                            <Flag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600 flex-shrink-0" />
                            <span className="break-words">通報・削除ポリシー</span>
                          </Label>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                            利用規約違反の作品は通報・削除される可能性があること、およびMicro Galleryの通報・削除ポリシーに同意します。
                          </p>
                        </div>
                      </div>

                      {/* Validation Message */}
                      {!agreeCopyright ||
                      !agreeAI ||
                      !agreeCommercial ||
                      !agreeReport ? (
                        <div className="p-3 sm:p-4 bg-red-50 border-l-4 border-red-500 rounded">
                          <p className="text-xs sm:text-sm text-red-700">
                            全ての項目に同意いただく必要があります。
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <Card className="bg-white mt-4 sm:mt-6">
            <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1 || isSubmitting}
                  className="w-full sm:w-auto px-6 order-2 sm:order-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  戻る
                </Button>

                <Button
                  onClick={handleNext}
                  className="bg-primary hover:bg-primary/90 w-full sm:w-auto px-6 sm:px-8 flex items-center justify-center gap-2 order-1 sm:order-2"
                  disabled={!isFormValid || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>登録中...</span>
                    </>
                  ) : (
                    <>
                      <span>登録を完了する</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>

              {/* reCAPTCHA Badge */}
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100">
                <RecaptchaBadge />
              </div>
            </CardContent>
          </Card>

          {/* Support Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8 sm:mt-12 text-center"
          >
            <Card className="bg-gradient-to-r from-cream/30 to-transparent border-0 shadow-none">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  ご不明な点やご質問がございましたら、お気軽にお問い合わせください。<br className="hidden sm:block" />
                  <a
                    href="mailto:support@microgalleryjapan.com"
                    className="text-primary hover:underline break-all sm:break-normal"
                  >
                    support@microgalleryjapan.com
                  </a>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

