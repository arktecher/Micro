import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "motion/react";

import { Button } from "@/components/ui/button";

const ANIMATION_DURATION = 0.8;
const ANIMATION_DELAY = 0.2;
const IN_VIEW_MARGIN = "-100px";

export function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: IN_VIEW_MARGIN });

  return (
    <section
      id="contact"
      className="py-32 bg-gradient-to-br from-accent/5 via-white to-primary/5"
      ref={ref}
    >
      <div className="max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: ANIMATION_DURATION }}
        >
          <h2
            className="text-4xl md:text-6xl mb-6 tracking-tight"
            style={{ fontWeight: 300 }}
          >
            あなたの壁を、
            <br className="md:hidden" />
            ギャラリーに。
          </h2>
          <p
            className="text-xl md:text-2xl mb-12 text-gray-600 max-w-3xl mx-auto"
            style={{ fontWeight: 300 }}
          >
            今すぐ参加して、新しいアートの形を広げましょう。
          </p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: ANIMATION_DURATION, delay: ANIMATION_DELAY }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 px-8 py-6 min-w-[240px]"
              asChild
            >
              <Link to="/artists">アーティスト登録</Link>
            </Button>
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-white px-8 py-6 min-w-[240px]"
              asChild
            >
              <Link to="/corporate">法人登録</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

