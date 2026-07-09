import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/sections/PageHeader.jsx";
import Section from "../../components/layout/Section.jsx";
import GlassPanel from "../../components/ui/GlassPanel.jsx";
import Icon from "../../components/ui/Icon.jsx";
import SocialIcon from "../../components/ui/SocialIcon.jsx";
import ContactForm from "../../components/forms/ContactForm.jsx";
import { SITE, SOCIALS } from "../../constants/site.js";
import { useFaqs } from "../../data/faq.js";
import Accordion from "../../components/ui/Accordion.jsx";
import Reveal from "../../components/ui/Reveal.jsx";
import AmbientScene from "../../components/3d/ambient/AmbientScene.jsx";
import { staggerContainer, slideInLeft, slideInRight } from "../../utils/motion.js";

/** Contact — enquiry form, direct channels and a compact FAQ. */
const Contact = () => {
  const { t } = useTranslation();
  const faqs = useFaqs();
  const contactMethods = [
    { icon: "Mail", label: t("contact.methods.email"), value: SITE.email, href: `mailto:${SITE.email}` },
    { icon: "Phone", label: t("contact.methods.call"), value: SITE.phone, href: `tel:${SITE.phone}` },
    { icon: "MapPin", label: t("contact.methods.find"), value: t("contact.methods.location") },
  ];
  return (
  <>
    {/* Page ambience — the broadcasting signal core + satellite */}
    <AmbientScene scene="contact" />
    <PageHeader
      eyebrow={t("contact.header.eyebrow")}
      title={t("contact.header.title")}
      highlight={t("contact.header.highlight")}
      description={t("contact.header.description")}
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
          {contactMethods.map((m) => (
            <motion.div key={m.label} variants={slideInLeft}>
              <GlassPanel hover tilt as={m.href ? "a" : "div"} {...(m.href ? { href: m.href } : {})} className="flex items-center gap-4 p-6">
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

          <motion.div variants={slideInLeft}>
            <GlassPanel className="p-6">
              <p className="mb-4 font-mono text-xs uppercase tracking-widest text-fog">{t("contact.followAlong")}</p>
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
        <Reveal delay={0.1} variants={slideInRight}>
          <ContactForm />
        </Reveal>
      </div>
    </Section>

    <Section>
      <div className="mx-auto max-w-3xl">
        <h2 className="h2 mb-8 text-center text-balance">{t("faq.quickAnswers")}</h2>
        <Accordion items={faqs.slice(0, 4)} />
      </div>
    </Section>
  </>
  );
};

export default Contact;
