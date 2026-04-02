import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, ArrowLeft, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { api } from "@/lib/api";
export function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("メールアドレスを入力してください");
            return;
        }
        setIsSubmitting(true);
        try {
            await api.post("/auth/forgot-password", { email });
            setIsSubmitted(true);
            toast.success("パスワードリセット用のメールを送信しました", {
                description: "メールアドレスが登録されている場合、リセットリンクを送信しました。",
            });
        }
        catch (error: any) {
            console.error("Forgot password error:", error);
            const errorMessage = error.message || "";
            if (errorMessage.includes("上限に達しました") || errorMessage.includes("rate limit") || errorMessage.includes("429")) {
                toast.error("メール送信の上限に達しました", {
                    description: "1時間あたり2通まで送信可能です。しばらく時間をおいてから再度お試しください。",
                    duration: 8000,
                });
                return;
            }
            setIsSubmitted(true);
            toast.success("パスワードリセット用のメールを送信しました", {
                description: "メールアドレスが登録されている場合、リセットリンクを送信しました。",
            });
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (<div className="min-h-screen bg-white flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16">
        <div className="w-full max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {!isSubmitted ? (<>
                
                <Link to="/login-selection" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-8">
                  <ArrowLeft className="w-4 h-4"/>
                  ログイン選択に戻る
                </Link>

                
                <div className="mb-8 sm:mb-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-8 h-8 text-primary"/>
                  </div>
                  <h1 className="text-2xl sm:text-3xl text-primary mb-3">
                    パスワードをお忘れですか？
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    ご登録のメールアドレスを入力してください。<br />
                    パスワード再設定用のリンクをお送りします。
                  </p>
                </div>

                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">メールアドレス</Label>
                    <Input id="email" type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary" required/>
                  </div>

                  <Button type="submit" className="w-full h-11 sm:h-12 bg-primary hover:bg-primary/90 text-white" disabled={isSubmitting}>
                    {isSubmitting ? (<>
                        <Loader2 className="w-4 h-4 animate-spin mr-2"/>
                        送信中...
                      </>) : ("リセットリンクを送信")}
                  </Button>
                </form>

                
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    <span className="block mb-2">📧 メールが届かない場合</span>
                    迷惑メールフォルダをご確認ください。数分経ってもメールが届かない場合は、
                    <Link to="/contact" className="text-primary hover:underline ml-1">
                      お問い合わせ
                    </Link>
                    ください。
                  </p>
                </div>
              </>) : (<div className="text-center py-8">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }} className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-green-500"/>
                </motion.div>
                <h2 className="text-2xl sm:text-3xl mb-4 text-primary">
                  メールを送信しました
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-2 leading-relaxed">
                  <span className="text-primary">{email}</span> 宛に<br />
                  パスワードリセット用のリンクを送信しました。
                </p>
                <p className="text-sm sm:text-base text-gray-600 mb-8 leading-relaxed">
                  メール内のリンクをクリックして、<br />
                  新しいパスワードを設定してください。
                </p>

                
                <div className="p-4 bg-gray-50 rounded-lg text-left mb-6">
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    <span className="block mb-2">⏱️ リンクの有効期限</span>
                    セキュリティのため、リンクは24時間で無効になります。
                  </p>
                </div>

                <div className="space-y-3">
                  <Link to="/login-selection" className="inline-block text-primary hover:underline transition-colors">
                    ログイン選択に戻る
                  </Link>
                  <p className="text-xs sm:text-sm text-gray-500">
                    メールが届かない場合は、
                    <button onClick={() => {
                setIsSubmitted(false);
                setEmail("");
            }} className="text-primary hover:underline ml-1">
                      もう一度送信
                    </button>
                  </p>
                </div>
              </div>)}
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>);
}
