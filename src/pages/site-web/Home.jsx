import Hero from "@/components/sections/Hero";
import ApprocheSimple from "@/components/sections/ApprocheSimple";
import Services from "@/components/sections/Services";
import About from "@/components/sections/About";
import CommentCaFonctionne from "@/components/sections/CommentCaFonctionne";
import AppExperience from "@/components/sections/AppExperience";
import Clubs from "@/components/sections/Clubs";
import Testimonials from "@/components/sections/Testimonials";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
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
