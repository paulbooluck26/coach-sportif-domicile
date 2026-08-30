import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { suiviPage } from "@/lib/analytics";

export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    suiviPage(location.pathname + location.search);
  }, [location]);

  return null;
}
