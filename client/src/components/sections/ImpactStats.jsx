import { motion } from "framer-motion";
import Section from "../layout/Section.jsx";
import GlassPanel from "../ui/GlassPanel.jsx";
import StatCard from "../cards/StatCard.jsx";
import { useImpactStats } from "../../data/stats.js";
import { staggerContainer, fadeUp, viewportOnce } from "../../utils/motion.js";

/** ImpactStats — bold metric band inside a glowing glass panel. */
const ImpactStats = () => {
  const impactStats = useImpactStats();
  return (
  <Section id="impact">
    <GlassPanel className="relative overflow-hidden p-10 sm:p-14">
      <div className="absolute inset-0 bg-grid bg-grid-fade opacity-20" />
      <div className="glow-orb left-1/2 top-0 size-72 -translate-x-1/2 opacity-40" />
      <motion.div
        variants={staggerContainer(0.1)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4"
      >
        {impactStats.map((s) => (
          <motion.div key={s.label} variants={fadeUp}>
            <StatCard {...s} className="text-center" />
          </motion.div>
        ))}
      </motion.div>
    </GlassPanel>
  </Section>
  );
};

export default ImpactStats;
