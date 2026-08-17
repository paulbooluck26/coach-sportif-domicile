import { Search, LayoutGrid, TrendingUp, ArrowRight } from "lucide-react";

const etapes = [
  { icon: Search, label: "Évaluer" },
  { icon: LayoutGrid, label: "Structurer" },
  { icon: TrendingUp, label: "Progresser" },
];

export default function ApprocheSimple() {
  return (
    <section className="py-24 lg:py-32 max-w-7xl mx-auto px-6 lg:px-10">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-xs font-semibold tracking-[0.25em] text-secondary mb-4 uppercase">Une approche simple</p>
          <p className="text-lg text-foreground/80 leading-relaxed max-w-md">
            Pas de programme standard. Pas de séance improvisée. Chaque accompagnement commence par comprendre votre situation, vos objectifs et votre niveau. Ensuite, on construit une progression adaptée et on l'ajuste au fil du temps.
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {etapes.map((e, i) => (
            <div key={e.label} className="flex items-center gap-2 sm:gap-4 flex-1">
              <div className="flex flex-col items-center text-center gap-3 flex-1">
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
                  <e.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <p className="font-heading font-semibold text-primary uppercase tracking-wide text-sm">{e.label}</p>
              </div>
              {i < etapes.length - 1 && <ArrowRight className="w-4 h-4 text-accent shrink-0" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
