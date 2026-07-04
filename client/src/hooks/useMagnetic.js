import { useEffect, useRef } from "react";

/**
 * useMagnetic — attach to a button/element to make it drift toward the
 * cursor while hovered, then spring back. Returns a ref to spread on the node.
 * Pure DOM transforms (no re-renders) for buttery 60fps.
 */
export function useMagnetic({ strength = 0.35, disabled = false } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || disabled) return;

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    };
    const onLeave = () => {
      el.style.transform = "translate(0px, 0px)";
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [strength, disabled]);

  return ref;
}

export default useMagnetic;
