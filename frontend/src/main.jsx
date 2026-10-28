import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'

// Global Fetch Interceptor for Vault Authentication
const originalFetch = window.fetch;
window.fetch = async (input, init = {}) => {
  const token = localStorage.getItem('riftbard_vault_token') || sessionStorage.getItem('riftbard_vault_token');
  const url = typeof input === 'string' ? input : (input && input.url ? input.url : '');

  // Only inject Authorization header to our own backend API endpoints
  if (token && (url.includes('/api/') || url.startsWith('/api'))) {
    init = init || {};
    init.headers = {
      ...init.headers,
      'Authorization': `Bearer ${token}`
    };
  }

  const response = await originalFetch(input, init);

  // If unauthorized on our API, trigger lock event (ignore auth and public routes)
  if (response.status === 401 && (url.includes('/api/') || url.startsWith('/api')) && !url.includes('/api/auth/') && !url.includes('/api/public/')) {
    localStorage.removeItem('riftbard_vault_token');
    sessionStorage.removeItem('riftbard_vault_token');
    window.dispatchEvent(new Event('vault_locked'));
  }

  return response;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
