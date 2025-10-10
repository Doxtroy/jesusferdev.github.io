import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'    // ← IMPORTANTE (Tailwind)
import './modern-effects.css' // CRT effects

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
