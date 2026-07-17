import { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ArrayField from "./ArrayField";

const QUILL_MODULES = {
  toolbar: [["bold", "italic", "underline"], [{ list: "ordered" }, { list: "bullet" }], ["link"], [{ header: [2, 3, false] }], ["clean"]],
};

export default function RessourceEditor({ open, initial, categories, onClose, onSave }) {
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (open) {
      setForm(initial
        ? { ...initial }
        : { titre: "", sous_titre: "", categorie_id: "", contenu: "", images: [], videos: [], fichiers: [], liens: [], mots_cles: [], ordre: 0, statut: "brouillon" });
    }
  }, [open, initial]);

  if (!form) return null;
  const set = (k, v) => setForm({ ...form, [k]: v });

  const submit = () => {
    if (!form.titre?.trim() || !form.categorie_id) return;
    onSave({ ...form, ordre: Number(form.ordre) || 0 });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{initial ? "Modifier la ressource" : "Nouvelle ressource"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Titre *</Label>
            <Input value={form.titre} onChange={e => set("titre", e.target.value)} />
          </div>
          <div>
            <Label>Sous-titre (optionnel)</Label>
            <Input value={form.sous_titre || ""} onChange={e => set("sous_titre", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Catégorie *</Label>
              <Select value={form.categorie_id} onValueChange={v => set("categorie_id", v)}>
                <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.emoji} {c.titre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
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
          <div>
            <Label>Contenu</Label>
            <div className="border border-input rounded-md overflow-hidden">
              <ReactQuill theme="snow" value={form.contenu || ""} onChange={v => set("contenu", v)} modules={QUILL_MODULES} />
            </div>
          </div>
          <div><Label>Images</Label><ArrayField values={form.images || []} onChange={v => set("images", v)} placeholder="URL image" type="file" /></div>
          <div><Label>Vidéos</Label><ArrayField values={form.videos || []} onChange={v => set("videos", v)} placeholder="URL vidéo" type="file" /></div>
          <div><Label>Pièces jointes (PDF)</Label><ArrayField values={form.fichiers || []} onChange={v => set("fichiers", v)} placeholder="URL PDF" type="file" /></div>
          <div><Label>Liens externes</Label><ArrayField values={form.liens || []} onChange={v => set("liens", v)} placeholder="https://..." /></div>
          <div><Label>Mots-clés</Label><ArrayField values={form.mots_cles || []} onChange={v => set("mots_cles", v)} placeholder="mot-clé" /></div>
          <div>
            <Label>Ordre d'affichage</Label>
            <Input type="number" value={form.ordre} onChange={e => set("ordre", e.target.value)} />
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