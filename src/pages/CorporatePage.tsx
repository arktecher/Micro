import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import {
  Building2,
  TrendingUp,
  Sparkles,
  Upload,
  QrCode,
  Banknote,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  HelpCircle,
  ChevronDown,
  Mail,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";

export function CorporatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // addSpace=true のクエリパラメータがある場合は正しいURLにリダイレクト
  useEffect(() => {
    if (searchParams.get("addSpace") === "true") {
      navigate("/signup/corporate?addSpace=true", { replace: true });
      return;
    }
    
    // Handle hash navigation to FAQ section
    if (location.hash === "#faq") {
      // Small delay to ensure the page is rendered
      setTimeout(() => {
        const faqElement = document.getElementById("faq");
        if (faqElement) {
          const headerOffset = 80; // Account for fixed header
          const elementPosition = faqElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [searchParams, navigate, location.hash]);

  const faqData = [
    {
      category: "登録・費用・収益について",
      items: [
        {
          question: "展示に費用はかかりますか？",
          answer:
            "展示は完全無料です。\n初期費用・月額レンタル料は一切ありません。\n\n但し、6か月未満の入れ替え時のみ、法人様に送料をご負担いただく場合があります。",
        },
        {
          question: "作品が売れた場合、法人の取り分は？",
          answer: "販売価格の10％を法人様に還元します。\n空間を提供いただくことへの対価です。",
        },
        {
          question: "複数店舗・複数拠点でも利用できますか？",
          answer: "はい。1法人アカウントの中で複数スペースを登録できます。",
        },
      ],
    },
    {
      category: "スペース登録・写真について",
      items: [
        {
          question: "「スペース」とは何ですか？",
          answer:
            "アートを設置する単位の空間を指します。\n例：受付、会議室、ホテル客室、廊下、店舗の一部 など",
        },
        {
          question: "スペース登録時に必要なものは？",
          answer: "— スペース名\n— 用途カテゴリ\n— 写真（壁・空間がわかるもの）\nの3点です。",
        },
        {
          question: "写真はどのように撮影すれば良いですか？",
          answer:
            "— 壁全体が入る構図\n— 明るい時間帯\n— 床・家具も少し写す\n— 人物・荷物は写さない\nなどが推奨です。",
        },
        {
          question: "スマホ撮影で問題ないですか？",
          answer: "はい、問題ありません。",
        },
      ],
    },
    {
      category: "AIレコメンド・作品選定について",
      items: [
        {
          question: "色解析とは？",
          answer: "壁・床・家具の色や、空間の雰囲気をAIが自動抽出する処理です。",
        },
        {
          question: "AIレコメンドはどう作品を選んでいますか？",
          answer:
            "— スペースの色・明るさ・トーン\n— 作品側の色味・スタイル\n— サイズ感\nなどを総合的に判定して候補を出します。",
        },
        {
          question: "提案がイメージと違う場合は？",
          answer:
            "「落ち着いた色が良い」「派手めは避けたい」などフィードバックいただければ、システム改善に反映します。",
        },
        {
          question: "言葉でも空間のイメージを伝えたいのですが？",
          answer: "「北欧」「ナチュラル」「ラグジュアリー」など、キーワード設定が可能です。",
        },
      ],
    },
    {
      category: "展示期間・送料・入れ替えについて",
      items: [
        {
          question: "最低展示期間はありますか？",
          answer:
            "— 6か月以上の展示 → 作品返却時の送料はアーティスト負担\n— 6か月未満の展示 → 法人様負担\nというルールがあります。",
        },
        {
          question: "送料負担のルールは？",
          answer:
            "— 6か月以上展示 → アーティスト側が送料負担\n— 6か月未満で返却・交換 → 法人様負担\nこれがマイクロギャラリーの基本ルールです。",
        },
        {
          question: "作品の入れ替えはどう調整しますか？",
          answer:
            "展示終了前にマイクロギャラリーから連絡し、\n— 継続展示\n— 別作品に入れ替え\n— 展示終了\nを選択いただきます。",
        },
      ],
    },
    {
      category: "破損・保険について",
      items: [
        {
          question: "展示中に作品が破損した場合は？",
          answer:
            "マイクロギャラリーは輸送・展示期間の事故に対応する保険スキームを整備しています。\n通常利用の範囲での破損であれば、\n法人様に重大な過失がない限り、保険でカバーされる前提です。",
        },
        {
          question: "紛失・盗難の場合は？",
          answer:
            "状況をヒアリングし、警察届出・保険会社との調整の上、\n故意や重過失がなければ保険でカバーする方針です。",
        },
      ],
    },
    {
      category: "メンテナンス・購入について",
      items: [
        {
          question: "日常的な手入れは必要ですか？",
          answer:
            "乾いた柔らかい布で軽くホコリを払う程度で充分です。\n以下は避けてください：\n— 水・洗剤使用\n— 直射日光\n— 高湿度（浴室近くなど）",
        },
        {
          question: "展示中の作品を法人として購入できますか？",
          answer:
            "はい、可能です。\n購入後は引き続き展示していただくことも、別場所への移動も自由です。",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section
        id="corporate-hero"
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 sm:pt-20"
      >
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1758448721149-aa0ce8e1b2c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjBsb2JieSUyMGFydHxlbnwxfHx8fDE3NjExNzkzMzN8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Modern office lobby"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-4 sm:mb-6 tracking-tight leading-tight px-2">
              あなたの空間を、<br />
              ギャラリーに変えませんか？
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-10 leading-relaxed px-2">
              アートを"無料で"展示し、販売が成立すれば報酬を受け取れる新しい仕組みです。
            </p>
            <Button
              size="lg"
              onClick={() => {
                localStorage.setItem("userType", "corporate");
                navigate("/signup/corporate");
              }}
              className="bg-accent hover:bg-accent/90 text-white h-12 sm:h-14 px-6 sm:px-10 text-base sm:text-lg shadow-2xl mx-2 sm:mx-0"
            >
              無料で始める
              <ChevronRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* 問題提起セクション */}
      <section className="py-12 sm:py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-4 sm:space-y-6"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl text-primary">
                アートを飾りたい、でも…
              </h2>
              <div className="space-y-3 sm:space-y-4 text-gray-700 leading-relaxed text-base sm:text-lg">
                <p>
                  「費用がかかる」<br />
                  「何を選べば良いかわからない」<br />
                  「維持管理が面倒」——
                </p>
                <p className="text-base sm:text-lg leading-relaxed text-gray-700 mb-4 sm:mb-6">
                  多くの企業・施設が、そうした理由でアート導入を見送っています。
                </p>
                <p className="text-lg sm:text-xl text-primary">
                  マイクロギャラリーなら、そのすべてが解決します。
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1550605406-3d836450a56b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbXB0eSUyMHdoaXRlJTIwd2FsbCUyMG9mZmljZXxlbnwxfHx8fHwxNzYxMTc5ODM4fDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Empty wall"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 仕組みセクション */}
      <section className="py-12 sm:py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl text-primary mb-3 sm:mb-4">
              マイクロギャラリーの仕組み
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              初期費用ゼロで、空いている壁を価値あるスペースに変える
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {[
                {
                  icon: Building2,
                  number: "01",
                  title: "マイクロギャラリーに登録",
                  description:
                    "法人情報と展示スペースを入力。完全無料で始められます。",
                  color: "from-blue-500 to-blue-600",
                },
                {
                  icon: Sparkles,
                  number: "02",
                  title: "AI作品提案",
                  description:
                    "AIが空間に合うアートを提案。好きな作品を選択できます。",
                  color: "from-purple-500 to-purple-600",
                },
                {
                  icon: Upload,
                  number: "03",
                  title: "作品を展示",
                  description:
                    "QRコード・フック・展示マニュアルが届くので、それに沿って展示。",
                  color: "from-accent to-accent/80",
                },
                {
                  icon: Banknote,
                  number: "04",
                  title: "販売報酬10％",
                  description:
                    "来場者がQRから購入すると販売額の10％が収益に。",
                  color: "from-primary to-primary/80",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="border-2 hover:shadow-xl transition-all duration-300 h-full">
                    <CardHeader className="text-center pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                      <div
                        className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-xl sm:rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 shadow-lg`}
                      >
                        <item.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 mb-1">
                        STEP {item.number}
                      </div>
                      <CardTitle className="text-base sm:text-lg">
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4 sm:pb-6 px-4 sm:px-6">
                      <p className="text-gray-600 text-center leading-relaxed text-xs sm:text-sm">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* メリットセクション */}
      <section className="py-12 sm:py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl text-primary mb-3 sm:mb-4">
              コストゼロで"空間価値"を高め、<br />
              収益も得られます
            </h2>
          </motion.div>

          <div className="max-w-5xl mx-auto grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: CheckCircle2,
                title: "完全無料",
                description:
                  "導入費・月額費ゼロ（初年度）。リスクなしで始められます。",
                color: "from-green-500 to-green-600",
              },
              {
                icon: TrendingUp,
                title: "収益化",
                description: "作品販売時に10％のコミッションをお支払いします。",
                color: "from-accent to-accent/80",
              },
              {
                icon: Sparkles,
                title: "ブランド価値向上",
                description:
                  "空間にアートがあることで、企業イメージがアップします。",
                color: "from-primary to-primary/80",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
              >
                <Card className="border-2 hover:shadow-xl transition-all duration-300 h-full">
                  <CardHeader className="text-center px-4 sm:px-6 pt-4 sm:pt-6">
                    <div
                      className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-lg sm:rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 sm:mb-4 shadow-lg`}
                    >
                      <item.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl sm:text-2xl">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                    <p className="text-gray-600 text-center leading-relaxed text-sm sm:text-base">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-6 sm:mt-8 text-center"
          >
            <p className="text-sm sm:text-base text-gray-600">
              ※今後、リース料を導入する可能性がありますが、初年度は完全無料です。
            </p>
          </motion.div>
        </div>
      </section>

      {/* 導入の流れセクション */}
      <section className="py-12 sm:py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl text-primary mb-3 sm:mb-4">
              ご利用の流れ
            </h2>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            {[
              {
                step: "1",
                title: "登録する",
                description:
                  "法人情報と展示スペースの情報（場所、壁のサイズ、写真など）を入力します。",
              },
              {
                step: "2",
                title: "AIによる作品提案を受け取る",
                description:
                  "貴社の空間に合ったアート作品をAIが自動で選定し、提案します。",
              },
              {
                step: "3",
                title: "郵送された作品を展示する",
                description:
                  "気に入った作品を選択すると、アーティストから直接郵送されます。QRコード付きで展示。",
              },
              {
                step: "4",
                title: "作品が売れたら、顧客がマイクロギャラリー上で決済",
                description:
                  "来場者がQRコードをスキャンし、オンラインで購入。決済は全てマイクロギャラリーが代行します。",
              },
              {
                step: "5",
                title: "コミッションが3か月ごとに自動振込",
                description:
                  "販売額の10％が貴社の報酬として、四半期ごとに自動で振り込まれます。",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="border-l-4 border-l-primary hover:shadow-lg transition-all duration-300">
                  <CardContent className="flex items-start gap-4 sm:gap-6 p-4 sm:p-6">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary text-white flex items-center justify-center text-lg sm:text-xl">
                      {item.step}
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="text-lg sm:text-xl text-primary mb-1 sm:mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8 sm:mt-12 text-center text-sm sm:text-base text-gray-600 leading-relaxed max-w-3xl mx-auto"
          >
            <p>
              既にアートをリースしている場合、コスト削減に。<br className="hidden sm:block" />
              初めての導入でもリスクなし。
            </p>
          </motion.div>
        </div>
      </section>

      {/* 重要な注意事項 */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl text-primary mb-3 sm:mb-4">
                ご利用にあたってのご注意
              </h2>
            </div>

            <Card className="border-2 border-orange-200 bg-orange-50/30">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-orange-100 flex items-center justify-center">
                      <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl text-primary mb-2 sm:mb-3">
                      公共性のあるスペースが対象です
                    </h3>
                    <div className="text-sm sm:text-base text-gray-700 leading-relaxed space-y-2 sm:space-y-3">
                      <p>
                        マイクロギャラリーは、アート作品の販売を目的としたプラットフォームです。そのため、不特定多数の方が訪れる公共性のあるスペースでの展示を前提としています。
                      </p>
                      <p className="text-base sm:text-lg text-primary">
                        ✓ 利用可能：オフィス、ホテル、カフェ、病院、美容室など、お客様や社員が訪れる場所
                      </p>
                      <p className="text-base sm:text-lg text-gray-600">
                        × 利用不可：個人宅、倉庫、人目につかない場所
                      </p>
                      <p className="mt-3 sm:mt-4 p-3 sm:p-4 bg-white rounded-lg border border-orange-200">
                        多くの方の目に触れることで、作品の販売機会が生まれ、貴社への収益還元が実現します。公共性のあるスペースでの展示にご協力をお願いいたします。
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ビジネス価値セクション */}
      <section className="py-12 sm:py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl text-primary mb-3 sm:mb-4">
              今まで"コスト"だったアートを、<br />
              "利益"に変える。
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              マイクロギャラリーはアート導入・販売・収益化をワンストップで支援します。
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto"
          >
            <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
              {/* Before */}
              <Card className="border-2 border-gray-300">
                <CardHeader className="bg-gray-100 border-b-2 px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
                  <CardTitle className="text-center text-xl sm:text-2xl text-gray-700">
                    従来のアートリース
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 sm:p-8">
                  <div className="space-y-3 sm:space-y-4">
                    {[
                      "月額リース料を支払い続ける",
                      "作品選定は限られた選択肢から",
                      "収益化の仕組みがない",
                    ].map((text, i) => (
                      <div key={i} className="flex items-start gap-2 sm:gap-3">
                        <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-100 flex items-center justify-center mt-1">
                          <span className="text-red-600 text-xs sm:text-sm">×</span>
                        </div>
                        <p className="text-sm sm:text-base text-gray-700">{text}</p>
                      </div>
                    ))}
                    <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-red-50 rounded-lg text-center">
                      <p className="text-sm sm:text-base text-red-700">
                        継続的なコスト負担
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* After */}
              <Card className="border-2 border-accent shadow-xl">
                <CardHeader className="bg-gradient-to-r from-accent/10 to-primary/10 border-b-2 px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
                  <CardTitle className="text-center text-xl sm:text-2xl text-primary">
                    マイクロギャラリーのシステム
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 sm:p-8">
                  <div className="space-y-3 sm:space-y-4">
                    {[
                      "初年度は完全無料（リース料ゼロ）",
                      "AIが最適な作品を提案",
                      "販売時に10％の報酬を獲得",
                    ].map((text, i) => (
                      <div key={i} className="flex items-start gap-2 sm:gap-3">
                        <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-100 flex items-center justify-center mt-1">
                          <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                        </div>
                        <p className="text-sm sm:text-base text-gray-700">{text}</p>
                      </div>
                    ))}
                    <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-accent/20 to-primary/20 rounded-lg text-center">
                      <p className="text-sm sm:text-base text-primary">
                        無料で導入＋収益化
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQセクション */}
      <section id="faq" className="py-12 sm:py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl text-primary">
                よくある質問
              </h2>
            </div>
            <p className="text-lg sm:text-xl text-gray-600">
              法人の皆さんからよくいただく質問
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12">
            {faqData.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="text-xl sm:text-2xl text-primary mb-4 sm:mb-6 pb-2 sm:pb-3 border-b-2 border-primary/20"
                >
                  {category.category}
                </motion.h3>
                <div className="space-y-2 sm:space-y-3">
                  {category.items.map((faq, itemIndex) => {
                    const uniqueIndex = categoryIndex * 100 + itemIndex;
                    const isOpen = openFaqIndex === uniqueIndex;

                    return (
                      <motion.div
                        key={itemIndex}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: itemIndex * 0.05 }}
                      >
                        <Card
                          className="border-2 hover:border-primary/30 transition-all duration-300 cursor-pointer"
                          onClick={() =>
                            setOpenFaqIndex(isOpen ? null : uniqueIndex)
                          }
                        >
                          <CardContent className="p-4 sm:p-6">
                            <div className="flex items-start justify-between gap-3 sm:gap-4">
                              <div className="flex-grow min-w-0">
                                <h4 className="text-base sm:text-lg text-primary mb-1 sm:mb-2">
                                  Q. {faq.question}
                                </h4>
                                {isOpen && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="text-sm sm:text-base text-gray-700 leading-relaxed mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200 whitespace-pre-line"
                                  >
                                    A. {faq.answer}
                                  </motion.div>
                                )}
                              </div>
                              <ChevronDown
                                className={`w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0 transition-transform duration-300 ${
                                  isOpen ? "rotate-180" : ""
                                }`}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* お問い合わせセクション */}
      <section className="py-12 sm:py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-8 sm:mb-12">
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                <h2 className="text-2xl sm:text-3xl md:text-4xl text-primary">
                  お問い合わせ
                </h2>
              </div>
              <p className="text-lg sm:text-xl text-gray-600">
                ご不明な点がございましたら、お気軽にお問い合わせください
              </p>
            </div>

            <Card className="border-2 shadow-xl">
              <CardContent className="p-6 sm:p-8 md:p-10">
                <div className="space-y-6 sm:space-y-8">
                  <div className="text-center">
                    <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 leading-relaxed">
                      登録に関するご質問、作品の展示や販売についてのお悩み、
                      <br className="hidden sm:block" />
                      その他どんなことでもお気軽にご相談ください。
                    </p>
                    <div className="flex flex-col items-center gap-3 sm:gap-4">
                      <div className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl text-primary">
                        <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
                        <a
                          href="mailto:support@microgallery.co.jp"
                          className="hover:underline break-all sm:break-normal"
                        >
                          support@microgallery.co.jp
                        </a>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">
                        ※通常1〜2営業日以内にご返信いたします
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 sm:pt-8 border-t border-gray-200">
                    <h3 className="text-lg sm:text-xl text-primary mb-3 sm:mb-4 text-center">
                      または、お問い合わせフォームから
                    </h3>
                    <div className="text-center">
                      <Button
                        size="lg"
                        onClick={() => navigate("/contact")}
                        className="bg-primary hover:bg-primary/90 text-white h-12 sm:h-14 px-6 sm:px-10 text-base sm:text-lg w-full sm:w-auto"
                      >
                        お問い合わせフォームを開く
                        <Mail className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTAセクション */}
      <section
        id="register-cta"
        className="relative py-16 sm:py-24 md:py-32 overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1596386461350-326ccb383e9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHJlY2VwdGlvbiUyMGFydHdvcmt8ZW58MXx8fHwxNzYxMTc5MzM0fDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Hotel reception"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/80 to-accent/80"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-8 sm:mb-12 leading-tight px-2">
              アートを"無料で"展示できるのは今だけ。
            </h2>
            <Button
              size="lg"
              onClick={() => {
                localStorage.setItem("userType", "corporate");
                navigate("/signup/corporate");
              }}
              className="bg-white hover:bg-white/90 text-primary h-12 sm:h-14 md:h-16 px-8 sm:px-12 text-base sm:text-lg md:text-xl shadow-2xl"
            >
              <span>無料登録はこちら</span>
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

