import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import App from './App';
import './styles/tailwind.css';
import './styles.css';
import './styles/category-bottom-bar.css';
import './styles/floating-accessory-carousel.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </HashRouter>
  </StrictMode>
);
