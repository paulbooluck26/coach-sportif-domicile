import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, ArrowRight, Sparkles, Home as HomeIcon, Laptop, Loader2, CheckCircle2 } from "lucide-react";
import Seo from "@/components/Seo";

const QUESTIONS = [
  {
    id: "objectif_principal",
    titre: "Qu'est-ce que vous aimeriez surtout améliorer aujourd'hui ?",
    options: [
      { label: "Mon physique", desc: "Perdre du gras, me tonifier, me sentir mieux dans mon corps.", domicile: 1, programme: 1 },
      { label: "Ma force et mes capacités physiques", desc: "Devenir plus fort, plus athlétique, plus performant.", domicile: 1, programme: 2 },
      { label: "Ma condition physique", desc: "Endurance, souffle, énergie, forme générale.", domicile: 1, programme: 1 },
      { label: "Reprendre une activité régulière", desc: "Retrouver une routine après une période d'arrêt.", domicile: 2, programme: 0 },
      { label: "Préparer un objectif précis", desc: "Course, sport, événement, défi personnel.", domicile: 1, programme: 1, flagComplexe: true },
    ],
  },
  {
    id: "projection",
    titre: "Si nous nous reparlons dans 3 mois, qu'est-ce qui vous ferait dire « ça valait le coup » ?",
    options: [
      { label: "Je me sens mieux dans mon corps", domicile: 1, programme: 1 },
      { label: "J'ai clairement progressé physiquement", domicile: 1, programme: 1 },
      { label: "Je suis plus fort, plus endurant", domicile: 0, programme: 1 },
      { label: "J'ai enfin réussi à être régulier", domicile: 2, programme: 0 },
      { label: "J'ai atteint un objectif précis", domicile: 1, programme: 1 },
    ],
  },
  {
    id: "niveau",
    titre: "Où en êtes-vous aujourd'hui ?",
    options: [
      { label: "Je débute", desc: "Je veux m'y mettre sérieusement.", domicile: 2, programme: 0, valeur: "debutant" },
      { label: "Je reprends", desc: "J'ai déjà pratiqué mais j'ai perdu le rythme.", domicile: 2, programme: 0, valeur: "reprise" },
      { label: "Je m'entraîne régulièrement", desc: "Je fais déjà du sport mais je veux progresser.", domicile: 1, programme: 1, valeur: "regulier" },
      { label: "Je suis sportif confirmé", desc: "Je cherche à optimiser mes performances.", domicile: 0, programme: 1, valeur: "confirme" },
    ],
  },
  {
    id: "frein_principal",
    titre: "Qu'est-ce qui vous empêche le plus souvent de progresser ?",
    options: [
      { label: "Je manque de temps", domicile: 0, programme: 2 },
      { label: "Je manque de motivation", domicile: 2, programme: 0 },
      { label: "Je ne sais pas exactement quoi faire", domicile: 1, programme: 1 },
      { label: "Je commence puis j'abandonne", domicile: 2, programme: 0 },
      { label: "Je m'entraîne déjà mais je stagne", domicile: 1, programme: 1, flagComplexe: true },
      { label: "Rien de particulier, je veux aller plus loin", domicile: 0, programme: 1 },
    ],
  },
  {
    id: "disponibilite",
    titre: "Combien de temps pouvez-vous réellement consacrer au sport chaque semaine ?",
    sousTitre: "Soyez réaliste : il n'y a pas de mauvaise réponse.",
    options: [
      { label: "1 à 2 heures", domicile: 1, programme: 1, valeur: "1-2h" },
      { label: "2 à 3 heures", domicile: 1, programme: 1, valeur: "2-3h" },
      { label: "3 à 4 heures", domicile: 1, programme: 1, valeur: "3-4h" },
      { label: "4 à 5 heures", domicile: 0, programme: 1, valeur: "4-5h" },
      { label: "5 heures ou plus", domicile: 0, programme: 1, valeur: "5h+" },
    ],
  },
  {
    id: "autonomie",
    titre: "Si vous avez un programme clair, êtes-vous capable de vous entraîner seul ?",
    options: [
      { label: "Oui, sans problème", domicile: 0, programme: 3, valeur: "forte" },
      { label: "Oui, mais j'ai parfois besoin d'un cadre", domicile: 1, programme: 2, valeur: "moyenne" },
      { label: "C'est difficile pour moi de rester régulier seul", domicile: 2, programme: 0, valeur: "faible" },
      { label: "Je préfère être accompagné pendant mes séances", domicile: 3, programme: 0, valeur: "faible" },
    ],
  },
  {
    id: "lieu_entrainement",
    titre: "Où préférez-vous vous entraîner ?",
    options: [
      { label: "Chez moi", domicile: 2, programme: 0, valeur: "domicile" },
      { label: "Dans ma salle", domicile: 0, programme: 2, valeur: "salle" },
      { label: "En extérieur", domicile: 1, programme: 1, valeur: "exterieur" },
      { label: "Peu importe, tant que ça fonctionne", domicile: 0, programme: 0, valeur: "indifferent" },
    ],
  },
  {
    id: "materiel",
    titre: "Quel matériel avez-vous à disposition ?",
    options: [
      { label: "Aucun", domicile: 1, programme: 0, valeur: "aucun" },
      { label: "Quelques haltères / kettlebells", domicile: 1, programme: 1, valeur: "leger" },
      { label: "Une salle de sport complète", domicile: 0, programme: 2, valeur: "salle" },
      { label: "Équipement à domicile assez complet", domicile: 1, programme: 2, valeur: "domicile_complet" },
      { label: "Je ne sais pas encore", domicile: 1, programme: 0, valeur: "inconnu" },
    ],
  },
  {
    id: "niveau_accompagnement",
    titre: "Qu'attendez-vous principalement d'un accompagnement ?",
    options: [
      { label: "Un programme clair, je gère le reste", domicile: 0, programme: 3, valeur: "programme_seul" },
      { label: "Un programme, avec un peu de suivi", domicile: 1, programme: 2, valeur: "programme_suivi" },
      { label: "Être accompagné régulièrement", domicile: 2, programme: 0, valeur: "regulier" },
      { label: "Un accompagnement très personnalisé, quelqu'un à mes côtés", domicile: 3, programme: 0, valeur: "tres_personnalise" },
    ],
  },
  {
    id: "duree_engagement",
    titre: "Sur quelle durée souhaitez-vous réellement vous engager ?",
    options: [
      { label: "4 semaines pour commencer", domicile: 0, programme: 0, valeur: "4_semaines" },
      { label: "3 mois pour une vraie progression", domicile: 0, programme: 0, valeur: "3_mois" },
      { label: "6 mois pour une transformation durable", domicile: 0, programme: 0, valeur: "6_mois" },
      { label: "Je préfère commencer progressivement", domicile: 0, programme: 0, valeur: "progressif" },
    ],
  },
];

const PROFILS = {
  batisseur: {
    nom: "Structure",
    accroche: "Progression encadrée",
    texte: "Vous avez envie de progresser, mais votre principal besoin est d'avoir un cadre clair qui vous permet de rester régulier.",
    photo: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=900&q=80",
  },
  determine: {
    nom: "Détermination",
    accroche: "Accompagnement personnalisé",
    texte: "Vous savez ce que vous voulez. Votre priorité est d'être accompagné, corrigé et guidé pour progresser sans perdre de temps.",
    photo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=80",
  },
  autonome: {
    nom: "Autonomie",
    accroche: "Progression indépendante",
    texte: "Vous savez vous entraîner seul et recherchez surtout une méthode claire, progressive et adaptée à votre objectif.",
    photo: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900&q=80",
  },
  performer: {
    nom: "Performance",
    accroche: "Optimisation",
    texte: "Vous avez déjà une pratique sportive et cherchez maintenant à structurer votre progression et mesurer vos performances.",
    photo: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=80",
  },
};

function calculerResultat(reponses) {
  let scoreDomicile = 0;
  let scoreProgramme = 0;
  let complexe = false;
  let niveau = "";
  let autonomie = "";

  QUESTIONS.forEach((q) => {
    const rep = reponses[q.id];
    if (!rep) return;
    scoreDomicile += rep.domicile || 0;
    scoreProgramme += rep.programme || 0;
    if (rep.flagComplexe) complexe = true;
    if (q.id === "niveau") niveau = rep.valeur;
    if (q.id === "autonomie") autonomie = rep.valeur;
  });

  const ecart = Math.abs(scoreDomicile - scoreProgramme);
  let recommandation;
  let profil;

  if (niveau === "confirme") {
    profil = "performer";
    recommandation = scoreDomicile >= scoreProgramme ? "domicile" : "programme";
  } else if (ecart <= 1 || complexe) {
    recommandation = "appel_decouverte";
    profil = scoreDomicile >= scoreProgramme ? (autonomie === "faible" ? "batisseur" : "determine") : "autonome";
  } else if (scoreDomicile > scoreProgramme) {
    profil = autonomie === "faible" ? "batisseur" : "determine";
    recommandation = "domicile";
  } else {
    profil = "autonome";
    recommandation = "programme";
  }

  return { scoreDomicile, scoreProgramme, profil, recommandation };
}

export default function Diagnostic() {
  const navigate = useNavigate();
  const [etape, setEtape] = useState("intro");
  const [step, setStep] = useState(0);
  const [reponses, setReponses] = useState({});
  const [lead, setLead] = useState({ prenom: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [resultat, setResultat] = useState(null);

  const question = QUESTIONS[step];
  const progression = Math.round(((step + 1) / QUESTIONS.length) * 100);

  const choisir = (option) => {
    const next = { ...reponses, [question.id]: option };
    setReponses(next);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setEtape("lead");
    }
  };

  const retour = () => {
    if (step === 0) {
      setEtape("intro");
    } else {
      setStep(step - 1);
    }
  };

  const soumettreLead = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = calculerResultat(reponses);
    const payload = {
      prenom: lead.prenom,
      email: lead.email,
      reponses,
      objectif_principal: reponses.objectif_principal?.label,
      niveau: reponses.niveau?.valeur,
      frein_principal: reponses.frein_principal?.label,
      disponibilite: reponses.disponibilite?.valeur,
      autonomie: reponses.autonomie?.valeur,
      lieu_entrainement: reponses.lieu_entrainement?.valeur,
      materiel: reponses.materiel?.valeur,
      niveau_accompagnement: reponses.niveau_accompagnement?.valeur,
      duree_engagement: reponses.duree_engagement?.valeur,
      profil_attribue: res.profil,
      score_domicile: res.scoreDomicile,
      score_programme: res.scoreProgramme,
      recommandation_finale: res.recommandation,
    };
    try {
      await base44.entities.DiagnosticPhysis.create(payload);
    } catch (_) {}
    setResultat(res);
    setSaving(false);
    setEtape("resultat");
  };

  if (etape === "intro") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-20 bg-gradient-to-b from-primary to-primary/90">
        <Seo
          title="Diagnostic Physis Gratuit"
          description="Répondez à quelques questions et découvrez en 3 minutes l'accompagnement PHYSIS COACHING le plus adapté à votre profil : coaching à domicile ou programme en ligne."
          path="/diagnostic"
        />
        <div className="max-w-lg text-center">
          <Sparkles className="w-9 h-9 text-accent mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary-foreground uppercase leading-tight">
            Votre objectif mérite mieux qu'un programme générique.
          </h1>
          <p className="text-primary-foreground/70 mt-6 leading-relaxed">
            Quelques questions pour comprendre votre objectif, votre quotidien et votre façon de fonctionner. À la fin, découvrez l'accompagnement Physis Coaching le plus adapté à votre profil.
          </p>
          <button
            onClick={() => setEtape("question")}
            className="mt-10 inline-flex items-center gap-2 bg-accent text-accent-foreground px-10 py-4 rounded-full text-sm font-semibold hover:scale-105 transition-all duration-300"
          >
            Commencer
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-xs text-primary-foreground/50 mt-4">Environ 3 minutes · Gratuit · Sans engagement</p>
        </div>
      </div>
    );
  }

  if (etape === "question") {
    return (
      <div className="min-h-screen bg-background px-6 py-10 flex flex-col">
        <div className="max-w-xl w-full mx-auto flex-1 flex flex-col">
          <div className="flex items-center gap-4 mb-10">
            <button onClick={retour} className="text-muted-foreground hover:text-foreground shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${progression}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">Question {step + 1} / {QUESTIONS.length}</p>
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary leading-snug mb-2">{question.titre}</h2>
          {question.sousTitre && <p className="text-sm text-muted-foreground mb-6">{question.sousTitre}</p>}
          {!question.sousTitre && <div className="mb-6" />}

          <div className="space-y-3">
            {question.options.map((opt) => (
              <button
                key={opt.label}
                onClick={() => choisir(opt)}
                className="w-full text-left bg-card border-2 border-border hover:border-accent rounded-2xl px-6 py-4 transition-all duration-200 hover:shadow-md"
              >
                <p className="font-heading font-semibold text-primary">{opt.label}</p>
                {opt.desc && <p className="text-sm text-muted-foreground mt-0.5">{opt.desc}</p>}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (etape === "lead") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-20 bg-background">
        <form onSubmit={soumettreLead} className="max-w-md w-full text-center">
          <CheckCircle2 className="w-10 h-10 text-accent mx-auto mb-5" />
          <h2 className="text-3xl font-heading font-bold text-primary uppercase mb-2">Votre profil est prêt.</h2>
          <p className="text-muted-foreground mb-8">Où puis-je vous envoyer votre profil Physis et votre recommandation personnalisée ?</p>
          <div className="space-y-3 text-left">
            <input
              required
              value={lead.prenom}
              onChange={(e) => setLead({ ...lead, prenom: e.target.value })}
              placeholder="Prénom"
              className="w-full border-2 border-border rounded-xl px-5 py-3.5 focus:outline-none focus:border-accent"
            />
            <input
              required
              type="email"
              value={lead.email}
              onChange={(e) => setLead({ ...lead, email: e.target.value })}
              placeholder="Adresse email"
              className="w-full border-2 border-border rounded-xl px-5 py-3.5 focus:outline-none focus:border-accent"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-left">
            En continuant, vous acceptez d'être contacté par Physis Coaching au sujet de votre diagnostic. Voir notre <Link to="/confidentialite" className="underline">politique de confidentialité</Link>.
          </p>
          <button
            type="submit"
            disabled={saving}
            className="w-full mt-6 inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-8 py-4 rounded-full text-sm font-semibold hover:scale-105 transition-all duration-300 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Découvrir mon profil <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      </div>
    );
  }

  if (etape === "resultat" && resultat) {
    const profil = PROFILS[resultat.profil];
    const rec = resultat.recommandation;
    const isAppel = rec === "appel_decouverte";
    const isDomicile = rec === "domicile";

    return (
      <div className="min-h-screen bg-background px-6 py-20">
        <div className="max-w-xl mx-auto">
          <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-8">
            <img src={profil.photo} alt={profil.nom} className="w-full h-full object-cover" />
          </div>
          <p className="text-sm font-bold tracking-[0.2em] text-secondary uppercase text-center mb-3">Votre profil</p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary uppercase text-center leading-tight">
            {profil.nom}
          </h1>
          <p className="text-accent font-semibold text-center mt-2">{profil.accroche}</p>
          <p className="text-muted-foreground text-center mt-6 leading-relaxed">{profil.texte}</p>

          <div className="mt-10 bg-card border-2 border-accent rounded-2xl p-8 text-center">
            {isAppel ? (
              <>
                <Sparkles className="w-8 h-8 text-accent mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-1">Votre situation mérite un vrai échange</p>
                <h2 className="text-2xl font-heading font-bold text-primary uppercase mb-4">Parlons-en ensemble</h2>
              </>
            ) : (
              <>
                {isDomicile ? <HomeIcon className="w-8 h-8 text-accent mx-auto mb-4" /> : <Laptop className="w-8 h-8 text-accent mx-auto mb-4" />}
                <p className="text-sm text-muted-foreground mb-1">L'accompagnement qui vous correspond</p>
                <h2 className="text-2xl font-heading font-bold text-primary uppercase mb-4">
                  {isDomicile ? "Coaching à domicile" : "Programmes Physis"}
                </h2>
              </>
            )}
            <Link
              to={isDomicile ? "/tarifs" : "/achat-programme"}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-full text-sm font-semibold hover:scale-105 transition-all duration-300"
            >
              {isDomicile ? "Découvrir le coaching à domicile" : "Découvrir les programmes"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-10 text-center border-t border-border pt-10">
            <h3 className="text-xl font-heading font-bold text-primary uppercase mb-3">Vous voulez aller plus loin ?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto mb-6">
              Vos réponses permettent déjà d'identifier la direction la plus adaptée. Si vous souhaitez qu'on regarde ensemble votre situation, je vous propose un échange gratuit de 30 minutes.
            </p>
            <Link
              to="/appel-decouverte"
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-4 rounded-full text-sm font-semibold hover:scale-105 transition-all duration-300"
            >
              Réserver mon appel découverte — 30 min
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-xs text-muted-foreground mt-3">Gratuit · Sans engagement</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
