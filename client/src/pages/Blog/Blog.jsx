import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/sections/PageHeader.jsx";
import Section from "../../components/layout/Section.jsx";
import BlogCard from "../../components/cards/BlogCard.jsx";
import Newsletter from "../../components/forms/Newsletter.jsx";
import GlassPanel from "../../components/ui/GlassPanel.jsx";
import AmbientScene from "../../components/3d/ambient/AmbientScene.jsx";
import { useBlogPosts, useBlogCategories } from "../../data/blog.js";
import { staggerContainer, blurIn } from "../../utils/motion.js";
import { cn } from "../../utils/cn.js";

/** Blog — filterable articles + inline newsletter capture. */
const Blog = () => {
  const { t } = useTranslation();
  const posts = useBlogPosts();
  const categories = useBlogCategories();
  const [active, setActive] = useState("all");

  const filtered = useMemo(
    () => (active === "all" ? posts : posts.filter((p) => p.category === active)),
    [active, posts]
  );

  return (
    <>
      {/* Page ambience — field notes adrift between the articles */}
      <AmbientScene scene="blog" />
      <PageHeader
        eyebrow={t("blogPage.header.eyebrow")}
        title={t("blogPage.header.title")}
        highlight={t("blogPage.header.highlight")}
        description={t("blogPage.header.description")}
      >
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActive(cat.key)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-300",
                active === cat.key
                  ? "border-lime/40 bg-lime/10 text-lime"
                  : "border-slate-line text-fog hover:border-ash hover:text-mist"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </PageHeader>

      <Section className="!pt-4">
        <motion.div
          key={active}
          variants={staggerContainer(0.07)}
          initial="hidden"
          animate="show"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((post) => (
            <motion.div key={post.id} variants={blurIn}>
              <BlogCard post={post} />
            </motion.div>
          ))}
        </motion.div>
      </Section>

      <Section id="newsletter">
        <GlassPanel className="relative overflow-hidden p-10 text-center sm:p-16">
          <div className="absolute inset-0 bg-grid bg-grid-fade opacity-20" />
          <div className="relative mx-auto flex max-w-xl flex-col items-center gap-5">
            <h2 className="h2 text-balance">{t("blogPage.newsletterTitle")}</h2>
            <p className="lead">{t("blogPage.newsletterLead")}</p>
            <Newsletter className="mt-2" />
          </div>
        </GlassPanel>
      </Section>
    </>
  );
};

export default Blog;
