import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Guard against benign Vite HMR websocket closure in preview iframe
window.addEventListener('unhandledrejection', (event) => {
  const msg = event?.reason?.message || String(event?.reason || '');
  if (msg.includes('WebSocket') || msg.includes('websocket')) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(<App />);
