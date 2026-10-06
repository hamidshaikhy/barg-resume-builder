import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/vazirmatn/wght.css'
import '@fontsource-variable/markazi-text/wght.css'
import '@fontsource/amiri/700.css'
import '@fontsource-variable/noto-naskh-arabic/wght.css'
import '@fontsource-variable/noto-sans-arabic/wght.css'
import './index.css'
import App from './App'

document.documentElement.lang = 'fa'
document.documentElement.dir = 'rtl'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
