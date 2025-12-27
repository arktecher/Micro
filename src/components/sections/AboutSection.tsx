import { useRef } from "react";
import { motion, useInView } from "motion/react";

import { ImageWithFallback } from "@/components/common/ImageWithFallback";

interface AboutSectionProps {
  aboutImage: string;
}

const ANIMATION_DURATION = 0.8;
const ANIMATION_DELAY = 0.2;
const IN_VIEW_MARGIN = "-100px";

export function AboutSection({ aboutImage }: AboutSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: IN_VIEW_MARGIN });

  return (
    <section id="about" className="py-32 bg-gray-50" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: ANIMATION_DURATION }}
            className="relative aspect-[4/3] overflow-hidden rounded-lg"
          >
            <ImageWithFallback
              src={aboutImage}
              alt="ギャラリー空間"
              className="w-full h-full object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{
              duration: ANIMATION_DURATION,
              delay: ANIMATION_DELAY,
            }}
          >
            <h2
              className="text-4xl md:text-5xl mb-6 tracking-tight"
              style={{ fontWeight: 300 }}
            >
              アートとビジネスの
              <br />
              新しい関係。
            </h2>
            <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
              <p>
                マイクロギャラリーは、アーティストの作品を企業や店舗に展示し、販売を通じて新しい収益と出会いを生み出す仕組みです。
              </p>
              <p>
                オフィス、ホテル、カフェ、病院など、あらゆる空間がギャラリーになります。訪問者はQRコードをスキャンするだけで、気に入った作品を購入できます。
              </p>
              <p>
                アーティストは作品を広く見てもらい、法人は空間を彩りながら収益を得る。それが、マイクロギャラリーが描く新しいアートエコシステムです。
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
