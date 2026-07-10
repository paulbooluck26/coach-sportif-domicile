import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, MapPin, CreditCard, LogOut, Edit, Save, X, Target, Dumbbell } from "lucide-react";

export default function Profil() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [paiements, setPaiements] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  const load = async () => {
    if (!user) return;
    try {
      const profiles = await base44.entities.ClientProfile.filter({ user_id: user.id });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
        setForm({ nom: profiles[0].nom || "", telephone: profiles[0].telephone || "", adresse: profiles[0].adresse || "", objectif: profiles[0].objectif || "" });
      } else {
        const np = await base44.entities.ClientProfile.create({ user_id: user.id, nom: user.full_name || "", email: user.email });
        setProfile(np);
        setForm({ nom: user.full_name || "", telephone: "", adresse: "", objectif: "" });
      }
      const pays = await base44.entities.Paiement.filter({ client_user_id: user.id }, "-created_date", 20).catch(() => []);
      setPaiements(pays);
      const allProgs = await base44.entities.Programme.filter({ statut: "actif" });
      setProgrammes(allProgs.filter(p => p.client_ids?.includes(user.id)));
    } catch {}
  };

  useEffect(() => { load(); }, [user]);

  const saveProfile = async () => {
    await base44.entities.ClientProfile.update(profile.id, form);
    setEditing(false);
    load();
  };

  if (!profile) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-1">Profil</p>
        <h1 className="font-heading text-3xl font-bold text-foreground">Mon compte</h1>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-foreground">Informations</h2>
          <button onClick={() => setEditing(!editing)} className="text-muted-foreground hover:text-accent">
            {editing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
          </button>
        </div>
        {editing ? (
          <div className="space-y-3">
            <div><label className="text-xs text-muted-foreground">Nom</label><input value={form.nom || ""} onChange={e => setForm({ ...form, nom: e.target.value })} className="w-full border border-border rounded-lg px-3 py-2 text-sm mt-1 bg-background" /></div>
            <div><label className="text-xs text-muted-foreground">Téléphone</label><input value={form.telephone || ""} onChange={e => setForm({ ...form, telephone: e.target.value })} className="w-full border border-border rounded-lg px-3 py-2 text-sm mt-1 bg-background" /></div>
            <div><label className="text-xs text-muted-foreground">Adresse</label><input value={form.adresse || ""} onChange={e => setForm({ ...form, adresse: e.target.value })} className="w-full border border-border rounded-lg px-3 py-2 text-sm mt-1 bg-background" /></div>
            <div><label className="text-xs text-muted-foreground">Objectif</label><input value={form.objectif || ""} onChange={e => setForm({ ...form, objectif: e.target.value })} className="w-full border border-border rounded-lg px-3 py-2 text-sm mt-1 bg-background" /></div>
            <button onClick={saveProfile} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Enregistrer</button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="flex items-center gap-3 text-sm text-foreground"><User className="w-4 h-4 text-muted-foreground" /> {profile.nom || user.full_name || "—"}</p>
            <p className="flex items-center gap-3 text-sm text-foreground"><Mail className="w-4 h-4 text-muted-foreground" /> {user.email}</p>
            <p className="flex items-center gap-3 text-sm text-foreground"><Phone className="w-4 h-4 text-muted-foreground" /> {profile.telephone || "—"}</p>
            <p className="flex items-center gap-3 text-sm text-foreground"><MapPin className="w-4 h-4 text-muted-foreground" /> {profile.adresse || "—"}</p>
            {profile.objectif && <p className="flex items-center gap-3 text-sm text-foreground"><Target className="w-4 h-4 text-muted-foreground" /> {profile.objectif}</p>}
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <h2 className="font-heading font-semibold text-foreground mb-3 flex items-center gap-2"><Dumbbell className="w-4 h-4 text-secondary" /> Programmes actifs</h2>
        {programmes.length > 0 ? (
          <div className="space-y-2">
            {programmes.map(p => (
              <div key={p.id} className="flex items-center justify-between border border-border rounded-lg p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.duration_weeks} semaines</p>
                </div>
                <button onClick={() => navigate("/espace-client/programme")} className="text-accent text-xs font-medium">Voir →</button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Aucun programme actif.</p>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <h2 className="font-heading font-semibold text-foreground mb-3 flex items-center gap-2"><CreditCard className="w-4 h-4 text-secondary" /> Paiements</h2>
        {paiements.length > 0 ? (
          <div className="space-y-2">
            {paiements.map(p => (
              <div key={p.id} className="flex items-center justify-between border border-border rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.montant || p.amount || 0}€</p>
                    <p className="text-xs text-muted-foreground">{new Date(p.created_date).toLocaleDateString("fr-FR")}</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/15 text-secondary capitalize">{p.statut || p.status || ""}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Aucun paiement enregistré.</p>
        )}
      </div>

      <button onClick={() => { logout(); navigate("/"); }} className="w-full flex items-center justify-center gap-2 border border-border rounded-xl py-3 text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors">
        <LogOut className="w-4 h-4" /> Déconnexion
      </button>
    </div>
  );
}