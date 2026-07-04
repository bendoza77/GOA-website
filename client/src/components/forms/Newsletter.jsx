import { useState } from "react";
import { motion } from "framer-motion";
import Button from "../ui/Button.jsx";
import Icon from "../ui/Icon.jsx";
import { cn } from "../../utils/cn.js";

/** Newsletter — inline email capture (front-end only, simulated success). */
const Newsletter = ({ className, compact = false }) => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSent(true);
  };

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("inline-flex items-center gap-2 rounded-full border border-neon/30 bg-neon/10 px-5 py-3 text-sm text-neon", className)}
      >
        <Icon name="CheckCircle2" className="size-4" /> You're on the list. Welcome to GOA.
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className={cn(
        "flex w-full flex-col gap-3 sm:flex-row",
        compact ? "max-w-md" : "max-w-lg",
        className
      )}
    >
      <div className="relative flex-1">
        <Icon name="Mail" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-fog" />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@domain.com"
          className="h-12 w-full rounded-full border border-slate-line surface-2 pl-11 pr-4 text-sm text-snow outline-none transition-colors placeholder:text-fog focus:border-lime/50"
        />
      </div>
      <Button type="submit" className="h-12 shrink-0" cursorLabel="Join" magnetic>
        Subscribe
        <Icon name="ArrowRight" className="size-4" />
      </Button>
    </form>
  );
};

export default Newsletter;
