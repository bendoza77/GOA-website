import { useId, useState } from "react";
import { cn } from "../../utils/cn.js";

/**
 * Input — premium field with a floating label and an animated focus underline.
 * Works for <input> and <textarea> (pass multiline). Uncontrolled-friendly.
 */
const Input = ({
  label,
  type = "text",
  multiline = false,
  rows = 4,
  className,
  required,
  ...rest
}) => {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const floated = focused || hasValue;

  const shared = {
    id,
    required,
    onFocus: () => setFocused(true),
    onBlur: (e) => {
      setFocused(false);
      setHasValue(Boolean(e.target.value));
    },
    onChange: (e) => setHasValue(Boolean(e.target.value)),
    placeholder: " ",
    className: cn(
      "peer w-full rounded-xl border border-slate-line surface px-4 pt-6 pb-2 text-sm text-snow",
      "outline-none transition-colors duration-300 placeholder:text-transparent",
      "focus:border-lime/50 focus:surface-2"
    ),
    ...rest,
  };

  return (
    <div className={cn("relative", className)}>
      {multiline ? (
        <textarea rows={rows} {...shared} />
      ) : (
        <input type={type} {...shared} />
      )}
      <label
        htmlFor={id}
        className={cn(
          "pointer-events-none absolute left-4 font-mono text-fog transition-all duration-200",
          floated ? "top-2.5 text-[0.65rem] uppercase tracking-widest text-lime" : "top-4 text-sm"
        )}
      >
        {label}
        {required && <span className="ml-0.5 text-green">*</span>}
      </label>
      {/* focus glow line */}
      <span className="pointer-events-none absolute inset-x-3 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-green to-neon transition-transform duration-300 peer-focus:scale-x-100" />
    </div>
  );
};

export default Input;
