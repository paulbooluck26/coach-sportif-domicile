import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Dumbbell, Clock, Repeat, Loader2, Target } from "lucide-react";

export default function ClientProgram() {
  const { user } = useAuth();
  const [programme, setProgramme] = useState(null);
  const [exercices, setExercices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        let client = await base44.entities.Client.filter({ email: user.email });
        client = client[0];
        if (!client) { setLoading(false); return; }
        const progs = await base44.entities.Programme.filter({ client_id: client.id }, "-created_date", 1);
        if (progs.length === 0) { setLoading(false); return; }
        setProgramme(progs[0]);
        const exos = await base44.entities.Exercice.filter({ programme_id: progs[0].id }, "order", 50);
        setExercices(exos);
      } catch (_) {} finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  if (!programme) {
    return (
      <div>
        <h1 className="text-3xl font-heading font-bold text-primary mb-2">Mon programme</h1>
        <div className="bg-muted/30 border border-border rounded-2xl p-12 text-center mt-8">
          <Dumbbell className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground">Votre coach ne vous a pas encore assigné de programme personnalisé.</p>
          <p className="text-sm text-muted-foreground/60 mt-2">N'hésitez pas à lui en parler lors de votre prochaine séance.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-10">
        <p className="text-xs font-semibold tracking-label text-secondary mb-3">PROGRAMME PERSONNALISÉ</p>
        <h1 className="text-4xl font-heading font-bold text-primary mb-3">{programme.name}</h1>
        <p className="text-muted-foreground leading-relaxed max-w-2xl">{programme.description || programme.objective}</p>
        <div className="flex gap-6 mt-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="w-4 h-4 text-secondary" /> {programme.objective || "Objectif sur mesure"}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 text-secondary" /> {programme.duration_weeks} semaines
          </div>
        </div>
      </div>

      <h2 className="text-xl font-heading font-semibold text-primary mb-5">Exercices</h2>
      <div className="space-y-3">
        {exercices.length === 0 ? (
          <p className="text-muted-foreground text-sm">Aucun exercice défini pour le moment.</p>
        ) : exercices.map((ex, i) => (
          <div key={ex.id} className="bg-background border border-border rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center font-heading font-bold text-secondary shrink-0">
              {i + 1}
            </div>
            <div className="flex-1">
              <h3 className="font-heading font-semibold text-primary">{ex.name}</h3>
              {ex.description && <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{ex.description}</p>}
              <div className="flex gap-5 mt-3 text-sm">
                {ex.sets && <span className="flex items-center gap-1.5 text-foreground/70"><Repeat className="w-3.5 h-3.5 text-secondary" /> {ex.sets} séries</span>}
                {ex.reps && <span className="text-foreground/70"> Répétitions: {ex.reps}</span>}
                {ex.rest_seconds && <span className="flex items-center gap-1.5 text-foreground/70"><Clock className="w-3.5 h-3.5 text-secondary" /> {ex.rest_seconds}s repos</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}