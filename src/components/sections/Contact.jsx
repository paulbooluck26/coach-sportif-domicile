import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Loader2, CheckCircle2 } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", goal: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await base44.entities.DemandeContact.create(form);
      setSent(true);
      setForm({ name: "", email: "", phone: "", goal: "", message: "" });
    } catch (err) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 lg:py-32 max-w-7xl mx-auto px-6 lg:px-10">
      <div className="grid lg:grid-cols-2 gap-16">
        <div>
          <p className="text-xs font-semibold tracking-label text-secondary mb-4">CONTACT</p>
          <h2 className="text-4xl lg:text-5xl font-heading font-bold text-primary leading-tight mb-6">
            Une question ?<br />Parlons-en.
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8 max-w-md">
            Vous souhaitez en savoir plus avant de réserver ? Laissez-moi vos coordonnées et votre objectif —
            je vous réponds sous 24h.
          </p>
          <div className="space-y-4 text-sm">
            <p className="text-muted-foreground">
              <span className="font-semibold text-primary">Téléphone :</span> 06 12 34 56 78
            </p>
            <p className="text-muted-foreground">
              <span className="font-semibold text-primary">Email :</span> contact@thelabforge.fr
            </p>
            <p className="text-muted-foreground">
              <span className="font-semibold text-primary">Zone :</span> Colmar et alentours (Haut-Rhin)
            </p>
          </div>
        </div>

        <div>
          {sent ? (
            <div className="bg-secondary/10 border border-secondary/30 rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-secondary mb-4" />
              <h3 className="text-xl font-heading font-semibold text-primary mb-2">Message envoyé</h3>
              <p className="text-muted-foreground text-sm">Merci ! Je vous recontacte très vite.</p>
              <button onClick={() => setSent(false)} className="mt-6 text-sm text-secondary font-medium hover:underline">
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-background border border-accent/30 rounded-2xl p-8 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Nom complet *</label>
                  <input
                    name="name" value={form.name} onChange={handleChange} required
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-sm focus:border-secondary focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email *</label>
                  <input
                    type="email" name="email" value={form.email} onChange={handleChange} required
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-sm focus:border-secondary focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Téléphone</label>
                  <input
                    name="phone" value={form.phone} onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-sm focus:border-secondary focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Objectif</label>
                  <select
                    name="goal" value={form.goal} onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-sm focus:border-secondary focus:outline-none transition-colors"
                  >
                    <option value="">Sélectionner…</option>
                    <option value="Perte de poids">Perte de poids</option>
                    <option value="Renforcement">Renforcement musculaire</option>
                    <option value="Remise en forme">Remise en forme</option>
                    <option value="Préparation physique">Préparation physique</option>
                    <option value="Bien-être & posture">Bien-être & posture</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Message *</label>
                <textarea
                  name="message" value={form.message} onChange={handleChange} required rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-sm focus:border-secondary focus:outline-none transition-colors resize-none"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button
                type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-secondary text-secondary-foreground rounded-full text-sm font-semibold hover:scale-[1.02] transition-transform disabled:opacity-50"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi…</> : <><Send className="w-4 h-4" /> Envoyer ma demande</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}