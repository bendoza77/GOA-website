import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/sections/PageHeader.jsx";
import Section from "../../components/layout/Section.jsx";
import SectionTitle from "../../components/ui/SectionTitle.jsx";
import GlassPanel from "../../components/ui/GlassPanel.jsx";
import Icon from "../../components/ui/Icon.jsx";
import ServiceCard from "../../components/cards/ServiceCard.jsx";
import ServiceProcess3D from "../../components/sections/ServiceProcess3D.jsx";
import CTASection from "../../components/sections/CTASection.jsx";
import AmbientScene from "../../components/3d/ambient/AmbientScene.jsx";
import { useServices } from "../../data/services.js";
import { staggerContainer, depthIn, fadeUp, viewportOnce } from "../../utils/motion.js";

/**
 * Services — the academy's support offering. A 3D ambient constellation sits
 * behind the whole page; the service grid leads into the signature scroll-
 * driven 3D process corridor, then the standards band and closing CTA.
 */
const Services = () => {
  const { t } = useTranslation();
  const services = useServices();
  const deliverables = t("servicesPage.deliverables.items", { returnObjects: true });
  const items = Array.isArray(deliverables) ? deliverables : [];

  return (
    <>
      {/* Page ambience — the orbiting service constellation */}
      <AmbientScene scene="services" />

      <PageHeader
        eyebrow={t("servicesPage.header.eyebrow")}
        title={t("servicesPage.header.title")}
        highlight={t("servicesPage.header.highlight")}
        description={t("servicesPage.header.description")}
      />

      {/* Service grid */}
      <Section className="!pt-4">
        <SectionTitle
          eyebrow={t("servicesPage.grid.eyebrow")}
          title={t("servicesPage.grid.title")}
          description={t("servicesPage.grid.description")}
        />
        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {services.map((service, i) => (
            <motion.div key={service.id} variants={depthIn}>
              <ServiceCard service={service} index={i} />
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* Signature scroll-driven 3D process corridor */}
      <ServiceProcess3D />

      {/* Standards baked into every engagement */}
      <Section id="standards">
        <SectionTitle
          eyebrow={t("servicesPage.deliverables.eyebrow")}
          title={t("servicesPage.deliverables.title")}
          description={t("servicesPage.deliverables.description")}
        />
        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {items.map((item, i) => (
            <motion.div key={i} variants={fadeUp}>
              <GlassPanel hover className="h-full p-7">
                <div className="mb-5 grid size-11 place-items-center rounded-xl border border-lime/20 bg-green/10 text-lime">
                  <Icon name="Check" className="size-5" strokeWidth={2.4} />
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold text-snow">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-fog">{item.desc}</p>
              </GlassPanel>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      <CTASection variant="services" />
    </>
  );
};

export default Services;
