import { motion } from "framer-motion";
import Icon from "./Icon.jsx";
import { viewportOnce } from "../../utils/motion.js";

/**
 * Timeline — vertical stepped journey with a growing neon spine.
 * Steps alternate sides on desktop, stack on mobile.
 */
const Timeline = ({ steps }) => (
  <div className="relative mx-auto max-w-4xl">
    {/* Spine */}
    <div className="absolute left-6 top-0 h-full w-px bg-slate-line md:left-1/2 md:-translate-x-1/2">
      <motion.div
        className="w-px bg-gradient-to-b from-green via-lime to-neon"
        initial={{ height: 0 }}
        whileInView={{ height: "100%" }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
      />
    </div>

    <div className="flex flex-col gap-10">
      {steps.map((step, i) => {
        const left = i % 2 === 0;
        return (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.6, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            className={`relative flex items-start gap-6 pl-16 md:pl-0 ${
              left ? "md:flex-row" : "md:flex-row-reverse"
            }`}
          >
            {/* Node */}
            <div className="absolute left-6 top-1 z-10 grid size-4 -translate-x-1/2 place-items-center md:left-1/2">
              <span className="size-4 rounded-full border-2 border-neon bg-void shadow-[0_0_12px_rgba(125,255,158,0.6)]" />
            </div>

            {/* Card */}
            <div className="w-full md:w-1/2 md:px-8">
              <div className="glass-panel p-6">
                <div className="mb-3 flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl border border-lime/20 bg-green/10 text-lime">
                    <Icon name={step.icon} className="size-5" />
                  </span>
                  <span className="font-mono text-xs tracking-[0.3em] text-fog">STEP {step.step}</span>
                </div>
                <h3 className="h3 mb-1.5 text-snow">{step.title}</h3>
                <p className="text-sm leading-relaxed text-fog">{step.desc}</p>
              </div>
            </div>
            <div className="hidden md:block md:w-1/2" />
          </motion.div>
        );
      })}
    </div>
  </div>
);

export default Timeline;
