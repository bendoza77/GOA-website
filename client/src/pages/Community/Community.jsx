import { motion } from "framer-motion";
import PageHeader from "../../components/sections/PageHeader.jsx";
import Section from "../../components/layout/Section.jsx";
import SectionTitle from "../../components/ui/SectionTitle.jsx";
import GlassPanel from "../../components/ui/GlassPanel.jsx";
import StatCard from "../../components/cards/StatCard.jsx";
import Icon from "../../components/ui/Icon.jsx";
import Marquee from "../../components/ui/Marquee.jsx";
import CTASection from "../../components/sections/CTASection.jsx";
import { COMMUNITY_STATS, COMMUNITY_CHANNELS, PARTNERS } from "../../data/community.js";
import { accent } from "../../utils/accents.js";
import { staggerContainer, fadeUp, viewportOnce } from "../../utils/motion.js";
import { cn } from "../../utils/cn.js";

/** Community — the always-on network around the academy. */
const Community = () => (
  <>
    <PageHeader
      eyebrow="Community"
      title="You're never building"
      highlight="alone"
      description="A 45,000-strong network of learners, alumni and mentors — reviewing PRs, sharing wins and opening doors, around the clock."
    />

    <Section className="!pt-4">
      <motion.div
        variants={staggerContainer(0.1)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid gap-8 rounded-3xl border border-slate-line surface p-10 sm:grid-cols-2 lg:grid-cols-4"
      >
        {COMMUNITY_STATS.map((s) => (
          <motion.div key={s.label} variants={fadeUp}>
            <StatCard {...s} className="text-center" />
          </motion.div>
        ))}
      </motion.div>
    </Section>

    <Section>
      <SectionTitle
        eyebrow="Inside the community"
        title="Channels for every part of the journey"
        description="From your first stuck moment to your first offer, there's a room full of people who've been there."
      />
      <motion.div
        variants={staggerContainer(0.07)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {COMMUNITY_CHANNELS.map((ch) => {
          const a = accent(ch.accent);
          return (
            <motion.div key={ch.name} variants={fadeUp}>
              <GlassPanel hover className="group h-full p-7">
                <div className={cn("mb-5 grid size-12 place-items-center rounded-xl border", a.border, a.bg, a.text)}>
                  <Icon name={ch.icon} className="size-6" strokeWidth={1.9} />
                </div>
                <h3 className="h3 mb-2 font-mono text-snow">{ch.name}</h3>
                <p className="text-sm leading-relaxed text-fog">{ch.desc}</p>
              </GlassPanel>
            </motion.div>
          );
        })}
      </motion.div>
    </Section>

    <Section>
      <p className="mb-8 text-center font-mono text-xs uppercase tracking-[0.3em] text-fog">
        Trusted by builders working at
      </p>
      <Marquee speed={40}>
        {PARTNERS.map((p) => (
          <span key={p} className="px-8 font-display text-2xl font-semibold text-mist/40 sm:text-3xl">
            {p}
          </span>
        ))}
      </Marquee>
    </Section>

    <CTASection
      eyebrow="Join us"
      title="Come build with 45,000 people who get it"
      description="Enroll in a cohort and get instant access to the community that turns momentum into offers."
      primary={{ label: "Join a cohort", to: "/contact" }}
      secondary={{ label: "See events", to: "/events" }}
    />
  </>
);

export default Community;
