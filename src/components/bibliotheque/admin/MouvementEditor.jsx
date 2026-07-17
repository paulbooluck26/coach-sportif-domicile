import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ArrayField from "./ArrayField";

const CATS = [
  { value: "push", label: "Push" }, { value: "jambes", label: "Jambes" }, { value: "tirage", label: "Tirage" },
  { value: "gainage", label: "Gainage" }, { value: "dos", label: "Dos" }, { value: "epaules", label: "Épaules" },
  { value: "cardio", label: "Cardio" }, { value: "mobilite", label: "Mobilité" }, { value: "autre", label: "Autre" },
];
const NIVEAUX = [{ value: "debutant", label: "Débutant" }, { value: "intermediaire", label: "Intermédiaire" }, { value: "avance", label: "Avancé" }];

export default function MouvementEditor({ open, initial, onClose, onSave }) {
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (open) {
      setForm(initial
        ? { ...initial }
        : { nom: "", categorie: "push", muscles: [], materiel: [], niveau: "debutant", description: "", erreurs: "", conseils: "", video_url: "", image_url: "", mots_cles: [], ordre: 0, statut: "publie" });
    }
  }, [open, initial]);

  if (!form) return null;
  const set = (k, v) => setForm({ ...form, [k]: v });

  const submit = () => {
    if (!form.nom?.trim()) return;
    onSave({ ...form, ordre: Number(form.ordre) || 0 });
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Catégorie</Label>
              <Select value={form.categorie} onValueChange={v => set("categorie", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Niveau</Label>
              <Select value={form.niveau} onValueChange={v => set("niveau", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{NIVEAUX.map(n => <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Muscles travaillés</Label><ArrayField values={form.muscles || []} onChange={v => set("muscles", v)} placeholder="ex : quadriceps" /></div>
          <div><Label>Matériel nécessaire</Label><ArrayField values={form.materiel || []} onChange={v => set("materiel", v)} placeholder="ex : haltères" /></div>
          <div><Label>Description technique</Label><Textarea value={form.description || ""} onChange={e => set("description", e.target.value)} rows={3} /></div>
          <div><Label>Erreurs fréquentes</Label><Textarea value={form.erreurs || ""} onChange={e => set("erreurs", e.target.value)} rows={2} /></div>
          <div><Label>Conseils du coach</Label><Textarea value={form.conseils || ""} onChange={e => set("conseils", e.target.value)} rows={2} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Image (URL)</Label><Input value={form.image_url || ""} onChange={e => set("image_url", e.target.value)} placeholder="URL" /></div>
            <div><Label>Vidéo / GIF (URL)</Label><Input value={form.video_url || ""} onChange={e => set("video_url", e.target.value)} placeholder="URL" /></div>
          </div>
          <div><Label>Mots-clés</Label><ArrayField values={form.mots_cles || []} onChange={v => set("mots_cles", v)} placeholder="mot-clé" /></div>
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