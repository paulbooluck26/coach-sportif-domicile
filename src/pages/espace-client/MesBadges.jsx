import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Lock, Award } from "lucide-react";

const CATEGORIES = [
  { key: "demarrage", label: "Démarrage" },
  { key: "engagement_coach", label: "Engagement" },
  { key: "seances_domicile", label: "Séances à domicile" },
  { key: "programmes_ligne", label: "Programmes en ligne" },
  { key: "performances", label: "Performances" },
  { key: "records", label: "Records personnels" },
  { key: "regularite", label: "Régularité" },
  { key: "objectifs", label: "Objectifs" },
];

// Un anneau par palier, du plus discret au plus riche — jamais un nom de
// métal affiché, juste une intensité de couleur.
const PALIER_RING = {
  1: "ring-2 ring-secondary/40",
  2: "ring-2 ring-accent/50",
  3: "ring-2 ring-accent",
  4: "ring-4 ring-accent shadow-[0_0_16px_rgba(191,160,117,0.5)]",
};

function computeStreakSemaines(dates) {
  if (dates.length === 0) return 0;
  const semaines = new Set(
    dates.map((d) => {
      const date = new Date(d);
      const jour = (date.getDay() + 6) % 7;
      date.setDate(date.getDate() - jour);
      return date.toISOString().split("T")[0];
    })
  );
  let streak = 0;
  let cursor = new Date();
  const jourCursor = (cursor.getDay() + 6) % 7;
  cursor.setDate(cursor.getDate() - jourCursor);
  if (!semaines.has(cursor.toISOString().split("T")[0])) {
    cursor.setDate(cursor.getDate() - 7);
  }
  while (semaines.has(cursor.toISOString().split("T")[0])) {
    streak++;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}

export default function MesBadges() {
  const { user } = useAuth();
  const [badges, setBadges] = useState(null);
  const [obtenus, setObtenus] = useState(null);
  const [progress, setProgress] = useState({});

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [badgeList, badgeClientList, profiles, bilans, seances, executions, records, messages, objectifs] = await Promise.all([
          base44.entities.Badge.filter({ actif: true }, "ordre_affichage"),
          base44.entities.BadgeClient.filter({ client_id: user.id }, "-date_obtention"),
          base44.entities.ClientProfile.filter({ user_id: user.id }, "-created_date"),
          base44.entities.BilanInitial.filter({ client_id: user.id }, "-created_date"),
          base44.entities.Seance.filter({ client_id: user.id }, "-date"),
          base44.entities.ExecutionSeance.filter({ client_id: user.id }, "-date_execution"),
          base44.entities.RecordPerso.filter({ client_id: user.id }, "-date_record"),
          base44.entities.Message.filter({ client_id: user.id, sender: "client" }, "-created_date"),
          base44.entities.ObjectifClient.filter({ client_id: user.id }, "-date_creation"),
        ]);

        const profile = profiles[0];
        const seancesDomicileCompletees = seances.filter((s) => s.session_type === "seance_individuelle" && s.status === "completed");
        const executionsTerminees = executions.filter((e) => e.statut === "termine");
        const appelRealise = seances.some((s) => s.session_type === "appel_bilan" && s.status === "completed");

        let performanceCount = 0;
        if (executionsTerminees.length > 0) {
          const perfsArrays = await Promise.all(
            executionsTerminees.map((ex) => base44.entities.PerformanceExercice.filter({ execution_id: ex.id }))
          );
          performanceCount = perfsArrays.reduce((sum, arr) => sum + arr.length, 0);
        }

        const datesActives = [
          ...seancesDomicileCompletees.map((s) => s.date),
          ...executionsTerminees.map((e) => e.date_execution),
        ];

        const profilChamps = [profile?.photo_url, profile?.telephone, profile?.adresse, profile?.objectif].filter(Boolean).length;

        setProgress({
          profil_complet: { valeur: profilChamps, cible: 4 },
          bilan_termine: { valeur: bilans.some((b) => b.statut === "termine") ? 1 : 0, cible: 1 },
          premier_message: { valeur: messages.length > 0 ? 1 : 0, cible: 1 },
          appel_realise: { valeur: appelRealise ? 1 : 0, cible: 1 },
          seances_domicile_count: { valeur: seancesDomicileCompletees.length },
          programmes_ligne_count: { valeur: executionsTerminees.length },
          performance_count: { valeur: performanceCount },
          record_count: { valeur: records.length },
          streak_semaines: { valeur: computeStreakSemaines(datesActives) },
          objectif_atteint_count: { valeur: objectifs.filter((o) => o.statut === "atteint").length },
        });

        setBadges(badgeList);
        setObtenus(badgeClientList);
      } catch (e) {
        console.error("Erreur chargement Mes badges:", e.message);
        setBadges([]);
        setObtenus([]);
      }
    })();
  }, [user]);

  if (!badges || !obtenus) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;
  }

  const obtenuIds = new Set(obtenus.map((o) => o.badge_id));
  const dateObtention = Object.fromEntries(obtenus.map((o) => [o.badge_id, o.date_obtention]));

  return (
    <div className="space-y-8 pb-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-1">Progression</p>
        <h1 className="font-heading text-3xl font-bold text-foreground">Mes badges</h1>
        <p className="text-sm text-muted-foreground mt-2">{obtenus.length} badge{obtenus.length > 1 ? "s" : ""} obtenu{obtenus.length > 1 ? "s" : ""} sur {badges.length}</p>
      </div>

      {CATEGORIES.map((cat) => {
        const badgesCat = badges.filter((b) => b.categorie === cat.key);
        if (badgesCat.length === 0) return null;
        return (
          <div key={cat.key}>
            <h2 className="font-heading text-base font-semibold text-foreground mb-3">{cat.label}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {badgesCat.map((b) => {
                const obtenu = obtenuIds.has(b.id);
                const prog = progress[b.condition_type];
                const valeur = prog?.valeur ?? 0;
                const cible = prog?.cible ?? b.condition_seuil;
                const pct = Math.min(100, Math.round((valeur / cible) * 100));
                return (
                  <div key={b.id} className={`bg-card border rounded-2xl p-4 text-center ${obtenu ? "border-accent/40" : "border-border opacity-70"}`}>
                    <div className={`w-14 h-14 rounded-full mx-auto mb-2.5 flex items-center justify-center text-2xl ${obtenu ? `bg-accent/15 ${PALIER_RING[b.palier]}` : "bg-muted grayscale"}`}>
                      {obtenu ? b.icone : <Lock className="w-5 h-5 text-muted-foreground" />}
                    </div>
                    <p className="text-sm font-heading font-semibold text-foreground leading-tight">{b.nom}</p>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{b.description}</p>
                    {obtenu ? (
                      <p className="text-[10px] text-accent mt-2">Obtenu le {new Date(dateObtention[b.id]).toLocaleDateString("fr-FR")}</p>
                    ) : (
                      <div className="mt-2.5">
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-secondary rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">{Math.min(valeur, cible)} / {cible}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
