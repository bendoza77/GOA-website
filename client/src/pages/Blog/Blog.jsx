import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import PageHeader from "../../components/sections/PageHeader.jsx";
import Section from "../../components/layout/Section.jsx";
import BlogCard from "../../components/cards/BlogCard.jsx";
import Newsletter from "../../components/forms/Newsletter.jsx";
import GlassPanel from "../../components/ui/GlassPanel.jsx";
import { BLOG_POSTS, BLOG_CATEGORIES } from "../../data/blog.js";
import { staggerContainer, fadeUp } from "../../utils/motion.js";
import { cn } from "../../utils/cn.js";

/** Blog — filterable articles + inline newsletter capture. */
const Blog = () => {
  const [active, setActive] = useState("All");

  const filtered = useMemo(
    () => (active === "All" ? BLOG_POSTS : BLOG_POSTS.filter((p) => p.category === active)),
    [active]
  );

  return (
    <>
      <PageHeader
        eyebrow="Field notes"
        title="Ideas, engineering &"
        highlight="career craft"
        description="Deep dives from GOA mentors on shipping modern software and building a career you're proud of."
      >
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {BLOG_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-300",
                active === cat
                  ? "border-lime/40 bg-lime/10 text-lime"
                  : "border-slate-line text-fog hover:border-ash hover:text-mist"
              )}
            >
              {cat}
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
            <motion.div key={post.id} variants={fadeUp}>
              <BlogCard post={post} />
            </motion.div>
          ))}
        </motion.div>
      </Section>

      <Section id="newsletter">
        <GlassPanel className="relative overflow-hidden p-10 text-center sm:p-16">
          <div className="absolute inset-0 bg-grid bg-grid-fade opacity-20" />
          <div className="relative mx-auto flex max-w-xl flex-col items-center gap-5">
            <h2 className="h2 text-balance">Get field notes in your inbox</h2>
            <p className="lead">One thoughtful email a week. No spam, no fluff — just sharp writing on code and careers.</p>
            <Newsletter className="mt-2" />
          </div>
        </GlassPanel>
      </Section>
    </>
  );
};

export default Blog;
