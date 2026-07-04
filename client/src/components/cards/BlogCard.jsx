import GlassPanel from "../ui/GlassPanel.jsx";
import Icon from "../ui/Icon.jsx";
import { accent } from "../../utils/accents.js";
import { cn } from "../../utils/cn.js";

/** BlogCard — article preview with a generated gradient cover + meta. */
const BlogCard = ({ post }) => {
  const a = accent(post.accent);
  return (
    <GlassPanel hover className="group flex h-full flex-col overflow-hidden">
      {/* Gradient cover with pixel grid + category glyph */}
      <div className={cn("relative h-40 overflow-hidden bg-gradient-to-br", a.gradient)}>
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-carbon/90 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-void/60 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-widest text-snow backdrop-blur">
          {post.category}
        </span>
        <Icon
          name="BookOpen"
          className="absolute -bottom-4 right-2 size-24 text-accent-ink/20 transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center gap-3 font-mono text-xs text-fog">
          <span>{post.date}</span>
          <span className="inline-flex items-center gap-1"><Icon name="Clock" className="size-3" /> {post.readTime}</span>
        </div>
        <h3 className="h3 mb-2 text-snow transition-colors group-hover:text-lime">{post.title}</h3>
        <p className="mb-5 flex-1 text-sm leading-relaxed text-fog">{post.excerpt}</p>
        <div className="flex items-center justify-between border-t border-slate-line pt-4">
          <span className="text-xs text-mist">By {post.author}</span>
          <span className={cn("inline-flex items-center gap-1 text-sm font-medium", a.text)}>
            Read <Icon name="ArrowUpRight" className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </GlassPanel>
  );
};

export default BlogCard;
