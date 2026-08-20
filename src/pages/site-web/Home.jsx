import Hero from "@/components/sections/Hero";
import ApprocheSimple from "@/components/sections/ApprocheSimple";
import Services from "@/components/sections/Services";
import About from "@/components/sections/About";
import CommentCaFonctionne from "@/components/sections/CommentCaFonctionne";
import AppExperience from "@/components/sections/AppExperience";
import Clubs from "@/components/sections/Clubs";
import Testimonials from "@/components/sections/Testimonials";
import Contact from "@/components/sections/Contact";
import Seo from "@/components/Seo";

export default function Home() {
  return (
    <>
      <Seo
        title="Coach Sportif à Domicile Colmar"
        description="Coaching sportif personnalisé à Colmar et alentours, à domicile, en ligne ou en entreprise. Diagnostic gratuit pour trouver l'accompagnement adapté à votre objectif."
        path="/"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SportsActivityLocation",
            "name": "Physis Coaching",
            "description": "Coaching sportif personnalisé à domicile, en ligne ou en entreprise.",
            "url": "https://physis-coaching.fr",
            "telephone": "+33698181428",
            "email": "contact@physis-coaching.fr",
            "priceRange": "€€",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Colmar",
              "addressRegion": "Grand Est",
              "addressCountry": "FR",
            },
            "areaServed": "Colmar et alentours",
            "sameAs": ["https://instagram.com/physiscoachingcolmar"],
          }),
        }}
      />
      <Hero />
      <ApprocheSimple />
      <Services />
      <About />
      <CommentCaFonctionne />
      <AppExperience />
      <Clubs />
      <Testimonials />
      <Contact />
    </>
  );
}
