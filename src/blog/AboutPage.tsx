import type { CSSProperties } from 'react';
import { ORDER_MESSAGE, whatsappLink } from '../config';
import { ArrowIcon, HeartIcon, WhatsAppIcon } from '../components/home/icons';
import BlogLayout from './BlogLayout';
import type { AboutPageData } from './types';

// /tentang-kami (content/pages/tentang-kami.yaml): the hero, the story as a timeline, what we
// stand for, the team, a few facts, testimonials, and the closing call. Styles: about.css.
//
// Everything is in the HTML and visible without JavaScript. The script below only adds the
// motion: blocks marked data-reveal fade up as they scroll into view (staggered by --i), the
// timeline's line fills as the page passes it, and each heart marker pops in with its block.
// The hidden starting state applies only once <html> has the "js" class (set first thing in
// <head>) and the visitor hasn't asked for reduced motion (about.css).

const HEAD_SCRIPT = `document.documentElement.classList.add('js');`;

const REVEAL_SCRIPT = `(function () {
  var root = document.documentElement;
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.remove('js');
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('[data-reveal]').forEach(function (el) { observer.observe(el); });

  var timeline = document.querySelector('.about-timeline');
  if (!timeline) return;
  var queued = false;
  function fill() {
    queued = false;
    var box = timeline.getBoundingClientRect();
    var progress = (innerHeight * 0.65 - box.top) / box.height;
    timeline.style.setProperty('--progress', Math.max(0, Math.min(1, progress)).toFixed(3));
  }
  function queue() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(fill);
  }
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  fill();
})();`;

/** The stagger step of a block within its group (about.css). */
const order = (i: number) => ({ '--i': i }) as CSSProperties;

export default function AboutPage({ head, assets, hero, timeline, values, team, facts, testimonials, closing }: AboutPageData) {
  const whatsapp = whatsappLink(ORDER_MESSAGE);
  return (
    <BlogLayout head={head} assets={assets} mainClass="nm-about" headScript={HEAD_SCRIPT} script={REVEAL_SCRIPT}>
      <section className="about-hero">
        <div className="about-hero-text">
          <p className="about-kicker">{hero.label}</p>
          <h1>{hero.h1}</h1>
          <p className="about-hero-intro">{hero.intro}</p>
        </div>
        <img
          className="about-hero-photo"
          src={hero.photo.src}
          alt={hero.photo.alt}
          width={hero.photo.width}
          height={hero.photo.height}
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      </section>

      <section className="about-story" aria-labelledby="perjalanan">
        <h2 id="perjalanan" className="sr-only">
          {timeline.heading}
        </h2>
        <div className="about-timeline">
          <div className="about-timeline-line" aria-hidden="true">
            <span />
          </div>
          <ol>
            {timeline.steps.map((step, i) => (
              <li className="about-step" key={step.heading} data-reveal="">
                <span className="about-marker" aria-hidden="true">
                  <HeartIcon />
                </span>
                <div className="about-step-text">
                  <p className="about-step-number" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3>{step.heading}</h3>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="about-values" aria-labelledby="yang-kami-pegang">
        <h2 id="yang-kami-pegang" data-reveal="">
          {values.heading}
        </h2>
        <ul>
          {values.items.map((item, i) => (
            <li key={item.title} data-reveal="" style={order(i)}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="about-team" aria-labelledby="tim">
        <h2 id="tim" data-reveal="">
          {team.heading}
        </h2>
        <div className="about-people">
          {team.people.map((person, i) => (
            <article className="about-person" id={person.slug} key={person.slug} data-reveal="" style={order(i)}>
              {person.photo ? (
                <img src={person.photo.src} alt={person.photo.alt} width={person.photo.width} height={person.photo.height} loading="lazy" decoding="async" />
              ) : (
                <div className="about-photo-placeholder" aria-hidden="true">
                  {person.name.charAt(0)}
                </div>
              )}
              <h3>{person.name}</h3>
              <p className="about-person-role">{person.role}</p>
              <p>{person.bio}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-facts" aria-labelledby="dalam-angka">
        <h2 id="dalam-angka" className="sr-only">
          {facts.heading}
        </h2>
        <ul>
          {facts.items.map((fact, i) => (
            <li key={fact.label} data-reveal="" style={order(i)}>
              <span className="about-fact-value">{fact.value}</span>
              <span className="about-fact-label">{fact.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="about-testimonials" aria-labelledby="testimoni">
        <h2 id="testimoni" className="sr-only">
          {testimonials.heading}
        </h2>
        <div className="about-quotes">
          {testimonials.items.map((t, i) => (
            <figure key={t.couple} data-reveal="" style={order(i)}>
              <div className="about-quote-mark" aria-hidden="true">
                “
              </div>
              <blockquote>{t.quote}</blockquote>
              <figcaption>
                {t.couple}, {t.city}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="about-closing" aria-labelledby="giliran-kalian" data-reveal="">
        <h2 id="giliran-kalian">{closing.heading}</h2>
        <p>{closing.text}</p>
        <div className="about-closing-actions">
          <a className="button button-primary" href={closing.primaryCta.href}>
            {closing.primaryCta.label}
            <ArrowIcon />
          </a>
          {whatsapp && (
            <a className="button button-outline" href={whatsapp} target="_blank" rel="noopener noreferrer" data-wa-button="about_cta">
              <WhatsAppIcon />
              {closing.whatsappLabel}
            </a>
          )}
        </div>
      </section>
    </BlogLayout>
  );
}
