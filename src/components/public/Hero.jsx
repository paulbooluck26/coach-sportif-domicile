import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative h-screen min-h-[700px] w-full overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2400&auto=format&fit=crop"
          alt="Coach sportif à domicile"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-primary/40" />
      </div>
      <div className="relative z-10 h-full flex flex-col justify-between px-6 lg:px-10 pt-28 pb-16">
        <div className="flex-1 flex items-center">
          <div className="max-w-7xl mx-auto w-full">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground/70 mb-6 scroll-materialize">
              Coach sportif personnel à domicile
            </p>
            <h1 className="font-heading font-bold text-primary-foreground leading-[0.95] scroll-materialize" style={{ fontSize: "clamp(3rem, 9vw, 7rem)", letterSpacing: "-0.03em" }}>
              L'art du<br />mouvement<br />sur mesure.
            </h1>
          </div>
        </div>
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <p className="text-primary-foreground/80 text-lg max-w-md scroll-materialize">
            Des séances individuelles et des programmes personnalisés, conçus pour
            transformer votre corps dans le confort de votre domicile.
          </p>
          <Link
            to="/reservation"
            className="group inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-8 py-4 rounded-md font-semibold text-sm hover:bg-accent/90 transition-all w-full md:w-auto"
          >
            Commencer ma transformation
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}