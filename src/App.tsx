import SiteHeader from './components/home/SiteHeader';
import Hero from './components/home/Hero';
import Marquee from './components/home/Marquee';
import Intro from './components/home/Intro';
import Catalog from './components/home/Catalog';
import Process from './components/home/Process';
import Pricing from './components/home/Pricing';
import Testimonial from './components/home/Testimonial';
import Faq from './components/home/Faq';
import FinalCta from './components/home/FinalCta';
import WhatsAppFloat from './components/home/WhatsAppFloat';
import OrderNotice from './components/home/OrderNotice';
import SiteFooter from './components/home/SiteFooter';
import './components/home/home.css';

export default function App() {
  return (
    <div className="nm-home">
      <SiteHeader />
      <main>
        <Hero />
        <Marquee />
        <Intro />
        <Catalog />
        <Process />
        <Pricing />
        <Testimonial />
        <Faq />
        <FinalCta />
      </main>
      <WhatsAppFloat />
      <OrderNotice />
      <SiteFooter />
    </div>
  );
}
