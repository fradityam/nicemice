import { FAQS } from '../../content/homeInfo';

// FAQPage structured data, built from the same list as the accordion. It renders only here,
// so it exists on the homepage alone. React 19 leaves <script> tags in place in the body,
// where Google reads JSON-LD fine.
const FAQ_JSON_LD = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer },
  })),
}).replace(/</g, '\\u003c');

export default function Faq() {
  return (
    <section className="faq" id="faq">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: FAQ_JSON_LD }} />
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
