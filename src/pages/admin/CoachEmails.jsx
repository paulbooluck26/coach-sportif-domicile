import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { envoyerEmail, variablesDisponiblesPour } from "@/lib/emailSender";
import { Mail, Plus, X, Save, Send, CheckCircle2, XCircle, Eye, Pencil } from "lucide-react";

const EVENEMENTS = [
  { value: "bienvenue", label: "Bienvenue nouveau client" },
  { value: "confirmation_reservation", label: "Confirmation réservation" },
  { value: "rappel_24h", label: "Rappel séance 24h avant" },
  { value: "recu_paiement", label: "Reçu de paiement" },
  { value: "achat_carnet", label: "Achat carnet de séances" },
  { value: "achat_programme", label: "Achat programme" },
  { value: "appel_decouverte", label: "Confirmation appel découverte" },
  { value: "appel_demarrage", label: "Confirmation appel de démarrage" },
  { value: "programme_disponible", label: "Programme disponible" },
  { value: "rdv_modifie", label: "Séance déplacée" },
  { value: "rdv_annule", label: "Séance annulée" },
  { value: "bilan_termine", label: "Fin de programme / bilan" },
  { value: "etape_forge", label: "Nouvelle étape du parcours FORGE" },
];

const evenementLabel = (v) => EVENEMENTS.find((e) => e.value === v)?.label || v;

export default function CoachEmails() {
  const [templates, setTemplates] = useState(undefined);
  const [editing, setEditing] = useState(null); // template en cours d'édition (objet)

  const load = async () => {
    const list = await base44.entities.EmailTemplate.list("evenement");
    setTemplates(list);
  };

  useEffect(() => { load().catch(() => setTemplates([])); }, []);

  if (!templates) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;

  const grouped = {};
  EVENEMENTS.forEach((e) => { grouped[e.value] = []; });
  templates.forEach((t) => { (grouped[t.evenement] ||= []).push(t); });

  const handleSave = async (t) => {
    if (t.id) {
      await base44.entities.EmailTemplate.update(t.id, {
        nom: t.nom, evenement: t.evenement, sujet: t.sujet, corps_html: t.corps_html,
        corps_texte: t.corps_texte, variables_disponibles: t.variables_disponibles,
        statut: t.statut, description_admin: t.description_admin,
      });
    } else {
      await base44.entities.EmailTemplate.create({
        nom: t.nom, evenement: t.evenement, sujet: t.sujet, corps_html: t.corps_html || "",
        corps_texte: t.corps_texte, variables_disponibles: t.variables_disponibles || [],
        statut: t.statut || "actif", description_admin: t.description_admin || "",
      });
    }
    setEditing(null);
    load();
  };

  const toggleStatut = async (t) => {
    await base44.entities.EmailTemplate.update(t.id, { statut: t.statut === "actif" ? "inactif" : "actif" });
    load();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Configuration</p>
          <h1 className="font-heading text-3xl font-bold text-foreground">Emails automatiques</h1>
        </div>
        <button
          onClick={() => setEditing(blankTemplate())}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> Nouveau modèle
        </button>
      </div>

      <p className="text-sm text-muted-foreground">
        Modifiez ici le sujet et le contenu de chaque email sans toucher au code. Les variables s'écrivent <code className="px-1 py-0.5 bg-muted rounded text-foreground">{"{{variable}}"}</code>.
      </p>

      <div className="space-y-6">
        {EVENEMENTS.map((ev) => {
          const items = grouped[ev.value] || [];
          const hasActive = items.some((t) => t.statut === "actif");
          return (
            <div key={ev.value} className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-secondary" />
                  <h2 className="font-heading font-semibold text-foreground">{ev.label}</h2>
                  <span className="text-xs text-muted-foreground">({ev.value})</span>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded ${hasActive ? "bg-secondary/15 text-secondary" : "bg-muted text-muted-foreground"}`}>
                  {hasActive ? "Actif" : "Inactif"}
                </span>
              </div>

              {items.length === 0 ? (
                <div className="flex items-center justify-between py-3">
                  <p className="text-sm text-muted-foreground">Aucun modèle — l'email n'est pas envoyé pour cet événement.</p>
                  <button onClick={() => setEditing(blankTemplate(ev.value))} className="text-sm text-secondary hover:underline flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Créer
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((t) => (
                    <div key={t.id} className="flex items-center gap-3 border border-border rounded-md p-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{t.sujet || "(sans sujet)"}</p>
                        <p className="text-xs text-muted-foreground truncate">{t.nom}</p>
                      </div>
                      <button onClick={() => setEditing({ ...t })} className="p-2 text-muted-foreground hover:text-secondary"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => toggleStatut(t)} className={`p-2 ${t.statut === "actif" ? "text-secondary" : "text-muted-foreground/50"}`}>
                        {t.statut === "actif" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editing && <TemplateEditor template={editing} onClose={() => setEditing(null)} onSave={handleSave} />}
    </div>
  );
}

function blankTemplate(evenement = "bienvenue") {
  return { id: null, nom: "", evenement, sujet: "", corps_html: "", corps_texte: "", variables_disponibles: variablesDisponiblesPour(evenement), statut: "actif", description_admin: "" };
}

function TemplateEditor({ template, onClose, onSave }) {
  const [form, setForm] = useState(template);
  const [testEmail, setTestEmail] = useState("");
  const [testResult, setTestResult] = useState(null);
  const [sending, setSending] = useState(false);

  const update = (k, v) => setForm({ ...form, [k]: v });

  const handleTest = async () => {
    setSending(true);
    setTestResult(null);
    // Construit des variables d'exemple à partir de la liste
    const sampleVars = {};
    (form.variables_disponibles || []).forEach((v) => { sampleVars[v] = `<${v}>`; });
    const res = await envoyerEmail(form.evenement, testEmail, sampleVars);
    setTestResult(res);
    setSending(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-primary/40 flex items-center justify-center p-6" onClick={onClose}>
      <div className="bg-background rounded-lg max-w-2xl w-full max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <h3 className="font-heading text-lg font-bold text-foreground">{form.id ? "Modifier le modèle" : "Nouveau modèle"}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Identifiant interne (nom)</label>
            <input value={form.nom} onChange={(e) => update("nom", e.target.value)} placeholder="ex: confirmation_reservation_v2" className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm" />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Événement</label>
            <select value={form.evenement} onChange={(e) => update("evenement", e.target.value)} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm">
              {EVENEMENTS.map((ev) => <option key={ev.value} value={ev.value}>{ev.label}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Sujet</label>
            <input value={form.sujet} onChange={(e) => update("sujet", e.target.value)} placeholder="Confirmation de réservation — The Lab Forge" className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm" />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Corps (texte brut)</label>
            <textarea value={form.corps_texte} onChange={(e) => update("corps_texte", e.target.value)} rows={6} placeholder="Bonjour {{client_prenom}},..." className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-y font-mono" />
            <p className="text-xs text-muted-foreground mt-1">C'est ce texte qui est envoyé via l'email actuel. Utilisez {"{{variable}}"}.</p>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Corps HTML (optionnel, pour usage futur)</label>
            <textarea value={form.corps_html} onChange={(e) => update("corps_html", e.target.value)} rows={4} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-y font-mono" />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description (note interne)</label>
            <textarea value={form.description_admin} onChange={(e) => update("description_admin", e.target.value)} rows={2} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-y" />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Statut</label>
            <select value={form.statut} onChange={(e) => update("statut", e.target.value)} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm">
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
            </select>
          </div>

          <div className="bg-muted/40 rounded-md p-3">
            <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Variables disponibles</p>
            <div className="flex flex-wrap gap-1.5">
              {(form.variables_disponibles || []).map((v) => (
                <span key={v} className="text-xs px-2 py-1 bg-background border border-border rounded font-mono">{v}</span>
              ))}
              {(form.variables_disponibles || []).length === 0 && <span className="text-xs text-muted-foreground">Aucune</span>}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-xs font-semibold text-foreground mb-2">Envoyer un email test</p>
            <div className="flex gap-2">
              <input value={testEmail} onChange={(e) => setTestEmail(e.target.value)} type="email" placeholder="email enregistré" className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-sm" />
              <button onClick={handleTest} disabled={!testEmail || sending} className="flex items-center gap-1.5 px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium disabled:opacity-50">
                {sending ? "Envoi…" : <><Send className="w-3.5 h-3.5" /> Tester</>}
              </button>
            </div>
            {testResult && (
              <p className={`text-xs mt-2 ${testResult.sent ? "text-secondary" : "text-destructive"}`}>
                {testResult.sent ? `Email envoyé à ${testEmail}` : `Échec : ${testResult.reason || testResult.error || "erreur"}`}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1.5">L'envoi ne fonctionne qu'avec un destinataire déjà inscrit à l'app.</p>
          </div>
        </div>

        <div className="sticky bottom-0 bg-background border-t border-border px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 border border-border rounded-md text-sm font-medium text-muted-foreground hover:bg-muted">Annuler</button>
          <button onClick={() => onSave(form)} disabled={!form.nom || !form.sujet || !form.corps_texte} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-semibold disabled:opacity-50">
            <Save className="w-4 h-4" /> Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}