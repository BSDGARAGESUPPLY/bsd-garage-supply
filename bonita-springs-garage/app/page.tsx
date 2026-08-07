import ScrollProgress from "@/components/ScrollProgress";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import About from "@/components/About";
import Services from "@/components/Services";
import Process from "@/components/Process";
import CtaBand from "@/components/CtaBand";
import WhyChooseUs from "@/components/WhyChooseUs";
import Testimonials from "@/components/Testimonials";
import ServiceAreas from "@/components/ServiceAreas";
import Faq from "@/components/Faq";
import ContactForm from "@/components/ContactForm";
import MapSection from "@/components/MapSection";
import Footer from "@/components/Footer";
import MobileCallBar from "@/components/MobileCallBar";

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main id="main">
        <Hero />
        <TrustBar />
        <About />
        <Services />
        <Process />
        <CtaBand />
        <WhyChooseUs />
        <Testimonials />
        <ServiceAreas />
        <Faq />
        <ContactForm />
        <MapSection />
      </main>
      <Footer />
      <MobileCallBar />
    </>
  );
}
