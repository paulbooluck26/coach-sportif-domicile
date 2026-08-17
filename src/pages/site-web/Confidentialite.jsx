export default function Confidentialite() {
  return (
    <div className="pt-32 pb-24 max-w-3xl mx-auto px-6 lg:px-10">
      <h1 className="text-4xl font-heading font-bold text-primary uppercase mb-10">Confidentialité</h1>

      <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="font-heading font-semibold text-primary text-lg mb-2">Responsable du traitement</h2>
          <p>
            Paul Booluck (Physis Coaching), contact@physis-coaching.fr, est responsable du traitement des données collectées sur ce site et dans l'application.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-semibold text-primary text-lg mb-2">Données collectées</h2>
          <p>
            Selon votre utilisation du site et de l'application : nom, prénom, email, téléphone, adresse (pour les séances à domicile), informations de bilan initial, historique de séances et de progression, données de paiement (traitées directement par Stripe, jamais stockées par nos soins).
          </p>
        </section>

        <section>
          <h2 className="font-heading font-semibold text-primary text-lg mb-2">Finalité</h2>
          <p>
            Ces données sont utilisées pour la gestion de votre compte, la réservation et le suivi de vos séances et programmes, la facturation, et la communication liée à votre accompagnement (confirmations, rappels).
          </p>
        </section>

        <section>
          <h2 className="font-heading font-semibold text-primary text-lg mb-2">Sous-traitants</h2>
          <p>
            Vos données sont hébergées et traitées par : Supabase (base de données, authentification), Vercel (hébergement du site), Stripe (paiements), Resend (envoi d'emails), Google (synchronisation d'agenda, connexion). Chacun de ces prestataires applique ses propres mesures de sécurité et de conformité.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-semibold text-primary text-lg mb-2">Vos droits</h2>
          <p>
            Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité de vos données. Pour exercer ces droits, contactez-nous à contact@physis-coaching.fr.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-semibold text-primary text-lg mb-2">Conservation des données</h2>
          <p>
            Vos données sont conservées pendant la durée de votre relation avec Physis Coaching, puis archivées ou supprimées conformément aux obligations légales (notamment comptables).
          </p>
        </section>

        <section>
          <h2 className="font-heading font-semibold text-primary text-lg mb-2">Cookies</h2>
          <p>
            Ce site utilise uniquement des cookies techniques nécessaires à son fonctionnement (connexion, préférences). Aucun cookie publicitaire n'est utilisé.
          </p>
        </section>
      </div>
    </div>
  );
}
