import {StrictMode, Suspense, lazy, useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter, Routes, Route, useLocation} from 'react-router-dom';
import App from './App.tsx';
import ComingSoonPage from './components/ComingSoonPage.tsx';
import NotFoundPage from './components/NotFoundPage.tsx';
import {track, trackPageView} from './analytics.ts';
import {loadFonts} from './loadFonts.ts';
import {PAGES, normalizePath, pageSeo} from './content/seo.ts';
import {isCouple} from './invitations/couples.ts';
import './index.css';

// The Worker writes each page's title and description into the HTML it serves, but moving
// between pages inside the app doesn't ask it again. This keeps the tab title (and the
// description) in step: the page's own text from content/seo.ts, or the homepage's elsewhere,
// loads the page's fonts, and counts the page view (and a demo's demo_view). A couple's page
// does its own once its invitation is loaded (CouplePage.tsx).
function PageMeta() {
  const {pathname} = useLocation();
  useEffect(() => {
    const page = pageSeo(pathname);
    const seo = page?.seo ?? PAGES['/'];
    document.title = seo.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', seo.description);
    if (isCouple(normalizePath(pathname).slice(1))) return;
    loadFonts(page ? (seo.theme ?? 'home') : 'other');
    trackPageView();
    if (seo.theme) track('demo_view', {theme: seo.theme});
  }, [pathname]);
  return null;
}

// Each template is its own chunk, downloaded only when its route is opened, so the
// homepage doesn't pay for template code.
const CherryTemplate = lazy(() => import('./components/templates/CherryTemplate.tsx'));
const SageTemplate = lazy(() => import('./components/templates/SageTemplate.tsx'));
const BatikTemplate = lazy(() => import('./components/templates/BatikTemplate.tsx'));
const NoirTemplate = lazy(() => import('./components/templates/NoirTemplate.tsx'));
const IndigoTemplate = lazy(() => import('./components/templates/IndigoTemplate.tsx'));
const LaLaLandTemplate = lazy(() => import('./components/templates/LaLaLandTemplate.tsx'));
const NotebookTemplate = lazy(() => import('./components/templates/NotebookTemplate.tsx'));
const FriendsTemplate = lazy(() => import('./components/templates/FriendsTemplate.tsx'));
const CrazyLoveTemplate = lazy(() => import('./components/templates/CrazyLoveTemplate.tsx'));
// A couple's invitation, nicemice.id/<slug> from src/couples/<slug>.ts. The site's own pages
// always win over it.
const CouplePage = lazy(() => import('./components/CouplePage.tsx'));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <PageMeta />
      <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/template/cherry" element={<CherryTemplate />} />
        <Route path="/template/sage" element={<SageTemplate />} />
        <Route path="/template/batik" element={<BatikTemplate />} />
        <Route path="/template/noir" element={<NoirTemplate />} />
        <Route path="/template/indigo" element={<IndigoTemplate />} />
        <Route path="/template/lalaland" element={<LaLaLandTemplate />} />
        <Route path="/template/notebook" element={<NotebookTemplate />} />
        <Route path="/template/friends" element={<FriendsTemplate />} />
        <Route path="/template/crazy-little-thing" element={<CrazyLoveTemplate />} />
        <Route path="/harga" element={<ComingSoonPage title="Harga & Paket" />} />
        <Route path="/faq" element={<ComingSoonPage title="FAQ" />} />
        <Route path="/blog" element={<ComingSoonPage title="Blog & Jurnal" />} />
        <Route path="/testimoni" element={<ComingSoonPage title="Cerita Pasangan" />} />
        <Route path="/:slug" element={<CouplePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
);
