import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import App from './App.tsx';
import CherryTemplate from './components/templates/CherryTemplate.tsx';
import SageTemplate from './components/templates/SageTemplate.tsx';
import BatikTemplate from './components/templates/BatikTemplate.tsx';
import NoirTemplate from './components/templates/NoirTemplate.tsx';
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
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
