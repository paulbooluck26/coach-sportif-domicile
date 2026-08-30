import { useState, useEffect } from "react";
import { chargerGA } from "@/lib/analytics";

const CLE_CONSENTEMENT = "physis_consentement_cookies";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const choix = localStorage.getItem(CLE_CONSENTEMENT);
    if (choix === "accepte") {
      chargerGA();
    } else if (choix !== "refuse") {
      setVisible(true);
    }
  }, []);

  const accepter = () => {
    localStorage.setItem(CLE_CONSENTEMENT, "accepte");
    chargerGA();
    setVisible(false);
  };

  const refuser = () => {
    localStorage.setItem(CLE_CONSENTEMENT, "refuse");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-primary text-primary-foreground p-4 sm:p-5">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-4">
        <p className="text-sm text-primary-foreground/80 flex-1">
          Nous utilisons des cookies de mesure d'audience pour comprendre comment vous utilisez notre site. Vous pouvez accepter ou refuser — votre choix n'affecte jamais votre navigation.
        </p>
        <div className="flex gap-2 shrink-0">
          <button onClick={refuser} className="px-4 py-2 rounded-full text-sm font-medium border border-primary-foreground/30 hover:bg-primary-foreground/10 transition-colors">
            Refuser
          </button>
          <button onClick={accepter} className="px-4 py-2 rounded-full text-sm font-semibold bg-accent text-accent-foreground hover:scale-105 transition-all duration-300">
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
