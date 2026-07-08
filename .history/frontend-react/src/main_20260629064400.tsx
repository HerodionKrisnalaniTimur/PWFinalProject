import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./index.css";
import App from './App.tsx'
import { PointsProvider } from './context/PointsContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PointsProvider>
     <App />
    </PointsProvider>
  </StrictMode>,
)