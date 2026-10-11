import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CATALOG_TEMPLATES } from '../../data';
import type { Template } from '../../types';
import lalalandThumbnail from '../../assets/images/lalaland/lalaland-thumbnail.webp';
import notebookThumbnail from '../../assets/images/notebook/notebook-thumbnail.webp';
import friendsThumbnail from '../../assets/images/friends/friends-thumbnail.webp';
import crazyLoveThumbnail from '../../assets/images/crazylove/crazylove-thumbnail.webp';
import OrderLink from './OrderLink';
import { ArrowIcon } from './icons';

// Cover screenshots for the catalog cards. A template needs one here (and a route below)
// before it's set `visible` in data.ts.
const THUMBNAILS: Record<string, string> = {
  'tema-lalaland': lalalandThumbnail,
  'tema-notebook': notebookThumbnail,
  'tema-friends': friendsThumbnail,
  'tema-crazy-little-thing': crazyLoveThumbnail,
};

const ROUTES: Record<string, string> = {
  'tema-lalaland': '/template/lalaland',
  'tema-notebook': '/template/notebook',
  'tema-friends': '/template/friends',
  'tema-crazy-little-thing': '/template/crazy-little-thing',
  'tema-cherry': '/template/cherry',
  'tema-sage': '/template/sage',
  'tema-batik': '/template/batik',
  'tema-noir': '/template/noir',
  'tema-indigo': '/template/indigo',
};

const CATEGORY_LABELS: Record<Template['category'], string> = {
  film: 'Film',
  minimalist: 'Minimalis',
  floral: 'Floral',
  modern: 'Modern',
  vintage: 'Klasik',
};

/** 'TEMA LA LA LAND' -> 'La La Land' */
function themeName(tpl: Template) {
  return tpl.name
    .replace(/^TEMA\s+/i, '')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Categories of the visible templates, in catalog order. The filter only shows once there are
// at least two to choose between.
const CATEGORIES = [...new Set(CATALOG_TEMPLATES.map((tpl) => tpl.category))];

export default function Catalog() {
  const [activeCategory, setActiveCategory] = useState<Template['category'] | null>(null);
  const templates = activeCategory
    ? CATALOG_TEMPLATES.filter((tpl) => tpl.category === activeCategory)
    : CATALOG_TEMPLATES;

  return (
    <section className="catalog" id="template">
      <div className="catalog-heading">
        <div>
          <p className="section-kicker">Katalog template</p>
          <h2>Pilih suasana yang paling terasa seperti kalian.</h2>
        </div>
        <p>
          Setiap template sudah dirancang utuh dan siap diisi dengan detail pernikahanmu. Pilih tema,
          lihat contohnya, lalu pesan dengan mudah.
        </p>
      </div>

      {CATEGORIES.length > 1 && (
        <div className="catalog-filter" role="group" aria-label="Filter kategori template">
          {[null, ...CATEGORIES].map((category) => (
            <button
              aria-pressed={activeCategory === category}
              className={activeCategory === category ? 'active' : ''}
              key={category ?? 'semua'}
              onClick={() => setActiveCategory(category)}
              type="button"
            >
              {category ? CATEGORY_LABELS[category] : 'Semua tema'}
            </button>
          ))}
        </div>
      )}

      <div className="template-grid">
        {templates.map((tpl) => {
          const name = themeName(tpl);
          return (
            <article className="template-card" key={tpl.id}>
              <div className="template-preview">
                <img
                  src={THUMBNAILS[tpl.id]}
                  alt={`Sampul undangan Tema ${name}`}
                  width={780}
                  height={1040}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="template-info">
                <div className="template-title-row">
                  <h3>Tema {name}</h3>
                  <span>{CATEGORY_LABELS[tpl.category]}</span>
                </div>
                <p>{tpl.subtitle}</p>
                <div className="template-actions">
                  <Link to={ROUTES[tpl.id]}>Lihat contoh</Link>
                  <OrderLink message={`Halo nice mice, saya ingin pesan undangan digital Tema ${name}.`}>
                    Pesan
                    <ArrowIcon />
                  </OrderLink>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <p className="catalog-note">Tema baru, cerita baru. Segera hadir!</p>
    </section>
  );
}
