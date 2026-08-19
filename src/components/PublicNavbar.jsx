import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Le Coach", href: "/#coach" },
  { label: "Services", href: "/#accompagnements" },
  { label: "App Mobile", href: "/#application" },
  { label: "Témoignages", href: "/#testimonials" },
  { label: "Contact", href: "/#contact" },
];

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const espaceLink = user ? "/espace-client" : "/login";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location]);

  const isHome = location.pathname === "/";
  const isReserver = location.pathname === "/reserver";
  const solid = scrolled || !isHome;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        solid
          ? "bg-background/80 backdrop-blur-md border-b border-accent/30 py-4"
          : "bg-transparent py-6"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img
            src="/logo-physis.png"
            alt="Physis Coaching"
            className="h-12 md:h-14 w-auto"
          />
        </Link>

        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors duration-300 ${solid ? "text-primary/70 hover:text-secondary" : "text-primary-foreground/80 hover:text-primary-foreground"}`}
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <Link
            to={espaceLink}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${solid ? "bg-primary text-primary-foreground hover:opacity-90" : "bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"}`}
          >
            Mon espace
          </Link>
          {isReserver ? (
            <Link
              to="/"
              className="px-6 py-2.5 border border-primary/40 text-primary rounded-full text-sm font-semibold hover:bg-primary/5 transition-all duration-300"
            >
              Retour à l'accueil
            </Link>
          ) : (
            <a
              href="/#accompagnements"
              className="px-6 py-2.5 bg-accent text-accent-foreground rounded-full text-sm font-semibold uppercase tracking-wide hover:scale-105 hover:shadow-lg transition-all duration-300"
            >
              Réserver
            </a>
          )}
        </div>

        <button className={`lg:hidden transition-colors ${solid ? "text-primary" : "text-primary-foreground"}`} onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {open && (
        <div className="lg:hidden bg-background/95 backdrop-blur-md border-t border-accent/30 mt-4 animate-fade-in">
          <div className="px-6 py-6 flex flex-col gap-5">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="text-sm font-medium text-primary/80 hover:text-secondary">
                {l.label}
              </a>
            ))}
            <div className="h-px bg-accent/30" />
            <Link to={espaceLink} className="px-6 py-3 bg-primary text-primary-foreground rounded-full text-sm font-semibold text-center">Mon espace</Link>
            {isReserver ? (
              <Link to="/" className="px-6 py-3 border border-primary/40 text-primary rounded-full text-sm font-semibold text-center">
                Retour à l'accueil
              </Link>
            ) : (
              <a href="/#accompagnements" className="px-6 py-3 bg-accent text-accent-foreground rounded-full text-sm font-semibold uppercase tracking-wide text-center">
                Réserver
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
