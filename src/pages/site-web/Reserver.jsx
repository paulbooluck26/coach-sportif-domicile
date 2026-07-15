import { useState } from "react";
import ForgeHero from "@/components/reserver/ForgeHero";
import DiagnosticSection from "@/components/reserver/DiagnosticSection";
import AccompagnementsSection from "@/components/reserver/AccompagnementsSection";
import AbonnementsSection from "@/components/reserver/AbonnementsSection";
import DecouverteSection from "@/components/reserver/DecouverteSection";
import ReservationTunnel from "@/components/reserver/ReservationTunnel";

export default function Reserver() {
  const [preselect, setPreselect] = useState(null);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const choisirOffre = (offreId) => {
    setPreselect({ offreId, key: Date.now() });
    setTimeout(() => scrollTo("parcours"), 50);
  };

  return (
    <div>
      <ForgeHero onCommencer={() => scrollTo("parcours")} onVoirOffres={() => scrollTo("accompagnements")} />

      <DiagnosticSection onChoisir={choisirOffre} />
      <AccompagnementsSection onChoisir={choisirOffre} />
      <AbonnementsSection onChoisir={choisirOffre} />
      <DecouverteSection onChoisir={choisirOffre} />

      <section id="parcours" className="py-20 px-6 bg-secondary/5 scroll-mt-24">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Parcours réservation</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Réservez en 3 étapes</h2>
          <p className="text-muted-foreground mt-3">Choisissez votre offre, sélectionnez un créneau, confirmez. Votre coach vous recontacte pour finaliser.</p>
        </div>
        <ReservationTunnel preselect={preselect} />
      </section>
    </div>
  );
}