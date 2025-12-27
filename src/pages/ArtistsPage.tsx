import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import {
  Palette,
  TrendingUp,
  Users,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  ChevronDown,
  Mail,
  Building2,
  Upload,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";

// FAQ Data
const FAQ_DATA = [
  {
    category: "登録・アカウントについて",
    items: [
      {
        question: "登録に審査はありますか？",
        answer:
          "いいえ、ありません。どなたでも無料でご登録いただけます。ただし、著作権侵害や公序良俗に反する作品は通報により削除される場合があります。",
      },
      {
        question: "登録や展示に費用はかかりますか？",
        answer:
          "かかりません。登録費用・月額費用・展示費用などは一切ありません。作品が売れた場合のみ、販売価格の50％が手数料となります。",
      },
      {
        question: "複数の作品を登録できますか？",
        answer:
          "はい、可能です。登録作品が多いほど法人に選ばれる機会が増えます。",
      },
      {
        question: "プロフィール情報は後から変更できますか？",
        answer: "はい、ダッシュボードからいつでも変更できます。",
      },
    ],
  },
  {
    category: "作品登録について",
    items: [
      {
        question: "作品画像はどのようなものが望ましいですか？",
        answer:
          "高解像度で、作品全体がはっきり確認できる画像を推奨します。\n• JPEG または PNG\n• 長辺 2,000px 以上推奨\n• 明るくシンプルな背景",
      },
      {
        question: "サブ画像（クローズアップ・設置イメージ）は登録できますか？",
        answer: "はい、登録できます。",
      },
      {
        question: "作品登録時に必要な情報は何ですか？",
        answer:
          "以下の情報を入力いただきます。\n• タイトル\n• 制作年\n• サイズ（縦 × 横 × 厚み）\n• 技法・素材\n• 販売価格（税込）\n• AI生成作品フラグ（該当する場合）",
      },
    ],
  },
  {
    category: "AI生成作品・著作権について",
    items: [
      {
        question: "AI生成作品も登録できますか？",
        answer:
          "はい、登録できます。ただし必ずAI生成作品としてのフラグをONにしてください。",
      },
      {
        question: "作品の著作権はどうなりますか？",
        answer:
          "著作権はアーティストに帰属します。マイクロギャラリーが著作権を取得することはありません。",
      },
      {
        question: "作品画像がプロモーションに利用されることはありますか？",
        answer:
          "マイクロギャラリーのサービス紹介やSNS等で使用させていただく場合があります。大きな露出の場合は事前に確認させていただきます。",
      },
    ],
  },
  {
    category: "展示の仕組みについて",
    items: [
      {
        question: "作品はどのように展示されますか？",
        answer:
          "1. 法人が空間写真・AIレコメンドを元に作品を選びます\\n2. 選ばれた作品のアーティストに展示リクエストが届きます\\n3. リクエストは自動承認されます（承認作業は不要です）\\n4. マイクロギャラリーから専用梱包ボックスが届きます\\n5. 作品を梱包し、法人へ直接発送します",
      },
      {
        question: "展示場所を自分で選ぶことはできますか？",
        answer:
          "できません。法人が自身の空間に合う作品を選定する仕組みです。",
      },
    ],
  },
  {
    category: "売上・収益について",
    items: [
      {
        question: "作品が売れた場合、アーティストはいくら受け取れますか？",
        answer:
          "販売価格の50％がアーティストの収益となります。（残りは法人10％・マイクロギャラリー 40％）",
      },
      {
        question: "売上はいつ受け取れますか？",
        answer: "四半期（3ヶ月）ごとに振込されます。",
      },
      {
        question: "販売価格は自由に設定できますか？",
        answer: "はい、自由に設定できます。",
      },
      {
        question: "税金や確定申告はどうすればよいですか？",
        answer:
          "税務申告はアーティストご自身の責任で行っていただきます。支払い履歴・明細はダッシュボードから確認できます。",
      },
    ],
  },
  {
    category: "送料・箱・保管について（重要）",
    items: [
      {
        question: "作品の発送はどのように行いますか？",
        answer:
          "以下の流れで行います。\\n1. 展示リクエストを受け取る\\n2. マイクロギャラリーから専用梱包ボックスが届く\\n3. 作品を梱包し、法人へ直接発送",
      },
      {
        question: "マイクロギャラリーが作品を保管することはありますか？",
        answer:
          "ありません。作品は常に アーティスト ⇄ 法人 で直接やり取りされます。",
      },
      {
        question: "発送・返却の送料負担はどうなりますか？",
        answer:
          "• アーティスト → 法人の発送：マイクロギャラリー負担\\n• 法人 → アーティストの返却：\\n　- 6か月以上展示：アーティスト負担\\n　- 6か月未満の返却・交換：法人負担",
      },
    ],
  },
  {
    category: "展示期間・返却について",
    items: [
      {
        question: "作品の返却依頼はいつ出せますか？",
        answer:
          "いつでも出せます。6か月未満でも返却依頼は可能です。\n\n送料負担は以下の通りです：\n• 6か月以上展示 → アーティスト負担\n• 6か月未満展示 → 法人負担\n\n返却依頼はダッシュボードから送信できます。",
      },
    ],
  },
  {
    category: "破損・盗難・保険について",
    items: [
      {
        question: "展示中に作品が破損した場合は？",
        answer: "マイクロギャラリーが加入している保険で補償されます。",
      },
      {
        question: "盗難・紛失があった場合は？",
        answer:
          "原則として保険で補償されます。状況確認・警察届出・保険申請を行ったうえで対応します。",
      },
    ],
  },
  {
    category: "その他",
    items: [
      {
        question: "他のプラットフォームと併用できますか？",
        answer:
          "はい、併用して問題ありません。ただし、同一作品の販売管理は重複しないようアーティストの自己管理が必要です。",
      },
      {
        question: "販売ステータス（展示のみ／展示＋販売）は変更できますか？",
        answer: "はい、ダッシュボードからいつでも変更できます。",
      },
      {
        question: "作品の閲覧数やレコメンド数は確認できますか？",
        answer:
          "はい、ダッシュボードで閲覧数・お気に入り数・レコメンド回数などが確認できます。",
      },
    ],
  },
];

export function ArtistsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
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
  }, [location.hash]);

  const scrollToCTA = () => {
    const ctaElement = document.getElementById("register-cta");
    if (ctaElement) {
      ctaElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleRegisterClick = () => {
    localStorage.setItem("userType", "artist");
    navigate("/signup/artist");
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <HeroSection onRegisterClick={handleRegisterClick} />

      {/* Founder Message Section */}
      <FounderMessageSection />

      {/* Visual Problem Section */}
      <VisualProblemSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Important Notice Section */}
      <ImportantNoticeSection />

      {/* Revenue Section */}
      <RevenueSection />

      {/* FAQ Section */}
      <FAQSection
        faqData={FAQ_DATA}
        openFaqIndex={openFaqIndex}
        setOpenFaqIndex={setOpenFaqIndex}
      />

      {/* Contact Section */}
      <ContactSection />

      {/* CTA Section */}
      <CTASection onRegisterClick={handleRegisterClick} />

      <Footer />
    </div>
  );
}

// Hero Section Component
function HeroSection({
  onRegisterClick,
}: {
  onRegisterClick: () => void;
}) {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-8">
      <div className="absolute inset-0 z-0 opacity-30">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1623317978595-5eed03cbba31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnQlMjBnYWxsZXJ5JTIwd2FsbCUyMGV4aGliaXRpb258ZW58MXx8fHwxNzYxMTc4NDU0fDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Art gallery"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl text-white mb-8 tracking-tight leading-tight">
            あなたの作品を、<br />
            世界の壁に。
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed max-w-3xl mx-auto">
            まだ世に出ていない素晴らしい作品と、<br className="hidden md:block" />
            アートを求めている空間を、私たちがつなぎます。
          </p>
          <Button
            size="lg"
            onClick={onRegisterClick}
            className="bg-accent hover:bg-accent/90 text-white h-14 px-10 text-lg shadow-2xl"
          >
            アーティスト登録はこちら
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

// Founder Message Section Component
function FounderMessageSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-white via-beige-50/30 to-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-sm text-gray-500 mb-2">アーティストの皆さんへ</p>
            <h2 className="text-4xl text-primary mb-12">創業者からのメッセージ</h2>
          </div>

          {/* Founder Profile */}
          <div className="flex flex-col md:flex-row gap-8 items-start mb-20">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1729559149720-2b6c5c200428?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMGJ1c2luZXNzbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzYxMTc4ODM4fDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="山田隆"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex-grow">
              <h3 className="text-xl text-primary mb-1">山田 隆</h3>
              <p className="text-gray-600">マイクロギャラリー　代表</p>
            </div>
          </div>

          {/* Message Content */}
          <div className="prose prose-lg max-w-none">
            <div className="space-y-8 text-gray-700 leading-relaxed">
              <p>
                初めまして。マイクロギャラリーの代表を務める山田隆と申します。<br />
                私は金融機関に15年ほど勤めたのち、インバウンド向けの事業を立ち上げてきました。<br />
                アートの専門家ではありませんが、ずっと心の中に引っかかかっていた疑問があります。
              </p>

              <p className="text-xl text-primary py-4">
                なぜ、こんなにも多くの壁が何も飾られていないのだろう。<br />
                そして、なぜ素晴らしいアーティストたちの作品が、人に見られることなく眠っているのだろう。
              </p>

              <p>
                この社会には、まだ知られていない素晴らしい作品が数えきれないほどあります。<br />
                同時に、アートを求めながらも、空白のままの空間が無数に存在しています。<br />
                マイクロギャラリーは、その「出会えていない二者」をつなぐために生まれました。
              </p>

              <div className="my-16"></div>

              <p>
                私たちはホテルやカフェ、オフィス、病院など、日常にある空間をギャラリーに変えます。<br />
                アーティストの皆さんの作品を、実際の壁に展示し、多くの人に見てもらう機会をつくります。<br />
                そこを訪れた人が、ふと立ち止まり、心を動かされ、その場で購入できる仕組みを整えました。
              </p>

              <p>
                展示した法人には報酬を還元し、アートを飾ることが「支出」ではなく「価値を生む行為」に変わります。<br />
                この循環によって、あなたの作品がより多くの場所に飾られ、より多くの人に届いていく。
              </p>

              <div className="my-16"></div>

              <p>
                アートは、誰かの心を変え、空間の空気を変える力を持っています。<br />
                そして、その力を世の中へ広げることこそ、私たちマイクロギャラリーの使命です。
              </p>

              <p className="text-2xl text-primary py-4">
                あなたの作品で、世の中の壁を満たしていきませんか。
              </p>

              <p>私たちは、あなたの創造が届く場所を共に広げていきます。</p>

              <div className="mt-16 text-right">
                <p className="text-gray-600">2025年</p>
                <p className="text-gray-800 mb-1">マイクロギャラリー</p>
                <p className="text-gray-800">代表　山田 隆</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Visual Problem Section Component
function VisualProblemSection() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl text-primary mb-4">
              この出会いを、実現させたい
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Empty Walls Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Card className="overflow-hidden border-2 hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                <div className="aspect-[4/3] overflow-hidden">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1550605406-3d836450a56b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbXB0eSUyMHdoaXRlJTIwd2FsbCUyMG9mZmljZXxlbnwxfHx8fDE3NjExNzg4Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Empty wall"
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-8 flex-1">
                  <h3 className="text-2xl text-primary mb-4">
                    何もない、たくさんの壁
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    オフィス、ホテル、カフェ、病院…。<br />
                    社会のあちこちに、まだアートが飾られていない壁がたくさんあります。
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Artist Passion Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Card className="overflow-hidden border-2 hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                <div className="aspect-[4/3] overflow-hidden">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1604227070389-b88fd2896af6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc3QlMjBwYWludGluZyUyMHN0dWRpb3xlbnwxfHx8fDE3NjEwNzM2NDJ8MA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Artist at work"
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-8 flex-1">
                  <h3 className="text-2xl text-primary mb-4">
                    見せる機会を待つ、作品たち
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    才能と情熱を注いで生み出された作品。<br />
                    でも、人に見てもらう機会は圧倒的に少ないのが現実です。
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// How It Works Section Component
function HowItWorksSection() {
  const steps = [
    {
      icon: Upload,
      number: "01",
      title: "作品を登録する",
      description: "写真をアップロードして、作品情報を入力。預け入れは不要です。",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Building2,
      number: "02",
      title: "法人（企業・店舗）が選定・展示",
      description:
        "オフィス、ホテル、カフェなどを運営する法人があなたの作品を選び、展示します。",
      color: "from-accent to-accent/80",
    },
    {
      icon: Users,
      number: "03",
      title: "幅広い人々に届く、売れたら50％があなたに",
      description: "その空間を訪れた人々がQRコードから購入できます。",
      color: "from-primary to-primary/80",
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl text-primary mb-4">シンプルな3つのステップ</h2>
          <p className="text-xl text-gray-600">あなたの作品が世に出るまで</p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="space-y-8">
            {steps.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
              >
                <Card className="border-2 hover:shadow-2xl transition-all duration-300">
                  <CardContent className="flex flex-col md:flex-row items-center gap-8 p-8">
                    <div
                      className={`flex-shrink-0 w-24 h-24 rounded-3xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-xl`}
                    >
                      <item.icon className="w-12 h-12 text-white" />
                    </div>
                    <div className="flex-grow text-center md:text-left">
                      <div className="text-sm text-gray-500 mb-2">
                        STEP {item.number}
                      </div>
                      <h3 className="text-2xl text-primary mb-3">{item.title}</h3>
                      <p className="text-gray-700 leading-relaxed text-lg">
                        {item.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Important Notice Section Component
function ImportantNoticeSection() {
  const notices = [
    {
      title: "審査なし、登録・展示は無料です",
      description:
        "マイクロギャラリーでは、作品やアーティストの審査は行っておりません。どなたでも無料でご登録いただけます。\n展示も無料で、登録費用や月額費用なども一切かかりません。\nただし、公共の場所に展示されるため、過度性的・暴力的な表現を含む作品はご遠慮ください。",
      borderColor: "border-blue-200",
      bgColor: "bg-blue-50/30",
      iconColor: "text-blue-600",
    },
    {
      title: "展示先は法人が選び、公共性のある場所に限ります",
      description:
        "展示する作品は、オフィス、ホテル、カフェ、病院など、不特定多数の方が訪れる公共性のあるスペースを運営する法人が、ご自身の空間に合うものを選定します。\nアーティスト側から展示場所を指定したり、個人宅への展示を行うことはできませんが、より多くの法人に見ていただけるよう、魅力的なプロフィールと作品登録をお勧めします。",
      borderColor: "border-purple-200",
      bgColor: "bg-purple-50/30",
      iconColor: "text-purple-600",
    },
    {
      title: "作品は保管せず、直接お送りいただきます",
      description:
        "マイクロギャラリーでは作品を預かることはございません。展示リクエストが届いた際に、アーティストご自身で展示先へ直接発送していただきます。\n梱包用の専用ボックスはマイクロギャラリーが無償でご提供いたしますので、安心してお送りください。",
      borderColor: "border-green-200",
      bgColor: "bg-green-50/30",
      iconColor: "text-green-600",
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl text-primary mb-4">
              ご利用前に知っておいていただきたいこと
            </h2>
          </div>

          <div className="space-y-6">
            {notices.map((notice, index) => (
              <Card
                key={index}
                className={`border-2 ${notice.borderColor} ${notice.bgColor}`}
              >
                <CardContent className="p-6">
                  <h3 className="text-xl text-primary mb-3 flex items-center gap-2">
                    <CheckCircle2 className={`w-6 h-6 ${notice.iconColor}`} />
                    {notice.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {notice.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Revenue Section Component
function RevenueSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-4xl text-primary mb-4">
            作品が売れたら、50％があなたに
          </h2>
          <p className="text-xl text-gray-600">登録・展示は無料。</p>
        </motion.div>
      </div>
    </section>
  );
}

// FAQ Section Component
function FAQSection({
  faqData,
  openFaqIndex,
  setOpenFaqIndex,
}: {
  faqData: typeof FAQ_DATA;
  openFaqIndex: number | null;
  setOpenFaqIndex: (index: number | null) => void;
}) {
  return (
    <section id="faq" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <HelpCircle className="w-10 h-10 text-primary" />
            <h2 className="text-4xl text-primary">よくある質問</h2>
          </div>
          <p className="text-xl text-gray-600">
            アーティストの皆さんからよくいただく質問
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-12">
          {faqData.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-2xl text-primary mb-6 pb-3 border-b-2 border-primary/20"
              >
                {category.category}
              </motion.h3>
              <div className="space-y-3">
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
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-grow">
                              <h4 className="text-lg text-primary mb-2">
                                Q. {faq.question}
                              </h4>
                              {isOpen && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="text-gray-700 leading-relaxed mt-3 pt-3 border-t border-gray-200 whitespace-pre-line"
                                >
                                  A. {faq.answer}
                                </motion.div>
                              )}
                            </div>
                            <ChevronDown
                              className={`w-6 h-6 text-primary flex-shrink-0 transition-transform duration-300 ${
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
  );
}

// Contact Section Component
function ContactSection() {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Mail className="w-10 h-10 text-primary" />
              <h2 className="text-4xl text-primary">お問い合わせ</h2>
            </div>
            <p className="text-xl text-gray-600">
              ご不明な点がございましたら、お気軽にお問い合わせください
            </p>
          </div>

          <Card className="border-2 shadow-xl">
            <CardContent className="p-10">
              <div className="space-y-8">
                <div className="text-center">
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    登録に関するご質問、作品の展示や販売についてのお悩み、<br />
                    その他どんなことでもお気軽にご相談ください。
                  </p>
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-3 text-xl text-primary">
                      <Mail className="w-6 h-6" />
                      <a
                        href="mailto:support@microgallery.co.jp"
                        className="hover:underline"
                      >
                        support@microgallery.co.jp
                      </a>
                    </div>
                    <p className="text-sm text-gray-600">
                      ※通常1〜2営業日以内にご返信いたします
                    </p>
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-200">
                  <h3 className="text-xl text-primary mb-4 text-center">
                    または、お問い合わせフォームから
                  </h3>
                  <div className="text-center">
                    <Button
                      size="lg"
                      onClick={() => navigate("/contact")}
                      className="bg-primary hover:bg-primary/90 text-white h-14 px-10 text-lg"
                    >
                      お問い合わせフォームを開く
                      <Mail className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

// CTA Section Component
function CTASection({ onRegisterClick }: { onRegisterClick: () => void }) {
  return (
    <section
      id="register-cta"
      className="relative py-32 overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-accent/90"
    >
      <div className="absolute inset-0 z-0 opacity-10">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1534943770885-dacb3dfa9d27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnQlMjBleGhpYml0aW9uJTIwdmlzaXRvcnxlbnwxfHx8fDE3NjExNzg4Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Art exhibition"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h2 className="text-5xl md:text-6xl text-white mb-6 leading-tight">
            世の中の壁を、<br />
            あなたの作品で<br />
            満たしていきませんか。
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed">
            あなたの努力と才能の結晶を、<br />
            共に広げるお手伝いができればと願っています。
          </p>
          <Button
            size="lg"
            onClick={onRegisterClick}
            className="bg-white hover:bg-white/90 text-primary h-16 px-12 text-xl shadow-2xl"
          >
            アーティスト登録へ進む
            <ChevronRight className="ml-2 w-6 h-6" />
          </Button>
          <p className="text-white/80 mt-8">登録・展示は無料。</p>
        </motion.div>
      </div>
    </section>
  );
}

