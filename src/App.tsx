import Header from './components/Header';
import Marquee from './components/Marquee';
import Hero from './components/Hero';
import TemplateShowcase from './components/TemplateShowcase';
import JourneySection from './components/JourneySection';
import AestheticsSection from './components/AestheticsSection';
import DifferenceSection from './components/DifferenceSection';
import TestimonialsSection from './components/TestimonialsSection';
import BlogGrid from './components/BlogGrid';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] selection:bg-[#D9F99D]/50 relative overflow-x-hidden">
      {/* 1. Header Navigation Bar */}
      <Header />

      {/* 2. Headline Accolades Marquee Banner */}
      <Marquee />

      <main>
        {/* 3. Hero Layout featuring Header title & Testimonials review dots */}
        <Hero />

        {/* 4. Curated Template Showcase Grid & green CTA Stripe ("Free wedding websites") */}
        <TemplateShowcase />

        {/* 5. Chronological Planning Journey Timeline Checklist Grid */}
        <JourneySection />

        {/* 6. Aesthetics visual category tags & Aesthetic Finder Simulation Quiz */}
        <AestheticsSection />

        {/* 7. Underlining "nicemice Difference" value proposition points */}
        <DifferenceSection />

        {/* 8. Additional requested Section 1: Detailed Client Testimonial Cards */}
        <TestimonialsSection />

        {/* 9. Additional requested Section 2: Featured Resources blog cards using generated images */}
        <BlogGrid />
      </main>

      {/* 10. Additional requested Section 3: Premium Footer with newsletter form */}
      <Footer />
    </div>
  );
}
