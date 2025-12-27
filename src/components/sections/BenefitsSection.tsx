import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Sparkles, TrendingUp } from "lucide-react";

const ANIMATION_DURATION = 0.8;
const IN_VIEW_MARGIN = "-100px";
const INITIAL_DELAY = 0.2;
const DELAY_INCREMENT = 0.2;

const BENEFITS = [
  {
    icon: Sparkles,
    title: "アーティスト向け",
    description: "作品を多くの人に見てもらい、販売機会を広げられる",
    features: [
      "展示費用はゼロ",
      "販売手数料は業界最安水準",
      "販売データの可視化",
      "新しいファンとの出会い",
    ],
    gradient: "from-accent/10 to-accent/5",
    border: "border-accent/20",
  },
  {
    icon: TrendingUp,
    title: "法人向け",
    description: "空間を彩りながら販売収益の10％を得られる",
    features: [
      "初期費用・月額費用なし",
      "アート選定の自由",
      "空間のブランディング向上",
      "売上の10％を収益化",
    ],
    gradient: "from-primary/10 to-primary/5",
    border: "border-primary/20",
  },
];

export function BenefitsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: IN_VIEW_MARGIN });

  return (
    <section id="benefits" className="py-32 bg-gray-50" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: ANIMATION_DURATION }}
          className="text-center mb-20"
        >
          <h2
            className="text-4xl md:text-5xl mb-6 tracking-tight"
            style={{ fontWeight: 300 }}
          >
            それぞれの価値を、
            <br className="md:hidden" />
            最大化する。
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {BENEFITS.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: ANIMATION_DURATION,
                  delay: INITIAL_DELAY + index * DELAY_INCREMENT,
                }}
                className={`bg-gradient-to-br ${benefit.gradient} border ${benefit.border} rounded-2xl p-10`}
              >
                <div className="mb-6">
                  <Icon
                    className="w-12 h-12 mb-4 text-primary"
                    strokeWidth={1.5}
                  />
                  <h3 className="text-3xl mb-3 tracking-tight">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 text-lg">{benefit.description}</p>
                </div>
                <ul className="space-y-3">
                  {benefit.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2.5 flex-shrink-0"></span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
