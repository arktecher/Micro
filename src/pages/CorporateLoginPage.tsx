import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export function CorporateLoginPage() {
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
        id: "CRP-001",
        name: "法人ユーザー",
        email: email
      };

      login("corporate", mockUser);

      toast.success("ログインしました");
      navigate("/corporate-dashboard");
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
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#A67C52]/10 to-[#A67C52]/5 flex items-center justify-center">
                <Building2 className="w-7 h-7 sm:w-8 sm:h-8 text-[#A67C52]" />
              </div>
            </div>

            {/* タイトル */}
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl text-gray-900 mb-2">法人ログイン</h1>
              <p className="text-sm text-gray-600">空間を彩り、収益化する</p>
            </div>

            {/* フォーム */}
            <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@company.com"
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
                  className="text-sm text-[#A67C52] hover:underline transition-colors"
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
                アカウントをお持ちでない方は
                <Link
                  to="/signup/corporate"
                  className="text-[#A67C52] hover:underline ml-1 transition-colors"
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



