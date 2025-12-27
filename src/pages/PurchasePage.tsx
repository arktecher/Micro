import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight, CreditCard, ShieldCheck, CheckCircle2, Sparkles, Package, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";

// モックデータ
const mockArtwork = {
  id: "artwork-001",
  title: "静寂の風景",
  artist: {
    name: "山田太郎",
    message: "私の作品を選んでくださってありがとうございます。あなたの空間に新しい物語が生まれることを願っています。"
  },
  price: 280000,
  image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=600&fit=crop",
  size: {
    width: 72.7,
    height: 53.0,
    depth: 2.0,
  },
  weight: 3.5,
  estimatedDelivery: "2〜3週間",
  venue: {
    name: "株式会社サンプル　本社ビル",
    location: "1階エントランスホール",
    contact: {
      name: "山田 太郎",
      department: "施設管理部",
      phone: "03-1234-5678",
      email: "yamada@sample-corp.jp"
    }
  }
};

type FormData = {
  deliveryMethod: "pickup" | "delivery";
  name: string;
  email: string;
  phone?: string;
  postalCode: string;
  prefecture: string;
  city: string;
  address: string;
  building?: string;
  notes?: string;
  paymentMethod: "card" | "apple-pay";
  cardNumber?: string;
  cardName?: string;
  expiryDate?: string;
  cvv?: string;
  saveCard?: boolean;
};

export function PurchasePage() {
  const navigate = useNavigate();
  const { artworkId } = useParams();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    deliveryMethod: "delivery",
    paymentMethod: "card",
    saveCard: false,
    name: "",
    email: "",
    phone: "",
    postalCode: "",
    prefecture: "",
    city: "",
    address: "",
    building: "",
    notes: "",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: ""
  });

  const paymentMethod = formData.paymentMethod;
  const deliveryMethod = formData.deliveryMethod;
  
  const SHIPPING_FEE = 1500;
  const shippingCost = deliveryMethod === "delivery" ? SHIPPING_FEE : 0;
  const totalPrice = mockArtwork.price + shippingCost;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [currentStep]);

  useEffect(() => {
    const handlePopState = () => {
      if (currentStep > 1) {
        setCurrentStep((prev) => prev - 1);
      } else {
        const from = location.state?.from;
        if (from) {
          navigate(from);
        } else {
          navigate(`/artwork/${artworkId}`);
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [currentStep, navigate, artworkId, location.state]);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const onSubmitStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(2);
    window.history.pushState({ step: 2 }, "");
  };

  const onSubmitStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(3);
    window.history.pushState({ step: 3 }, "");
  };

  const onSubmitStep3 = () => {
    setTimeout(() => {
      setCurrentStep(4);
    }, 1000);
  };

  const handleClose = () => {
    const from = location.state?.from;
    if (from) {
      navigate(from);
    } else {
      navigate(`/artwork/${artworkId}`);
    }
  };

  const handleViewOtherWorks = () => {
    navigate("/artworks");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAFAFA] to-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50"
      >
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            {currentStep < 4 && (
              <>
                <span className="text-xs sm:text-sm text-gray-400">Step {currentStep} / 3</span>
                <Separator orientation="vertical" className="h-3 sm:h-4 bg-gray-300" />
              </>
            )}
            <h1 className="text-sm sm:text-base text-gray-900 tracking-wide">
              {currentStep === 1 && "受け取り方法"}
              {currentStep === 2 && "お支払い方法"}
              {currentStep === 3 && "ご注文の確認"}
              {currentStep === 4 && ""}
            </h1>
          </div>

          {currentStep < 4 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="rounded-full hover:bg-gray-100"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          )}
        </div>
      </motion.div>

      <div className="pt-16 sm:pt-20 pb-8 sm:pb-12">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="container mx-auto px-4 sm:px-6 max-w-5xl"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
                <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                  <div className="space-y-2">
                    <h2 className="text-xl sm:text-2xl text-[#222]">受け取り方法</h2>
                    <p className="text-xs sm:text-sm text-gray-500">作品の受け取り方法を選択してください</p>
                  </div>

                  <form onSubmit={onSubmitStep1} className="space-y-6 sm:space-y-8">
                    <div className="space-y-3 sm:space-y-4">
                      <label
                        className={`flex items-start gap-3 sm:gap-4 p-4 sm:p-6 rounded-xl border-2 cursor-pointer transition-all ${
                          deliveryMethod === "pickup"
                            ? "border-[#C6A05C] bg-[#C6A05C]/5 shadow-md"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <input
                          type="radio"
                          value="pickup"
                          checked={deliveryMethod === "pickup"}
                          onChange={(e) => handleInputChange("deliveryMethod", e.target.value)}
                          className="w-4 h-4 sm:w-5 sm:h-5 text-[#C6A05C] focus:ring-[#C6A05C] mt-0.5"
                        />
                        <Home className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 sm:gap-3 mb-1">
                            <p className="text-sm sm:text-base text-[#222]">その場で受け取り</p>
                            <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-green-100 text-green-700 text-[10px] sm:text-xs rounded-full">送料無料</span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                            展示場所で直接作品をお受け取りいただけます。配送を待つ必要がなく、すぐに作品をお持ち帰りいただけます。
                          </p>
                        </div>
                      </label>

                      <label
                        className={`flex items-start gap-3 sm:gap-4 p-4 sm:p-6 rounded-xl border-2 cursor-pointer transition-all ${
                          deliveryMethod === "delivery"
                            ? "border-[#C6A05C] bg-[#C6A05C]/5 shadow-md"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <input
                          type="radio"
                          value="delivery"
                          checked={deliveryMethod === "delivery"}
                          onChange={(e) => handleInputChange("deliveryMethod", e.target.value)}
                          className="w-4 h-4 sm:w-5 sm:h-5 text-[#C6A05C] focus:ring-[#C6A05C] mt-0.5"
                        />
                        <Package className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 sm:gap-3 mb-1">
                            <p className="text-sm sm:text-base text-[#222]">ご自宅へ配送</p>
                            <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 text-gray-700 text-[10px] sm:text-xs rounded-full">送料 ¥{SHIPPING_FEE.toLocaleString()}</span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                            ご指定の住所へ安全に梱包してお届けします。お届けまで約{mockArtwork.estimatedDelivery}かかります。
                          </p>
                        </div>
                      </label>
                    </div>

                    {deliveryMethod === "delivery" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-4 sm:space-y-6"
                      >
                        <Separator className="bg-gray-200/50" />
                        
                        <div className="space-y-2">
                          <h3 className="text-base sm:text-lg text-[#222]">お届け先情報</h3>
                          <p className="text-xs sm:text-sm text-gray-500">作品をお届けする住所を入力してください</p>
                        </div>
                    
                    <div>
                      <Label htmlFor="name" className="text-xs sm:text-sm text-gray-700 mb-2 block">
                        お名前
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="山田 太郎"
                        className="h-11 sm:h-12 bg-white border-gray-200 focus:border-[#C6A05C] transition-all"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-xs sm:text-sm text-gray-700 mb-2 block">
                        メールアドレス
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="example@email.com"
                        className="h-11 sm:h-12 bg-white border-gray-200 focus:border-[#C6A05C] transition-all"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-xs sm:text-sm text-gray-700 mb-2 block">
                        電話番号（任意）
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone || ""}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="090-1234-5678"
                        className="h-11 sm:h-12 bg-white border-gray-200 focus:border-[#C6A05C] transition-all"
                      />
                    </div>

                    <Separator className="bg-gray-200/50" />

                    <div>
                      <Label htmlFor="postalCode" className="text-xs sm:text-sm text-gray-700 mb-2 block">
                        郵便番号
                      </Label>
                      <Input
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange("postalCode", e.target.value)}
                        placeholder="123-4567"
                        className="h-11 sm:h-12 bg-white border-gray-200 focus:border-[#C6A05C] transition-all"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="prefecture" className="text-xs sm:text-sm text-gray-700 mb-2 block">
                        都道府県
                      </Label>
                      <Input
                        id="prefecture"
                        value={formData.prefecture}
                        onChange={(e) => handleInputChange("prefecture", e.target.value)}
                        placeholder="東京都"
                        className="h-11 sm:h-12 bg-white border-gray-200 focus:border-[#C6A05C] transition-all"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="city" className="text-xs sm:text-sm text-gray-700 mb-2 block">
                        市区町村
                      </Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        placeholder="渋谷区"
                        className="h-11 sm:h-12 bg-white border-gray-200 focus:border-[#C6A05C] transition-all"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="address" className="text-xs sm:text-sm text-gray-700 mb-2 block">
                        番地
                      </Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder="1-2-3"
                        className="h-11 sm:h-12 bg-white border-gray-200 focus:border-[#C6A05C] transition-all"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="building" className="text-xs sm:text-sm text-gray-700 mb-2 block">
                        建物名・部屋番号（任意）
                      </Label>
                      <Input
                        id="building"
                        value={formData.building || ""}
                        onChange={(e) => handleInputChange("building", e.target.value)}
                        placeholder="〇〇ビル 4F"
                        className="h-11 sm:h-12 bg-white border-gray-200 focus:border-[#C6A05C] transition-all"
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes" className="text-xs sm:text-sm text-gray-700 mb-2 block">
                        備考（任意）
                      </Label>
                      <Textarea
                        id="notes"
                        value={formData.notes || ""}
                        onChange={(e) => handleInputChange("notes", e.target.value)}
                        placeholder="プレゼント包装希望、配送時間帯のご希望など"
                        className="min-h-[80px] sm:min-h-[100px] bg-white border-gray-200 focus:border-[#C6A05C] transition-all resize-none text-xs sm:text-sm"
                      />
                    </div>
                      </motion.div>
                    )}

                    <div className="pt-2 sm:pt-4">
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full bg-[#222] hover:bg-[#333] text-white h-12 sm:h-14 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 group"
                      >
                        <span className="text-sm sm:text-base">次へ</span>
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </form>
                </div>

                <div className="lg:col-span-1">
                  <div className="lg:sticky lg:top-20 sm:top-24">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                      className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100"
                    >
                      <div className="aspect-[4/3] relative overflow-hidden bg-gray-50">
                        <ImageWithFallback
                          src={mockArtwork.image}
                          alt={mockArtwork.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 sm:p-6 space-y-2 sm:space-y-3">
                        <h3 className="text-base sm:text-lg text-[#222]">{mockArtwork.title}</h3>
                        <p className="text-xs sm:text-sm text-gray-500">{mockArtwork.artist.name}</p>
                        <Separator className="bg-gray-200/50" />
                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] sm:text-xs text-gray-500">作品価格</span>
                            <span className="text-sm sm:text-base text-[#222]">
                              ¥{mockArtwork.price.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] sm:text-xs text-gray-500">送料</span>
                            <span className="text-sm sm:text-base text-[#222]">
                              {shippingCost === 0 ? "無料" : `¥${shippingCost.toLocaleString()}`}
                            </span>
                          </div>
                          <Separator className="bg-gray-200/50" />
                          <div className="flex justify-between items-center pt-1">
                            <span className="text-xs sm:text-sm text-gray-700">合計（税込）</span>
                            <span className="text-xl sm:text-2xl text-[#222]">
                              ¥{totalPrice.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="container mx-auto px-4 sm:px-6 max-w-3xl"
            >
              <div className="space-y-6 sm:space-y-8">
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl text-[#222]">お支払い方法</h2>
                  <p className="text-xs sm:text-sm text-gray-500">ご希望のお支払い方法を選択してください</p>
                </div>

                <form onSubmit={onSubmitStep2} className="space-y-4 sm:space-y-6">
                    <div className="space-y-2 sm:space-y-3">
                      <label
                        className={`flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-lg border-2 cursor-pointer transition-all ${
                          paymentMethod === "card"
                            ? "border-[#C6A05C] bg-[#C6A05C]/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          value="card"
                          checked={paymentMethod === "card"}
                          onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
                          className="w-4 h-4 sm:w-5 sm:h-5 text-[#C6A05C] focus:ring-[#C6A05C]"
                        />
                        <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                        <div className="flex-1">
                          <p className="text-xs sm:text-sm text-[#222]">クレジットカード</p>
                          <p className="text-[10px] sm:text-xs text-gray-500">Visa / Mastercard / Amex</p>
                        </div>
                      </label>

                      <label
                        className={`flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-lg border-2 cursor-pointer transition-all ${
                          paymentMethod === "apple-pay"
                            ? "border-[#C6A05C] bg-[#C6A05C]/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          value="apple-pay"
                          checked={paymentMethod === "apple-pay"}
                          onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
                          className="w-4 h-4 sm:w-5 sm:h-5 text-[#C6A05C] focus:ring-[#C6A05C]"
                        />
                        <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
                          <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor">
                            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs sm:text-sm text-[#222]">Apple Pay</p>
                          <p className="text-[10px] sm:text-xs text-gray-500">簡単・安全なお支払い</p>
                        </div>
                      </label>
                    </div>

                    {paymentMethod === "card" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4 sm:space-y-6 pt-2 sm:pt-4"
                      >
                        <Separator className="bg-gray-200/50" />

                        <div>
                          <Label htmlFor="cardNumber" className="text-xs sm:text-sm text-gray-700 mb-2 block">
                            カード番号
                          </Label>
                          <Input
                            id="cardNumber"
                            value={formData.cardNumber || ""}
                            onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                            placeholder="1234 5678 9012 3456"
                            className="h-11 sm:h-12 bg-white border-gray-200 focus:border-[#C6A05C] transition-all"
                          />
                        </div>

                        <div>
                          <Label htmlFor="cardName" className="text-xs sm:text-sm text-gray-700 mb-2 block">
                            カード名義（ローマ字）
                          </Label>
                          <Input
                            id="cardName"
                            value={formData.cardName || ""}
                            onChange={(e) => handleInputChange("cardName", e.target.value)}
                            placeholder="TARO YAMADA"
                            className="h-11 sm:h-12 bg-white border-gray-200 focus:border-[#C6A05C] transition-all"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                          <div>
                            <Label htmlFor="expiryDate" className="text-xs sm:text-sm text-gray-700 mb-2 block">
                              有効期限
                            </Label>
                            <Input
                              id="expiryDate"
                              value={formData.expiryDate || ""}
                              onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                              placeholder="MM/YY"
                              className="h-11 sm:h-12 bg-white border-gray-200 focus:border-[#C6A05C] transition-all"
                            />
                          </div>

                          <div>
                            <Label htmlFor="cvv" className="text-xs sm:text-sm text-gray-700 mb-2 block">
                              CVC
                            </Label>
                            <Input
                              id="cvv"
                              value={formData.cvv || ""}
                              onChange={(e) => handleInputChange("cvv", e.target.value)}
                              placeholder="123"
                              maxLength={4}
                              className="h-11 sm:h-12 bg-white border-gray-200 focus:border-[#C6A05C] transition-all"
                            />
                          </div>
                        </div>

                        <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-blue-50 border border-blue-100 rounded-lg">
                          <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="text-[10px] sm:text-xs text-blue-900 leading-relaxed">
                            お支払い情報は暗号化されて安全に送信されます
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <Button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        variant="outline"
                        size="lg"
                        className="flex-1 h-12 sm:h-14 rounded-lg border-gray-300 hover:bg-gray-50"
                      >
                        <span className="text-sm sm:text-base">戻る</span>
                      </Button>
                      <Button
                        type="submit"
                        size="lg"
                        className="flex-1 bg-[#222] hover:bg-[#333] text-white h-12 sm:h-14 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 group"
                      >
                        <span className="text-sm sm:text-base">次へ</span>
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </form>
                </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="container mx-auto px-4 sm:px-6 max-w-4xl"
            >
              <div className="space-y-8 sm:space-y-12">
                <div className="text-center space-y-2 sm:space-y-3">
                  <h2 className="text-2xl sm:text-3xl text-[#222]">ご注文内容の確認</h2>
                  <p className="text-xs sm:text-sm text-gray-500">内容をご確認の上、確定してください</p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="bg-gradient-to-b from-gray-50 to-white p-6 sm:p-8 rounded-2xl border border-gray-100"
                >
                  <div className="flex flex-col md:flex-row gap-6 sm:gap-8">
                    <div className="md:w-1/2">
                      <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
                        <ImageWithFallback
                          src={mockArtwork.image}
                          alt={mockArtwork.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="md:w-1/2 flex flex-col justify-center space-y-3 sm:space-y-4">
                      <div>
                        <h3 className="text-xl sm:text-2xl text-[#222] mb-1 sm:mb-2">{mockArtwork.title}</h3>
                        <p className="text-sm sm:text-base text-gray-600">{mockArtwork.artist.name}</p>
                      </div>
                      <Separator className="bg-gray-200/50" />
                      <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">サイズ</span>
                          <span className="text-[#222]">
                            {mockArtwork.size.width} × {mockArtwork.size.height} cm
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">お届け予定</span>
                          <span className="text-[#222]">約{mockArtwork.estimatedDelivery}</span>
                        </div>
                      </div>
                      <Separator className="bg-gray-200/50" />
                      <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">作品価格</span>
                          <span className="text-[#222]">¥{mockArtwork.price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">送料</span>
                          <span className="text-[#222]">
                            {shippingCost === 0 ? "無料" : `¥${shippingCost.toLocaleString()}`}
                          </span>
                        </div>
                      </div>
                      <Separator className="bg-gray-200/50" />
                      <div className="flex justify-between items-end pt-1 sm:pt-2">
                        <span className="text-xs sm:text-sm text-gray-700">合計（税込）</span>
                        <span className="text-2xl sm:text-3xl text-[#222]">
                          ¥{totalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
                >
                  <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
                    <h4 className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 tracking-wide">受け取り方法</h4>
                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-[#222]">
                      {formData.deliveryMethod === "pickup" ? (
                        <>
                          <div className="flex items-center gap-2">
                            <Home className="w-3 h-3 sm:w-4 sm:h-4 text-[#C6A05C]" />
                            <span>その場で受け取り</span>
                          </div>
                          <p className="text-[10px] sm:text-xs text-gray-600 leading-relaxed">
                            展示場所で直接作品をお受け取りいただけます
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <Package className="w-3 h-3 sm:w-4 sm:h-4 text-[#C6A05C]" />
                            <span>ご自宅へ配送</span>
                          </div>
                          <Separator className="bg-gray-200/50" />
                          <div className="space-y-1.5 sm:space-y-2">
                            <p>{formData.name}</p>
                            <p>{formData.email}</p>
                            {formData.phone && <p>{formData.phone}</p>}
                            <Separator className="bg-gray-200/50 my-1 sm:my-2" />
                            <p>〒{formData.postalCode}</p>
                            <p>
                              {formData.prefecture} {formData.city} {formData.address}
                            </p>
                            {formData.building && <p>{formData.building}</p>}
                            {formData.notes && (
                              <>
                                <Separator className="bg-gray-200/50 my-1 sm:my-2" />
                                <p className="text-[10px] sm:text-xs text-gray-600">{formData.notes}</p>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
                    <h4 className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 tracking-wide">お支払い方法</h4>
                    <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-[#222]">
                      {formData.paymentMethod === "card" && (
                        <>
                          <p className="flex items-center gap-2">
                            <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                            <span>クレジットカード</span>
                          </p>
                          {formData.cardNumber && (
                            <p className="text-gray-600">
                              **** **** **** {formData.cardNumber.slice(-4)}
                            </p>
                          )}
                        </>
                      )}
                      {formData.paymentMethod === "apple-pay" && (
                        <p>Apple Pay</p>
                      )}
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-center"
                >
                  <p className="text-[10px] sm:text-xs text-gray-500 leading-relaxed">
                    ※ご注文確定後、アーティスト・ギャラリーに通知されます。
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-2xl mx-auto"
                >
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    variant="outline"
                    size="lg"
                    className="flex-1 h-12 sm:h-16 rounded-lg border-gray-300 hover:bg-gray-50"
                  >
                    <span className="text-sm sm:text-base">戻る</span>
                  </Button>
                  <Button
                    onClick={onSubmitStep3}
                    size="lg"
                    className="flex-1 bg-[#C6A05C] hover:bg-[#B89050] text-white h-12 sm:h-16 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 hover:scale-105"
                  >
                    <span className="text-base sm:text-lg tracking-wide">購入する</span>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="min-h-[calc(100vh-80px)] flex items-center justify-center"
            >
              <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
                <div className="text-center space-y-8 sm:space-y-12">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 150,
                      damping: 15,
                      delay: 0.2
                    }}
                    className="flex justify-center"
                  >
                    <div className="relative">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#C6A05C]/20 to-[#C6A05C]/5 flex items-center justify-center">
                        <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14 text-[#C6A05C]" />
                      </div>
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2"
                      >
                        <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-[#C6A05C]" />
                      </motion.div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    <h2 className="text-3xl sm:text-4xl text-[#222] leading-relaxed">
                      おめでとうございます
                    </h2>
                    <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                      この作品があなたのもとへ旅立ちます
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 1 }}
                    className="max-w-md mx-auto"
                  >
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                      <ImageWithFallback
                        src={mockArtwork.image}
                        alt={mockArtwork.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="mt-4 sm:mt-6 space-y-1.5 sm:space-y-2">
                      <h3 className="text-xl sm:text-2xl text-[#222]">{mockArtwork.title}</h3>
                      <p className="text-sm sm:text-base text-gray-600">{mockArtwork.artist.name}</p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="space-y-3 sm:space-y-4"
                  >
                    <div className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-[#C6A05C]/10 rounded-full">
                      {formData.deliveryMethod === "pickup" ? (
                        <div className="flex items-center gap-2">
                          <Home className="w-3 h-3 sm:w-4 sm:h-4 text-[#C6A05C]" />
                          <p className="text-xs sm:text-sm text-[#222]">
                            展示場所でお受け取りください
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Package className="w-3 h-3 sm:w-4 sm:h-4 text-[#C6A05C]" />
                          <p className="text-xs sm:text-sm text-[#222]">
                            約{mockArtwork.estimatedDelivery}でお届け予定
                          </p>
                        </div>
                      )}
                    </div>

                    {formData.deliveryMethod === "pickup" && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9, duration: 0.8 }}
                        className="max-w-2xl mx-auto"
                      >
                        <div className="p-4 sm:p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <Home className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                            <h4 className="text-xs sm:text-sm text-primary">受け取り場所</h4>
                          </div>
                          <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                            <div>
                              <p className="text-[10px] sm:text-xs text-gray-500 mb-1">展示施設</p>
                              <p className="text-[#222]">{mockArtwork.venue.name}</p>
                            </div>
                            <div>
                              <p className="text-[10px] sm:text-xs text-gray-500 mb-1">展示場所</p>
                              <p className="text-[#222]">{mockArtwork.venue.location}</p>
                            </div>
                            <Separator className="bg-gray-200/50" />
                            <div>
                              <p className="text-[10px] sm:text-xs text-gray-500 mb-1 sm:mb-2">担当者情報（お持ち帰り時にお声がけください）</p>
                              <div className="space-y-1.5 sm:space-y-2 pl-3 sm:pl-4 border-l-2 border-primary/30">
                                <p className="text-[#222]">
                                  {mockArtwork.venue.contact.department} {mockArtwork.venue.contact.name}様
                                </p>
                                <p className="text-[10px] sm:text-xs text-gray-600">
                                  電話: {mockArtwork.venue.contact.phone}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>

                  {formData.deliveryMethod === "pickup" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1, duration: 0.8 }}
                      className="max-w-2xl mx-auto"
                    >
                      <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500 animate-pulse" />
                          <p className="text-[10px] sm:text-xs text-blue-900 uppercase tracking-wider">
                            Micro Gallery 担当者様へ
                          </p>
                        </div>
                        <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-blue-900 leading-relaxed">
                          <p>
                            こちらのお客様は下記作品の決済を完了し、展示場所でのお持ち帰りをご希望されています。
                          </p>
                          <div className="p-3 sm:p-4 bg-white/60 rounded-lg border border-blue-100">
                            <p className="mb-1 sm:mb-2">
                              <span className="text-[10px] sm:text-xs text-blue-700">作品名：</span>
                              <span className="text-[#222]">{mockArtwork.title}</span>
                            </p>
                            <p className="mb-1 sm:mb-2">
                              <span className="text-[10px] sm:text-xs text-blue-700">作家名：</span>
                              <span className="text-[#222]">{mockArtwork.artist.name}</span>
                            </p>
                            <p>
                              <span className="text-[10px] sm:text-xs text-blue-700">購入者：</span>
                              <span className="text-[#222]">{formData.name || "未入力"}</span>
                            </p>
                          </div>
                          <p>
                            お持ち帰り用の絵画ボックスに入れてお渡しいただけますでしょうか。
                          </p>
                          <div className="pt-1 sm:pt-2 border-t border-blue-200">
                            <p className="text-[10px] sm:text-xs text-blue-700 mb-1">貴社担当者様</p>
                            <p className="text-[#222]">
                              {mockArtwork.venue.contact.department} {mockArtwork.venue.contact.name}様
                            </p>
                            <p className="text-[10px] sm:text-xs text-blue-700 mt-1 sm:mt-2">
                              電話: {mockArtwork.venue.contact.phone}<br />
                              メール: {mockArtwork.venue.contact.email}
                            </p>
                            <p className="text-[10px] sm:text-xs text-blue-600 mt-2 sm:mt-3 italic">
                              ※ この情報は {mockArtwork.venue.contact.email} 宛にメールでも送信されています
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: formData.deliveryMethod === "pickup" ? 1.2 : 1, duration: 0.8 }}
                    className="max-w-xl mx-auto"
                  >
                    <div className="p-6 sm:p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100">
                      <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider mb-2 sm:mb-3">
                        Message from Artist
                      </p>
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic">
                        {mockArtwork.artist.message}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-900 mt-3 sm:mt-4">
                        — {mockArtwork.artist.name}
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: formData.deliveryMethod === "pickup" ? 1.4 : 1.2, duration: 0.8 }}
                    className="space-y-3 sm:space-y-4 pt-4 sm:pt-8"
                  >
                    <Button
                      onClick={() => navigate("/")}
                      size="lg"
                      className="bg-[#222] hover:bg-[#333] text-white px-8 sm:px-12 h-12 sm:h-14 rounded-lg"
                    >
                      トップページへ
                    </Button>
                    <div>
                      <button
                        onClick={handleViewOtherWorks}
                        className="text-xs sm:text-sm text-gray-500 hover:text-[#C6A05C] underline underline-offset-4 transition-colors"
                      >
                        このアーティストの他の作品を見る
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}



