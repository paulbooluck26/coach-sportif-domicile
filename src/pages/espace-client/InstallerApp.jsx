import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Smartphone } from "lucide-react";

const LienSite = () => <a href="https://www.physis-coaching.fr/espace-client" className="text-secondary underline">physis-coaching.fr</a>;

const ETAPES_IOS = [
  { titre: "Ouvrez le site dans Safari", desc: <>Rendez-vous sur <LienSite />, en vous assurant d'utiliser Safari (pas Chrome sur iPhone).</> },
  { titre: "Appuyez sur le bouton Partager", desc: "L'icône carrée avec une flèche vers le haut, en bas de l'écran." },
  { titre: "Choisissez « Sur l'écran d'accueil »", desc: "Faites défiler la liste si besoin, puis appuyez sur « Ajouter »." },
  { titre: "C'est fait", desc: "L'icône Physis Coaching apparaît sur votre écran d'accueil, comme une vraie application." },
];

const ETAPES_ANDROID = [
  { titre: "Ouvrez le site dans Chrome", desc: <>Rendez-vous sur <LienSite /> avec le navigateur Chrome.</> },
  { titre: "Ouvrez le menu", desc: "Les trois points verticaux, en haut à droite de l'écran." },
  { titre: "Choisissez « Installer l'application »", desc: "Ou « Ajouter à l'écran d'accueil » selon la version de Chrome." },
  { titre: "Confirmez", desc: "L'icône Physis Coaching apparaît sur votre écran d'accueil, en plein écran, sans barre de navigateur." },
];

export default function InstallerApp() {
  const [onglet, setOnglet] = useState("ios");
  const etapes = onglet === "ios" ? ETAPES_IOS : ETAPES_ANDROID;

  return (
    <div className="space-y-6 pb-2">
      <Link to="/espace-client/profil" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="w-4 h-4" /> Profil
      </Link>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-1">Espace client</p>
        <h1 className="font-heading text-3xl font-bold text-foreground">Installer l'application</h1>
        <p className="text-sm text-muted-foreground mt-2">Ajoutez Physis Coaching à votre écran d'accueil pour un accès rapide, comme une vraie application.</p>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setOnglet("ios")} className={`flex-1 py-3 rounded-xl text-sm font-semibold border ${onglet === "ios" ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground"}`}>
          iPhone
        </button>
        <button onClick={() => setOnglet("android")} className={`flex-1 py-3 rounded-xl text-sm font-semibold border ${onglet === "android" ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground"}`}>
          Android / Samsung
        </button>
      </div>

      <div className="space-y-3">
        {etapes.map((e, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-4 flex gap-4">
            <div className="w-8 h-8 rounded-full bg-secondary/15 text-secondary font-heading font-bold text-sm flex items-center justify-center shrink-0">{i + 1}</div>
            <div>
              <p className="font-semibold text-foreground text-sm mb-1">{e.titre}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{e.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-secondary/10 border border-secondary/30 rounded-2xl p-4 flex items-start gap-3">
        <Smartphone className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
        <p className="text-sm text-foreground/80">
          Une fois installée, l'application s'ouvre en plein écran, sans barre d'adresse — exactement comme une application téléchargée sur un store.
        </p>
      </div>
    </div>
  );
}
