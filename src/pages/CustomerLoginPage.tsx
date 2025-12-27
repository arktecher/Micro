import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export function CustomerLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mock authentication - in production, this would call an API
      // For now, we'll accept any email/password combination
      if (!email || !password) {
        toast.error("メールアドレスとパスワードを入力してください");
        setLoading(false);
        return;
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock user data - in production, this would come from the API
      const mockUser = {
        id: "BYR-001",
        name: "購入者ユーザー",
        email: email
      };

      login("customer", mockUser);

      toast.success("ログインしました");

      // お気に入りに追加する作品IDを確認（既存の機能を維持）
      const pendingFavoriteId = localStorage.getItem("mgj_pending_favorite_artwork_id");
      const redirectPath = localStorage.getItem("mgj_redirect_after_login");

      if (pendingFavoriteId) {
        // クリーンアップ
        localStorage.removeItem("mgj_pending_favorite_artwork_id");
        localStorage.removeItem("mgj_redirect_after_login");
      }

      // 元のページに戻る
      if (redirectPath) {
        navigate(redirectPath);
      } else {
        // Navigate to my-page if it exists, otherwise go to home
        navigate("/my-page#profile");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* メインコンテンツ */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* アイコン */}
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#8B7355]/10 to-[#8B7355]/5 flex items-center justify-center">
                <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8 text-[#8B7355]" />
              </div>
            </div>

            {/* タイトル */}
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl text-gray-900 mb-2">ご購入の方ログイン</h1>
              <p className="text-sm text-gray-600">お気に入り・購入履歴を管理する</p>
            </div>

            {/* フォーム */}
            <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm">パスワード</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="mr-2 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm text-gray-600">ログイン状態を保持</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-[#8B7355] hover:underline transition-colors"
                >
                  パスワードを忘れた
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-11 sm:h-12 bg-gray-900 hover:bg-gray-800 text-white"
                disabled={loading}
              >
                {loading ? "ログイン中..." : "ログイン"}
              </Button>
            </form>

            {/* 新規登録リンク */}
            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-sm text-gray-600">
                初めてご利用の方は
                <Link
                  to="/signup/customer"
                  className="text-[#8B7355] hover:underline ml-1 transition-colors"
                >
                  新規登録
                </Link>
              </p>
            </div>

            {/* 戻るリンク */}
            <div className="mt-4 sm:mt-6 text-center">
              <Link
                to="/login-selection"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← ログイン選択に戻る
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}



