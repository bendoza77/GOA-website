/** Global site configuration: brand, navigation, socials, contact. */

export const SITE = {
  name: "Goal-Oriented Academy",
  short: "GOA",
  email: "hello@goa.academy",
  phone: "+1 (555) 012-3489",
};

/** Tab-title brand suffix (kept in Latin across languages). */
export const TITLE_SUFFIX = "Goal-Oriented Academy";

/**
 * Route → i18n meta key. Drives the browser-tab <title> and <meta
 * description> per language (see hooks/useDocumentMeta). Unmatched paths fall
 * back to the "notFound" key.
 */
export const ROUTE_META_KEYS = {
  "/": "home",
  "/about": "about",
  "/services": "services",
  "/courses": "courses",
  "/mentors": "mentors",
  "/community": "community",
  "/events": "events",
  "/success-stories": "successStories",
  "/blog": "blog",
  "/contact": "contact",
};

/**
 * Primary navigation — routes live in /routes/AppRoutes.jsx. `key` maps to
 * the label under `nav.<key>` in the locale files.
 */
export const NAV_LINKS = [
  { key: "home", path: "/" },
  { key: "services", path: "/services" },
  { key: "courses", path: "/courses" },
  { key: "mentors", path: "/mentors" },
  { key: "about", path: "/about" },
];

/**
 * Footer link destinations, grouped by column. Labels + column titles come
 * from i18n (`footer.columns`) and are zipped onto these paths in the same
 * order, so structure stays a single source of truth here.
 */
export const FOOTER_LINK_PATHS = [
  ["/courses", "/mentors", "/events", "/success-stories"],
  ["/about", "/community", "/blog", "/contact"],
  ["/courses", "/success-stories", "/contact", "/#newsletter"],
];

export const SOCIALS = [
  { label: "GitHub", href: "https://github.com", icon: "github" },
  { label: "X", href: "https://x.com", icon: "x" },
  { label: "LinkedIn", href: "https://linkedin.com", icon: "linkedin" },
  { label: "YouTube", href: "https://youtube.com", icon: "youtube" },
  { label: "Discord", href: "https://discord.com", icon: "discord" },
];
