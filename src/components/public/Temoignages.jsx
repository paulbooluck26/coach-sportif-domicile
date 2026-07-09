export default function Temoignages() {
  const items = [
    {
      quote: "J'ai retrouvé une énergie que je n'avais pas eue depuis des années. Les séances à domicile m'ont changé la vie.",
      name: "Sophie M.",
      detail: "Programme 8 semaines",
    },
    {
      quote: "Un accompagnement d'une précision remarquable. Chaque séance est ajustée à ce dont j'ai besoin ce jour-là.",
      name: "Thomas L.",
      detail: "Carnet de 5 séances",
    },
    {
      quote: "Le programme personnalisé m'a permis de progresser même entre les séances. Je me sens plus fort à 45 ans qu'à 30.",
      name: "Karim D.",
      detail: "Programme complet",
    },
  ];

  return (
    <section id="temoignages" className="py-28 lg:py-36 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="max-w-2xl mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-5">Témoignages</p>
          <h2 className="font-heading font-bold text-4xl lg:text-5xl text-foreground leading-tight text-balance">
            Ce que disent ceux qui se sont transformés.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((t) => (
            <div key={t.name} className="bg-card border border-border rounded-lg p-10 flex flex-col">
              <div className="text-4xl text-accent font-heading leading-none mb-6">“</div>
              <p className="text-foreground/80 leading-relaxed mb-8 flex-1">{t.quote}</p>
              <div className="pt-6 border-t border-border">
                <p className="font-heading font-semibold text-foreground">{t.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{t.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}