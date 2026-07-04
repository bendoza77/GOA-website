import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GlassPanel from "../ui/GlassPanel.jsx";
import Button from "../ui/Button.jsx";
import Icon from "../ui/Icon.jsx";
import Input from "./Input.jsx";

/**
 * ContactForm — front-end only. Simulates submission with a success state.
 * No network / backend (per project scope), just polished UX + validation.
 */
const ContactForm = () => {
  const [status, setStatus] = useState("idle"); // idle | sending | sent

  const handleSubmit = (e) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setTimeout(() => setStatus("sent"), 1200);
  };

  return (
    <GlassPanel className="p-7 sm:p-9">
      <AnimatePresence mode="wait">
        {status === "sent" ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-10 text-center"
          >
            <div className="mb-5 grid size-16 place-items-center rounded-full border border-neon/30 bg-neon/10">
              <Icon name="CheckCircle2" className="size-8 text-neon" />
            </div>
            <h3 className="h3 text-snow">Message sent</h3>
            <p className="mt-2 max-w-sm text-sm text-fog">
              Thanks for reaching out. Our team will get back to you within one business day.
            </p>
            <Button className="mt-6" variant="outline" onClick={() => setStatus("idle")}>
              Send another
            </Button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="First name" name="firstName" required />
              <Input label="Last name" name="lastName" required />
            </div>
            <Input label="Email address" type="email" name="email" required />
            <Input label="What are you interested in?" name="topic" />
            <Input label="Your message" name="message" multiline required />
            <Button
              type="submit"
              size="lg"
              magnetic
              className="mt-1 w-full sm:w-auto sm:self-start"
              cursorLabel="Send"
              disabled={status === "sending"}
            >
              {status === "sending" ? "Sending…" : "Send message"}
              {status !== "sending" && <Icon name="Send" className="size-4" />}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </GlassPanel>
  );
};

export default ContactForm;
