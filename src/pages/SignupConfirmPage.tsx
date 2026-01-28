import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowRight, Mail, AlertCircle, RefreshCw, Info, User, Sparkles } from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

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
  const { isAuthenticated, userType, currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const status = (searchParams.get("status") || "").toLowerCase();
  const errorType = searchParams.get("error_type") || "";
  const isConfirmed = status === "confirmed";
  const isError = status === "error";
  const isExpired = errorType === "expired";
  const isInvalid = errorType === "invalid";

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // If confirmed but not authenticated yet, wait a bit for auto-login to complete
    if (isConfirmed && !isAuthenticated) {
      setIsCheckingAuth(true);
      const timer = setTimeout(() => {
        setIsCheckingAuth(false);
      }, 1000); // Wait 1 second for auto-login to complete
      return () => clearTimeout(timer);
    } else {
      setIsCheckingAuth(false);
    }
  }, [isConfirmed, isAuthenticated]);

  const role = useMemo(() => {
    // Prefer authenticated user type, fallback to pending signup role
    if (userType) return userType;
    const raw = localStorage.getItem("mgj_pending_signup_role");
    if (raw === "artist" || raw === "corporate" || raw === "customer") return raw;
    return null;
  }, [userType]);

  const roleLabel = getRoleLabel(role);
  const loginPath = getLoginPath(role);
  const nextPaths = getNextPaths(role);
  const hasToken = Boolean(localStorage.getItem("mgj_access_token"));
  const isLoggedIn = isAuthenticated && hasToken;

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

  // Corporate "signup complete" screen (match clone UI)
  if (isConfirmed && isLoggedIn && role === "corporate") {
    const emailForGreeting = currentUser?.email || "";

    return (
      <div className="min-h-screen bg-[#F8F6F1]">
        <Header />

        <section className="min-h-screen flex items-center justify-center px-4 pt-24 pb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl w-full text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 bg-gradient-to-br from-[#C3A36D] to-[#D4B478] rounded-full flex items-center justify-center mx-auto mb-8"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl sm:text-5xl text-[#3A3A3A] mb-4"
            >
              🎉 サインアップ完了！
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-600 mb-8"
            >
              {emailForGreeting ? `${emailForGreeting}様、ようこそMicro Gallery Japanへ！` : "ようこそMicro Gallery Japanへ！"}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl p-8 mb-8 shadow-lg"
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <Sparkles className="w-8 h-8 text-[#C3A36D]" />
                <h2 className="text-2xl text-[#3A3A3A]">次のステップ</h2>
              </div>
              <p className="text-lg text-gray-700 mb-6">
                あなたの空間を登録して、AIが最適なアート作品を提案します
              </p>
              <div className="grid gap-4 text-left">
                <div className="flex items-start gap-3 p-4 bg-[#F8F6F1] rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-[#C3A36D] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h3 className="text-[#3A3A3A] mb-1">スペース情報を登録</h3>
                    <p className="text-sm text-gray-600">展示場所の写真と詳細を入力（2分で完了）</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-[#F8F6F1] rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-[#C3A36D] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h3 className="text-[#3A3A3A] mb-1">AIが作品を提案</h3>
                    <p className="text-sm text-gray-600">空間に合ったアート作品を自動でセレクト</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-[#F8F6F1] rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-[#C3A36D] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h3 className="text-[#3A3A3A] mb-1">展示開始</h3>
                    <p className="text-sm text-gray-600">作品が届き次第、すぐに展示・販売がスタート</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                onClick={() => {
                  // Ensure we navigate with the query parameter
                  navigate("/signup/corporate?addSpace=true", { replace: false });
                }}
                className="bg-gradient-to-r from-[#C3A36D] to-[#D4B478] hover:opacity-90 px-8 py-6 text-lg"
              >
                スペース登録へ進む
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/corporate-dashboard")}
                className="px-8 py-6 text-lg"
              >
                後で登録する
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-sm text-gray-500 mt-6"
            >
              スペース登録は後からダッシュボードで追加できます
            </motion.p>
          </motion.div>
        </section>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream/30 via-white to-gray-50">
      <Header />

      <div className="pt-24 pb-20">
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={`${isConfirmed && isLoggedIn ? "mb-16" : "mb-8 sm:mb-12"} text-center`}
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
            ) : isConfirmed && isLoggedIn ? (
              <>
                {/* Welcome Page for Confirmed and Logged In Users */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 mb-6"
                >
                  <CheckCircle className="w-12 h-12 text-white" />
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="text-4xl md:text-5xl text-primary mb-6"
                >
                  ようこそ、Micro Gallery Japanへ
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-xl text-gray-600 leading-relaxed"
                >
                  登録が完了しました！次のステップで、あなたをもっと知ってもらいましょう
                </motion.p>
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

          {/* Welcome Content for Artists - Outside Card */}
          {isConfirmed && isLoggedIn && role === "artist" && (
            <>
              {/* Important Information Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mb-12"
              >
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-50/50 to-purple-50/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Info className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl text-primary mb-3">
                          ご利用前に知っておいていただきたいこと
                        </h3>
                      </div>
                    </div>
                    
                    <div className="space-y-4 ml-16">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-primary mb-1">審査なし、登録は自由です</p>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            作品やアーティストの審査はありません。ただし、公共の場所に展示されるため、過度に性的・暴力的な表現を含む作品はご遠慮ください。
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-primary mb-1">展示場所は法人が選びます</p>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            展示する作品は各法人が選定します。アーティスト側から展示場所の指定はできませんが、魅力的なプロフィールと作品登録で、展示のチャンスを広げましょう。
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-primary mb-1">作品は保管せず、直接お送りいただきます</p>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            MGJでは作品を預かりません。展示リクエストが届いた際に、展示先へ直接発送していただきます。梱包用の専用ボックスはMGJが無償でご提供します。
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-primary mb-1">展示は公共性のあるスペースに限ります</p>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            MGJは作品を販売することが目的のサービスです。展示場所は不特定多数の方が訪れる公共性のあるスペース（オフィス、ホテル、カフェなど）に限定され、個人宅や人目につかない場所への展示は行っておりません。
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Next Action */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="space-y-4 mb-12"
              >
                {/* Profile Enhancement Card */}
                <Card className="border-2 border-accent bg-gradient-to-r from-accent/5 to-transparent hover:shadow-xl transition-all">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                          <User className="w-8 h-8 text-accent" />
                        </div>
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-2xl text-primary mb-2">
                          プロフィールを充実させる
                        </h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          写真や経歴を追加することで、法人があなたの作品を選びやすくなります。<br />
                          魅力的なプロフィールは、展示のチャンスを広げます。
                        </p>
                        <Button
                          size="lg"
                          onClick={() => navigate(nextPaths.profile)}
                          className="bg-accent hover:bg-accent/90 text-white"
                        >
                          今すぐプロフィールを編集
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Later Message */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="text-center"
              >
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate(nextPaths.dashboard)}
                  className="mb-3"
                >
                  後でプロフィールを編集する
                </Button>
                <p className="text-sm text-gray-500">
                  いつでもダッシュボードから編集できます
                </p>
              </motion.div>
            </>
          )}

          {/* Welcome Content for Corporate/Customer */}
          {isConfirmed && isLoggedIn && role !== "artist" && (
            <Card className="border-2 border-primary/20 bg-white">
              <CardContent className="p-5 sm:p-6 md:p-8">
                <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">
                  登録が完了しました。次のステップへ進んでください。
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    size="lg"
                    onClick={() => navigate(nextPaths.dashboard)}
                    className="bg-primary hover:bg-primary/90 text-white flex-1"
                  >
                    <span>ダッシュボードへ</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate(nextPaths.profile)}
                    className="flex-1"
                  >
                    プロフィールへ
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error and Non-Confirmed States */}
          {(!isConfirmed || !isLoggedIn || isError) && (
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
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

