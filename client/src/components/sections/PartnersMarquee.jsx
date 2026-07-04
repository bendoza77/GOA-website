import { PARTNERS } from "../../data/community.js";
import Marquee from "../ui/Marquee.jsx";

/** PartnersMarquee — "where our grads work" logo strip (text wordmarks). */
const PartnersMarquee = () => (
  <div className="section !py-14">
    <div className="container-goa">
      <p className="mb-8 text-center font-mono text-xs uppercase tracking-[0.3em] text-fog">
        Our graduates ship at
      </p>
    </div>
    <Marquee speed={38}>
      {PARTNERS.map((p) => (
        <span
          key={p}
          className="select-none px-8 font-display text-2xl font-semibold text-mist/40 transition-colors hover:text-lime sm:text-3xl"
        >
          {p}
        </span>
      ))}
    </Marquee>
  </div>
);

export default PartnersMarquee;
