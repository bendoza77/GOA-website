/** Global site configuration: brand, navigation, socials, contact. */

export const SITE = {
  name: "Goal-Oriented Academy",
  short: "GOA",
  tagline: "Engineer your future.",
  description:
    "A premium programming academy engineering the next generation of developers — learn by building, mentored by people who ship.",
  email: "hello@goa.academy",
  phone: "+1 (555) 012-3489",
  location: "Remote-first · Berlin · San Francisco",
};

/**
 * Per-route document metadata — drives the browser-tab <title> and the
 * meta description on navigation (see hooks/useDocumentMeta + MainLayout).
 * `title` is the page label; it's combined with the brand via TITLE_TEMPLATE.
 * The home route uses its full title verbatim (template skipped).
 */
export const TITLE_SUFFIX = "Goal-Oriented Academy";

export const PAGE_META = {
  "/": {
    title: "Goal-Oriented Academy — Engineer your future",
    description:
      "A premium, outcome-driven programming academy. Learn by building real software, mentored by engineers who ship.",
  },
  "/about": {
    title: "About",
    description: "Our mission, values and the GOA journey — turning ambition into shipped software.",
  },
  "/courses": {
    title: "Courses",
    description: "Project-first tracks across the modern stack, each mapped to a real hiring signal.",
  },
  "/mentors": {
    title: "Mentors",
    description: "Learn from working engineers and designers at the teams you admire.",
  },
  "/community": {
    title: "Community",
    description: "Join 45,000+ builders reviewing PRs, sharing wins and opening doors around the clock.",
  },
  "/events": {
    title: "Events",
    description: "Live workshops, talks, hackathons and hiring fairs — most open to everyone.",
  },
  "/success-stories": {
    title: "Success Stories",
    description: "Real people, real transformations. The before, the after, and the number that changed.",
  },
  "/blog": {
    title: "Blog",
    description: "Field notes from GOA mentors on shipping modern software and building a career.",
  },
  "/contact": {
    title: "Contact",
    description: "Questions about tracks, scholarships, hiring or mentoring? Let's talk.",
  },
  "/404": {
    title: "Page not found",
    description: "The page you're after moved, shipped, or never existed.",
  },
};

/** Primary navigation — routes live in /routes/AppRoutes.jsx.
 *  Header keeps only the four primary destinations; the deeper pages
 *  (Community, Events, Stories, Blog) stay routed and reachable via
 *  FOOTER_LINKS. */
export const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Courses", path: "/courses" },
  { label: "Mentors", path: "/mentors" },
  { label: "About", path: "/about" },
];

export const FOOTER_LINKS = [
  {
    title: "Learn",
    links: [
      { label: "All Courses", path: "/courses" },
      { label: "Mentors", path: "/mentors" },
      { label: "Events", path: "/events" },
      { label: "Success Stories", path: "/success-stories" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", path: "/about" },
      { label: "Community", path: "/community" },
      { label: "Blog", path: "/blog" },
      { label: "Contact", path: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Curriculum", path: "/courses" },
      { label: "Career Support", path: "/success-stories" },
      { label: "FAQ", path: "/contact" },
      { label: "Newsletter", path: "/#newsletter" },
    ],
  },
];

export const SOCIALS = [
  { label: "GitHub", href: "https://github.com", icon: "github" },
  { label: "X", href: "https://x.com", icon: "x" },
  { label: "LinkedIn", href: "https://linkedin.com", icon: "linkedin" },
  { label: "YouTube", href: "https://youtube.com", icon: "youtube" },
  { label: "Discord", href: "https://discord.com", icon: "discord" },
];
