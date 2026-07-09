import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Loader2, CheckCircle2 } from "lucide-react";

export default function ContactSection() {
  const [form, setForm] = useState({ nom: "", email: "", telephone: "", objectif: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.entities.DemandeContact.create(form);
      setSent(true);
      setForm({ nom: "", email: "", telephone: "", objectif: "", message: "" });
    } catch (err) {
      // let bubble
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-28 lg:py-36 bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-5">Contact</p>
            <h2 className="font-heading font-bold text-4xl lg:text-5xl leading-tight mb-8 text-balance">
              Parlons de votre transformation.
            </h2>
            <p className="text-primary-foreground/70 text-lg leading-relaxed mb-10">
              Une question, un objectif, une contrainte ? Écrivez-moi. Je vous réponds
              sous 24h pour construire ensemble votre parcours.
            </p>
            <div className="space-y-4 text-primary-foreground/80">
              <p className="flex items-center gap-3"><span className="text-accent">✦</span> Première séance sans engagement</p>
              <p className="flex items-center gap-3"><span className="text-accent">✦</span> Déplacement Paris & région parisienne</p>
              <p className="flex items-center gap-3"><span className="text-accent">✦</span> Du lundi au samedi, 7h–21h</p>
            </div>
          </div>
          <div className="bg-primary-foreground/5 rounded-lg p-8 lg:p-10 border border-primary-foreground/10">
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <CheckCircle2 className="w-16 h-16 text-accent mb-6" />
                <h3 className="font-heading text-2xl font-semibold mb-3">Message envoyé</h3>
                <p className="text-primary-foreground/70">Merci. Je vous réponds sous 24h.</p>
                <button onClick={() => setSent(false)} className="mt-8 text-sm text-accent hover:underline">
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-primary-foreground/60 mb-2">Nom complet</label>
                    <input name="nom" value={form.nom} onChange={handleChange} required className="w-full bg-primary-foreground/5 border border-primary-foreground/15 rounded-md px-4 py-3 text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none focus:border-accent" placeholder="Votre nom" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-primary-foreground/60 mb-2">Téléphone</label>
                    <input name="telephone" value={form.telephone} onChange={handleChange} className="w-full bg-primary-foreground/5 border border-primary-foreground/15 rounded-md px-4 py-3 text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none focus:border-accent" placeholder="06 12 34 56 78" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-primary-foreground/60 mb-2">Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full bg-primary-foreground/5 border border-primary-foreground/15 rounded-md px-4 py-3 text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none focus:border-accent" placeholder="vous@email.fr" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-primary-foreground/60 mb-2">Votre objectif</label>
                  <input name="objectif" value={form.objectif} onChange={handleChange} className="w-full bg-primary-foreground/5 border border-primary-foreground/15 rounded-md px-4 py-3 text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none focus:border-accent" placeholder="Remise en forme, renforcement, perte de poids..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-primary-foreground/60 mb-2">Message</label>
                  <textarea name="message" value={form.message} onChange={handleChange} required rows={4} className="w-full bg-primary-foreground/5 border border-primary-foreground/15 rounded-md px-4 py-3 text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none focus:border-accent resize-none" placeholder="Décrivez votre besoin..." />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-accent text-accent-foreground py-3.5 rounded-md font-semibold text-sm hover:bg-accent/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi...</> : <><Send className="w-4 h-4" /> Envoyer ma demande</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}