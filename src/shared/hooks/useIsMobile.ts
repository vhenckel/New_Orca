import { useEffect, useState } from "react";

const MOBILE_MAX_WIDTH_PX = 767;
export const mobileViewportQuery = `(max-width: ${MOBILE_MAX_WIDTH_PX}px)`;

/** True quando a viewport corresponde a breakpoint "mobile" (alinhado ao `md` do Tailwind). */
export function getIsViewportMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(mobileViewportQuery).matches;
}

/**
 * Assina `matchMedia` para detectar mobile. Estado inicial lê o valor atual (evita flash desktop→mobile no CSR).
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(getIsViewportMobile);

  useEffect(() => {
    const mq = window.matchMedia(mobileViewportQuery);
    setIsMobile(mq.matches);
    const onChange = () => setIsMobile(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
