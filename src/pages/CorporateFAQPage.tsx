import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Search, ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type FAQItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
  relatedIds?: string[];
};

const faqData: FAQItem[] = [
  // 1. アカウント・ログインについて
  {
    id: "q1",
    question: "ログイン情報を社内で共有してもいいですか？",
    answer:
      'MGJでは**「1法人につき1つの代表アカウント」**を推奨しています。\n代表アカウント内で 担当者（メンバー）を追加登録 でき、担当者ごとにメール通知を受け取ることも可能です。\n実際のログインID・パスワードは代表アカウントのみで管理いただく形となります。',
    category: "アカウント",
    relatedIds: ["q3", "q4"],
  },
  {
    id: "q2",
    question: "パスワードを忘れてしまいました。",
    answer: 'ログイン画面の「パスワードをお忘れですか？」から再設定が可能です。',
    category: "アカウント",
  },
  {
    id: "q3",
    question: "担当者が退職・異動した場合は？",
    answer:
      "代表アカウントを維持したまま、\n— 担当者リストから削除\n— 新担当者を追加\nできます。",
    category: "アカウント",
    relatedIds: ["q1", "q32"],
  },
  {
    id: "q4",
    question: "複数店舗・複数拠点でも利用できますか？",
    answer: "はい。1法人アカウントの中で複数スペースを登録できます。",
    category: "アカウント",
    relatedIds: ["q6", "q28"],
  },

  // 2. 法人情報について
  {
    id: "q5",
    question: "法人名や住所を変更できますか？",
    answer: 'ログイン後の「法人情報」画面から変更できます。',
    category: "法人情報",
  },

  // 3. スペース登録・写真アップロード
  {
    id: "q6",
    question: "「スペース」とは何ですか？",
    answer:
      "アートを設置する単位の空間を指します。\n例：受付、会議室、ホテル客室、廊下、店舗の一部 など",
    category: "スペース登録",
    relatedIds: ["q7", "q8"],
  },
  {
    id: "q7",
    question: "スペース登録時に必要なものは？",
    answer: "— スペース名\n— 用途カテゴリ\n— 写真（壁・空間がわかるもの）\nの3点です。",
    category: "スペース登録",
    relatedIds: ["q6", "q8"],
  },
  {
    id: "q8",
    question: "写真はどのように撮影すれば良いですか？",
    answer:
      "— 壁全体が入る構図\n— 明るい時間帯\n— 床・家具も少し写す\n— 人物・荷物は写さない\nなどが推奨です。",
    category: "スペース登録",
    relatedIds: ["q9", "q10"],
  },
  {
    id: "q9",
    question: "スマホ撮影で問題ないですか？",
    answer: "はい、問題ありません。",
    category: "スペース登録",
  },
  {
    id: "q10",
    question: "写真を差し替えた場合、提案はどうなりますか？",
    answer: "新しい写真を基に自動で再解析され、レコメンドも自動更新されます。",
    category: "スペース登録",
    relatedIds: ["q11", "q12"],
  },

  // 4. 色解析・AIレコメンドについて
  {
    id: "q11",
    question: "色解析とは？",
    answer: "壁・床・家具の色や、空間の雰囲気をAIが自動抽出する処理です。",
    category: "AI・レコメンド",
    relatedIds: ["q12", "q13"],
  },
  {
    id: "q12",
    question: "AIレコメンドはどう作品を選んでいますか？",
    answer:
      "— スペースの色・明るさ・トーン\n— 作品側の色味・スタイル\n— サイズ感\nなどを総合的に判定して候補を出します。",
    category: "AI・レコメンド",
    relatedIds: ["q11", "q13"],
  },
  {
    id: "q13",
    question: "提案がイメージと違う場合は？",
    answer:
      "「落ち着いた色が良い」「派手めは避けたい」などフィードバックいただければ、システム改善に反映します。",
    category: "AI・レコメンド",
    relatedIds: ["q14", "q34"],
  },
  {
    id: "q14",
    question: "言葉でも空間のイメージを伝えたいのですが？",
    answer: "「北欧」「ナチュラル」「ラグジュアリー」など、キーワード設定が可能です。",
    category: "AI・レコメンド",
    relatedIds: ["q13", "q34"],
  },

  // 5. 作品の選定・サイズ感
  {
    id: "q15",
    question: "作品サイズはどう決めれば良いですか？",
    answer:
      "AIが空間の幅・天井高・視認距離から推奨サイズを算出し、複数候補を提示します。",
    category: "作品選定",
    relatedIds: ["q12", "q28"],
  },

  // 6. 契約・リースの基本
  {
    id: "q16",
    question: "契約はMGJと結ぶのですか？",
    answer:
      "はい。法人様はMGJ（日本法人）が窓口となり、アーティストとの個別契約は不要です。",
    category: "契約",
  },

  // 7. 展示期間・入れ替え・送料
  {
    id: "q17",
    question: "作品の入れ替えはどう調整しますか？",
    answer:
      "展示終了前にMGJから連絡し、\n— 継続展示\n— 別作品に入れ替え\n— 展示終了\nを選択いただきます。",
    category: "展示期間",
    relatedIds: ["q18", "q27"],
  },
  {
    id: "q18",
    question: "送料負担のルールは？",
    answer:
      "— 6か月以上展示 → アーティスト側が送料負担\n— 6か月未満で返却・交換 → 法人様負担\nこれがMGJの基本ルールです。",
    category: "展示期間",
    relatedIds: ["q17", "q27"],
  },

  // 8. 破損・紛失・保険
  {
    id: "q19",
    question: "展示中に作品が破損した場合は？",
    answer:
      "MGJは輸送・展示期間の事故に対応する保険スキームを整備しています。\n通常利用の範囲での破損であれば、\n法人様に重大な過失がない限り、保険でカバーされる前提です。",
    category: "保険・破損",
    relatedIds: ["q20"],
  },
  {
    id: "q20",
    question: "紛失・盗難の場合は？",
    answer:
      "状況をヒアリングし、警察届出・保険会社との調整の上、\n故意や重過失がなければ保険でカバーする方針です。",
    category: "保険・破損",
    relatedIds: ["q19"],
  },

  // 9. データ・セキュリティ
  {
    id: "q21",
    question: "スペース写真をプロモーションに使われることはありますか？",
    answer: "事例紹介として利用する場合は、必ず事前に承諾をいただきます。",
    category: "データ・セキュリティ",
  },
  {
    id: "q22",
    question: "データはどのように扱われますか？",
    answer:
      "サービス改善・レコメンド精度向上目的で使用します。\n外部への販売や特定可能な形での提供は行いません。",
    category: "データ・セキュリティ",
  },

  // 10. 料金・費用について
  {
    id: "q23",
    question: "展示に費用はかかりますか？",
    answer:
      "展示は完全無料です。\n初期費用・月額・レンタル料は一切ありません。\n\n但し、6か月未満の入れ替え時のみ、法人様に送料をご負担いただく場合があります。",
    category: "料金・収益",
    relatedIds: ["q18", "q24"],
  },
  {
    id: "q24",
    question: "作品が売れた場合、法人の取り分は？",
    answer: "販売価格の 10％を法人様に還元します。\n空間を提供いただくことへの対価です。",
    category: "料金・収益",
    relatedIds: ["q23", "q25"],
  },
  {
    id: "q25",
    question: "送料などの支払い方法は？",
    answer:
      "銀行振込またはクレジットカード決済に対応予定です。\n売上分配はMGJから登録口座へ振り込みます。",
    category: "料金・収益",
  },

  // 11. 作品の購入について
  {
    id: "q26",
    question: "展示中の作品を法人として購入できますか？",
    answer:
      "はい、可能です。\n購入後は引き続き展示していただくことも、別場所への移動も自由です。",
    category: "購入・メンテナンス",
  },

  // 12. 展示期間について
  {
    id: "q27",
    question: "最低展示期間はありますか？",
    answer:
      "— 6か月以上の展示 → 作品返却時の送料はアーティスト負担\n— 6か月未満の展示 → 法人様負担\nというルールがあります。",
    category: "展示期間",
    relatedIds: ["q18", "q17"],
  },

  // 13. 複数作品の展示
  {
    id: "q28",
    question: "1スペースに複数作品を展示できますか？",
    answer:
      '基本仕様では「1スペース＝1作品」です。\n複数展示したい場合は、スペースを追加登録してください。',
    category: "作品展示",
    relatedIds: ["q6", "q15"],
  },

  // 14. メンテナンス
  {
    id: "q29",
    question: "日常的な手入れは必要ですか？",
    answer:
      "乾いた柔らかい布で軽くホコリを払う程度で充分です。\n以下は避けてください：\n— 水・洗剤使用\n— 直射日光\n— 高湿度（浴室近くなど）",
    category: "購入・メンテナンス",
    relatedIds: ["q30"],
  },
  {
    id: "q30",
    question: "定期メンテナンスは必要ですか？",
    answer:
      "基本不要です。\n展示開始から1年以上経過した作品は、MGJより状態確認をお願いする場合があります。",
    category: "購入・メンテナンス",
    relatedIds: ["q29"],
  },

  // 15. 通知・メール設定
  {
    id: "q31",
    question: "MGJからどんなメールが届きますか？",
    answer:
      "— 配送予定\n— 到着完了\n— 作品が「お気に入り」に入った通知\n— 作品が売れた通知\n— 展示期間終了前のリマインド\nを自動通知します。",
    category: "通知設定",
    relatedIds: ["q32"],
  },
  {
    id: "q32",
    question: "通知設定は変更できますか？",
    answer:
      'はい。\nログイン後「設定」から、通知項目ごとに ON/OFF を切り替えできます。\n担当者ごとに通知内容を変えることも可能です。',
    category: "通知設定",
    relatedIds: ["q31", "q3"],
  },

  // 16. 審査なしのオープンプラットフォーム
  {
    id: "q33",
    question: "審査なしで品質は大丈夫ですか？",
    answer:
      'MGJは「オープンプラットフォーム方式」を採用しているため審査は行いません。\nただし、以下は自動的に非表示になります：\n— 暴力・差別表現\n— 著作権侵害\n— 公序良俗違反作品\n\nまた、法人ごとに「NGテイスト」が設定でき、\n表示しない傾向を調整できます。',
    category: "オープンプラットフォーム",
    relatedIds: ["q34"],
  },
  {
    id: "q34",
    question: "レコメンドが好みに合わない場合は？",
    answer:
      "レコメンドは候補の1つですので、採用は任意です。\n「抽象画は避けたい」「青系が多い方が良い」などフィードバックをいただくと、精度が向上します。",
    category: "オープンプラットフォーム",
    relatedIds: ["q13", "q33"],
  },

  // 17. 初期導入
  {
    id: "q35",
    question: "トライアルやお試しはありますか？",
    answer:
      '作品展示自体が無料のため、\n「まず1作品のみ試す」スモールスタートが可能です。\n気に入れば後から増やしていただけます。',
    category: "初期導入",
    relatedIds: ["q23"],
  },
];

const categories = [
  "すべて",
  "アカウント",
  "法人情報",
  "スペース登録",
  "AI・レコメンド",
  "作品選定",
  "契約",
  "展示期間",
  "保険・破損",
  "データ・セキュリティ",
  "料金・収益",
  "購入・メンテナンス",
  "作品展示",
  "通知設定",
  "オープンプラットフォーム",
  "初期導入",
];

export function CorporateFAQPage() {
  const [selectedCategory, setSelectedCategory] = useState("すべて");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFAQs = faqData.filter((faq) => {
    const matchesCategory =
      selectedCategory === "すべて" || faq.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getRelatedQuestions = (relatedIds: string[] = []) => {
    return faqData.filter((faq) => relatedIds.includes(faq.id));
  };

  const scrollToQuestion = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-20 sm:pt-32 pb-16 sm:pb-24">
        <div className="max-w-[920px] mx-auto px-4 sm:px-6">
          {/* ヘッダー */}
          <div className="mb-8 sm:mb-12 text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-3 text-[#1A1A1A]">
              FAQ（よくある質問）
            </h1>
            <p className="text-sm sm:text-base text-[#6B6B6B]">
              法人向けによくいただく質問をまとめています。カテゴリーからお選びください。
            </p>
          </div>

          {/* 検索ボックス */}
          <div className="mb-6 sm:mb-10">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="キーワードで検索（例：送料、サイズ、破損保証）"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 sm:h-11 pl-10 sm:pl-12 pr-4 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-primary transition-colors text-sm sm:text-base"
              />
            </div>
          </div>

          {/* カテゴリータブ */}
          <div className="mb-8 sm:mb-12 overflow-x-auto">
            <div className="flex gap-2 pb-2 min-w-max">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 sm:px-4 py-2 rounded-lg border border-[#E5E5E5] text-xs sm:text-sm transition-colors whitespace-nowrap ${
                    selectedCategory === category
                      ? "bg-[#F4F4F4] text-[#1A1A1A]"
                      : "bg-white text-[#6B6B6B] hover:bg-[#FAFAFA]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ アコーディオン */}
          <div className="space-y-1">
            {filteredFAQs.length > 0 ? (
              <Accordion type="single" collapsible className="space-y-1">
                {filteredFAQs.map((faq) => (
                  <AccordionItem
                    key={faq.id}
                    value={faq.id}
                    id={faq.id}
                    className="border border-[#E5E5E5] rounded-lg px-4 sm:px-6 overflow-hidden"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-4 sm:py-5">
                      <span className="pr-4 text-sm sm:text-base">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 sm:pb-6">
                      <div className="bg-[#FAFAFA] -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 sm:py-5 text-[#5A5A5A] leading-relaxed text-sm sm:text-base">
                        {faq.answer.split("\n").map((line, index) => (
                          <p key={index} className="mb-2 last:mb-0">
                            {line}
                          </p>
                        ))}

                        {/* 関連質問 */}
                        {faq.relatedIds && faq.relatedIds.length > 0 && (
                          <div className="mt-4 sm:mt-6 bg-[#F9F9F9] rounded-lg p-3 sm:p-4 border border-[#E5E5E5]">
                            <p className="text-xs text-[#6B6B6B] mb-2">関連する質問</p>
                            <div className="space-y-1">
                              {getRelatedQuestions(faq.relatedIds).map((related) => (
                                <button
                                  key={related.id}
                                  onClick={() => scrollToQuestion(related.id)}
                                  className="block text-xs sm:text-sm text-primary hover:text-primary/80 transition-colors text-left"
                                >
                                  → {related.question}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <p className="text-sm sm:text-base text-[#6B6B6B]">
                  該当する質問が見つかりませんでした。
                  <br />
                  別のキーワードやカテゴリーをお試しください。
                </p>
              </div>
            )}
          </div>

          {/* お問い合わせCTA */}
          <div className="mt-12 sm:mt-16 text-center p-6 sm:p-8 bg-[#FAFAFA] rounded-lg border border-[#E5E5E5]">
            <p className="text-sm sm:text-base text-[#1A1A1A] mb-3 sm:mb-4">解決しない場合は、お気軽にお問い合わせください。</p>
            <a
              href="#/contact"
              className="inline-block px-6 sm:px-8 py-2 sm:py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base"
            >
              お問い合わせフォームへ
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

