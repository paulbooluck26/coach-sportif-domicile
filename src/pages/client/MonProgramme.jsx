import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Dumbbell, Target, Calendar, CheckCircle2 } from "lucide-react";

export default function MonProgramme() {
  const { user } = useAuth();
  const [programme, setProgramme] = useState(undefined);

  useEffect(() => {
    if (!user) return;
    base44.entities.Programme.filter({ client_user_id: user.id, actif: true })
      .then(r => setProgramme(r[0] || null))
      .catch(() => {});
  }, [user]);

  if (programme === undefined) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;

  if (!programme) {
    return (
      <div className="space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Mon programme</p>
          <h1 className="font-heading text-3xl font-bold text-foreground">Programme personnalisé</h1>
        </div>
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Dumbbell className="w-12 h-12 text-secondary mx-auto mb-6" />
          <p className="text-foreground/60 mb-2">Votre coach n'a pas encore assigné de programme.</p>
          <p className="text-sm text-muted-foreground">Il apparaîtra ici dès qu'il sera prêt.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Mon programme</p>
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">{programme.nom}</h1>
        {programme.description && <p className="text-foreground/60">{programme.description}</p>}
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-5">
          <Calendar className="w-5 h-5 text-accent mb-2" />
          <p className="font-heading text-2xl font-bold text-foreground">{programme.duree_semaines}</p>
          <p className="text-sm text-muted-foreground">semaines</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <Dumbbell className="w-5 h-5 text-accent mb-2" />
          <p className="font-heading text-2xl font-bold text-foreground">{programme.exercices?.length || 0}</p>
          <p className="text-sm text-muted-foreground">exercices</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <Target className="w-5 h-5 text-accent mb-2" />
          <p className="font-heading text-sm font-semibold text-foreground leading-tight">{programme.objectif || "Progression globale"}</p>
          <p className="text-sm text-muted-foreground mt-1">objectif</p>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">Exercices</h2>
        {(programme.exercices || []).map((ex, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-heading font-bold text-sm flex-shrink-0">{i + 1}</span>
                <h3 className="font-heading font-semibold text-foreground">{ex.nom}</h3>
              </div>
            </div>
            {ex.description && <p className="text-foreground/60 text-sm mb-4 pl-11">{ex.description}</p>}
            <div className="flex flex-wrap gap-4 pl-11 text-sm">
              {ex.series && <span className="text-muted-foreground"><strong className="text-foreground">{ex.series}</strong> séries</span>}
              {ex.repetitions && <span className="text-muted-foreground"><strong className="text-foreground">{ex.repetitions}</strong> répétitions</span>}
              {ex.repos && <span className="text-muted-foreground"><strong className="text-foreground">{ex.repos}</strong> de repos</span>}
            </div>
          </div>
        ))}
        {(!programme.exercices || programme.exercices.length === 0) && (
          <p className="text-muted-foreground text-sm bg-card border border-border rounded-lg p-6">Aucun exercice défini pour le moment.</p>
        )}
      </div>
    </div>
  );
}