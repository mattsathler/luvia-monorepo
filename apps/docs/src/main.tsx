import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './src/docs/App'
import "luv-ui/styles.css";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App></App>
  </StrictMode>,
)
