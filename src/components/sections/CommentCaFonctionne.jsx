import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const etapes = [
  { num: "01", titre: "Bilan", desc: "Comprendre votre niveau, vos objectifs et vos contraintes." },
  { num: "02", titre: "Planification", desc: "Construire un accompagnement cohérent et progressif." },
  { num: "03", titre: "Coaching", desc: "Vous accompagner dans l'exécution et la progression." },
  { num: "04", titre: "Ajustement", desc: "Faire évoluer le travail selon vos résultats et votre quotidien." },
];

export default function CommentCaFonctionne() {
  return (
    <section className="py-24 lg:py-32 bg-primary">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <h2 className="text-6xl lg:text-8xl font-heading font-bold text-primary-foreground leading-tight uppercase max-w-2xl mb-16">
          Votre progression commence avant la première séance.
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {etapes.map((e) => (
            <div key={e.num} className="border-t border-primary-foreground/20 pt-6">
              <p className="font-mono text-sm text-accent mb-3">{e.num}</p>
              <h3 className="font-heading font-semibold text-primary-foreground text-lg uppercase mb-2">{e.titre}</h3>
              <p className="text-primary-foreground/60 text-sm leading-relaxed">{e.desc}</p>
            </div>
          ))}
        </div>

        <Link
          to="/reserver"
          className="group inline-flex items-center gap-2 mt-16 px-8 py-4 bg-accent text-accent-foreground rounded-full text-sm font-semibold hover:scale-105 transition-all duration-300"
        >
          Réserver un diagnostic
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
