import { PRICING } from '../../content/homeInfo';
import OrderLink from './OrderLink';
import { ArrowIcon, CheckIcon, SparkIcon } from './icons';

export default function Pricing() {
  const { regular, custom, addons, partner, note } = PRICING;

  return (
    <section className="pricing" id="harga">
      <div className="pricing-heading">
        <div>
          <p className="section-kicker section-kicker-light">Daftar harga</p>
          <h2>Pilih yang siap pakai, atau buat cerita yang benar-benar baru.</h2>
        </div>
        <p>
          Mulai dari koleksi template pilihan hingga desain custom, semuanya dikerjakan dan didampingi
          langsung oleh tim nice mice.
        </p>
      </div>

      <div className="pricing-grid">
        <article className="price-card price-card-featured">
          <div className="price-card-top">
            <span className="price-label">{regular.label}</span>
            {regular.originalPrice && <span className="price-badge">{regular.badge}</span>}
          </div>
          <div className="price">
            {regular.originalPrice && <s>{regular.originalPrice}</s>}
            <strong>{regular.price}</strong>
          </div>
          <p className="price-description">{regular.description}</p>
          <ul className="price-features">
            {regular.features.map((feature) => (
              <li key={feature}>
                <CheckIcon />
                {feature}
              </li>
            ))}
          </ul>
          <div className="price-terms">
            {regular.terms.map((term) => (
              <span key={term.label}>
                <strong>{term.value}</strong>
                {term.label}
              </span>
            ))}
          </div>
          <a className="button button-primary" href="#template">
            Pilih template
            <ArrowIcon />
          </a>
        </article>

        <div className="price-options">
          <article className="price-card price-card-custom">
            <div className="price-card-top">
              <span className="price-label">{custom.label}</span>
              <SparkIcon />
            </div>
            <div className="option-price">
              <small>{custom.priceLabel}</small>
              <strong>{custom.price}</strong>
            </div>
            <p>{custom.description}</p>
            <dl>
              {custom.details.map((detail) => (
                <div key={detail.term}>
                  <dt>{detail.term}</dt>
                  <dd>{detail.value}</dd>
                </div>
              ))}
            </dl>
            <OrderLink className="text-link" message={custom.whatsappMessage}>
              Ceritakan idemu <ArrowIcon />
            </OrderLink>
          </article>

          <article className="price-card price-card-addons">
            <span className="price-label">Layanan tambahan</span>
            {addons.map((addon) => (
              <div className="addon" key={addon.title}>
                <div>
                  <h3>{addon.title}</h3>
                  <p>{addon.description}</p>
                </div>
                <strong>{addon.price}</strong>
              </div>
            ))}
          </article>
        </div>
      </div>

      <div className="vendor-inquiry">
        <div>
          <span className="price-label">{partner.label}</span>
          <h3>{partner.title}</h3>
          <p>{partner.description}</p>
        </div>
        <OrderLink className="button button-outline" message={partner.whatsappMessage}>
          Jadi partner kami
          <ArrowIcon />
        </OrderLink>
      </div>

      <p className="pricing-note">{note}</p>
    </section>
  );
}
