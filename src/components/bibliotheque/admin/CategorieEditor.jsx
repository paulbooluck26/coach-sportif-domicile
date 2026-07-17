import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CategorieEditor({ open, initial, onClose, onSave }) {
  const [form, setForm] = useState({ titre: "", emoji: "", type: "article", ordre: 0, description: "" });

  useEffect(() => {
    if (open) setForm(initial ? { ...initial } : { titre: "", emoji: "", type: "article", ordre: 0, description: "" });
  }, [open, initial]);

  const submit = () => {
    if (!form.titre?.trim()) return;
    onSave({ ...form, ordre: Number(form.ordre) || 0 });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{initial ? "Modifier la catégorie" : "Nouvelle catégorie"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Titre *</Label>
            <Input value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} placeholder="Ex : Vocabulaire" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Emoji</Label>
              <Input value={form.emoji} onChange={e => setForm({ ...form, emoji: e.target.value })} placeholder="📖" />
            </div>
            <div>
              <Label>Ordre</Label>
              <Input type="number" value={form.ordre} onChange={e => setForm({ ...form, ordre: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Type de catégorie</Label>
            <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="article">Articles (texte riche)</SelectItem>
                <SelectItem value="mouvement">Bibliothèque des mouvements</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={form.description || ""} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Court texte affiché sous le titre" />
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