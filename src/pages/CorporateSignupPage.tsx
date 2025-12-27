import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Building2,
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  Upload,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Home,
  Coffee,
  Briefcase,
  Hospital,
  UtensilsCrossed,
  MoreHorizontal,
  Plus,
  X,
  Image as ImageIcon,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RecaptchaBadge } from "@/components/common/RecaptchaBadge";

const STEPS = [
  { id: 1, title: "基本情報", description: "会社・担当者情報の入力" },
  { id: 2, title: "スペース登録", description: "展示場所の情報登録" },
];

const FACILITY_TYPES = [
  {
    id: "hotel",
    label: "ホテル",
    icon: Home,
    subTypes: ["ロビー", "客室", "会議室", "レストラン", "廊下", "その他"],
  },
  {
    id: "office",
    label: "オフィス",
    icon: Briefcase,
    subTypes: [
      "受付",
      "会議室",
      "エントランス",
      "ワーキングスペース",
      "廊下",
      "休憩室",
      "その他",
    ],
  },
  {
    id: "hospital",
    label: "病院・クリニック",
    icon: Hospital,
    subTypes: ["待合室", "受付", "診察室", "廊下", "ホール", "その他"],
  },
  {
    id: "cafe",
    label: "飲食店・カフェ",
    icon: Coffee,
    subTypes: ["店内", "入口", "トイレ前", "待合", "個室", "その他"],
  },
  {
    id: "salon",
    label: "美容室",
    icon: UtensilsCrossed,
    subTypes: ["フロアー", "受付", "その他"],
  },
  {
    id: "other",
    label: "その他",
    icon: MoreHorizontal,
    subTypes: ["エントランス", "ホール", "廊下", "会議室", "その他"],
  },
];

interface SpaceImage {
  file: File;
  preview: string;
}

interface Space {
  id: string;
  facilityType: string;
  facilityTypeOther: string;
  subType: string;
  subTypeOther: string;
  spaceName: string;
  location: string;
  uploadedImages: SpaceImage[];
  isRegistered: boolean;
}

export function CorporateSignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const isAddSpaceMode = searchParams.get("addSpace") === "true";

  const [currentStep, setCurrentStep] = useState(isAddSpaceMode ? 2 : 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  // Step 1: 基本情報
  const [companyName, setCompanyName] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 2: スペース登録（複数対応）
  const [spaces, setSpaces] = useState<Space[]>([
    {
      id: crypto.randomUUID(),
      facilityType: "",
      facilityTypeOther: "",
      subType: "",
      subTypeOther: "",
      spaceName: "",
      location: "",
      uploadedImages: [],
      isRegistered: false,
    },
  ]);

  // プログレス計算
  const progress = (currentStep / STEPS.length) * 100;

  // セッションストレージのキー
  const SESSION_KEY = "corporateSignupFormData";

  // 初回マウント時にsessionStorageからデータを復元
  useEffect(() => {
    const savedData = sessionStorage.getItem(SESSION_KEY);
    if (savedData && !isAddSpaceMode) {
      try {
        const parsed = JSON.parse(savedData);
        setCompanyName(parsed.companyName || "");
        setPostalCode(parsed.postalCode || "");
        setCompanyAddress(parsed.companyAddress || "");
        setContactName(parsed.contactName || "");
        setEmail(parsed.email || "");
        setPhone(parsed.phone || "");
        setPassword(parsed.password || "");
        setConfirmPassword(parsed.confirmPassword || "");
        setCurrentStep(parsed.currentStep || 1);

        if (parsed.spaces) {
          setSpaces(
            parsed.spaces.map((space: any) => ({
              ...space,
              uploadedImages: [],
              isRegistered: false,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to restore session data:", error);
      }
    }
  }, []);

  // フォームデータが変更されたらsessionStorageに保存
  useEffect(() => {
    if (!isAddSpaceMode) {
      const formData = {
        companyName,
        postalCode,
        companyAddress,
        contactName,
        email,
        phone,
        password,
        confirmPassword,
        currentStep,
        spaces: spaces.map((space) => ({
          ...space,
          uploadedImages: [],
        })),
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(formData));
    }
  }, [
    companyName,
    postalCode,
    companyAddress,
    contactName,
    email,
    phone,
    password,
    confirmPassword,
    currentStep,
    spaces,
    isAddSpaceMode,
  ]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

  // スペース追加モードの時、既存の会社情報を読み込む
  useEffect(() => {
    if (isAddSpaceMode) {
      const savedSpaces = JSON.parse(
        localStorage.getItem("mgj_registered_spaces") || "[]"
      );
      if (savedSpaces.length > 0) {
        const firstSpace = savedSpaces[0];
        if (firstSpace.location) {
          setCompanyAddress(firstSpace.location);
        }
      }
    }
  }, [isAddSpaceMode]);

  // コンポーネントがアンマウントされる時に画像URLを解放
  useEffect(() => {
    return () => {
      spaces.forEach((space) => {
        space.uploadedImages.forEach((image) => {
          URL.revokeObjectURL(image.preview);
        });
      });
    };
  }, []);

  // 郵便番号から住所を取得
  const fetchAddressFromPostalCode = async (code: string) => {
    const cleanCode = code.replace(/-/g, "");

    if (cleanCode.length === 7) {
      setIsLoadingAddress(true);
      try {
        const response = await fetch(
          `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleanCode}`
        );
        const data = await response.json();

        if (data.results && data.results.length > 0) {
          const result = data.results[0];
          const fullAddress = `${result.address1}${result.address2}${result.address3}`;
          setCompanyAddress(fullAddress);
          toast.success("住所を自動入力しました", {
            description: "必要に応じて番地・建物名を追加してください",
          });
        } else {
          toast.error("住所が見つかりませんでした", {
            description: "郵便番号を確認してください",
          });
        }
      } catch (error) {
        toast.error("住所の取得に失敗しました");
      } finally {
        setIsLoadingAddress(false);
      }
    }
  };

  // 郵便番号の変更をハンドル
  const handlePostalCodeChange = (value: string) => {
    const formatted = value.replace(/[^\d-]/g, "");
    setPostalCode(formatted);

    const cleanCode = formatted.replace(/-/g, "");
    if (cleanCode.length === 7) {
      fetchAddressFromPostalCode(formatted);
    }
  };

  // 会社住所が変更されたら、全スペースの所在地を自動更新（初期状態のみ）
  useEffect(() => {
    if (companyAddress) {
      setSpaces((prev) =>
        prev.map((space) => ({
          ...space,
          location: space.location === "" ? companyAddress : space.location,
        }))
      );
    }
  }, [companyAddress]);

  const canProceedStep1 = true;

  const canProceedStep2 = true;

  const canProceedStep3 = true;

  const handleNext = () => {
    if (currentStep === 1) {
      login("corporate", {
        id: `CRP-${Date.now()}`,
        name: contactName,
        email: email,
      });
      setShowWelcome(true);
      window.scrollTo(0, 0);
    } else if (currentStep < STEPS.length) {
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
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    login("corporate", {
      id: `CRP-${Date.now()}`,
      name: contactName,
      email: email,
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    setIsSubmitting(false);
    setShowSuccess(true);
  };

  const addSpace = () => {
    setSpaces((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        facilityType: "",
        facilityTypeOther: "",
        subType: "",
        subTypeOther: "",
        spaceName: "",
        location: companyAddress,
        uploadedImages: [],
        isRegistered: false,
      },
    ]);
  };

  const removeSpace = (id: string) => {
    if (spaces.length > 1) {
      setSpaces((prev) => prev.filter((space) => space.id !== id));
    }
  };

  const updateSpace = (id: string, field: keyof Space, value: any) => {
    setSpaces((prev) =>
      prev.map((space) => (space.id === id ? { ...space, [field]: value } : space))
    );
  };

  const copyCompanyAddress = (spaceId: string) => {
    updateSpace(spaceId, "location", companyAddress);
  };

  const registerSpace = (spaceId: string) => {
    const space = spaces.find((s) => s.id === spaceId);
    if (!space) return;

    updateSpace(spaceId, "isRegistered", true);

    const selectedFacility = FACILITY_TYPES.find(
      (f) => f.id === space.facilityType
    );
    const facilityTypeLabel =
      space.facilityType === "other"
        ? space.facilityTypeOther
        : selectedFacility?.label || space.facilityType;

    const subTypeLabel =
      space.subType === "その他" ? space.subTypeOther : space.subType;

    const savedSpaces = JSON.parse(
      localStorage.getItem("mgj_registered_spaces") || "[]"
    );
    const uploadedImages = space.uploadedImages.map((img) => img.preview);
    const newSpace = {
      id: space.id,
      name: space.spaceName,
      facilityType: facilityTypeLabel,
      subType: subTypeLabel,
      location: space.location,
      images: uploadedImages,
      image:
        uploadedImages.length > 0
          ? uploadedImages[0]
          : "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
      status: "未選択" as const,
      hasAIProposal: false,
      currentArtwork: null,
      pastArtworks: [],
      totalSales: 0,
      totalRevenue: 0,
      registeredAt: new Date().toISOString(),
    };

    savedSpaces.push(newSpace);
    localStorage.setItem("mgj_registered_spaces", JSON.stringify(savedSpaces));

    toast.success("スペースを登録しました！", {
      description: "ダッシュボードでアート作品を選択できます。",
    });
    setTimeout(() => {
      navigate("/corporate-dashboard", { state: { openTab: "spaces" } });
    }, 1500);
  };

  const handleImageUpload = async (
    spaceId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    const space = spaces.find((s) => s.id === spaceId);
    if (files && space && space.uploadedImages.length < 3) {
      const newImages = Array.from(files).slice(
        0,
        3 - space.uploadedImages.length
      );
      
      // Create preview URLs with HEIC conversion
      const { createImagePreviewUrl } = await import("@/lib/heicConverter");
      const imageObjects: SpaceImage[] = await Promise.all(
        newImages.map(async (file) => {
          try {
            const preview = await createImagePreviewUrl(file);
            return { file, preview };
          } catch (error) {
            console.error("Error creating preview:", error);
            return { file, preview: URL.createObjectURL(file) };
          }
        })
      );
      
      updateSpace(spaceId, "uploadedImages", [
        ...space.uploadedImages,
        ...imageObjects,
      ]);
    }
  };

  const removeImage = (spaceId: string, imageIndex: number) => {
    const space = spaces.find((s) => s.id === spaceId);
    if (space) {
      const newImages = [...space.uploadedImages];
      URL.revokeObjectURL(newImages[imageIndex].preview);
      newImages.splice(imageIndex, 1);
      updateSpace(spaceId, "uploadedImages", newImages);
    }
  };

  // ウェルカム画面（Step 1完了後）
  if (showWelcome) {
    return (
      <div className="min-h-screen bg-[#F8F6F1]">
        <Header />

        <section className="min-h-screen flex items-center justify-center px-4 pt-20 sm:pt-24 pb-12 sm:pb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl w-full text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#C3A36D] to-[#D4B478] rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8"
            >
              <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-4xl md:text-5xl text-[#3A3A3A] mb-3 sm:mb-4"
            >
              🎉 サインアップ完了！
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8"
            >
              {companyName}様、ようこそMicro Gallery Japanへ！
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 shadow-lg"
            >
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-[#C3A36D]" />
                <h2 className="text-xl sm:text-2xl text-[#3A3A3A]">
                  次のステップ
                </h2>
              </div>
              <p className="text-base sm:text-lg text-gray-700 mb-4 sm:mb-6">
                あなたの空間を登録して、AIが最適なアート作品を提案します
              </p>
              <div className="grid gap-3 sm:gap-4 text-left">
                {[
                  {
                    step: "1",
                    title: "スペース情報を登録",
                    description: "展示場所の写真と詳細を入力（2分で完了）",
                  },
                  {
                    step: "2",
                    title: "AIが作品を提案",
                    description: "空間に合ったアート作品を自動でセレクト",
                  },
                  {
                    step: "3",
                    title: "展示開始",
                    description: "作品が届き次第、すぐに展示・販売がスタート",
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-[#F8F6F1] rounded-lg"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#C3A36D] text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-sm sm:text-base">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base text-[#3A3A3A] mb-1">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
            >
              <Button
                onClick={() => {
                  setShowWelcome(false);
                  setCurrentStep(2);
                }}
                className="bg-gradient-to-r from-[#C3A36D] to-[#D4B478] hover:opacity-90 px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg"
              >
                <span>スペース登録へ進む</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/corporate-dashboard")}
                className="px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg"
              >
                後で登録する
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-xs sm:text-sm text-gray-500 mt-4 sm:mt-6"
            >
              スペース登録は後からダッシュボードで追加できます
            </motion.p>
          </motion.div>
        </section>

        <Footer />
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-[#F8F6F1]">
        <Header />

        <section className="min-h-screen flex items-center justify-center px-4 pt-20 sm:pt-24 pb-12 sm:pb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl w-full text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#C3A36D] to-[#D4B478] rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8"
            >
              <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-4xl md:text-5xl text-[#3A3A3A] mb-3 sm:mb-4"
            >
              🎉 すべて完了しました！
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg sm:text-xl text-gray-600 mb-2 sm:mb-3"
            >
              あなたの空間が、今日からアートの舞台になります。
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-base sm:text-lg text-gray-600 mb-8 sm:mb-12"
            >
              次は、展示したいアートを選びましょう。
              <br className="hidden sm:block" />
              写真をアップロードすると、AIが最適な作品を提案します。
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#C3A36D] to-[#D4B478] hover:opacity-90 text-base sm:text-lg px-6 sm:px-8"
                onClick={() => navigate("/corporate-dashboard")}
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>アートを選ぶ</span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base sm:text-lg px-6 sm:px-8"
                onClick={() => navigate("/corporate-dashboard")}
              >
                <span>マイページに進む</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 sm:mt-12 p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl border-2 border-[#C3A36D]/20"
            >
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                💡 あなたの壁が、次の展示スペースになります。
                <br className="hidden sm:block" />
                アーティストと共に、新しい価値を創造していきましょう。
              </p>
            </motion.div>
          </motion.div>
        </section>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F1]">
      <Header />

      <div className="container mx-auto px-4 pt-16 sm:pt-20 md:pt-24 pb-6 sm:pb-8 max-w-4xl">
        {/* スペース追加モードの戻るボタン */}
        {isAddSpaceMode && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-4 sm:mb-6"
          >
            <Button
              variant="ghost"
              onClick={() =>
                navigate("/corporate-dashboard", { state: { openTab: "spaces" } })
              }
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              ダッシュボードに戻る
            </Button>
          </motion.div>
        )}

        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl text-[#3A3A3A] mb-2 sm:mb-3">
            {isAddSpaceMode
              ? "新しいスペースを追加"
              : "マイクロギャラリーを始める"}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {isAddSpaceMode
              ? "別の場所にもアートを飾りましょう。"
              : "あなたの空間を、アートが彩ります。"}
          </p>
        </motion.div>

        {/* プログレスバー */}
        {!isAddSpaceMode && (
          <Card className="bg-white mb-6 sm:mb-8">
            <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
              <div className="mb-4 sm:mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-xs sm:text-sm text-gray-600">
                    ステップ {currentStep} / {STEPS.length}
                  </span>
                  <span className="text-xs sm:text-sm text-[#C3A36D]">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
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
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mx-auto mb-2 transition-colors ${
                        step.id < currentStep
                          ? "bg-green-500 text-white"
                          : step.id === currentStep
                          ? "bg-[#C3A36D] text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {step.id < currentStep ? (
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <span className="text-sm sm:text-base">{step.id}</span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-[#3A3A3A] mb-1">
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
        )}

        {/* フォーム */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="bg-white">
                <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#C3A36D]" />
                    基本情報
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-gray-600 mt-2">
                    会社と担当者の情報を入力してください
                  </p>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">
                  {/* 会社名 */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="companyName"
                      className="flex items-center gap-2 text-sm sm:text-base"
                    >
                      <Building2 className="w-4 h-4 text-[#C3A36D]" />
                      施設名・店舗名
                    </Label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="例：株式会社〇〇、レストラン花、〇〇総合病院"
                      className="h-11 sm:h-12 text-sm sm:text-base"
                    />
                    <p className="text-xs text-gray-500">
                      ※
                      オフィスの場合は会社名、レストラン・カフェはお店の名前、病院は病院名を入力してください
                    </p>
                  </div>

                  {/* 郵便番号 */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="postalCode"
                      className="flex items-center gap-2 text-sm sm:text-base"
                    >
                      <MapPin className="w-4 h-4 text-[#C3A36D]" />
                      郵便番号
                    </Label>
                    <Input
                      id="postalCode"
                      value={postalCode}
                      onChange={(e) => handlePostalCodeChange(e.target.value)}
                      placeholder="123-4567"
                      className="h-11 sm:h-12 text-sm sm:text-base"
                      maxLength={8}
                      disabled={isLoadingAddress}
                    />
                    <p className="text-xs text-gray-500">
                      {isLoadingAddress
                        ? "住所を取得中..."
                        : "7桁入力すると自動で住所が入力されます"}
                    </p>
                  </div>

                  {/* 会社住所 */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="companyAddress"
                      className="flex items-center gap-2 text-sm sm:text-base"
                    >
                      <MapPin className="w-4 h-4 text-[#C3A36D]" />
                      会社住所
                    </Label>
                    <Input
                      id="companyAddress"
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                      placeholder="東京都渋谷区〇〇1-2-3 ○○ビル4F"
                      className="h-11 sm:h-12 text-sm sm:text-base"
                    />
                    <p className="text-xs text-gray-500">
                      郵便番号から自動入力後、番地・建物名を追加してください
                    </p>
                  </div>

                  {/* 担当者名 */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="contactName"
                      className="flex items-center gap-2 text-sm sm:text-base"
                    >
                      <User className="w-4 h-4 text-[#C3A36D]" />
                      担当者名
                    </Label>
                    <Input
                      id="contactName"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="山田 太郎"
                      className="h-11 sm:h-12 text-sm sm:text-base"
                    />
                    <p className="text-xs text-gray-500">
                      まずは1名を登録してください。登録後、マイページから複数の担当者追加できます
                    </p>
                  </div>

                  {/* メールアドレス */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="flex items-center gap-2 text-sm sm:text-base"
                    >
                      <Mail className="w-4 h-4 text-[#C3A36D]" />
                      メールアドレス
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contact@example.com"
                      className="h-11 sm:h-12 text-sm sm:text-base"
                    />
                  </div>

                  {/* 電話番号 */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="flex items-center gap-2 text-sm sm:text-base"
                    >
                      <Phone className="w-4 h-4 text-[#C3A36D]" />
                      電話番号{" "}
                      <span className="text-gray-400 text-xs">(任意)</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="03-1234-5678"
                      className="h-11 sm:h-12 text-sm sm:text-base"
                    />
                  </div>

                  {/* パスワード */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="flex items-center gap-2 text-sm sm:text-base"
                    >
                      <Lock className="w-4 h-4 text-[#C3A36D]" />
                      パスワード
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="8文字以上"
                      className="h-11 sm:h-12 text-sm sm:text-base"
                    />
                  </div>

                  {/* パスワード確認 */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="flex items-center gap-2 text-sm sm:text-base"
                    >
                      <Lock className="w-4 h-4 text-[#C3A36D]" />
                      パスワード（確認）
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="パスワードを再入力"
                      className="h-11 sm:h-12 text-sm sm:text-base"
                    />
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs sm:text-sm text-red-500">
                        パスワードが一致しません
                      </p>
                    )}
                  </div>

                  {/* メール認証の説明 */}
                  <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs sm:text-sm text-blue-700 flex items-start gap-2">
                      <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>
                        次のステップで、入力されたメールアドレスに確認メールをお送りします。
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3 sm:space-y-4"
            >
              {/* ヘッダー */}
              <div className="flex items-center justify-between p-4 sm:p-6 bg-white rounded-xl border-2 border-[#C3A36D]/20">
                <div>
                  <h3 className="text-lg sm:text-xl text-[#3A3A3A] flex items-center gap-2">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-[#C3A36D]" />
                    スペース登録
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    複数のスペースを登録できます。後で追加・編集も可能です。
                  </p>
                </div>
                <Badge className="bg-[#C3A36D] text-white px-2 sm:px-3 py-1 text-xs sm:text-sm">
                  {spaces.length}件
                </Badge>
              </div>

              {/* スペース追加ボタン */}
              <Button
                onClick={addSpace}
                variant="outline"
                className="w-full border-2 border-dashed border-[#C3A36D]/30 hover:border-[#C3A36D] hover:bg-[#C3A36D]/5"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>スペースを追加</span>
              </Button>

              {/* スペースカード */}
              {spaces.map((space, index) => {
                const selectedFacility = FACILITY_TYPES.find(
                  (f) => f.id === space.facilityType
                );

                return (
                  <Card
                    key={space.id}
                    className={`bg-white border-2 ${
                      space.isRegistered
                        ? "border-green-500 bg-green-50/30"
                        : "border-gray-200"
                    }`}
                  >
                    <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                            <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#C3A36D]" />
                            スペース {index + 1}
                          </CardTitle>
                          {space.isRegistered && (
                            <Badge className="bg-green-500 text-white text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              登録済み
                            </Badge>
                          )}
                        </div>
                        {spaces.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSpace(space.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-5 px-4 sm:px-6 pb-4 sm:pb-6">
                      {/* 施設概要（大分類） */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm sm:text-base">
                          <Briefcase className="w-4 h-4 text-[#C3A36D]" />
                          施設概要
                        </Label>
                        <Select
                          value={space.facilityType}
                          onValueChange={(value) => {
                            updateSpace(space.id, "facilityType", value);
                            updateSpace(space.id, "subType", "");
                            updateSpace(space.id, "facilityTypeOther", "");
                          }}
                        >
                          <SelectTrigger className="h-11 sm:h-12 text-sm sm:text-base">
                            <SelectValue placeholder="施設タイプを選択" />
                          </SelectTrigger>
                          <SelectContent>
                            {FACILITY_TYPES.map((facility) => {
                              const Icon = facility.icon;
                              return (
                                <SelectItem key={facility.id} value={facility.id}>
                                  <div className="flex items-center gap-2">
                                    <Icon className="w-4 h-4" />
                                    {facility.label}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>

                        {/* その他を選択した場合の自由記述 */}
                        {space.facilityType === "other" && (
                          <Textarea
                            value={space.facilityTypeOther}
                            onChange={(e) =>
                              updateSpace(
                                space.id,
                                "facilityTypeOther",
                                e.target.value
                              )
                            }
                            placeholder="施設タイプを入力してください（例：美術館、図書館、など）"
                            className="text-sm sm:text-base mt-2"
                            rows={2}
                          />
                        )}
                      </div>

                      {/* 具体的な場所（小分類） */}
                      {space.facilityType && selectedFacility && (
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2 text-sm sm:text-base">
                            <MapPin className="w-4 h-4 text-[#C3A36D]" />
                            具体的な場所
                          </Label>
                          <Select
                            value={space.subType}
                            onValueChange={(value) => {
                              updateSpace(space.id, "subType", value);
                              updateSpace(space.id, "subTypeOther", "");
                            }}
                          >
                            <SelectTrigger className="h-11 sm:h-12 text-sm sm:text-base">
                              <SelectValue placeholder="場所を選択" />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedFacility.subTypes.map((subType) => (
                                <SelectItem key={subType} value={subType}>
                                  {subType}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* その他を選択した場合の自由記述 */}
                          {space.subType === "その他" && (
                            <Textarea
                              value={space.subTypeOther}
                              onChange={(e) =>
                                updateSpace(
                                  space.id,
                                  "subTypeOther",
                                  e.target.value
                                )
                              }
                              placeholder="具体的な場所を入力してください（例：屋上テラス、地下駐車場、など）"
                              className="text-sm sm:text-base mt-2"
                              rows={2}
                            />
                          )}
                        </div>
                      )}

                      {/* スペース名 */}
                      <div className="space-y-2">
                        <Label
                          htmlFor={`spaceName-${space.id}`}
                          className="flex items-center gap-2 text-sm sm:text-base"
                        >
                          <Home className="w-4 h-4 text-[#C3A36D]" />
                          スペース名（自分用）
                        </Label>
                        <Input
                          id={`spaceName-${space.id}`}
                          value={space.spaceName}
                          onChange={(e) =>
                            updateSpace(space.id, "spaceName", e.target.value)
                          }
                          placeholder="例：1階エントランス、会議室A"
                          className="h-11 sm:h-12 text-sm sm:text-base"
                        />
                        <p className="text-xs text-gray-500">
                          後で管理しやすいように、わかりやすい名前を付けてください
                        </p>
                      </div>

                      {/* 所在地 */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor={`location-${space.id}`}
                            className="flex items-center gap-2 text-sm sm:text-base"
                          >
                            <MapPin className="w-4 h-4 text-[#C3A36D]" />
                            所在地
                          </Label>
                          {!isAddSpaceMode && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyCompanyAddress(space.id)}
                              className="text-xs sm:text-sm h-auto py-1"
                            >
                              会社住所をコピー
                            </Button>
                          )}
                        </div>
                        <Input
                          id={`location-${space.id}`}
                          value={space.location}
                          onChange={(e) =>
                            updateSpace(space.id, "location", e.target.value)
                          }
                          placeholder="例：東京都渋谷区"
                          className="h-11 sm:h-12 text-sm sm:text-base"
                        />
                        <p className="text-xs text-gray-500">
                          会社住所と異なる場合のみ変更してください
                        </p>
                      </div>

                      {/* 写真アップロード */}
                      <div className="space-y-2 sm:space-y-3">
                        <Label className="flex items-center gap-2 text-sm sm:text-base">
                          <ImageIcon className="w-4 h-4 text-[#C3A36D]" />
                          スペースの写真{" "}
                          <span className="text-gray-400 text-xs">
                            (任意・最大3枚)
                          </span>
                        </Label>

                        <div className="grid grid-cols-3 gap-2 sm:gap-4">
                          {space.uploadedImages.map((image, imgIndex) => (
                            <div
                              key={imgIndex}
                              className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 group"
                            >
                              <img
                                src={image.preview}
                                alt={`スペース写真 ${imgIndex + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(space.id, imgIndex)}
                                className="absolute top-1 right-1 sm:top-2 sm:right-2 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                              >
                                <X className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          ))}
                          {space.uploadedImages.length < 3 && (
                            <label className="aspect-square border-2 border-dashed border-[#C3A36D]/30 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#C3A36D] hover:bg-[#C3A36D]/5 transition-all">
                              <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-[#C3A36D] mb-1 sm:mb-2" />
                              <span className="text-xs text-gray-600">
                                アップロード
                              </span>
                              <input
                                type="file"
                                accept="image/*,.heic,.heif"
                                multiple
                                className="hidden"
                                onChange={(e) => handleImageUpload(space.id, e)}
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      {/* 次のステップ案内 */}
                      {!space.isRegistered && (
                        <div className="p-3 sm:p-4 bg-gradient-to-r from-[#C3A36D]/10 to-[#D4B478]/10 border border-[#C3A36D]/20 rounded-lg">
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#C3A36D]/20 flex items-center justify-center flex-shrink-0">
                              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[#C3A36D]" />
                            </div>
                            <div>
                              <h4 className="text-xs sm:text-sm text-[#3A3A3A] mb-1">
                                次のステップ
                              </h4>
                              <p className="text-xs text-gray-700">
                                スペースを登録後、次のページでAIがあなたの空間に最適なアート作品の傾向を提案します。
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* この場所を登録するボタン */}
                      <div className="pt-2 sm:pt-4">
                        <Button
                          onClick={() => registerSpace(space.id)}
                          disabled={space.isRegistered}
                          className={`w-full h-11 sm:h-12 text-sm sm:text-base ${
                            space.isRegistered
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-[#C3A36D] hover:bg-[#B8975F]"
                          } text-white`}
                        >
                          {space.isRegistered ? (
                            <>
                              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span>登録完了</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span>この場所を登録する</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ナビゲーションボタン（Step 2以外で表示） */}
        {currentStep !== 2 && (
          <Card className="bg-white mt-4 sm:mt-6">
            <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="px-4 sm:px-6 h-10 sm:h-11"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>戻る</span>
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && !canProceedStep1) ||
                    (currentStep === 2 && !canProceedStep2) ||
                    (currentStep === 3 && !canProceedStep3) ||
                    isSubmitting
                  }
                  className="bg-gradient-to-r from-[#C3A36D] to-[#D4B478] hover:opacity-90 px-6 sm:px-8 h-10 sm:h-11 text-sm sm:text-base"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>登録中...</span>
                    </>
                  ) : currentStep === STEPS.length ? (
                    <>
                      登録完了
                      <CheckCircle className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      <span>次へ</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>

              {/* reCAPTCHA v3 バッジ */}
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100">
                <RecaptchaBadge />
              </div>
            </CardContent>
          </Card>
        )}

        {/* 補足情報 */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-600">
            すでにアカウントをお持ちですか？
            <Button
              variant="link"
              className="text-[#C3A36D] p-0 ml-1 h-auto text-xs sm:text-sm"
              onClick={() => navigate("/login")}
            >
              ログイン
            </Button>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}

