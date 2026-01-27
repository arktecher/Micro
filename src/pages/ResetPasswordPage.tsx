import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Lock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client for password reset
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Check if we have access_token in URL hash (from Supabase redirect)
    // This is a backup in case SupabaseAuthRedirectHandler didn't catch it
    const hash = window.location.hash;
    if (hash) {
      const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const type = hashParams.get("type");
      
      if (accessToken && type === "recovery") {
        // Store tokens temporarily for password update
        sessionStorage.setItem("mgj_reset_token", accessToken);
        if (refreshToken) {
          sessionStorage.setItem("mgj_reset_refresh_token", refreshToken);
        }
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("パスワードを入力してください");
      return;
    }

    if (password.length < 8) {
      toast.error("パスワードは8文字以上である必要があります");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("パスワードが一致しません");
      return;
    }

    if (!supabase) {
      toast.error("設定エラーが発生しました");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Get tokens from sessionStorage
      const accessToken = sessionStorage.getItem("mgj_reset_token");
      const refreshToken = sessionStorage.getItem("mgj_reset_refresh_token");
      
      if (!accessToken) {
        throw new Error("リセットトークンが見つかりません。新しいリセットメールをリクエストしてください。");
      }

      console.log("Attempting password reset with token:", accessToken.substring(0, 20) + "...");
      console.log("Has refresh token:", !!refreshToken);

      // Set the session with the recovery tokens
      // For recovery flow, we need both access_token and refresh_token
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || "",
      });

      console.log("setSession result:", { 
        hasSession: !!sessionData?.session, 
        hasUser: !!sessionData?.user,
        error: sessionError
      });

      if (sessionError) {
        console.error("Session error details:", sessionError);
        
        // Translate Supabase session errors to Japanese
        let errorMessage = "リセットトークンが無効または期限切れです";
        const errorMsg = sessionError.message.toLowerCase();
        
        if (errorMsg.includes("expired") || errorMsg.includes("invalid")) {
          errorMessage = "リセットトークンが無効または期限切れです。新しいリセットメールをリクエストしてください";
        } else if (errorMsg.includes("not found")) {
          errorMessage = "トークンが見つかりません";
        }
        
        throw new Error(errorMessage);
      }

      if (!sessionData?.session) {
        throw new Error("リセットトークンが無効または期限切れです。新しいリセットメールをリクエストしてください。");
      }

      // Update password
      console.log("Updating password...");
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        console.error("Update password error:", updateError);
        
        // Translate Supabase errors to Japanese
        let errorMessage = "パスワードの更新に失敗しました";
        const errorMsg = updateError.message.toLowerCase();
        
        if (errorMsg.includes("should be different") || errorMsg.includes("same as")) {
          errorMessage = "新しいパスワードは現在のパスワードと異なるものを設定してください";
        } else if (errorMsg.includes("weak") || errorMsg.includes("too short")) {
          errorMessage = "パスワードが弱すぎます。8文字以上の強固なパスワードを設定してください";
        } else if (errorMsg.includes("invalid")) {
          errorMessage = "無効なパスワードです";
        }
        
        throw new Error(errorMessage);
      }

      // Clear tokens
      sessionStorage.removeItem("mgj_reset_token");
      sessionStorage.removeItem("mgj_reset_refresh_token");

      console.log("Password reset successful!");
      setIsSuccess(true);
      toast.success("パスワードが正常にリセットされました");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login-selection");
      }, 2000);
    } catch (error: any) {
      console.error("Reset password error:", error);
      const errorMessage = error.message || "パスワードリセットに失敗しました";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16">
          <div className="w-full max-w-md text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-8 h-8 text-green-500" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl mb-4 text-primary">
              パスワードがリセットされました
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-8">
              新しいパスワードでログインできます。
            </p>
            <Button
              onClick={() => navigate("/login-selection")}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              ログインへ
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Header */}
            <div className="mb-8 sm:mb-10 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl text-primary mb-3">
                新しいパスワードを設定
              </h1>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                新しいパスワードを入力してください
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-700">{error}</p>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-red-600 hover:underline mt-1 inline-block"
                  >
                    新しいリセットメールをリクエスト
                  </Link>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password">新しいパスワード</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="8文字以上"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary"
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
                  placeholder="パスワードを再入力"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary"
                  required
                  minLength={8}
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-500">
                    パスワードが一致しません
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 sm:h-12 bg-primary hover:bg-primary/90 text-white"
                disabled={isSubmitting || password !== confirmPassword}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    リセット中...
                  </>
                ) : (
                  "パスワードをリセット"
                )}
              </Button>
            </form>

            {/* Additional info */}
            <div className="mt-8 text-center">
              <Link
                to="/forgot-password"
                className="text-sm text-gray-600 hover:text-primary transition-colors"
              >
                リセットリンクを再送信
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
