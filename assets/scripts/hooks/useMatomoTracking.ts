import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const useMatomoTracking = (): void => {
  const location = useLocation();

  useEffect(() => {
    if (typeof _paq !== "undefined") {
      _paq.push(["setCustomUrl", window.location.href]);
      _paq.push(["setDocumentTitle", document.title]);
      _paq.push(["trackPageView"]);
    }
  }, [location]);
};

export default useMatomoTracking;
