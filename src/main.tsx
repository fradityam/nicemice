import {StrictMode, Suspense, lazy} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import App from './App.tsx';
import ComingSoonPage from './components/ComingSoonPage.tsx';
import './index.css';

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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
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
        <Route path="/harga" element={<ComingSoonPage title="Harga & Paket" />} />
        <Route path="/faq" element={<ComingSoonPage title="FAQ" />} />
        <Route path="/blog" element={<ComingSoonPage title="Blog & Jurnal" />} />
        <Route path="/testimoni" element={<ComingSoonPage title="Cerita Pasangan" />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
);
