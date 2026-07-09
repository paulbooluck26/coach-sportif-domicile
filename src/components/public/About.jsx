export default function About() {
  return (
    <section id="methode" className="py-28 lg:py-36 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1200&auto=format&fit=crop"
              alt="Méthode d'entraînement"
              className="w-full h-[520px] object-cover rounded-md"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-5">La méthode</p>
            <h2 className="font-heading font-bold text-4xl lg:text-5xl text-foreground leading-tight mb-8 text-balance">
              Le corps est une architecture. Je la construis avec précision.
            </h2>
            <div className="space-y-5 text-foreground/70 text-lg leading-relaxed">
              <p>
                Je ne crois pas aux séances standardisées. Chaque corps raconte
                une histoire — ses déséquilibres, ses forces, ses besoins. Mon
                approche commence par une lecture attentive de la vôtre.
              </p>
              <p>
                De cette lecture naît un programme de mouvement conçu
                exclusivement pour vous, adapté à votre espace, votre emploi du
                temps et vos objectifs. Chaque séance est une étape vers une
                version plus solide, plus libre de vous-même.
              </p>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-6 pt-8 border-t border-border">
              <div>
                <p className="font-heading text-3xl font-bold text-primary">8 ans</p>
                <p className="text-sm text-muted-foreground mt-1">d'expérience</p>
              </div>
              <div>
                <p className="font-heading text-3xl font-bold text-primary">120+</p>
                <p className="text-sm text-muted-foreground mt-1">clients accompagnés</p>
              </div>
              <div>
                <p className="font-heading text-3xl font-bold text-primary">100%</p>
                <p className="text-sm text-muted-foreground mt-1">à domicile</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}