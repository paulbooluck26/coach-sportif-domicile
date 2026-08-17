import { Star } from "lucide-react";

const testimonials = [
  {
    text: "Paul a transformé ma routine. Je n'aurais jamais cru que je pouvais progresser autant à domicile. Professionnel, à l'écoute et d'une exigence rare.",
    name: "Sophie M.",
    detail: "Coaching sur 6 mois",
  },
  {
    text: "Le programme personnalisé m'a permis de reprendre le sport en autonomie tout en gardant un suivi régulier. Exactement ce qu'il me fallait.",
    name: "Karim B.",
    detail: "Programme 8 semaines",
  },
  {
    text: "Un coaching haut de gamme. Chaque séance est structurée, chaque mouvement est justifié. On se sent accompagné à 100%.",
    name: "Émilie L.",
    detail: "Carnet de 10 séances",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 lg:py-32 bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-semibold tracking-label text-secondary mb-4">TÉMOIGNAGES</p>
          <h2 className="text-6xl lg:text-8xl font-heading font-bold leading-tight">
            Ce qu'ils disent.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-2xl p-8 backdrop-blur-sm">
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-secondary text-secondary" />
                ))}
              </div>
              <p className="text-primary-foreground/80 leading-relaxed mb-8 text-sm">"{t.text}"</p>
              <div className="pt-4 border-t border-primary-foreground/10">
                <p className="font-heading font-semibold text-primary-foreground">{t.name}</p>
                <p className="text-xs text-primary-foreground/50 mt-1">{t.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
