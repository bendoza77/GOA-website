import { forwardRef, useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "../../utils/cn.js";
import { useMagnetic } from "../../hooks/useMagnetic.js";
import { useCursor } from "../../hooks/useCursor.js";

/**
 * Button — the signature GOA control.
 * Variants: primary | secondary | ghost | outline | neon
 * Features: glow, magnetic drift, click ripple, icon slots, polymorphic
 * (renders <Link> when `to`, <a> when `href`, else <button>).
 */

const VARIANTS = {
  primary:
    "bg-green text-accent-ink font-semibold hover:bg-lime shadow-[0_10px_40px_-12px_rgba(47,191,95,0.5)]",
  secondary:
    "glass text-snow hover:border-lime/40 hover:text-snow",
  outline:
    "border border-ash/70 text-mist hover:border-lime/60 hover:text-snow bg-transparent",
  ghost:
    "text-mist hover:text-snow hover:surface-3",
  neon:
    "bg-transparent text-neon border border-neon/40 hover:bg-neon/10 hover:border-neon shadow-[0_0_30px_-8px_rgba(125,255,158,0.6)]",
};

const SIZES = {
  sm: "h-9 px-4 text-sm gap-1.5",
  md: "h-11 px-6 text-sm gap-2",
  lg: "h-14 px-8 text-base gap-2.5",
};

const Button = forwardRef(function Button(
  {
    children,
    variant = "primary",
    size = "md",
    className,
    to,
    href,
    magnetic = false,
    glow = false,
    icon: Icon,
    iconRight: IconRight,
    cursorLabel,
    onClick,
    type = "button",
    disabled,
    ...rest
  },
  forwardedRef
) {
  const [ripples, setRipples] = useState([]);
  const magneticRef = useMagnetic({ strength: 0.3, disabled: !magnetic });
  const { cursorProps } = useCursor();
  const localRef = useRef(null);
  const setRefs = (node) => {
    localRef.current = node;
    if (magnetic) magneticRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  const spawnRipple = useCallback(
    (e) => {
      const el = localRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const id = Date.now() + Math.random();
      setRipples((prev) => [
        ...prev,
        {
          id,
          size,
          x: e.clientX - rect.left - size / 2,
          y: e.clientY - rect.top - size / 2,
        },
      ]);
      setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 650);
    },
    []
  );

  const handleClick = (e) => {
    spawnRipple(e);
    onClick?.(e);
  };

  const classes = cn(
    "group relative inline-flex items-center justify-center overflow-hidden rounded-full",
    "font-sans transition-all duration-300 will-change-transform select-none",
    "active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none",
    "focus-visible:outline-2 focus-visible:outline-neon focus-visible:outline-offset-2",
    VARIANTS[variant],
    SIZES[size],
    glow && "glow-green",
    className
  );

  const inner = (
    <>
      {Icon && <Icon className="size-[1.1em] shrink-0" strokeWidth={2.2} />}
      <span className="relative z-10 inline-flex items-center gap-2 whitespace-nowrap">{children}</span>
      {IconRight && (
        <IconRight
          className="size-[1.1em] shrink-0 transition-transform duration-300 group-hover:translate-x-0.5"
          strokeWidth={2.2}
        />
      )}
      {/* Sheen sweep on hover */}
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      {/* Ripples */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="pointer-events-none absolute rounded-full bg-white/30 animate-[goa-ripple_0.65s_ease-out]"
          style={{
            width: r.size,
            height: r.size,
            left: r.x,
            top: r.y,
            animation: "goa-ripple 0.65s ease-out",
          }}
        />
      ))}
    </>
  );

  const hoverProps = cursorLabel ? cursorProps("button", cursorLabel) : cursorProps("button");

  if (to) {
    return (
      <Link ref={setRefs} to={to} className={classes} onClick={handleClick} {...hoverProps} {...rest}>
        {inner}
      </Link>
    );
  }
  if (href) {
    return (
      <a ref={setRefs} href={href} className={classes} onClick={handleClick} {...hoverProps} {...rest}>
        {inner}
      </a>
    );
  }
  return (
    <button
      ref={setRefs}
      type={type}
      disabled={disabled}
      className={classes}
      onClick={handleClick}
      {...hoverProps}
      {...rest}
    >
      {inner}
    </button>
  );
});

export default Button;
