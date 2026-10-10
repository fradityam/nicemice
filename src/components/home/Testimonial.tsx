import { HeartIcon } from './icons';

// A real client quote, shared with the couple's permission. Keep it word for word.
export default function Testimonial() {
  return (
    <section className="testimonial" aria-label="Testimoni klien">
      <div className="quote-mark" aria-hidden="true">“</div>
      <figure>
        <blockquote>
          Dari awal prosesnya menyenangkan banget. Hasilnya lebih dari yang kami bayangkan—rapi,
          mudah dibuka, dan semua tamu bilang undangannya lucu!
        </blockquote>
        <figcaption>— Nabila &amp; Arga, Jakarta</figcaption>
      </figure>
      <div className="testimonial-hearts">
        <HeartIcon />
        <HeartIcon />
        <HeartIcon />
      </div>
    </section>
  );
}
