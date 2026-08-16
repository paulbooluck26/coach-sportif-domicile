import { useRef, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Camera, Trash2, Loader2, Pencil } from "lucide-react";
import ClientAvatar from "@/components/ClientAvatar";

const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const OUTPUT_SIZE = 512;

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function cropSquareAndCompress(dataUrl, size) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const min = Math.min(img.width, img.height);
      const sx = (img.width - min) / 2;
      const sy = (img.height - min) / 2;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Compression échouée"))),
        "image/jpeg",
        0.85
      );
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

export default function ProfilePhotoUpload({ photoUrl, name, onSaved, onRemoved }) {
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  const handleFile = async (file) => {
    setError("");
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setError("Format non supporté. Utilisez JPG, PNG ou WEBP.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("Image trop lourde (5 Mo max).");
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await readFileAsDataURL(file);
      const blob = await cropSquareAndCompress(dataUrl, OUTPUT_SIZE);
      const compressed = new File([blob], "photo-profil.jpg", { type: "image/jpeg" });
      const { file_url } = await base44.integrations.Core.UploadFile({ file: compressed });
      await onSaved(file_url);
    } catch (e) {
      setError("Échec de l'envoi de l'image. Réessayez.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-5">
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => !uploading && setMenuOpen((v) => !v)}
            className="relative rounded-full focus:outline-none focus:ring-2 focus:ring-accent"
            title="Modifier la photo de profil"
          >
            <ClientAvatar name={name} photoUrl={photoUrl} size={96} />
            <span className="absolute bottom-0 right-0 bg-secondary text-secondary-foreground w-7 h-7 rounded-full flex items-center justify-center border-2 border-background">
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Pencil className="w-3.5 h-3.5" />}
            </span>
          </button>

          {menuOpen && (
            <div className="absolute left-0 top-full mt-2 bg-card border border-border rounded-xl shadow-lg py-1.5 z-20 w-52">
              <button
                type="button"
                onClick={() => { setMenuOpen(false); inputRef.current?.click(); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-secondary/10 transition-colors"
              >
                <Camera className="w-4 h-4" /> {photoUrl ? "Modifier la photo" : "Ajouter une photo"}
              </button>
              {photoUrl && (
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); onRemoved(); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Supprimer la photo
                </button>
              )}
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">Cliquez sur la photo pour la modifier</p>
          <p className="text-xs text-muted-foreground mt-1">JPG, PNG ou WEBP · 5 Mo max · recadrage carré automatique.</p>
        </div>
      </div>

      {error && <p className="text-xs text-destructive mt-2">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
