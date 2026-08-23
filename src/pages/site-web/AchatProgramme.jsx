import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowRight, Sparkles, Check, Loader2, Smartphone, Target, TrendingUp } from "lucide-react";
import Seo from "@/components/Seo";

const ETAPES = [
  { n: "01", titre: "Évaluer", desc: "Votre appel de bilan pose les bases : objectif, niveau, contraintes." },
  { n: "02", titre: "Programmer", desc: "Votre programme est construit sur mesure, disponible dans l'application." },
  { n: "03", titre: "S'entraîner", desc: "Chaque séance est guidée, où vous voulez, à votre rythme." },
  { n: "04", titre: "Ajuster", desc: "Votre coach suit vos entraînements et ajuste ce qui doit l'être." },
  { n: "05", titre: "Progresser", desc: "Le programme évolue avec vous, semaine après semaine." },
];

export default function AchatProgramme() {
  const [produits, setProduits] = useState(null);

  useEffect(() => {
    base44.entities.Produit.filter({ categorie: "programme_ligne", actif: true, visible_public: true }, "ordre_affichage")
      .then(setProduits)
      .catch(() => setProduits([]));
  }, []);

  if (!produits) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="pt-32 pb-24">
      <Seo
        title="Programmes en Ligne"
        description="Programmes d'entraînement structurés à suivre en autonomie, avec un suivi personnalisé de votre coach via l'application PHYSIS COACHING."
        path="/achat-programme"
      />

      <section className="max-w-3xl mx-auto px-6 lg:px-10 text-center mb-8">
        <p className="text-sm md:text-base font-bold tracking-[0.2em] text-secondary mb-4 uppercase">Programmes en ligne</p>
        <h1 className="text-4xl lg:text-6xl font-heading font-bold text-primary leading-tight mb-6">
          Un plan d'entraînement structuré, à votre rythme.
        </h1>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Un programme personnalisé, accessible directement dans l'application Physis. Entraînez-vous où vous voulez, suivez votre progression et bénéficiez d'un accompagnement adapté à votre niveau d'engagement. Chaque programme est construit sur mesure après votre appel de bilan.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><Smartphone className="w-4 h-4 text-secondary" /> Application Physis</span>
          <span className="flex items-center gap-1.5"><Target className="w-4 h-4 text-secondary" /> Programme personnalisé</span>
          <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-secondary" /> Suivi de progression</span>
        </div>
      </section>

      <p className="text-center text-xs font-bold tracking-[0.25em] text-muted-foreground uppercase mb-12">Choisissez votre niveau d'accompagnement</p>

      <section className="max-w-4xl mx-auto px-6 lg:px-10 mb-16">
        <div className="grid sm:grid-cols-3 gap-5">
          {produits.map((p) => {
            const highlight = !!p.metadata?.recommande;
            const prix = p.prix_promo ?? p.prix_ttc;
            return (
              <div
                key={p.id}
                className={`relative rounded-2xl p-6 border transition-all duration-300 hover:scale-[1.02] flex flex-col ${
                  highlight ? "bg-primary text-primary-foreground border-primary shadow-xl lg:-translate-y-2" : "bg-background border-accent/30"
                }`}
              >
                {p.metadata?.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-secondary text-secondary-foreground text-[10px] font-semibold rounded-full tracking-wide flex items-center gap-1 whitespace-nowrap">
                    <Sparkles className="w-3 h-3" /> {p.metadata.badge}
                  </span>
                )}
                <h3 className={`text-xl font-heading font-bold ${highlight ? "text-primary-foreground" : "text-primary"}`}>{p.nom}</h3>
                <p className={`text-xs mt-1 ${highlight ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{p.metadata?.duree_semaines} semaines</p>
                <div className="flex items-baseline gap-1 my-3">
                  <span className={`text-3xl font-heading font-bold ${highlight ? "text-secondary" : "text-primary"}`}>{prix}€</span>
                </div>
                <p className={`text-sm mb-4 ${highlight ? "text-primary-foreground/80" : "text-foreground/80"}`}>{p.description}</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {(p.metadata?.inclus || []).map((f, j) => (
                    <li key={j} className={`flex items-start gap-2 text-sm ${highlight ? "text-primary-foreground/80" : "text-foreground/80"}`}>
                      <Check className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                {p.metadata?.tag && (
                  <p className={`text-[10px] font-bold tracking-wider uppercase mb-3 ${highlight ? "text-primary-foreground/50" : "text-muted-foreground"}`}>{p.metadata.tag}</p>
                )}
                <Link
                  to="/espace-client/reserver/programme"
                  className={`flex items-center justify-center gap-2 w-full py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                    highlight ? "bg-secondary text-secondary-foreground hover:scale-105" : "border border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  }`}
                >
                  Choisir {p.nom}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {produits.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 lg:px-10 mb-16">
          <div className="text-center mb-10">
            <p className="text-xs font-bold tracking-[0.2em] text-secondary uppercase mb-2">Comparatif</p>
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-primary">Quelle formule vous correspond ?</h2>
          </div>

          <div className="bg-background border border-accent/30 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[560px] grid" style={{ gridTemplateColumns: `1.2fr repeat(${produits.length}, 1fr)` }}>

                <div className="border-b border-accent/20"></div>
                {produits.map((p) => {
                  const highlight = !!p.metadata?.recommande;
                  return (
                    <div key={p.id} className={`text-center py-5 px-3 border-b border-accent/20 ${highlight ? "bg-accent/15 shadow-[inset_0_3px_0_theme(colors.accent.DEFAULT)]" : ""}`}>
                      <p className="font-heading font-bold text-lg text-primary">{p.nom}</p>
                      {p.metadata?.badge && <p className="text-[10px] font-bold tracking-wider text-secondary uppercase mt-1">{p.metadata.badge}</p>}
                    </div>
                  );
                })}

                {[
                  { label: "Durée", render: (p) => `${p.metadata?.duree_semaines} semaines` },
                  { label: "Suivi hebdomadaire", render: (p) => p.metadata?.duree_semaines >= 12 ? "✓" : "—" },
                  { label: "Messagerie coach", render: (p) => p.metadata?.duree_semaines >= 12 ? "✓" : "—" },
                  { label: "Visio mensuelle", render: (p) => p.metadata?.duree_semaines >= 24 ? "✓" : "—" },
                  { label: "Idéal pour...", render: (p) => p.ideal_si, small: true },
                ].flatMap((row, ri) => [
                  <div key={`label-${ri}`} className="py-5 px-6 border-b border-accent/20 text-sm font-semibold text-primary">{row.label}</div>,
                  ...produits.map((p) => {
                    const highlight = !!p.metadata?.recommande;
                    return (
                      <div key={`${ri}-${p.id}`} className={`text-center py-5 px-3 border-b border-accent/20 font-mono ${row.small ? "text-xs leading-snug font-sans" : "text-sm"} ${highlight ? "bg-accent/15 text-foreground font-semibold" : "text-muted-foreground"}`}>
                        {row.render(p)}
                      </div>
                    );
                  }),
                ])}

                <div className="py-6 px-6 text-sm font-semibold text-primary">Prix</div>
                {produits.map((p) => {
                  const highlight = !!p.metadata?.recommande;
                  return (
                    <div key={`prix-${p.id}`} className={`text-center py-6 px-3 font-mono font-bold ${highlight ? "bg-accent/15 text-secondary text-xl" : "text-primary text-lg"}`}>
                      {(p.prix_promo ?? p.prix_ttc)}€
                    </div>
                  );
                })}

              </div>
            </div>
          </div>
        </section>
      )}

      <section className="bg-primary py-16 mb-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <p className="text-sm font-bold tracking-[0.2em] text-accent uppercase mb-2">La méthode</p>
            <h2 className="text-2xl lg:text-3xl font-heading font-bold text-primary-foreground">Plus qu'un programme. Un cadre pour progresser.</h2>
          </div>
          <div className="grid sm:grid-cols-5 gap-6">
            {ETAPES.map((e) => (
              <div key={e.n}>
                <p className="font-mono text-xs text-accent mb-2">{e.n}</p>
                <h3 className="font-heading font-bold text-lg text-primary-foreground mb-1.5">{e.titre}</h3>
                <p className="text-xs text-primary-foreground/60 leading-relaxed">{e.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-6 lg:px-10 text-center">
        <h3 className="text-xl font-heading font-bold text-primary mb-2">Vous ne savez pas quelle formule vous correspond ?</h3>
        <p className="text-sm text-muted-foreground mb-6">Quelques questions suffisent pour identifier l'accompagnement le plus adapté à votre objectif, votre niveau et votre disponibilité.</p>
        <Link to="/diagnostic" className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-full text-sm font-semibold hover:scale-105 transition-all duration-300">
          Trouver mon accompagnement
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
