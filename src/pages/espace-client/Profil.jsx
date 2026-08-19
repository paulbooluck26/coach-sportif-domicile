import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Phone, MapPin, CreditCard, LogOut, Edit, Save, X, Target, Dumbbell, ClipboardList, CheckCircle2, TrendingUp, AlertTriangle, Loader2 } from "lucide-react";
import ProfilePhotoUpload from "@/components/ProfilePhotoUpload";

export default function Profil() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [paiements, setPaiements] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [bilan, setBilan] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

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
      const pays = await base44.entities.Paiement.filter({ client_id: user.id }, "-created_date", 20).catch(() => []);
      setPaiements(pays);
      const allProgs = await base44.entities.Programme.filter({ statut: "actif" });
      setProgrammes(allProgs.filter(p => p.client_ids?.includes(user.id)));
      const bilans = await base44.entities.BilanInitial.filter({ client_id: user.id }).catch(() => []);
      setBilan(bilans[0] || null);
    } catch {}
  };

  useEffect(() => { load(); }, [user]);

  const saveProfile = async () => {
    await base44.entities.ClientProfile.update(profile.id, form);
    setEditing(false);
    load();
  };

  const savePhoto = async (url) => {
    await base44.entities.ClientProfile.update(profile.id, { photo_url: url });
    load();
  };

  const removePhoto = async () => {
    await base44.entities.ClientProfile.update(profile.id, { photo_url: "" });
    load();
  };

  const supprimerCompte = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      const { data, error } = await supabase.functions.invoke("delete-account");
      if (error || data?.error) throw new Error(data?.error || error?.message || "Échec de la suppression");
      await logout();
      navigate("/");
    } catch (e) {
      setDeleteError("Une erreur est survenue. Réessayez ou contactez-nous directement.");
      setDeleting(false);
    }
  };

  if (!profile) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-1">Profil</p>
        <h1 className="font-heading text-3xl font-bold text-foreground">Mon compte</h1>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <h2 className="font-heading font-semibold text-foreground mb-4">Photo de profil</h2>
        <ProfilePhotoUpload
          photoUrl={profile.photo_url}
          name={profile.nom || user.full_name}
          onSaved={savePhoto}
          onRemoved={removePhoto}
        />
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
        <h2 className="font-heading font-semibold text-foreground mb-3 flex items-center gap-2"><ClipboardList className="w-4 h-4 text-secondary" /> Bilan initial</h2>
        {!bilan || bilan.statut === "non_commence" ? (
          <div>
            <p className="text-sm text-muted-foreground mb-4">Préparez votre premier échange avec votre coach en renseignant vos informations. Optionnel — vous pouvez aussi en discuter directement ensemble.</p>
            <Link to="/espace-client/bilan-initial" className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold">Commencer le bilan initial</Link>
          </div>
        ) : bilan.statut === "en_cours" ? (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Bilan en cours — étape {bilan.etape_actuelle || 1} / 7</p>
            <p className="text-sm text-muted-foreground mb-4">Reprenez là où vous vous êtes arrêté.</p>
            <Link to="/espace-client/bilan-initial" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold">Reprendre le bilan</Link>
          </div>
        ) : (
          <div>
            <p className="flex items-center gap-2 text-sm text-secondary mb-1"><CheckCircle2 className="w-4 h-4" /> Bilan complété</p>
            <p className="text-sm text-muted-foreground mb-4">{bilan.date_remplissage ? `Le ${new Date(bilan.date_remplissage).toLocaleDateString("fr-FR")}` : ""}</p>
            <Link to="/espace-client/bilan-initial" className="inline-flex items-center gap-2 border border-border px-4 py-2.5 rounded-lg text-sm font-semibold text-foreground">Voir mon bilan</Link>
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
        <h2 className="font-heading font-semibold text-foreground mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-secondary" /> Suivi & progression</h2>
        <p className="text-sm text-muted-foreground mb-4">Consultez l'évolution de vos performances et vos records personnels au fil des séances.</p>
        <Link to="/espace-client/performances" className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold">Voir mes performances</Link>
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

      <div className="text-center pt-2">
        <button onClick={() => setShowDelete(true)} className="text-xs text-muted-foreground hover:text-destructive underline transition-colors">
          Supprimer mon compte
        </button>
      </div>

      {showDelete && (
        <div className="fixed inset-0 z-50 bg-primary/40 flex items-center justify-center p-6" onClick={() => !deleting && setShowDelete(false)}>
          <div className="bg-card rounded-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <h3 className="font-heading font-bold text-xl text-foreground mb-2">Supprimer votre compte</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Cette action est <strong>définitive</strong>. Vous perdrez l'accès à votre espace, vos séances à venir seront annulées, et vos informations personnelles seront effacées. Vos paiements passés sont conservés uniquement pour nos obligations comptables légales.
            </p>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Tapez <strong>SUPPRIMER</strong> pour confirmer
            </label>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm mb-2 bg-background focus:outline-none focus:border-destructive"
            />
            {deleteError && <p className="text-xs text-destructive mb-2">{deleteError}</p>}
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowDelete(false)} disabled={deleting} className="flex-1 border border-border py-3 rounded-lg text-sm font-medium text-foreground disabled:opacity-50">
                Annuler
              </button>
              <button
                onClick={supprimerCompte}
                disabled={confirmText !== "SUPPRIMER" || deleting}
                className="flex-1 bg-destructive text-destructive-foreground py-3 rounded-lg text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Supprimer définitivement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
