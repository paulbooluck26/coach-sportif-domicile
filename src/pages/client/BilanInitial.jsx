import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Check, Loader2, CheckCircle2, ClipboardList, RotateCcw } from "lucide-react";
import { STEPS, JOURS, emptyBilan, SECTIONS, formatBilanValue } from "@/lib/bilanConfig";

const inputCls = "w-full bg-card border border-border rounded-md px-4 py-2.5 text-foreground focus:outline-none focus:border-accent text-sm";

function Field({ label, children, hint, full }) {
  return (
    <div className={full ? "" : "sm:col-span-1"}>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

export default function BilanInitial() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bilan, setBilan] = useState(emptyBilan);
  const [bilanId, setBilanId] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [termine, setTermine] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const list = await base44.entities.BilanInitial.filter({ created_by_id: user.id });
        if (list.length) {
          const b = list[0];
          setBilan({ ...emptyBilan, ...b });
          setBilanId(b.id);
          if (b.statut === "termine") { setTermine(true); setStep(7); }
          else setStep(b.etape_actuelle || 1);
        }
      } catch {}
      finally { setLoading(false); }
    })();
  }, [user]);

  const set = (k, v) => setBilan((prev) => ({ ...prev, [k]: v }));

  const toggleJour = (j) => {
    setBilan((prev) => {
      const arr = Array.isArray(prev.jours_disponibles) ? prev.jours_disponibles : [];
      return { ...prev, jours_disponibles: arr.includes(j) ? arr.filter((x) => x !== j) : [...arr, j] };
    });
  };

  const save = async (nextStep, isTermine = false) => {
    setSaving(true);
    setError("");
    try {
      const payload = { ...bilan, etape_actuelle: nextStep, statut: isTermine ? "termine" : "en_cours" };
      if (isTermine) payload.date_remplissage = new Date().toISOString().split("T")[0];
      let rec;
      if (bilanId) rec = await base44.entities.BilanInitial.update(bilanId, payload);
      else { rec = await base44.entities.BilanInitial.create({ ...payload, statut: "en_cours" }); setBilanId(rec.id); }
      setBilan({ ...emptyBilan, ...rec });
      if (isTermine) setTermine(true);
      else setStep(nextStep);
    } catch {
      setError("Échec de l'enregistrement. Réessayez.");
    } finally {
      setSaving(false);
    }
  };

  const next = () => {
    if (step === 2 && !bilan.confirmation_exactitude) {
      setError("Merci de confirmer que les informations de santé sont exactes pour continuer.");
      return;
    }
    setError("");
    if (step < 7) save(step + 1);
    else save(7, true);
  };
  const back = () => { setError(""); if (step > 1) setStep(step - 1); };
  const reprendre = () => { setTermine(false); setStep(1); };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;
  }

  // ---- Résumé (bilan terminé) ----
  if (termine) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-1">Bilan initial</p>
            <h1 className="font-heading text-3xl font-bold text-foreground">Votre bilan est complété</h1>
          </div>
          <button onClick={reprendre} className="inline-flex items-center gap-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted">
            <RotateCcw className="w-4 h-4" /> Modifier
          </button>
        </div>
        <div className="flex items-center gap-3 bg-secondary/10 border border-secondary/20 rounded-lg p-4">
          <CheckCircle2 className="w-5 h-5 text-secondary" />
          <p className="text-sm text-foreground">
            Merci ! Votre coach recevra ces informations avant votre premier échange.
            {bilan.date_remplissage ? ` Complété le ${new Date(bilan.date_remplissage).toLocaleDateString("fr-FR")}.` : ""}
          </p>
        </div>
        {SECTIONS.map((sec) => (
          <div key={sec.titre} className="bg-card border border-border rounded-2xl p-5">
            <h2 className="font-heading font-semibold text-foreground mb-3">{sec.titre}</h2>
            <dl className="space-y-2">
              {sec.fields.map((f) => (
                <div key={f.key} className="grid grid-cols-3 gap-2 text-sm">
                  <dt className="text-muted-foreground">{f.label}</dt>
                  <dd className="col-span-2 text-foreground whitespace-pre-wrap break-words">{formatBilanValue(f.key, bilan[f.key])}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
        <button onClick={() => navigate("/espace-client/profil")} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" /> Retour à mon profil
        </button>
      </div>
    );
  }

  // ---- Wizard ----
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-1">Bilan initial</p>
        <h1 className="font-heading text-3xl font-bold text-foreground">Préparer votre accompagnement</h1>
        <p className="text-sm text-muted-foreground mt-2">Renseignez vos informations avant votre premier échange. Vous pouvez aussi en discuter directement avec votre coach.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${i + 1 < step ? "bg-secondary text-secondary-foreground" : i + 1 === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {i + 1 < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className="text-xs font-medium hidden sm:inline max-w-[7rem] leading-tight">{s.titre}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-2 ${i + 1 < step ? "bg-secondary" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 sm:p-6">
        <h2 className="font-heading text-lg font-semibold text-foreground mb-5">Étape {step} — {STEPS[step - 1].titre}</h2>

        {step === 1 && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Prénom"><input className={inputCls} value={bilan.prenom} onChange={(e) => set("prenom", e.target.value)} /></Field>
            <Field label="Nom"><input className={inputCls} value={bilan.nom} onChange={(e) => set("nom", e.target.value)} /></Field>
            <Field label="Date de naissance"><input type="date" className={inputCls} value={bilan.date_naissance} onChange={(e) => set("date_naissance", e.target.value)} /></Field>
            <Field label="Sexe">
              <select className={inputCls} value={bilan.sexe} onChange={(e) => set("sexe", e.target.value)}>
                <option value="">—</option>
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
                <option value="Non précisé">Non précisé</option>
              </select>
            </Field>
            <Field label="Téléphone"><input className={inputCls} value={bilan.telephone} onChange={(e) => set("telephone", e.target.value)} /></Field>
            <Field label="Adresse"><input className={inputCls} value={bilan.adresse} onChange={(e) => set("adresse", e.target.value)} /></Field>
            <Field label="Taille (cm)"><input type="number" className={inputCls} value={bilan.taille_cm} onChange={(e) => set("taille_cm", e.target.value)} /></Field>
            <Field label="Poids (kg)"><input type="number" className={inputCls} value={bilan.poids_kg} onChange={(e) => set("poids_kg", e.target.value)} /></Field>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Field label="Antécédents médicaux" full><textarea rows={2} className={inputCls} value={bilan.antecedents_medicaux} onChange={(e) => set("antecedents_medicaux", e.target.value)} /></Field>
            <Field label="Blessures actuelles ou anciennes" full><textarea rows={2} className={inputCls} value={bilan.blessures} onChange={(e) => set("blessures", e.target.value)} /></Field>
            <Field label="Douleurs éventuelles" full><textarea rows={2} className={inputCls} value={bilan.douleurs} onChange={(e) => set("douleurs", e.target.value)} /></Field>
            <Field label="Causes supposées des douleurs / blessures" full><textarea rows={2} className={inputCls} value={bilan.causes_douleurs} onChange={(e) => set("causes_douleurs", e.target.value)} /></Field>
            <Field label="Opérations ou restrictions médicales" full><textarea rows={2} className={inputCls} value={bilan.operations_restrictions} onChange={(e) => set("operations_restrictions", e.target.value)} /></Field>
            <label className="flex items-start gap-3 bg-muted/40 rounded-lg p-3 cursor-pointer">
              <input type="checkbox" checked={bilan.confirmation_exactitude} onChange={(e) => set("confirmation_exactitude", e.target.checked)} className="mt-0.5 w-4 h-4 accent-secondary" />
              <span className="text-sm text-foreground">Je confirme que les informations renseignées sont exactes.</span>
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Métier"><input className={inputCls} value={bilan.metier} onChange={(e) => set("metier", e.target.value)} /></Field>
            <Field label="Activité quotidienne">
              <select className={inputCls} value={bilan.activite_quotidienne} onChange={(e) => set("activite_quotidienne", e.target.value)}>
                <option value="">—</option>
                <option>Sédentaire</option>
                <option>Plutôt sédentaire</option>
                <option>Actif</option>
                <option>Très actif</option>
              </select>
            </Field>
            <Field label="Heures de sommeil / nuit"><input type="number" className={inputCls} value={bilan.heures_sommeil} onChange={(e) => set("heures_sommeil", e.target.value)} /></Field>
            <Field label="Qualité du sommeil">
              <select className={inputCls} value={bilan.qualite_sommeil} onChange={(e) => set("qualite_sommeil", e.target.value)}>
                <option value="">—</option>
                <option>Mauvaise</option>
                <option>Moyenne</option>
                <option>Bonne</option>
                <option>Très bonne</option>
              </select>
            </Field>
            <Field label="Niveau de stress quotidien (1-10)" full>
              <div className="flex items-center gap-4">
                <input type="range" min={1} max={10} value={bilan.niveau_stress || 5} onChange={(e) => set("niveau_stress", Number(e.target.value))} className="flex-1 accent-secondary" />
                <span className="font-heading text-xl font-bold text-secondary w-10 text-center">{bilan.niveau_stress || 5}</span>
              </div>
            </Field>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <Field label="Comment décririez-vous votre alimentation actuelle ?" full><textarea rows={2} className={inputCls} value={bilan.alimentation_actuelle} onChange={(e) => set("alimentation_actuelle", e.target.value)} /></Field>
            <Field label="Régime alimentaire particulier ?" full><input className={inputCls} value={bilan.regime_particulier} onChange={(e) => set("regime_particulier", e.target.value)} placeholder="Végétarien, sans gluten, sans lactose..." /></Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Objectif nutritionnel principal">
                <select className={inputCls} value={bilan.objectif_nutritionnel} onChange={(e) => set("objectif_nutritionnel", e.target.value)}>
                  <option value="">—</option>
                  <option>Perte de poids</option>
                  <option>Prise de muscle</option>
                  <option>Performance</option>
                  <option>Santé générale</option>
                  <option>Autre</option>
                </select>
              </Field>
              <Field label="Calories journalières (si connue)"><input type="number" className={inputCls} value={bilan.calories_journalieres} onChange={(e) => set("calories_journalieres", e.target.value)} /></Field>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <Field label="Pratiquez-vous actuellement une activité sportive régulière ?" full>
              <div className="flex gap-3">
                {[{ v: "oui", l: "Oui" }, { v: "non", l: "Non" }].map((o) => (
                  <button key={o.v} type="button" onClick={() => set("activite_sportive_reguliere", o.v)} className={`px-5 py-2.5 rounded-md text-sm font-medium border ${bilan.activite_sportive_reguliere === o.v ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground"}`}>{o.l}</button>
                ))}
              </div>
            </Field>
            <Field label="Quelles activités pratiquez-vous ?" full><input className={inputCls} value={bilan.activites_pratiquees} onChange={(e) => set("activites_pratiquees", e.target.value)} placeholder="Musculation, running, vélo..." /></Field>
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Depuis combien de temps"><input className={inputCls} value={bilan.duree_pratique} onChange={(e) => set("duree_pratique", e.target.value)} placeholder="6 mois, 2 ans..." /></Field>
              <Field label="Séances / semaine"><input type="number" className={inputCls} value={bilan.seances_par_semaine} onChange={(e) => set("seances_par_semaine", e.target.value)} /></Field>
              <Field label="Durée moyenne (min)"><input type="number" className={inputCls} value={bilan.duree_seance} onChange={(e) => set("duree_seance", e.target.value)} /></Field>
            </div>
            <Field label="Intensité habituelle des entraînements">
              <select className={inputCls} value={bilan.intensite_habituelle} onChange={(e) => set("intensite_habituelle", e.target.value)}>
                <option value="">—</option>
                <option>Faible</option>
                <option>Modérée</option>
                <option>Soutenue</option>
                <option>Intense</option>
              </select>
            </Field>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <Field label="Quels sont vos objectifs principaux ?" full><textarea rows={2} className={inputCls} value={bilan.objectifs_principaux} onChange={(e) => set("objectifs_principaux", e.target.value)} /></Field>
            <Field label="Pourquoi souhaitez-vous être accompagné aujourd'hui ?" full><textarea rows={2} className={inputCls} value={bilan.pourquoi_accompagnement} onChange={(e) => set("pourquoi_accompagnement", e.target.value)} /></Field>
            <Field label="Quels résultats aimeriez-vous obtenir ?" full><textarea rows={2} className={inputCls} value={bilan.resultats_souhaites} onChange={(e) => set("resultats_souhaites", e.target.value)} /></Field>
            <Field label="Nombre de séances souhaitées par semaine"><input type="number" className={inputCls} value={bilan.seances_souhaitees_par_semaine} onChange={(e) => set("seances_souhaitees_par_semaine", e.target.value)} /></Field>
            <Field label="Jours disponibles" full>
              <div className="flex flex-wrap gap-2">
                {JOURS.map((j) => (
                  <button key={j} type="button" onClick={() => toggleJour(j)} className={`px-3 py-1.5 rounded-full text-sm font-medium border ${(bilan.jours_disponibles || []).includes(j) ? "bg-secondary text-secondary-foreground border-secondary" : "bg-card border-border text-foreground"}`}>{j}</button>
                ))}
              </div>
            </Field>
            <Field label="Horaires disponibles" full><input className={inputCls} value={bilan.horaires_disponibles} onChange={(e) => set("horaires_disponibles", e.target.value)} placeholder="Le matin, 18h-20h, week-ends..." /></Field>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-4">
            <Field label="Qu'attendez-vous de votre accompagnement avec The Lab Forge ?" full><textarea rows={3} className={inputCls} value={bilan.attentes_accompagnement} onChange={(e) => set("attentes_accompagnement", e.target.value)} /></Field>
            <Field label="Qu'est-ce qui pourrait vous dire dans quelques mois que cet accompagnement est une réussite ?" full><textarea rows={3} className={inputCls} value={bilan.critere_reussite} onChange={(e) => set("critere_reussite", e.target.value)} /></Field>
          </div>
        )}

        {error && <p className="text-sm text-destructive mt-4">{error}</p>}

        <div className="flex items-center gap-3 mt-6 pt-5 border-t border-border">
          <button onClick={back} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-2"><ChevronLeft className="w-4 h-4" /> Retour</button>
          <button onClick={next} disabled={saving} className="flex-1 bg-primary text-primary-foreground py-3 rounded-md font-semibold text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement...</> : step < 7 ? <>Continuer <ChevronRight className="w-4 h-4" /></> : <><CheckCircle2 className="w-4 h-4" /> Terminer le bilan</>}
          </button>
        </div>
      </div>
    </div>
  );
}