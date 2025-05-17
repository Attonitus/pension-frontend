import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import PensionApp from './PensionApp'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PensionApp />
  </StrictMode>,
)
