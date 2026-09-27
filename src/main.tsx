import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import App from './App.tsx';
import CherryTemplate from './components/templates/CherryTemplate.tsx';
import SageTemplate from './components/templates/SageTemplate.tsx';
import BatikTemplate from './components/templates/BatikTemplate.tsx';
import NoirTemplate from './components/templates/NoirTemplate.tsx';
import IndigoTemplate from './components/templates/IndigoTemplate.tsx';
import LaLaLandTemplate from './components/templates/LaLaLandTemplate.tsx';
import ComingSoonPage from './components/ComingSoonPage.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/template/cherry" element={<CherryTemplate />} />
        <Route path="/template/sage" element={<SageTemplate />} />
        <Route path="/template/batik" element={<BatikTemplate />} />
        <Route path="/template/noir" element={<NoirTemplate />} />
        <Route path="/template/indigo" element={<IndigoTemplate />} />
        <Route path="/template/lalaland" element={<LaLaLandTemplate />} />
        <Route path="/harga" element={<ComingSoonPage title="Harga & Paket" />} />
        <Route path="/faq" element={<ComingSoonPage title="FAQ" />} />
        <Route path="/blog" element={<ComingSoonPage title="Blog & Jurnal" />} />
        <Route path="/testimoni" element={<ComingSoonPage title="Cerita Pasangan" />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
