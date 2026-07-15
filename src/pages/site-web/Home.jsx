import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Services from "@/components/sections/Services";
import Clubs from "@/components/sections/Clubs";
import Testimonials from "@/components/sections/Testimonials";
import AppExperience from "@/components/sections/AppExperience";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <Clubs />
      <AppExperience />
      <Testimonials />
      <Contact />
    </>
  );
}