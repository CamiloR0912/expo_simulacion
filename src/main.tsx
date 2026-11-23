import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/source-sans-3'
import './index.css'
import App from './App.tsx'

// Se espera a las fuentes antes de dibujar: así ninguna diapositiva aparece con texto en blanco
// y los rótulos de los lienzos salen en Pixel Operator desde el primer fotograma.
const fuentes = ['400 40px "Pixel Operator"', '700 40px "Pixel Operator"', '400 40px "Source Sans 3 Variable"', '600 40px "Source Sans 3 Variable"']

Promise.all(fuentes.map((f) => document.fonts.load(f, 'Aáñ²λ')))
  .catch(() => undefined)
  .finally(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
