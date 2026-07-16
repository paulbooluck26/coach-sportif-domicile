import { X, Mail, Phone, CalendarDays, Clock, PhoneCall } from "lucide-react";
import { parseDateLocal } from "@/lib/creneaux";

const STATUTS_APPEL = {
  appel_a_passer: { label: "Appel à passer", color: "bg-accent/15 text-accent" },
  appel_confirme: { label: "Appel confirmé", color: "bg-secondary text-foreground" },
  appel_realise: { label: "Appel réalisé", color: "bg-primary/10 text-primary/60" },
  appel_annule: { label: "Appel annulé", color: "bg-destructive/10 text-destructive" },
};

export default function DemandeDetailModal({ demande, onClose }) {
  if (!demande) return null;
  const st = STATUTS_APPEL[demande.statut];
  return (
    <div className="fixed inset-0 z-50 bg-primary/40 flex items-center justify-center p-6" onClick={onClose}>
      <div className="bg-background rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center"><PhoneCall className="w-5 h-5" /></div>
            <div>
              <h3 className="font-heading text-lg font-bold text-foreground">{demande.name}</h3>
              <p className="text-xs text-muted-foreground">Appel découverte</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-6 space-y-4">
          {st && <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>}
          <div className="flex flex-wrap gap-4 text-sm">
            {demande.email && <a href={`mailto:${demande.email}`} className="flex items-center gap-1.5 text-foreground hover:text-accent"><Mail className="w-4 h-4" /> {demande.email}</a>}
            {demande.phone && <a href={`tel:${demande.phone}`} className="flex items-center gap-1.5 text-foreground hover:text-accent"><Phone className="w-4 h-4" /> {demande.phone}</a>}
          </div>
          {(demande.date_souhaitee || demande.heure_souhaitee) && (
            <div className="flex flex-wrap gap-4 text-sm text-foreground">
              {demande.date_souhaitee && <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-accent" /> {parseDateLocal(demande.date_souhaitee).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</span>}
              {demande.heure_souhaitee && <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-accent" /> {demande.heure_souhaitee}</span>}
            </div>
          )}
          {demande.goal && <div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Objectif</p><p className="text-sm text-foreground">{demande.goal}</p></div>}
          {demande.message && <div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Message</p><p className="text-sm text-foreground/80 whitespace-pre-line">{demande.message}</p></div>}
        </div>
      </div>
    </div>
  );
}