export default function About() {
  return (
    <section id="coach" className="py-24 lg:py-32 max-w-7xl mx-auto px-6 lg:px-10">
      <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        <div className="relative">
          <div className="aspect-[4/5] rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80"
              alt="Paul Booluck, coach PHYSIS COACHING"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -right-6 lg:-right-12 bg-background border border-accent/30 rounded-xl px-8 py-6 shadow-xl max-w-[200px]">
            <p className="text-3xl font-heading font-bold text-primary">XX+</p>
            <p className="text-xs text-muted-foreground tracking-wide mt-1 uppercase">Clients accompagnés</p>
          </div>
        </div>

        <div>
          <p className="text-sm md:text-base font-bold tracking-[0.2em] text-secondary mb-4 uppercase">Le coach</p>
          <h2 className="text-6xl lg:text-8xl font-heading font-bold text-primary leading-tight mb-8 uppercase">
            Une expertise construite sur le terrain.
          </h2>
          <div className="space-y-6 text-base text-muted-foreground leading-relaxed">
            <p>
              Je suis Paul Booluck, coach sportif diplômé BPJEPS Activités de la Forme.
            </p>
            <p>
              Mon parcours m'a amené à évoluer dans des environnements différents, en France comme à l'étranger, avec une même conviction : le bon entraînement n'est pas celui qui est le plus compliqué, mais celui qui est adapté à la personne et capable de la faire progresser. Rigueur, préparation et constance sont au cœur de mon approche du coaching.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-4 pt-8 border-t border-accent/30">
            <div>
              <p className="text-2xl font-heading font-bold text-primary">XX+</p>
              <p className="text-xs text-muted-foreground mt-1">Années d'expérience</p>
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-primary">XX%</p>
              <p className="text-xs text-muted-foreground mt-1">À domicile</p>
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-primary">24h</p>
              <p className="text-xs text-muted-foreground mt-1">Annulation gratuite</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="text-xs font-medium text-primary bg-accent/15 px-4 py-2 rounded-full">BPJEPS Activités de la Forme</span>
            <span className="text-xs font-medium text-primary bg-accent/15 px-4 py-2 rounded-full">Expérience France & international</span>
          </div>
        </div>
      </div>
    </section>
  );
}
