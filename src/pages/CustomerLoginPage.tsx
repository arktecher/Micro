import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { api } from "@/lib/api";
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
            if (!email || !password) {
                toast.error("メールアドレスとパスワードを入力してください");
                setLoading(false);
                return;
            }
            const response = await api.post<{
                access_token: string;
                token_type: string;
                user: {
                    id: string;
                    email: string;
                    user_type: string;
                    name: string;
                };
            }>("/auth/login/customer", {
                email,
                password,
            });
            if (response.access_token) {
                localStorage.setItem("mgj_access_token", response.access_token);
            }
            login("customer", {
                id: response.user.id,
                name: response.user.name,
                email: response.user.email,
            });
            toast.success("ログインしました");
            const pendingFavoriteId = localStorage.getItem("mgj_pending_favorite_artwork_id");
            const redirectPath = localStorage.getItem("mgj_redirect_after_login");
            if (pendingFavoriteId) {
                localStorage.removeItem("mgj_pending_favorite_artwork_id");
                localStorage.removeItem("mgj_redirect_after_login");
            }
            if (redirectPath) {
                navigate(redirectPath);
            }
            else {
                navigate("/my-page#profile");
            }
        }
        catch (error: any) {
            console.error("Login error:", error);
            toast.error("ログインに失敗しました", {
                description: error.message || "メールアドレスまたはパスワードが正しくありません。",
            });
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="min-h-screen bg-white flex flex-col">
      <Header />

      
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16">
        <div className="w-full max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#8B7355]/10 to-[#8B7355]/5 flex items-center justify-center">
                <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8 text-[#8B7355]"/>
              </div>
            </div>

            
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl text-gray-900 mb-2">ご購入の方ログイン</h1>
              <p className="text-sm text-gray-600">お気に入り・購入履歴を管理する</p>
            </div>

            
            <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">メールアドレス</Label>
                <Input id="email" type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary" required/>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm">パスワード</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary" required/>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="mr-2 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"/>
                  <span className="text-sm text-gray-600">ログイン状態を保持</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-[#8B7355] hover:underline transition-colors">
                  パスワードを忘れた
                </Link>
              </div>

              <Button type="submit" className="w-full h-11 sm:h-12 bg-gray-900 hover:bg-gray-800 text-white" disabled={loading}>
                {loading ? (<>
                    <Loader2 className="w-4 h-4 animate-spin mr-2"/>
                    ログイン中...
                  </>) : ("ログイン")}
              </Button>
            </form>

            
            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-sm text-gray-600">
                初めてご利用の方は
                <Link to="/signup/customer" className="text-[#8B7355] hover:underline ml-1 transition-colors">
                  新規登録
                </Link>
              </p>
            </div>

            
            <div className="mt-4 sm:mt-6 text-center">
              <Link to="/login-selection" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                ← ログイン選択に戻る
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>);
}
