import { useState, useEffect, useMemo } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ArrayField from "./ArrayField";
import MouvementPicker from "./MouvementPicker";
import { MOUV_CATEG, NIVEAU, TYPES_MOUVEMENT, MATERIEL_REF, MUSCLES_REF } from "@/lib/mouvementReferentiel";

const QUILL_MODULES = {
  toolbar: [["bold", "italic", "underline"], [{ list: "ordered" }, { list: "bullet" }], ["link"], [{ header: [2, 3, false] }], ["clean"]],
};

const defaultForm = () => ({
  nom: "",
  famille: "",
  categorie: "push",
  type_mouvement: "polyarticulaire",
  niveau: "debutant",
  difficulte_technique: 1,
  muscles: [],
  muscles_secondaires: [],
  materiel: [],
  mots_cles: [],
  objectif: "",
  description: "",
  points_cles: [],
  erreurs: "",
  conseils: "",
  variantes_faciles: [],
  variantes_difficiles: [],
  video_url: "",
  image_url: "",
  ordre: 0,
  statut: "publie",
});

export default function MouvementEditor({ open, initial, mouvements = [], onClose, onSave }) {
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (open) setForm(initial ? { ...defaultForm(), ...initial } : defaultForm());
  }, [open, initial]);

  const familles = useMemo(
    () => [...new Set(mouvements.map(m => m.famille).filter(Boolean))].sort(),
    [mouvements]
  );

  if (!form) return null;
  const set = (k, v) => setForm({ ...form, [k]: v });

  const submit = () => {
    if (!form.nom?.trim()) return;
    onSave({
      ...form,
      difficulte_technique: Number(form.difficulte_technique) || 1,
      ordre: Number(form.ordre) || 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{initial ? "Modifier le mouvement" : "Nouveau mouvement"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nom *</Label>
            <Input value={form.nom} onChange={e => set("nom", e.target.value)} />
          </div>
          <div>
            <Label>Famille de mouvement</Label>
            <Input value={form.famille || ""} list="familles-dl" onChange={e => set("famille", e.target.value)} placeholder="ex : Squat" />
            <datalist id="familles-dl">{familles.map(f => <option key={f} value={f} />)}</datalist>
            <p className="text-xs text-muted-foreground mt-1">Regroupe les variantes. Les mouvements d'une même famille s'affichent automatiquement dans la fiche.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Catégorie</Label>
              <Select value={form.categorie} onValueChange={v => set("categorie", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(MOUV_CATEG).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type de mouvement</Label>
              <Select value={form.type_mouvement || "polyarticulaire"} onValueChange={v => set("type_mouvement", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(TYPES_MOUVEMENT).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Niveau</Label>
              <Select value={form.niveau} onValueChange={v => set("niveau", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(NIVEAU).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Difficulté technique (1-5)</Label>
              <Select value={String(form.difficulte_technique || 1)} onValueChange={v => set("difficulte_technique", Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map(n => (
                    <SelectItem key={n} value={String(n)}>{"★".repeat(n)}{"☆".repeat(5 - n)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div><Label>Muscles principaux</Label><ArrayField values={form.muscles || []} onChange={v => set("muscles", v)} placeholder="ex : Quadriceps" suggestions={MUSCLES_REF} /></div>
          <div><Label>Muscles secondaires</Label><ArrayField values={form.muscles_secondaires || []} onChange={v => set("muscles_secondaires", v)} placeholder="ex : Fessiers" suggestions={MUSCLES_REF} /></div>
          <div><Label>Matériel nécessaire</Label><ArrayField values={form.materiel || []} onChange={v => set("materiel", v)} placeholder="ex : Haltères" suggestions={MATERIEL_REF} /></div>

          <div><Label>Objectif de l'exercice</Label><Input value={form.objectif || ""} onChange={e => set("objectif", e.target.value)} placeholder="ex : Renforcer la chaîne extérieure" /></div>

          <div>
            <Label>Exécution</Label>
            <div className="border border-input rounded-md overflow-hidden">
              <ReactQuill theme="snow" value={form.description || ""} onChange={v => set("description", v)} modules={QUILL_MODULES} />
            </div>
          </div>

          <div><Label>Points clés</Label><ArrayField values={form.points_cles || []} onChange={v => set("points_cles", v)} placeholder="ex : Dos neutre, genoux alignés" /></div>
          <div><Label>Erreurs fréquentes</Label><Textarea value={form.erreurs || ""} onChange={e => set("erreurs", e.target.value)} rows={2} /></div>
          <div><Label>Conseils du coach</Label><Textarea value={form.conseils || ""} onChange={e => set("conseils", e.target.value)} rows={2} /></div>

          <div><Label>Variantes plus faciles</Label><MouvementPicker values={form.variantes_faciles || []} mouvements={mouvements} excludeId={initial?.id} onChange={v => set("variantes_faciles", v)} /></div>
          <div><Label>Variantes plus difficiles</Label><MouvementPicker values={form.variantes_difficiles || []} mouvements={mouvements} excludeId={initial?.id} onChange={v => set("variantes_difficiles", v)} /></div>

          <div className="grid grid-cols-2 gap-3">
            <div><Label>Image (URL)</Label><Input value={form.image_url || ""} onChange={e => set("image_url", e.target.value)} /></div>
            <div><Label>Vidéo / GIF (URL)</Label><Input value={form.video_url || ""} onChange={e => set("video_url", e.target.value)} /></div>
          </div>
          <div><Label>Tags</Label><ArrayField values={form.mots_cles || []} onChange={v => set("mots_cles", v)} placeholder="tag" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Ordre</Label><Input type="number" value={form.ordre} onChange={e => set("ordre", e.target.value)} /></div>
            <div>
              <Label>Statut</Label>
              <Select value={form.statut} onValueChange={v => set("statut", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="brouillon">Brouillon</SelectItem>
                  <SelectItem value="publie">Publié</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={submit}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}