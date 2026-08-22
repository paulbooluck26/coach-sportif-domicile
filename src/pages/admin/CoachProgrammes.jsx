import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dumbbell, Trash2, Edit, X, Save, Hammer, RotateCcw, Library, Rocket, Loader2 } from "lucide-react";
import ProgrammeBuilder from "@/components/programme/ProgrammeBuilder";
import { cloneProgramme } from "@/lib/programmeClone";

const STATUTS = {
  brouillon: { label: "Brouillon", color: "bg-muted text-muted-foreground" },
  actif: { label: "Actif", color: "bg-secondary text-secondary-foreground" },
  termine: { label: "Terminé", color: "bg-primary/10 text-primary/60" },
  supprime: { label: "Supprimé", color: "bg-destructive/10 text-destructive" },
};

const ONGLETS = [
  { key: "actifs", label: "Actifs" },
  { key: "brouillons", label: "Brouillons" },
  { key: "bibliotheque", label: "Bibliothèque" },
  { key: "supprimes", label: "Supprimés" },
];

const emptyForm = { name: "", description: "", duration_weeks: 4, objective: "", client_ids: [], statut: "brouillon", est_modele: false, date_debut: new Date().toISOString().split("T")[0] };

export default function CoachProgrammes() {
  const [programmes, setProgrammes] = useState(null);
  const [clients, setClients] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [builder, setBuilder] = useState(null);
  const [onglet, setOnglet] = useState("actifs");
  const [deploying, setDeploying] = useState(null);
  const [deployClientId, setDeployClientId] = useState("");
  const [rechercheClient, setRechercheClient] = useState("");
  const [deployLoading, setDeployLoading] = useState(false);

  const load = async () => {
    const [p, c] = await Promise.all([
      base44.entities.Programme.list("-created_date", 200),
      base44.entities.ClientProfile.list("-created_date", 100),
    ]);
    setProgrammes(p);
    setClients(c);
  };
  useEffect(() => {
    load().catch(() => {});
    const params = new URLSearchParams(window.location.search);
    const cmdClientId = params.get("client_id");
    const cmdDuree = params.get("duree");
    if (cmdClientId) {
      setEditing({ new: true });
      setForm({ name: "", description: "", duration_weeks: parseInt(cmdDuree) || 4, objective: "", client_ids: [cmdClientId], statut: "actif", est_modele: false, date_debut: new Date().toISOString().split("T")[0] });
    }
  }, []);

  const startNew = () => { setEditing({ new: true }); setForm(emptyForm); };
  const startEdit = (p) => { setEditing(p); setForm({ name: p.name || "", description: p.description || "", duration_weeks: p.duration_weeks || 4, objective: p.objective || "", client_ids: p.client_ids || [], statut: p.statut || "brouillon", est_modele: !!p.est_modele, date_debut: new Date().toISOString().split("T")[0] }); };

  const toggleClient = (userId) => {
    setForm(f => ({ ...f, client_ids: f.client_ids.includes(userId) ? f.client_ids.filter(id => id !== userId) : [...f.client_ids, userId] }));
  };

  const save = async () => {
    const clientNames = form.client_ids.map(id => clients.find(c => c.user_id === id)?.nom).filter(Boolean).join(", ");
    const { date_debut, ...formSansDate } = form;
    const payload = { ...formSansDate, client_names: clientNames };
    let programmeId;
    if (editing.id) {
      await base44.entities.Programme.update(editing.id, payload);
      programmeId = editing.id;
    } else {
      const created = await base44.entities.Programme.create(payload);
      programmeId = created.id;
    }

    const today = new Date().toISOString().split("T")[0];
    for (const clientId of form.client_ids) {
      const existing = await base44.entities.ProgrammeAssignation.filter({ programme_id: programmeId, client_id: clientId });
      if (existing.length === 0) {
        await base44.entities.ProgrammeAssignation.create({ programme_id: programmeId, client_id: clientId, date_debut: form.date_debut || today });
        const commandes = await base44.entities.CommandeProgramme.filter({ client_id: clientId, statut: "en_preparation" });
        for (const cmd of commandes) {
          await base44.entities.CommandeProgramme.update(cmd.id, { statut: "pret", programme_id: programmeId });
          await base44.entities.Notification.create({
            client_id: clientId,
            titre: "Votre programme est prêt !",
            message: `Votre programme "${form.name}" est désormais disponible. Rendez-vous dans "Mon programme" pour le consulter.`,
            type: "programme_pret",
            lien: "/espace-client/programme",
            lu: false,
          });
        }
      }
    }
    setEditing(null);
    load();
  };

  const supprimer = async (p) => {
    if (!confirm("Déplacer ce programme vers la corbeille ?")) return;
    await base44.entities.Programme.update(p.id, { statut: "supprime" });
    load();
  };
  const restaurer = async (p) => {
    await base44.entities.Programme.update(p.id, { statut: "brouillon" });
    load();
  };

  const ouvrirDeploiement = (p) => { setDeploying(p); setDeployClientId(""); setRechercheClient(""); };
  const confirmerDeploiement = async () => {
    if (!deploying || !deployClientId) return;
    setDeployLoading(true);
    try {
      const client = clients.find(c => c.user_id === deployClientId);
      const nouveau = await cloneProgramme(deploying, {
        client_ids: [deployClientId],
        client_names: client?.nom || "",
        statut: "actif",
      });
      const today = new Date().toISOString().split("T")[0];
      await base44.entities.ProgrammeAssignation.create({ programme_id: nouveau.id, client_id: deployClientId, date_debut: today });
      setDeploying(null);
      await load();
      setBuilder(nouveau);
    } catch (e) {
      alert("Erreur lors du déploiement. Réessayez.");
    }
    setDeployLoading(false);
  };

  if (builder) return <ProgrammeBuilder programme={builder} onBack={() => { setBuilder(null); load(); }} />;

  if (!programmes) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;

  const parOnglet = {
    actifs: programmes.filter(p => p.statut === "actif" && !p.est_modele),
    brouillons: programmes.filter(p => (p.statut || "brouillon") === "brouillon" && !p.est_modele),
    bibliotheque: programmes.filter(p => p.est_modele && p.statut !== "supprime"),
    supprimes: programmes.filter(p => p.statut === "supprime"),
  };
  const liste = parOnglet[onglet] || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Back-office</p>
          <h1 className="font-heading text-3xl font-bold text-foreground">Programmes</h1>
        </div>
        <button onClick={startNew} className="bg-primary text-primary-foreground px-5 py-2.5 rounded-md font-semibold text-sm">+ Nouveau programme</button>
      </div>

      <div className="flex gap-1 border-b border-border overflow-x-auto no-scrollbar">
        {ONGLETS.map((o) => (
          <button
            key={o.key}
            onClick={() => setOnglet(o.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${onglet === o.key ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {o.label} {parOnglet[o.key]?.length > 0 && <span className="ml-1 text-xs">({parOnglet[o.key].length})</span>}
          </button>
        ))}
      </div>

      {liste.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          {onglet === "bibliotheque" ? <Library className="w-10 h-10 text-secondary mx-auto mb-4" /> : <Dumbbell className="w-10 h-10 text-secondary mx-auto mb-4" />}
          <p className="text-muted-foreground">
            {onglet === "actifs" && "Aucun programme actif pour le moment."}
            {onglet === "brouillons" && "Aucun brouillon en cours."}
            {onglet === "bibliotheque" && "Aucun modèle enregistré. Cochez \"Modèle de bibliothèque\" en créant un programme pour le retrouver ici et le déployer rapidement vers un client."}
            {onglet === "supprimes" && "Aucun programme supprimé."}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {liste.map(p => {
            const st = STATUTS[p.statut] || STATUTS.brouillon;
            return (
              <div key={p.id} className={`bg-card border rounded-lg p-6 ${onglet === "supprimes" ? "opacity-60 border-border" : "border-border"}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-heading font-semibold text-lg text-foreground">{p.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{p.est_modele ? "Modèle de bibliothèque" : (p.client_names || "Non assigné")} · {p.duration_weeks || 4} sem.</p>
                  </div>
                  {!p.est_modele && <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>}
                </div>
                {p.objective && <p className="text-sm text-accent mb-4">Objectif : {p.objective}</p>}
                <div className="flex gap-2 flex-wrap">
                  {onglet === "supprimes" ? (
                    <button onClick={() => restaurer(p)} className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold"><RotateCcw className="w-4 h-4" /> Restaurer</button>
                  ) : (
                    <>
                      <button onClick={() => setBuilder(p)} className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold"><Hammer className="w-4 h-4" /> Constructeur</button>
                      {p.est_modele && (
                        <button onClick={() => ouvrirDeploiement(p)} className="flex items-center gap-1.5 bg-secondary text-secondary-foreground px-4 py-2 rounded-md text-sm font-semibold"><Rocket className="w-4 h-4" /> Déployer</button>
                      )}
                      <button onClick={() => startEdit(p)} className="p-2 text-muted-foreground hover:text-accent border border-border rounded-md"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => supprimer(p)} className="p-2 text-muted-foreground hover:text-destructive border border-border rounded-md"><Trash2 className="w-4 h-4" /></button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-primary/40 flex items-center justify-center p-6" onClick={() => setEditing(null)}>
          <div className="bg-card rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-semibold text-xl text-foreground">{editing.new ? "Nouveau programme" : "Modifier le programme"}</h3>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer bg-secondary/10 border border-secondary/30 rounded-md px-3 py-2.5">
                <input type="checkbox" checked={form.est_modele} onChange={e => setForm({ ...form, est_modele: e.target.checked, client_ids: e.target.checked ? [] : form.client_ids })} className="rounded" />
                <span className="text-sm text-foreground">Modèle de bibliothèque (sans client, réutilisable)</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-foreground mb-1.5">Nom du programme</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent" /></div>
                {!form.est_modele && (
                  <div><label className="block text-sm font-medium text-foreground mb-1.5">Statut</label>
                    <select value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 bg-card focus:outline-none focus:border-accent">
                      <option value="brouillon">Brouillon</option>
                      <option value="actif">Actif</option>
                      <option value="termine">Terminé</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-foreground mb-1.5">Durée (sem.)</label><input type="number" value={form.duration_weeks} onChange={e => setForm({ ...form, duration_weeks: parseInt(e.target.value) || 4 })} className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent" /></div>
                <div><label className="block text-sm font-medium text-foreground mb-1.5">Objectif</label><input value={form.objective} onChange={e => setForm({ ...form, objective: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent" /></div>
              </div>
              {!form.est_modele && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Clients assignés ({form.client_ids.length})</label>
                  <div className="border border-border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                    {clients.map(c => (
                      <label key={c.id} className="flex items-center gap-2 cursor-pointer text-sm">
                        <input type="checkbox" checked={form.client_ids.includes(c.user_id)} onChange={() => toggleClient(c.user_id)} className="rounded" />
                        <span>{c.nom || c.email}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {!form.est_modele && (
                <div><label className="block text-sm font-medium text-foreground mb-1.5">Date de début (nouveaux clients)</label><input type="date" value={form.date_debut || ""} onChange={e => setForm({ ...form, date_debut: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent" /><p className="text-xs text-muted-foreground mt-1">Date à laquelle le programme commence pour les clients nouvellement assignés.</p></div>
              )}
              <div><label className="block text-sm font-medium text-foreground mb-1.5">Description</label><textarea value={form.description || ""} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full border border-border rounded-md px-3 py-2 resize-none focus:outline-none focus:border-accent" /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditing(null)} className="flex-1 border border-border py-3 rounded-md text-sm font-medium text-foreground">Annuler</button>
              <button onClick={save} disabled={!form.name || (!form.est_modele && form.client_ids.length === 0)} className="flex-1 bg-primary text-primary-foreground py-3 rounded-md text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {deploying && (
        <div className="fixed inset-0 z-50 bg-primary/40 flex items-center justify-center p-6" onClick={() => setDeploying(null)}>
          <div className="bg-card rounded-lg p-8 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-xl text-foreground">Déployer "{deploying.name}"</h3>
              <button onClick={() => setDeploying(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Une copie complète de ce modèle (semaines, séances, exercices) sera créée pour le client choisi.</p>
            <label className="block text-sm font-medium text-foreground mb-1.5">Client</label>
            <input
              value={rechercheClient}
              onChange={(e) => { setRechercheClient(e.target.value); setDeployClientId(""); }}
              placeholder="Rechercher un client..."
              className="w-full border border-border rounded-md px-3 py-2 bg-background focus:outline-none focus:border-accent mb-2"
            />
            <div className="max-h-48 overflow-y-auto border border-border rounded-md mb-6">
              {clients
                .filter((c) => !rechercheClient || (c.nom || c.email || "").toLowerCase().includes(rechercheClient.toLowerCase()))
                .map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setDeployClientId(c.user_id); setRechercheClient(c.nom || c.email); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-secondary/20 ${deployClientId === c.user_id ? "bg-accent/15 font-medium text-foreground" : "text-foreground"}`}
                  >
                    {c.nom || c.email}
                  </button>
                ))}
              {clients.filter((c) => !rechercheClient || (c.nom || c.email || "").toLowerCase().includes(rechercheClient.toLowerCase())).length === 0 && (
                <p className="px-3 py-2 text-sm text-muted-foreground">Aucun client trouvé.</p>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeploying(null)} className="flex-1 border border-border py-3 rounded-md text-sm font-medium text-foreground">Annuler</button>
              <button onClick={confirmerDeploiement} disabled={!deployClientId || deployLoading} className="flex-1 bg-primary text-primary-foreground py-3 rounded-md text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                {deployLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Rocket className="w-4 h-4" /> Déployer</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
