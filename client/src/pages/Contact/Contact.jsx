import { motion } from "framer-motion";
import PageHeader from "../../components/sections/PageHeader.jsx";
import Section from "../../components/layout/Section.jsx";
import GlassPanel from "../../components/ui/GlassPanel.jsx";
import Icon from "../../components/ui/Icon.jsx";
import SocialIcon from "../../components/ui/SocialIcon.jsx";
import ContactForm from "../../components/forms/ContactForm.jsx";
import { SITE, SOCIALS } from "../../constants/site.js";
import { FAQS } from "../../data/faq.js";
import Accordion from "../../components/ui/Accordion.jsx";
import Reveal from "../../components/ui/Reveal.jsx";
import { staggerContainer, fadeUp } from "../../utils/motion.js";

const CONTACT_METHODS = [
  { icon: "Mail", label: "Email us", value: SITE.email, href: `mailto:${SITE.email}` },
  { icon: "Phone", label: "Call us", value: SITE.phone, href: `tel:${SITE.phone}` },
  { icon: "MapPin", label: "Find us", value: SITE.location },
];

/** Contact — enquiry form, direct channels and a compact FAQ. */
const Contact = () => (
  <>
    <PageHeader
      eyebrow="Say hello"
      title="Let's talk about your"
      highlight="next move"
      description="Questions about a track, scholarships, hiring partnerships or mentoring? We usually reply within one business day."
    />

    <Section className="!pt-4">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        {/* Left — methods */}
        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-4"
        >
          {CONTACT_METHODS.map((m) => (
            <motion.div key={m.label} variants={fadeUp}>
              <GlassPanel hover as={m.href ? "a" : "div"} {...(m.href ? { href: m.href } : {})} className="flex items-center gap-4 p-6">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-lime/20 bg-green/10 text-lime">
                  <Icon name={m.icon} className="size-5" />
                </span>
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-fog">{m.label}</p>
                  <p className="text-snow">{m.value}</p>
                </div>
              </GlassPanel>
            </motion.div>
          ))}

          <motion.div variants={fadeUp}>
            <GlassPanel className="p-6">
              <p className="mb-4 font-mono text-xs uppercase tracking-widest text-fog">Follow along</p>
              <div className="flex flex-wrap gap-3">
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    className="grid size-11 place-items-center rounded-full border border-slate-line text-fog transition-all hover:-translate-y-0.5 hover:border-lime/40 hover:text-lime"
                  >
                    <SocialIcon name={s.icon} className="size-4" />
                  </a>
                ))}
              </div>
            </GlassPanel>
          </motion.div>
        </motion.div>

        {/* Right — form */}
        <Reveal delay={0.1}>
          <ContactForm />
        </Reveal>
      </div>
    </Section>

    <Section>
      <div className="mx-auto max-w-3xl">
        <h2 className="h2 mb-8 text-center text-balance">Quick answers</h2>
        <Accordion items={FAQS.slice(0, 4)} />
      </div>
    </Section>
  </>
);

export default Contact;
