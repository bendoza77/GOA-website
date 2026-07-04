import { motion } from "framer-motion";
import Badge from "../ui/Badge.jsx";
import ParticleField from "../backgrounds/ParticleField.jsx";
import { staggerContainer, fadeUp } from "../../utils/motion.js";
import { cn } from "../../utils/cn.js";

/**
 * PageHeader — consistent inner-page hero: eyebrow badge, large title,
 * lede + optional children (filters, stats). Sits over the shared backdrop
 * with a local particle field for continuity with the home hero.
 */
const PageHeader = ({ eyebrow, title, highlight, description, children, className }) => (
  <header className={cn("relative overflow-hidden pt-36 pb-16 sm:pt-40", className)}>
    <ParticleField className="opacity-50" />
    <div className="container-goa relative">
      <motion.div
        variants={staggerContainer(0.1)}
        initial="hidden"
        animate="show"
        className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center"
      >
        {eyebrow && (
          <motion.div variants={fadeUp}>
            <Badge dot pixel tone="neon">{eyebrow}</Badge>
          </motion.div>
        )}
        <motion.h1 variants={fadeUp} className="h1 text-balance">
          {title}
          {highlight && <> <span className="text-gradient-green">{highlight}</span></>}
        </motion.h1>
        {description && (
          <motion.p variants={fadeUp} className="lead">
            {description}
          </motion.p>
        )}
        {children && <motion.div variants={fadeUp} className="w-full">{children}</motion.div>}
      </motion.div>
    </div>
  </header>
);

export default PageHeader;
