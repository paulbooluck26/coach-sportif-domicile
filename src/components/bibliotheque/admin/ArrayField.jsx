import { useState } from "react";
import { X, Upload, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Champ réutilisable : liste de chaînes (mots-clés, URLs...).
// type="file" ajoute un bouton d'upload vers le stockage de l'app.
export default function ArrayField({ values = [], onChange, placeholder, type = "text" }) {
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);

  const add = () => {
    const v = input.trim();
    if (!v) return;
    if (!values.includes(v)) onChange([...values, v]);
    setInput("");
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onChange([...values, file_url]);
    } catch {}
    setUploading(false);
    e.target.value = "";
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:border-secondary"
        />
        <button type="button" onClick={add} className="px-3 rounded-md border border-border text-sm hover:bg-muted flex items-center"><Plus className="w-4 h-4" /></button>
        {type === "file" && (
          <label className={`px-3 rounded-md border border-border text-sm hover:bg-muted cursor-pointer flex items-center ${uploading ? "opacity-50" : ""}`}>
            <Upload className="w-4 h-4" />
            <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        )}
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {values.map((v, i) => (
            <span key={i} className="inline-flex items-center gap-1 bg-muted text-xs px-2 py-1 rounded-full max-w-full">
              <span className="truncate max-w-[220px]">{v}</span>
              <button type="button" onClick={() => onChange(values.filter((_, idx) => idx !== i))}><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}