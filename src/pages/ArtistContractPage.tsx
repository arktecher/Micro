import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Palette,
  DollarSign,
  Package,
  Shield,
  Truck,
  AlertCircle,
  Coins,
  FileText,
  CheckCircle,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ArtistContractPage() {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);

  // ページ遷移時に一番上にスクロール
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Check if user has already agreed to terms
  useEffect(() => {
    const hasAgreed = localStorage.getItem("mgj_artist_terms_agreed");
    if (hasAgreed === "true") {
      // User has already agreed, skip this page and go directly to artwork selection
      navigate("/artwork-selection");
    }
  }, [navigate]);

  const handleAgree = () => {
    if (agreed) {
      // Save agreement status to localStorage
      localStorage.setItem("mgj_artist_terms_agreed", "true");
      console.log("Contract agreed");
      navigate("/artwork-selection");
    }
  };

  const keyPoints = [
    {
      icon: Heart,
      color: "text-accent",
      bgColor: "bg-accent/10",
      title: "展示は無料です",
      description: "登録料や掲載料などの費用は一切かかりません。",
    },
    {
      icon: Palette,
      color: "text-primary",
      bgColor: "bg-primary/10",
      title: "価格はあなたが決めます",
      description:
        "作品の販売価格は、アーティストご本人が自由に設定していただけます。MGJが価格を一方的に変更することはございません。",
    },
    {
      icon: DollarSign,
      color: "text-accent",
      bgColor: "bg-accent/10",
      title: "売上の50％をお支払い",
      description:
        "作品が売れた際は、販売価格の50％をお支払いいたします。お支払いは3か月ごとにまとめて行われます。",
    },
    {
      icon: Package,
      color: "text-primary",
      bgColor: "bg-primary/10",
      title: "発送について",
      description:
        "作品は展示先（ホテル・オフィスなど）へ直接お送りいただきます。発送時の梱包箱はMGJからお送りしますので、同封のマニュアルに従って梱包をお願いいたします。",
    },
    {
      icon: Shield,
      color: "text-accent",
      bgColor: "bg-accent/10",
      title: "保険で大切に守ります",
      description:
        "展示中・輸送中の作品はMGJが加入する保険でカバーされます。万が一破損や紛失が発生した場合も、保険会社の定める条件に基づいて補償いたします。",
    },
    {
      icon: Truck,
      color: "text-primary",
      bgColor: "bg-primary/10",
      title: "返却時の送料について",
      description:
        "展示開始から3か月以内にアーティストが返却をご希望の場合は送料をご負担いただきます。3か月以降にマイクロギャラリー側が交換・返却する際は、先方が送料を負担いたします。",
    },
    {
      icon: AlertCircle,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
      title: "作品の審査について",
      description:
        "作品の登録は原則自由ですが、他者の権利を侵害するものや、公的な空間への展示に適さないと判断される作品は、掲載をお断りする場合がございます。",
    },
    {
      icon: Coins,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
      title: "将来的な料金について",
      description:
        "アーティストの皆さまからご利用料をいただくことは想定しておりません。将来的に法人向けのサービスに料金を導入する可能性がありますが、その場合も事前にお知らせいたします。",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream/30 via-white to-gray-50">
      <Header />

      <div className="pt-20 sm:pt-24 pb-12 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          {/* ウェルカムメッセージ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8 sm:mb-12"
          >
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 mb-4 sm:mb-6">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-primary mb-3 sm:mb-4 px-2">
                最後のステップです
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto px-2">
                ご利用にあたっての大切なお約束をわかりやすくまとめました。
                <br className="hidden sm:block" />
                お互いに安心して、気持ちよく関わっていくためのルールとお考えください。
                <br className="hidden sm:block" />
                わからないことがあれば、いつでも遠慮なくお尋ねください。
              </p>
            </div>
          </motion.div>

          {/* 要点まとめ */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8 sm:mb-12"
          >
            <Card className="shadow-xl border-2">
              <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
                <CardTitle className="text-lg sm:text-xl md:text-2xl text-center">
                  契約のポイント（わかりやすく要約）
                </CardTitle>
                <p className="text-center text-sm sm:text-base text-gray-600 mt-2">
                  詳細は下記「アーティスト契約」に記載されています
                </p>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 md:p-8">
                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                  {keyPoints.map((point, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                      className="flex gap-3 sm:gap-4"
                    >
                      <div
                        className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full ${point.bgColor} flex items-center justify-center`}
                      >
                        <point.icon
                          className={`w-5 h-5 sm:w-6 sm:h-6 ${point.color}`}
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h3 className="text-sm sm:text-base text-primary mb-1 sm:mb-2">
                          {point.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                          {point.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 詳細な契約書 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-8 sm:mb-12"
          >
            <Card className="shadow-xl border-2">
              <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
                <CardTitle className="text-lg sm:text-xl md:text-2xl text-center">
                  アーティスト利用契約（MGJアーティスト規約）
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 md:p-8">
                <ScrollArea className="h-[400px] sm:h-[500px] md:h-[600px] rounded-lg border p-4 sm:p-6 bg-gray-50">
                  <div className="space-y-4 sm:space-y-6 text-xs sm:text-sm leading-relaxed text-gray-700">
                    <div>
                      <p className="mb-3 sm:mb-4">
                        本規約（以下「本契約」といいます）は、株式会社マイクロギャラリージャパン（以下「甲」といいます）が運営する「Micro
                        Gallery
                        Japan」（以下「MGJ」といいます）のサービスを利用し、作品を登録・展示・販売するアーティスト（以下「乙」といいます）との間の権利義務関係を定めるものです。
                      </p>
                      <p>
                        乙がMGJ上で「同意する」ボタンをクリックし登録を完了した時点で、本契約は成立します。
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm sm:text-base text-primary mb-2 sm:mb-3">
                        第1条（目的）
                      </h3>
                      <p>
                        本契約は、乙が制作したアート作品（以下「作品」といいます）を、甲が運営するMGJプラットフォーム上を通じて展示・販売する仕組みを定め、乙の創作活動の機会拡大および取引の公正性を確保することを目的とします。
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm sm:text-base text-primary mb-2 sm:mb-3">
                        第2条（登録および作品掲載）〔改訂後〕
                      </h3>
                      <ol className="list-decimal list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                        <li>
                          乙は、MGJのアーティスト登録ページから必要事項（氏名、住所、経歴、作品情報等）を正確に登録するものとします。
                        </li>
                        <li>
                          乙は、登録内容に変更が生じた場合、速やかに甲へ通知するものとします。
                        </li>
                        <li>
                          乙は、作品の販売価格を自由に設定できるものとします。甲は販売促進上の理由により助言を行うことができますが、価格を強制的に変更することはありません。
                        </li>
                        <li>
                          乙は、作品の登録を原則自由に行えます。ただし、甲は、他者の権利を侵害するものや、過度に暴力的・性的な表現など、公的な空間への展示に適さないと判断される作品について、掲載または展示を拒否・削除できるものとします。
                          <br />
                          <span className="ml-2 sm:ml-4">
                            その際、甲はその理由を個別に開示する義務を負わないものとします。
                          </span>
                        </li>
                      </ol>
                    </div>

                    <div>
                      <h3 className="text-sm sm:text-base text-primary mb-2 sm:mb-3">
                        第3条（作品の展示および発送）
                      </h3>
                      <ol className="list-decimal list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                        <li>
                          作品が展示先（マイクロギャラリー）に選ばれた場合、乙は甲の指示に従い、作品を甲を経由せず直接マイクロギャラリーへ発送するものとします。
                        </li>
                        <li>発送時の送料および梱包費は乙の負担とします。</li>
                        <li>
                          作品が販売または展示終了後に返却される場合、以下の通り送料を負担します。
                          <br />
                          <span className="ml-2 sm:ml-4">
                            （1）展示開始から3ヶ月以内に乙が返却を希望する場合：乙が送料を負担する。
                          </span>
                          <br />
                          <span className="ml-2 sm:ml-4">
                            （2）展示開始から3ヶ月経過後にマイクロギャラリーが交換・返却を希望する場合：マイクロギャラリーが送料を負担する。
                          </span>
                        </li>
                        <li>
                          甲は、輸送中・展示中の破損、汚損、紛失等について合理的な注意義務を負うが、不可抗力による損害については責任を負わない。
                        </li>
                      </ol>
                    </div>

                    <div>
                      <h3 className="text-sm sm:text-base text-primary mb-2 sm:mb-3">
                        第4条（販売および支払い）
                      </h3>
                      <ol className="list-decimal list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                        <li>
                          作品が販売された場合、甲は購入者から販売代金を受領し、所定の手数料を控除した残額を乙に支払います。
                        </li>
                        <li>
                          乙への支払額は、販売代金（税込）の<strong>50％</strong>
                          とします。
                        </li>
                        <li>
                          支払いは、3か月ごとに締め、翌月末までに乙の指定口座へ振り込みます。
                        </li>
                        <li>振込手数料は乙の負担とします。</li>
                      </ol>
                    </div>

                    <div>
                      <h3 className="text-sm sm:text-base text-primary mb-2 sm:mb-3">
                        第5条（知的財産権）
                      </h3>
                      <ol className="list-decimal list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                        <li>
                          乙は、登録する作品が第三者の著作権・商標権・肖像権等を侵害していないことを保証します。
                        </li>
                        <li>
                          甲は、MGJの運営・広報・販売促進の目的の範囲内で、乙の作品画像・情報を無償で使用できるものとします。
                        </li>
                        <li>
                          乙がAI生成や他者素材を利用した作品を登録する場合、その法的権利関係を乙自身の責任で解決するものとします。
                        </li>
                      </ol>
                    </div>

                    <div>
                      <h3 className="text-sm sm:text-base text-primary mb-2 sm:mb-3">
                        第6条（費用・利用料）
                      </h3>
                      <ol className="list-decimal list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                        <li>
                          本契約締結時点において、作品登録および展示に関する費用は無料とします。
                        </li>
                        <li>
                          甲は、今後サービス運営上の必要に応じて法人に対してリース料・利用料を導入する場合があります。その際は、少なくとも30日前に乙に通知し、乙が同意しない場合は契約を終了できます。
                        </li>
                      </ol>
                    </div>

                    <div>
                      <h3 className="text-sm sm:text-base text-primary mb-2 sm:mb-3">
                        第7条（禁止事項）
                      </h3>
                      <p className="mb-1 sm:mb-2">乙は、以下の行為を行ってはなりません。</p>
                      <ol className="list-decimal list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                        <li>第三者の権利を侵害する行為</li>
                        <li>公序良俗に反する作品の登録</li>
                        <li>MGJ上で虚偽情報を登録する行為</li>
                        <li>作品を無断で複製・再販する行為</li>
                        <li>甲または展示先の信用を毀損する行為</li>
                      </ol>
                    </div>

                    <div>
                      <h3 className="text-sm sm:text-base text-primary mb-2 sm:mb-3">
                        第8条（契約期間および終了）
                      </h3>
                      <ol className="list-decimal list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                        <li>本契約は、乙の登録完了日から効力を有します。</li>
                        <li>
                          乙は、MGJのマイページから契約の終了を申し出ることができます。
                        </li>
                        <li>
                          甲は、乙が本契約に違反した場合、または運営上の支障が生じた場合、事前通知の上で登録を停止・削除できるものとします。
                        </li>
                      </ol>
                    </div>

                    <div>
                      <h3 className="text-sm sm:text-base text-primary mb-2 sm:mb-3">
                        第9条（免責）
                      </h3>
                      <ol className="list-decimal list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                        <li>
                          甲は、天災、事故、通信障害、展示先施設の都合等、甲の合理的支配を超える事由によってした損害について責任を負いません。
                        </li>
                        <li>
                          乙が登録・展示した作品に関して第三者と紛争が生じた場合、乙の責任において解決するものとします。
                        </li>
                        <li>
                          ただし、甲の重大な過失または故意による損害についてはこの限りではありません。
                        </li>
                      </ol>
                    </div>

                    <div>
                      <h3 className="text-sm sm:text-base text-primary mb-2 sm:mb-3">
                        第10条（準拠法および管轄）
                      </h3>
                      <ol className="list-decimal list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                        <li>本契約は日本法を準拠法とします。</li>
                        <li>
                          本契約に関する紛争が生じた場合、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
                        </li>
                      </ol>
                    </div>

                    <div className="border-t pt-4 sm:pt-6 mt-6 sm:mt-8">
                      <h3 className="text-sm sm:text-base text-primary mb-2 sm:mb-3">
                        【オンライン同意の効力】
                      </h3>
                      <p>
                        乙がMGJの登録画面において「本契約に同意する」ボタンを押下し登録を完了した時点で、本契約は電子的に締結されたものとし、書面による署名・押印に代わる法的効力を有します。
                      </p>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>

          {/* 同意チェックボックスとボタン */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Card className="shadow-xl border-2 border-primary/20">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <div className="space-y-4 sm:space-y-6">
                  {/* チェックボックス */}
                  <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 bg-gray-50 rounded-lg">
                    <Checkbox
                      id="agree"
                      checked={agreed}
                      onCheckedChange={(checked) => setAgreed(checked as boolean)}
                      className="mt-1"
                    />
                    <label
                      htmlFor="agree"
                      className="flex-grow text-sm sm:text-base text-gray-700 leading-relaxed cursor-pointer"
                    >
                      上記の「アーティスト利用契約（MGJアーティスト規約）」の内容を確認し、同意します。
                    </label>
                  </div>

                  {/* 同意ボタン */}
                  <Button
                    onClick={handleAgree}
                    disabled={!agreed}
                    size="lg"
                    className={`w-full sm:w-auto sm:min-w-[300px] md:min-w-[400px] h-12 sm:h-14 sm:h-16 text-sm sm:text-base md:text-lg mx-auto block flex items-center justify-center ${
                      agreed
                        ? "bg-primary hover:bg-primary/90"
                        : "bg-gray-300 cursor-not-allowed"
                    }`}
                  >
                    {agreed ? (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-6" />
                        <span className="text-xs sm:text-sm md:text-base">
                          契約に同意して次の画面でサイトに掲載する作品を選ぶ
                        </span>
                      </div>
                    ) : (
                      <>上記にチェックを入れてください</>
                    )}
                  </Button>

                  {/* サポート情報 */}
                  <div className="text-center pt-4 sm:pt-6 border-t">
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed px-2">
                      ご不明な点やご質問がございましたら、お気軽にお問い合わせください。
                      <br className="hidden sm:block" />
                      <a
                        href="mailto:support@microgalleryjapan.com"
                        className="text-primary hover:underline break-all sm:break-normal"
                      >
                        support@microgalleryjapan.com
                      </a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

