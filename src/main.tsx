import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';

const root = document.getElementById('root');
if (!root) throw new Error('#root is missing from index.html');

// The control panel is its own chunk: visitors never download it.
const AdminApp = lazy(() => import('./admin/AdminApp'));
const isPanel = window.location.pathname === '/aboli' || window.location.pathname.startsWith('/aboli/');

createRoot(root).render(
  <StrictMode>
    {isPanel ? (
      <Suspense fallback={null}>
        <AdminApp />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
);
