import React from 'react'
import ReactDOM from 'react-dom/client'

const App = () => (
  <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
    <h1>🍳 FlavorForked</h1>
    <p>Phase 1: Foundation Complete ✅</p>
    <ul>
      <li>✅ MongoDB connected and seeded</li>
      <li>✅ 15 ingredients loaded</li>
      <li>✅ 16 synonyms loaded</li>
      <li>✅ 10 nutrition records loaded</li>
      <li>✅ 4 cuisines loaded</li>
      <li>✅ 5 recipe templates loaded</li>
    </ul>
    <p>
      <strong>Next:</strong> Phase 2 - Auth + Profiles + Onboarding
    </p>
  </div>
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
