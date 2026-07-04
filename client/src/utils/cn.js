/**
 * cn — tiny className combiner.
 * Accepts strings, arrays and conditional objects, dedupes falsy values.
 * Keeps the bundle lean (no clsx/tailwind-merge dependency).
 *
 * cn("a", cond && "b", ["c", cond2 && "d"], { e: cond3 })
 */
export function cn(...inputs) {
  const out = [];

  const walk = (value) => {
    if (!value) return;
    if (typeof value === "string" || typeof value === "number") {
      out.push(String(value));
    } else if (Array.isArray(value)) {
      value.forEach(walk);
    } else if (typeof value === "object") {
      for (const key in value) {
        if (value[key]) out.push(key);
      }
    }
  };

  inputs.forEach(walk);
  return out.join(" ");
}

export default cn;
