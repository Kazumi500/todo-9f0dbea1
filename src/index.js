import './styles/style.css';
import { initUI } from './modules/dom.js';

function hideAppLoader() {
  const loader = document.getElementById('app-loader');
  if (!loader) return;
  loader.classList.add('is-hidden');
  // Remove from DOM after the fade transition completes (350ms + buffer)
  setTimeout(() => loader.remove(), 500);
}

document.addEventListener('DOMContentLoaded', () => {
  initUI();
  hideAppLoader();
});

// Safety net so the loader never gets stuck (e.g. script error during init)
setTimeout(hideAppLoader, 8000);
