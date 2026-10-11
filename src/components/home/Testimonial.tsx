import { useState } from 'react';
import { TESTIMONIALS } from '../../content/homeInfo';
import { ArrowIcon, HeartIcon } from './icons';

const SWIPE_DISTANCE = 45;

export default function Testimonial() {
  const [index, setIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const count = TESTIMONIALS.length;

  const show = (next: number) => setIndex((next + count) % count);

  return (
    <section className="testimonial" aria-label="Testimoni klien" aria-roledescription="carousel">
      <div className="quote-mark" aria-hidden="true">“</div>
      <div
        className="testimonial-window"
        onTouchStart={(event) => setTouchStart(event.touches[0].clientX)}
        onTouchEnd={(event) => {
          if (touchStart === null) return;
          const distance = touchStart - event.changedTouches[0].clientX;
          if (Math.abs(distance) > SWIPE_DISTANCE) show(distance > 0 ? index + 1 : index - 1);
          setTouchStart(null);
        }}
      >
        <div className="testimonial-track" style={{ transform: `translateX(-${index * 100}%)` }}>
          {TESTIMONIALS.map((testimonial, i) => (
            <figure
              className="testimonial-slide"
              key={testimonial.couple}
              aria-roledescription="slide"
              aria-label={`${i + 1} dari ${count}`}
              aria-hidden={i !== index}
            >
              <blockquote>{testimonial.quote}</blockquote>
              <figcaption className="testimonial-author">
                - {testimonial.couple}, {testimonial.city}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
      {count > 1 && (
        <div className="testimonial-controls">
          <button
            aria-label="Testimoni sebelumnya"
            className="testimonial-arrow testimonial-arrow-previous"
            onClick={() => show(index - 1)}
            type="button"
          >
            <ArrowIcon />
          </button>
          <div className="testimonial-dots" role="group" aria-label="Pilih testimoni">
            {TESTIMONIALS.map((testimonial, i) => (
              <button
                aria-label={`Lihat testimoni ${i + 1}`}
                aria-pressed={index === i}
                className={index === i ? 'active' : ''}
                key={testimonial.couple}
                onClick={() => setIndex(i)}
                type="button"
              />
            ))}
          </div>
          <button
            aria-label="Testimoni berikutnya"
            className="testimonial-arrow"
            onClick={() => show(index + 1)}
            type="button"
          >
            <ArrowIcon />
          </button>
        </div>
      )}
      <div className="testimonial-hearts" aria-hidden="true">
        <HeartIcon />
        <HeartIcon />
        <HeartIcon />
      </div>
    </section>
  );
}
