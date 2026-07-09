import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Inbox, Mail, Phone, Trash2 } from "lucide-react";

const STATUTS = [
  { id: "nouveau", label: "Nouveau", color: "bg-accent/15 text-accent" },
  { id: "en_cours", label: "En cours", color: "bg-secondary text-foreground" },
  { id: "traite", label: "Traité", color: "bg-primary/10 text-primary/60" },
];

export default function CoachDemandes() {
  const [demandes, setDemandes] = useState(null);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    const data = await base44.entities.DemandeContact.list("-created_date", 100);
    setDemandes(data);
  };
  useEffect(() => { load().catch(() => {}); }, []);

  const updateStatut = async (id, statut) => {
    await base44.entities.DemandeContact.update(id, { statut });
    load();
  };
  const remove = async (id) => {
    if (!confirm("Supprimer cette demande ?")) return;
    await base44.entities.DemandeContact.delete(id);
    load();
  };

  if (!demandes) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;

  const filtered = filter === "all" ? demandes : demandes.filter(d => d.statut === filter);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Back-office</p>
        <h1 className="font-heading text-3xl font-bold text-foreground">Demandes de contact</h1>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setFilter("all")} className={`px-4 py-2 rounded-md text-sm font-medium ${filter === "all" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"}`}>Toutes ({demandes.length})</button>
        {STATUTS.map(s => (
          <button key={s.id} onClick={() => setFilter(s.id)} className={`px-4 py-2 rounded-md text-sm font-medium ${filter === s.id ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"}`}>{s.label} ({demandes.filter(d => d.statut === s.id).length})</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Inbox className="w-10 h-10 text-secondary mx-auto mb-4" />
          <p className="text-muted-foreground">Aucune demande dans cette catégorie.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(d => (
            <div key={d.id} className="bg-card border border-border rounded-lg p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-heading font-semibold text-foreground">{d.nom}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUTS.find(s => s.id === d.statut)?.color || STATUTS[0].color}`}>{STATUTS.find(s => s.id === d.statut)?.label}</span>
                    <span className="text-xs text-muted-foreground">{new Date(d.created_date).toLocaleDateString("fr-FR")}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                    {d.email && <a href={`mailto:${d.email}`} className="flex items-center gap-1.5 hover:text-accent"><Mail className="w-3.5 h-3.5" /> {d.email}</a>}
                    {d.telephone && <a href={`tel:${d.telephone}`} className="flex items-center gap-1.5 hover:text-accent"><Phone className="w-3.5 h-3.5" /> {d.telephone}</a>}
                  </div>
                  {d.objectif && <p className="text-sm font-medium text-foreground mb-1">Objectif : {d.objectif}</p>}
                  <p className="text-sm text-foreground/70">{d.message}</p>
                </div>
                <div className="flex md:flex-col gap-2">
                  <select value={d.statut} onChange={e => updateStatut(d.id, e.target.value)} className="border border-border rounded-md px-3 py-2 text-sm bg-card text-foreground focus:outline-none focus:border-accent">
                    {STATUTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                  <button onClick={() => remove(d.id)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}