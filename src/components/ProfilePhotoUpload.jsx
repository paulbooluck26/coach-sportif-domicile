import { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Camera, Trash2, Loader2, Upload } from "lucide-react";
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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

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

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div>
      <div className="flex items-center gap-5">
        <ClientAvatar name={name} photoUrl={photoUrl} size={96} />
        <div className="flex-1">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              {photoUrl ? "Changer la photo" : "Importer une photo"}
            </button>
            {photoUrl && !uploading && (
              <button
                type="button"
                onClick={onRemoved}
                className="inline-flex items-center gap-2 border border-border text-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-destructive/5 hover:text-destructive hover:border-destructive/40 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Supprimer
              </button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            JPG, PNG ou WEBP · 5 Mo max · recadrage carré automatique.
          </p>
        </div>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`mt-4 border-2 border-dashed rounded-xl p-4 text-center text-sm cursor-pointer transition-colors ${
          dragOver ? "border-secondary bg-secondary/10" : "border-border hover:border-secondary/50"
        }`}
      >
        <Upload className="w-5 h-5 mx-auto mb-1.5 text-muted-foreground" />
        Glissez-déposez une photo ici, ou cliquez pour sélectionner.
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