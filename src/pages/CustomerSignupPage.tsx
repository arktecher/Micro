import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RecaptchaBadge } from "@/components/common/RecaptchaBadge";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export function CustomerSignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      alert("パスワードが一致しません。");
      return;
    }

    // Login processing (mock) - pass user information
    login("customer", {
      name: formData.name,
      email: formData.email,
    });

    // Check for pending favorite artwork ID
    const pendingFavoriteId = localStorage.getItem("mgj_pending_favorite_artwork_id");
    const redirectPath = localStorage.getItem("mgj_redirect_after_signup");

    if (pendingFavoriteId) {
      // Add to favorites (mock)
      const favorites = JSON.parse(
        localStorage.getItem("mgj_customer_favorites") || "[]"
      );
      if (!favorites.includes(pendingFavoriteId)) {
        favorites.push(pendingFavoriteId);
        localStorage.setItem("mgj_customer_favorites", JSON.stringify(favorites));
      }

      // Dispatch event to update header numbers
      window.dispatchEvent(new Event("favoritesUpdated"));

      // Cleanup
      localStorage.removeItem("mgj_pending_favorite_artwork_id");
      localStorage.removeItem("mgj_redirect_after_signup");

      // Return to original page
      if (redirectPath) {
        navigate(redirectPath);
      } else {
        navigate("/my-page");
      }
    } else {
      // Normal signup goes to my page
      if (redirectPath) {
        navigate(redirectPath);
      } else {
        navigate("/my-page");
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Icon */}
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8B7355]/10 to-[#8B7355]/5 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-[#8B7355]" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl text-[#222] mb-2">
                新規登録
              </h1>
              <p className="text-sm text-gray-600">
                アカウントを作成して作品をお気に入り登録
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">お名前</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="山田 太郎"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="8文字以上"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  required
                  minLength={8}
                />
                <p className="text-xs text-gray-500">
                  半角英数字8文字以上で入力してください
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">パスワード（確認）</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="再度入力してください"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  required
                  minLength={8}
                />
              </div>

              {/* Terms of Service */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) =>
                    handleChange("agreeToTerms", checked as boolean)
                  }
                  required
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-gray-700 leading-relaxed cursor-pointer"
                >
                  <Link
                    to="/privacy-policy"
                    className="text-[#8B7355] hover:underline"
                  >
                    プライバシーポリシー
                  </Link>
                  および
                  <Link
                    to="/artist-terms"
                    className="text-[#8B7355] hover:underline ml-1"
                  >
                    利用規約
                  </Link>
                  に同意します
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#222] hover:bg-[#333] text-white h-11 sm:h-12"
                disabled={!formData.agreeToTerms}
              >
                アカウントを作成
              </Button>

              {/* reCAPTCHA v3 Badge */}
              <div className="pt-4 border-t border-gray-100">
                <RecaptchaBadge />
              </div>
            </form>

            {/* Login Link */}
            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-sm text-gray-600">
                すでにアカウントをお持ちの方は
                <Link
                  to="/login/customer"
                  className="text-[#8B7355] hover:underline ml-1"
                >
                  ログイン
                </Link>
              </p>
            </div>

            {/* Additional Info */}
            <div className="mt-6 sm:mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 leading-relaxed">
                ※ アカウント登録は無料です
                <br />
                ※
                登録後すぐに作品の閲覧・お気に入り登録・購入が可能になります
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

