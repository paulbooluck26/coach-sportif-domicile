export default function About() {
  return (
    <section id="about" className="py-24 lg:py-32 max-w-7xl mx-auto px-6 lg:px-10">
      <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        <div className="relative">
          <div className="aspect-[4/5] rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80"
              alt="Le coach"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -right-6 lg:-right-12 bg-background border border-accent/30 rounded-xl px-8 py-6 shadow-xl max-w-[200px]">
            <p className="text-3xl font-heading font-bold text-primary">8+</p>
            <p className="text-xs text-muted-foreground tracking-label mt-1">ANNÉES D'EXPÉRIENCE</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-label text-secondary mb-4">À PROPOS</p>
          <h2 className="text-4xl lg:text-5xl font-heading font-bold text-primary leading-tight mb-8">
            Le coaching comme<br />une architecture du corps.
          </h2>
          <div className="space-y-6 text-base text-muted-foreground leading-relaxed">
            <p>
              Diplômé en sciences du sport et spécialiste de la préparation physique, j'accompagne
              chaque client avec une méthode précise, une écoute attentive et un suivi rigoureux —
              le tout dans le confort de votre domicile.
            </p>
            <p>
              Pas de salle bondée. Pas de programme générique. Chaque séance est pensée pour vous,
              votre corps, vos objectifs et votre rythme de vie.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-6 pt-8 border-t border-accent/30">
            <div>
              <p className="text-2xl font-heading font-bold text-primary">200+</p>
              <p className="text-xs text-muted-foreground mt-1">Clients accompagnés</p>
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-primary">100%</p>
              <p className="text-xs text-muted-foreground mt-1">À domicile</p>
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-primary">24h</p>
              <p className="text-xs text-muted-foreground mt-1">Annulation gratuite</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}