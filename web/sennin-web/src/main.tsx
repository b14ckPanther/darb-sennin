import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import '@fontsource/zen-antique/latin-400.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const root = document.getElementById('root')
if (!root) {
  throw new Error('Missing #root element in index.html')
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
