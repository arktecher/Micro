import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "motion/react";
import {
  Palette,
  Building2,
  ShoppingCart,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const ANIMATION_DURATION = 0.8;
const IN_VIEW_MARGIN = "-100px";

const FLOW_STEPS = [
  {
    icon: Palette,
    title: "アーティスト",
    subtitle: "",
    description: '作品を"飾るだけ"でチャンスが生まれる',
    features: [
      "展示候補として登録",
      "自分で価格設定可能",
      "販売時に50％を受け取り",
    ],
    bgColor: "bg-blue-900",
    arrowLabel: "作品登録",
  },
  {
    icon: Building2,
    title: "マイクロギャラリー",
    subtitle: "(法人)",
    description: '空間を"ギャラリー"に。初期費用ゼロ。',
    features: ["展示費無料", "販売成立時に10％の報酬", "空間価値と話題性が上がる"],
    bgColor: "bg-accent",
    arrowLabel: "展示・販売機会",
  },
  {
    icon: ShoppingCart,
    title: "購入者",
    subtitle: "(第三者)",
    description: "展示空間で作品と出会う",
    features: ["QRで簡単購入", "実物を見て選べる", "アーティストを直接支援"],
    bgColor: "bg-gray-700",
  },
];

export function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: IN_VIEW_MARGIN });

  return (
    <section
      id="how"
      className="py-32 bg-gradient-to-b from-white to-gray-50"
      ref={ref}
    >
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: ANIMATION_DURATION }}
          className="text-center mb-16"
        >
          <h2
            className="text-4xl md:text-5xl mb-6 tracking-tight text-primary"
            style={{ fontWeight: 300 }}
          >
            マイクロギャラリーがつなぐ、アートの新しい循環
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            アーティストが作品を登録し、法人が展示。<br />
            その作品を見た
            <span className="text-primary">第三者の購入者</span>
            が買うことで、すべての人に価値が還元されます。
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: ANIMATION_DURATION, delay: 0.2 }}
          className="mb-20"
        >
          <div className="relative max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 items-center">
              {FLOW_STEPS.map((step, index) => {
                const Icon = step.icon;
                const isLast = index === FLOW_STEPS.length - 1;

                return (
                  <div key={index} className="relative">
                    <div className="flex flex-col items-center text-center">
                      <div
                        className={`w-32 h-32 rounded-full ${step.bgColor} flex items-center justify-center mb-4 shadow-lg`}
                      >
                        <Icon className="w-16 h-16 text-white" strokeWidth={1.5} />
                      </div>
                      <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 w-full min-h-[280px] flex flex-col">
                        <h3 className="text-xl mb-2 text-primary">
                          {step.title}
                          {step.subtitle && (
                            <>
                              <br />
                              <span className="text-sm">{step.subtitle}</span>
                            </>
                          )}
                        </h3>
                        <p className="text-sm text-gray-700 mb-4">{step.description}</p>
                        <ul className="space-y-2 text-left">
                          {step.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                              <span className="text-xs text-gray-600">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {!isLast && (
                      <>
                        <div className="hidden md:block absolute top-12 -right-8 w-16">
                          <ArrowRight className="w-12 h-12 text-gray-400" strokeWidth={2} />
                          <p className="text-xs text-gray-500 mt-1 whitespace-nowrap">
                            {step.arrowLabel}
                          </p>
                        </div>
                        <div className="md:hidden flex justify-center my-4">
                          <div className="flex flex-col items-center">
                            <ArrowRight
                              className="w-10 h-10 text-gray-400 rotate-90"
                              strokeWidth={2}
                            />
                            <p className="text-xs text-gray-500 mt-1">{step.arrowLabel}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: ANIMATION_DURATION, delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white h-14 px-10 text-lg shadow-lg"
              asChild
            >
              <Link to="/artists">
                <Palette className="mr-2 w-5 h-5" />
                アーティストとして参加
              </Link>
            </Button>
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-white h-14 px-10 text-lg shadow-lg"
              asChild
            >
              <Link to="/corporate">
                <Building2 className="mr-2 w-5 h-5" />
                法人として参加
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

