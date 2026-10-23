import { CONTACT_INSTAGRAM, CONTACT_WHATSAPP } from '../config';
import { FAQS, PRICING } from './homeInfo';
import { SITE_URL } from './seo';

// The homepage's structured data (JSON-LD) for search engines: who Nice Mice is
// (Organization, WebSite), what it sells and for how much (Service with its offers), and the
// FAQ. Built from the same prices, FAQ and contacts as the page, so they always match. The
// Worker (worker/index.ts) writes it into the homepage's <head>.

const ORGANIZATION_ID = `${SITE_URL}/#organization`;

/** 'Rp149.000', '+Rp80.000', 'Mulai Rp99.000' → 149000, 80000, 99000. */
const rupiah = (price: string) => Number(price.replace(/\D/g, ''));

/** An offer's price: exact, or a starting price ("Mulai …") as a minimum. */
function offerPrice(price: string, startsFrom = /^mulai/i.test(price)) {
  return startsFrom
    ? { priceSpecification: { '@type': 'PriceSpecification', minPrice: rupiah(price), priceCurrency: 'IDR' } }
    : { price: rupiah(price), priceCurrency: 'IDR' };
}

function homepageGraph() {
  const { regular, custom, addons } = PRICING;
  const regularOffer = {
    '@type': 'Offer',
    name: regular.label,
    description: regular.description,
    url: `${SITE_URL}/#harga`,
    ...offerPrice(regular.price),
    // The struck-through price, while there's a promo.
    ...(regular.originalPrice
      ? {
          priceSpecification: [
            { '@type': 'UnitPriceSpecification', price: rupiah(regular.price), priceCurrency: 'IDR' },
            { '@type': 'UnitPriceSpecification', priceType: 'https://schema.org/ListPrice', price: rupiah(regular.originalPrice), priceCurrency: 'IDR' },
          ],
        }
      : {}),
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ORGANIZATION_ID,
        name: 'Nice Mice',
        url: `${SITE_URL}/`,
        logo: `${SITE_URL}/icon-512.png`,
        ...(CONTACT_WHATSAPP
          ? {
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: `+${CONTACT_WHATSAPP.replace(/\D/g, '')}`,
                contactType: 'customer service',
                availableLanguage: 'Indonesian',
              },
            }
          : {}),
        ...(CONTACT_INSTAGRAM ? { sameAs: [CONTACT_INSTAGRAM] } : {}),
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: 'Nice Mice',
        url: `${SITE_URL}/`,
        inLanguage: 'id-ID',
        publisher: { '@id': ORGANIZATION_ID },
      },
      {
        '@type': 'Service',
        name: 'Undangan Pernikahan Digital',
        serviceType: 'Undangan pernikahan digital',
        provider: { '@id': ORGANIZATION_ID },
        areaServed: { '@type': 'Country', name: 'Indonesia' },
        url: `${SITE_URL}/`,
        offers: [
          regularOffer,
          { '@type': 'Offer', name: custom.label, description: custom.description, url: `${SITE_URL}/#harga`, ...offerPrice(custom.price, true) },
          ...addons.map((addon) => ({ '@type': 'Offer', name: addon.title, description: addon.description, ...offerPrice(addon.price) })),
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQS.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      },
    ],
  };
}

/** The homepage's JSON-LD, safe to put inside a <script> tag. */
export const HOMEPAGE_JSON_LD = JSON.stringify(homepageGraph()).replace(/</g, '\\u003c');
