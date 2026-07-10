import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function PublicNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Services", href: "/#services" },
    { label: "Tarifs", href: "/#tarifs" },
    { label: "Méthode", href: "/#methode" },
    { label: "Témoignages", href: "/#temoignages" },
  ];

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? "glass-nav shadow-lg" : "bg-transparent"}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-10 h-20 flex items-center justify-between">
        <a href="/" className={`font-heading text-xl font-bold tracking-tight transition-colors ${scrolled ? "text-primary-foreground" : "text-primary"}`}>
          The Lab Forge
        </a>
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a key={l.href} href={l.href} className={`text-sm font-medium transition-colors ${scrolled ? "text-primary-foreground/80 hover:text-primary-foreground" : "text-foreground/70 hover:text-foreground"}`}>
              {l.label}
            </a>
          ))}
          <Link to="/reservation" className={`px-5 py-2.5 rounded-md text-sm font-semibold transition-all ${scrolled ? "bg-accent-foreground/10 text-primary-foreground hover:bg-accent-foreground/20" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
            Réserver
          </Link>
        </nav>
        <button className="md:hidden text-primary" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden glass-nav px-6 py-6 space-y-4">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="block text-sm font-medium text-primary-foreground/90" onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <Link to="/reservation" className="block bg-accent text-accent-foreground px-5 py-2.5 rounded-md text-sm font-semibold text-center" onClick={() => setOpen(false)}>
            Réserver
          </Link>
        </div>
      )}
    </header>
  );
}