import { motion } from "motion/react";
import { useEffect, useMemo } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowRight, Mail, AlertCircle, RefreshCw } from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type SignupRole = "artist" | "corporate" | "customer" | null;

function getRoleLabel(role: SignupRole) {
  switch (role) {
    case "artist":
      return "アーティスト";
    case "corporate":
      return "法人";
    case "customer":
      return "ご購入者";
    default:
      return "ユーザー";
  }
}

function getLoginPath(role: SignupRole) {
  switch (role) {
    case "artist":
      return "/login/artist";
    case "corporate":
      return "/login/corporate";
    case "customer":
      return "/login/customer";
    default:
      return "/login-selection";
  }
}

function getNextPaths(role: SignupRole) {
  switch (role) {
    case "artist":
      return { dashboard: "/dashboard", profile: "/signup/artist/profile" };
    case "corporate":
      return { dashboard: "/corporate-dashboard", profile: "/corporate-profile" };
    case "customer":
      return { dashboard: "/my-page", profile: "/my-page#profile" };
    default:
      return { dashboard: "/login-selection", profile: "/login-selection" };
  }
}

export function SignupConfirmPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const status = (searchParams.get("status") || "").toLowerCase();
  const errorType = searchParams.get("error_type") || "";
  const isConfirmed = status === "confirmed";
  const isError = status === "error";
  const isExpired = errorType === "expired";
  const isInvalid = errorType === "invalid";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const role = useMemo(() => {
    const raw = localStorage.getItem("mgj_pending_signup_role");
    if (raw === "artist" || raw === "corporate" || raw === "customer") return raw;
    return null;
  }, []);

  const roleLabel = getRoleLabel(role);
  const loginPath = getLoginPath(role);
  const nextPaths = getNextPaths(role);
  const hasToken = Boolean(localStorage.getItem("mgj_access_token"));

  // Get signup path based on role
  const signupPath = useMemo(() => {
    switch (role) {
      case "artist":
        return "/signup/artist";
      case "corporate":
        return "/signup/corporate";
      case "customer":
        return "/signup/customer";
      default:
        return "/login-selection";
    }
  }, [role]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream/30 via-white to-gray-50">
      <Header />

      <div className="pt-20 sm:pt-24 pb-12 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8 sm:mb-12 text-center"
          >
            {isError ? (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 mb-4 sm:mb-6">
                  <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl text-primary mb-3 sm:mb-4 px-2">
                  {isExpired ? "確認リンクの有効期限が切れています" : "確認リンクが無効です"}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-2">
                  {isExpired
                    ? "この確認リンクは既に使用済みか、有効期限が切れています。新しい確認メールを送信してください。"
                    : "この確認リンクは無効です。新しい確認メールを送信するか、ログインを試してください。"}
                </p>
              </>
            ) : (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 mb-4 sm:mb-6">
                  <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl text-primary mb-3 sm:mb-4 px-2">
                  {isConfirmed ? "メールアドレスの確認が完了しました" : "メール確認が完了したらログインしてください"}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-2">
                  {isConfirmed
                    ? `${roleLabel}アカウントの確認が完了しました。次へ進んでください。`
                    : `${roleLabel}アカウントのメール確認が完了したら、ログインしてダッシュボード・プロフィール編集へ進めます。`}
                </p>
              </>
            )}
          </motion.div>

          <Card className={`border-2 ${isError ? "border-red-200 bg-red-50/50" : "border-primary/10 bg-white"}`}>
            <CardContent className="p-5 sm:p-6 md:p-8 space-y-4">
              {isError ? (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base text-red-700 mb-1 font-semibold">
                        {isExpired ? "リンクの有効期限が切れています" : "リンクが無効です"}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                        {isExpired
                          ? "確認メールのリンクは24時間以内に使用する必要があります。新しい確認メールを送信するか、既に確認済みの場合はログインを試してください。"
                          : "この確認リンクは既に使用済みか、無効な形式です。新しい確認メールを送信するか、ログインを試してください。"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button
                      size="lg"
                      onClick={() => navigate(loginPath)}
                      className="bg-primary hover:bg-primary/90 text-white flex-1"
                    >
                      <span>{role ? `${roleLabel}でログイン` : "ログインへ"}</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => navigate(signupPath)}
                      className="flex-1 border-primary/20"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      新規登録からやり直す
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      <strong>解決方法：</strong>
                      <br />
                      • 既にメール確認が完了している場合は、ログインページからログインできます
                      <br />
                      • 確認メールが届いていない場合は、新規登録からやり直してください
                      <br />
                      • メールが迷惑メールフォルダに入っている可能性もあります
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base text-primary mb-1">確認メールのリンクをクリックしましたか？</p>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        {isConfirmed
                          ? "確認が完了しました。次のステップへ進めます。"
                          : "クリック後は、このページからログインしてください（確認済みのメールアドレスでログインできます）。"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    {isConfirmed && hasToken ? (
                      <Button
                        size="lg"
                        onClick={() => navigate(nextPaths.dashboard)}
                        className="bg-primary hover:bg-primary/90 text-white flex-1"
                      >
                        <span>ダッシュボードへ</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        onClick={() => navigate(loginPath)}
                        className="bg-primary hover:bg-primary/90 text-white flex-1"
                      >
                        <span>{role ? `${roleLabel}でログイン` : "ログインへ"}</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => navigate(isConfirmed && hasToken ? nextPaths.profile : "/login-selection")}
                      className="flex-1"
                    >
                      {isConfirmed && hasToken ? "プロフィールへ" : "ログイン選択へ"}
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                      メールが見つからない場合は、迷惑メールをご確認ください。<br />
                      登録し直す場合は
                      <Link to={signupPath} className="text-primary hover:underline ml-1">
                        こちら
                      </Link>
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}

