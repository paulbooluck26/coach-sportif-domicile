import { ArrowRight, Home, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import ProgrammeAccompagnement from "@/components/programme/ProgrammeAccompagnement";

const services = [
  {
    icon: Home,
    title: "Séances individuelles à domicile",
    desc: "Un coaching complet, chez vous. Renforcement musculaire, cardio, mobilité et posture — adapté à votre espace et votre matériel. Chaque séance dure 60 minutes.",
    features: ["Évaluation posturale initiale", "Matériel fourni si besoin", "Suivi progression séance par séance"],
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
    link: "/reserver",
  },
  {
    icon: ClipboardList,
    title: "Programmes personnalisés",
    desc: "Un plan d'entraînement structuré sur plusieurs semaines, conçu pour atteindre un objectif précis. Idéal en complément des séances ou pour s'entraîner en autonomie.",
    features: ["Plan sur 4 à 12 semaines", "Exercices détaillés et vidéos", "Ajustements selon progression"],
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
    link: "/achat-programme",
  },
];

const OFFRES_PROG = [
  { id: "start", nom: "START", duree: 4, prix: 49, desc: "Programme découverte pour construire de bonnes bases et reprendre une routine efficace." },
  { id: "forge", nom: "FORGE Transformation", duree: 12, prix: 149, desc: "Le programme principal pour une transformation physique et des habitudes durables.", recommande: true },
  { id: "legacy", nom: "LEGACY", duree: 24, prix: 299, desc: "Un accompagnement longue durée pour une transformation complète." },
];

export default function Services() {
  return (
    <section id="services" className="py-24 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="max-w-2xl mb-16">
          <p className="text-xs font-semibold tracking-label text-secondary mb-4">SERVICES</p>
          <h2 className="text-4xl lg:text-5xl font-heading font-bold text-primary leading-tight">
            Deux approches,<br />une même exigence.
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {services.map((s, i) => (
            <div key={i} className="group bg-background rounded-2xl overflow-hidden border border-accent/20 hover:shadow-xl transition-all duration-500">
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={s.image}
                  alt={s.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <s.icon className="w-5 h-5 text-secondary" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-primary">{s.title}</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6">{s.desc}</p>
                <ul className="space-y-2 mb-6">
                  {s.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-foreground/80">
                      <span className="w-1 h-1 rounded-full bg-secondary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to={s.link} className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:gap-3 transition-all">
                  {i === 0 ? "Réserver une séance" : "Acheter un programme"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-16 border-t border-accent/20">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold tracking-label text-secondary mb-4">PROGRAMMES EN LIGNE</p>
            <h3 className="text-3xl lg:text-4xl font-heading font-bold text-primary leading-tight">
              Achetez un programme,<br />entraînez-vous en autonomie.
            </h3>
            <p className="text-muted-foreground mt-4">Programme préparé sur mesure par votre coach. Aucun créneau à réserver — vous vous entraînez quand vous voulez. Chaque programme inclut un accompagnement humain complet : un appel de démarrage, un appel de bilan et une messagerie privée avec votre coach.</p>
          </div>
          <ProgrammeAccompagnement className="mb-10" />
          <div className="grid md:grid-cols-3 gap-6">
            {OFFRES_PROG.map(o => (
              <div key={o.id} className={`bg-background rounded-2xl border p-8 relative ${o.recommande ? "border-secondary shadow-xl" : "border-accent/20"}`}>
                {o.recommande && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground text-xs font-semibold px-3 py-1 rounded-full">Recommandé</span>}
                <h4 className="font-heading text-xl font-bold text-primary mb-2">{o.nom}</h4>
                <p className="text-sm text-muted-foreground mb-6">{o.desc}</p>
                <p className="font-heading text-4xl font-bold text-primary mb-1">{o.prix}€</p>
                <p className="text-sm text-muted-foreground mb-6">{o.duree} semaines</p>
                <Link to={`/achat-programme?offre=${o.id}`} className="block text-center bg-primary text-primary-foreground py-3 rounded-md font-semibold text-sm hover:opacity-90 transition-opacity">Choisir cette offre</Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}