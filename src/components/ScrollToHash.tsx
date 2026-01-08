import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Ensures hash links (e.g. /#features) scroll to the target element in SPA navigation.
 */
export const ScrollToHash = () => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;

    const id = location.hash.replace("#", "");

    // Retry a few times to handle route transitions + layout/asset loading.
    let tries = 0;
    const maxTries = 20;

    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      tries += 1;
      if (tries < maxTries) {
        window.setTimeout(tryScroll, 50);
      }
    };

    // Wait one frame to ensure the section is laid out after route transitions
    requestAnimationFrame(() => {
      tryScroll();
    });
  }, [location.pathname, location.hash]);

  return null;
};
