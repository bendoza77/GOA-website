import { Link } from "react-router-dom";
import { SITE, FOOTER_LINKS, SOCIALS } from "../../constants/site.js";
import Logo from "../ui/Logo.jsx";
import SocialIcon from "../ui/SocialIcon.jsx";
import Newsletter from "../forms/Newsletter.jsx";

/** Footer — sitemap, newsletter, socials + oversized brand watermark. */
const Footer = () => (
  <footer className="relative mt-24 overflow-hidden border-t border-slate-line bg-ink/60">
    <div className="absolute inset-0 bg-grid bg-grid-fade opacity-20" />
    <div className="container-goa relative py-16">
      <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
        {/* Brand + newsletter */}
        <div className="flex flex-col gap-6">
          <Logo size={40} />
          <p className="max-w-sm text-sm leading-relaxed text-fog">{SITE.description}</p>
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-lime">Join the newsletter</p>
            <Newsletter compact />
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {FOOTER_LINKS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 font-mono text-xs uppercase tracking-widest text-fog">{col.title}</h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-sm text-mist transition-colors hover:text-lime"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-14 flex flex-col items-center justify-between gap-6 border-t border-slate-line pt-8 sm:flex-row">
        <p className="font-mono text-xs text-fog">
          © {new Date().getFullYear()} {SITE.name}. Engineered with care.
        </p>
        <div className="flex items-center gap-3">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              aria-label={s.label}
              className="grid size-9 place-items-center rounded-full border border-slate-line text-fog transition-all hover:-translate-y-0.5 hover:border-lime/40 hover:text-lime"
            >
              <SocialIcon name={s.icon} className="size-4" />
            </a>
          ))}
        </div>
      </div>
    </div>

    {/* Oversized brand watermark */}
    <div className="pointer-events-none select-none overflow-hidden">
      <div
        className="bg-clip-text text-center font-display text-[22vw] font-bold leading-none text-transparent"
        style={{ backgroundImage: "linear-gradient(to bottom, var(--watermark), transparent)" }}
      >
        GOA
      </div>
    </div>
  </footer>
);

export default Footer;
