export default function MentionsLegales() {
  return (
    <div className="pt-32 pb-24 max-w-3xl mx-auto px-6 lg:px-10">
      <h1 className="text-4xl font-heading font-bold text-primary uppercase mb-10">Mentions légales</h1>

      <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="font-heading font-semibold text-primary text-lg mb-2">Éditeur du site</h2>
          <p>
            Physis Coaching — Paul Booluck<br />
            Auto-entrepreneur — TVA non applicable, art. 293B du CGI<br />
            SIRET : 98524575200011<br />
            Adresse : Colmar, Haut-Rhin, France<br />
            Email : contact@physis-coaching.fr<br />
            Téléphone : 06 98 18 14 28
          </p>
        </section>

        <section>
          <h2 className="font-heading font-semibold text-primary text-lg mb-2">Directeur de la publication</h2>
          <p>Paul Booluck</p>
        </section>

        <section>
          <h2 className="font-heading font-semibold text-primary text-lg mb-2">Hébergement</h2>
          <p>
            Site web : Vercel Inc. — 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis<br />
            Base de données : Supabase Inc.<br />
            Paiements : Stripe Payments Europe, Ltd.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-semibold text-primary text-lg mb-2">Propriété intellectuelle</h2>
          <p>
            L'ensemble des contenus présents sur ce site (textes, images, logo, identité visuelle) est la propriété de Physis Coaching, sauf mention contraire. Toute reproduction sans autorisation est interdite.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-semibold text-primary text-lg mb-2">Contact</h2>
          <p>Pour toute question relative à ce site, contactez-nous à contact@physis-coaching.fr.</p>
        </section>
      </div>
    </div>
  );
}
