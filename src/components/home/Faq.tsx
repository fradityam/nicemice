import { FAQS } from '../../content/homeInfo';

// The FAQ's structured data (FAQPage) is in the homepage's <head>, written by the Worker from
// the same list (src/content/structuredData.ts).

export default function Faq() {
  return (
    <section className="faq" id="faq">
      <div className="faq-heading">
        <p className="section-kicker">Pertanyaan umum</p>
        <h2>Hal yang mungkin ingin kamu tanyakan</h2>
        <p>Belum menemukan jawabannya? Tim kami dengan senang hati akan membantu lewat WhatsApp.</p>
      </div>
      <div className="faq-list">
        {FAQS.map((faq, index) => (
          <details key={faq.question} open={index === 0}>
            <summary>
              <span>{String(index + 1).padStart(2, '0')}</span>
              {faq.question}
              <i aria-hidden="true" />
            </summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
