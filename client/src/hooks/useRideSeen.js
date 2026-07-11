import { useEffect, useState } from "react";
import { wasRideSeen, onRideSeen } from "../utils/rideGate.js";

/**
 * useRideSeen — reactive view of the session ride-seen flag (see rideGate).
 * Starts from whatever the session already knows and flips to true the instant
 * the ride completes, so the app shell can drop Home's chrome-free treatment
 * (and Home can skip the intro runways) without a reload.
 */
export function useRideSeen() {
  const [seen, setSeen] = useState(wasRideSeen);
  useEffect(() => onRideSeen(() => setSeen(true)), []);
  return seen;
}

export default useRideSeen;
