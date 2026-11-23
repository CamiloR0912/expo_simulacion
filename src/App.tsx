// Motor de la presentación: escenario de 1920×1080 escalado a la ventana, navegación por teclado
// y la banda «Pulso de la ciudad», cuya curva SIR sirve de línea de tiempo de toda la exposición.
import { useEffect, useState } from 'react'
import { DIAPOSITIVAS, SECCIONES } from './diapositivas'
import { coma, sir } from './sim/modelos'
import { C, Pausa } from './tema'

const DIAS = 150
const SERIE = sir(0.3, 0.1, DIAS)
const TOTAL = DIAPOSITIVAS.length

function trazo(campo: 's' | 'i' | 'r') {
  return SERIE.map((p, k) => `${k ? 'L' : 'M'}${((p.t / DIAS) * 1000).toFixed(1)},${(96 - p[campo] * 92).toFixed(1)}`).join('')
}
const TRAZOS = { s: trazo('s'), i: trazo('i'), r: trazo('r') }

function indiceDeHash() {
  const n = parseInt(window.location.hash.slice(1), 10)
  return Number.isFinite(n) ? Math.min(TOTAL, Math.max(1, n)) - 1 : 0
}

function Flecha({ izquierda }: { izquierda?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" style={izquierda ? { transform: 'scaleX(-1)' } : undefined}>
      <path d="M6 3h4v4h4v4h4v2h-4v4h-4v4H6v-4h4v-4H6z" fill="currentColor" />
    </svg>
  )
}

function Pulso({ idx, portada, ir }: { idx: number; portada: boolean; ir: (n: number) => void }) {
  const avance = TOTAL > 1 ? idx / (TOTAL - 1) : 0
  const hoy = SERIE[Math.round(avance * DIAS)]
  return (
    <footer className={portada ? 'pulso pulso-portada' : 'pulso'}>
      <div className="pulso-cabecera">
        <span>Pulso de la ciudad · modelo SIR · RK4</span>
        <span className="pulso-dia">
          Día {hoy.t} · I/N = {coma(hoy.i * 100, 1)} %
        </span>
  <div className="pulso-nav">
          <button type="button" aria-label="Diapositiva anterior" disabled={idx === 0} onClick={() => ir(idx - 1)}>
            <Flecha izquierda />
          </button>
          <span>
            {idx + 1} / {TOTAL}
          </span>
          <button type="button" aria-label="Diapositiva siguiente" disabled={idx === TOTAL - 1} onClick={() => ir(idx + 1)}>
            <Flecha />
          </button>
        </div>
      </div>
      <div className="pulso-curva">
        <svg viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true">
          <line x1="0" x2="1000" y1={96 - 0.2 * 92} y2={96 - 0.2 * 92} stroke={C.ambar} strokeWidth="1.5" strokeDasharray="8 6" vectorEffect="non-scaling-stroke" />
          <g className="pulso-tenue" opacity="0.28">
            <path d={TRAZOS.s} fill="none" stroke={C.azul} strokeWidth="4" vectorEffect="non-scaling-stroke" />
            <path d={TRAZOS.r} fill="none" stroke={C.blanco} strokeWidth="4" vectorEffect="non-scaling-stroke" />
            <path d={TRAZOS.i} fill="none" stroke={C.rojo} strokeWidth="5" vectorEffect="non-scaling-stroke" />
          </g>
        </svg>
        <div className="pulso-recorrido" style={{ width: `${avance * 100}%` }}>
          <svg viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true">
            <path d={TRAZOS.s} fill="none" stroke={C.azul} strokeWidth="4" vectorEffect="non-scaling-stroke" />
            <path d={TRAZOS.r} fill="none" stroke={C.blanco} strokeWidth="4" vectorEffect="non-scaling-stroke" />
            <path d={TRAZOS.i} fill="none" stroke={C.rojo} strokeWidth="6" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
        <div className="pulso-marcador" style={{ left: `${avance * 100}%` }} />
      </div>
      <nav className="pulso-secciones" aria-label="Secciones">
        {SECCIONES.map((s) => {
          const fin = SECCIONES.find((o) => o.desde > s.desde)?.desde ?? TOTAL
          const actual = idx >= s.desde && idx < fin
          return (
            <button key={s.nombre} type="button" className="pulso-seccion" aria-current={actual ? 'true' : undefined} style={{ left: `${(s.desde / (TOTAL - 1)) * 100}%`, transform: s.desde === TOTAL - 1 ? 'translateX(-100%)' : undefined }} onClick={() => ir(s.desde)}>
              {s.nombre}
            </button>
          )
        })}
      </nav>
    </footer>
  )
}

export default function App() {
  const [idx, setIdx] = useState(indiceDeHash)
  const [enPausa, setEnPausa] = useState(false)
  const [escala, setEscala] = useState(() => Math.min(window.innerWidth / 1920, window.innerHeight / 1080))

  const ir = (n: number) => {
    const destino = Math.min(TOTAL - 1, Math.max(0, n))
    window.location.hash = String(destino + 1)
    setIdx(destino)
  }

  useEffect(() => {
    const alRedimensionar = () => setEscala(Math.min(window.innerWidth / 1920, window.innerHeight / 1080))
    const alCambiarHash = () => setIdx(indiceDeHash())
    // ResizeObserver avisa también la primera vez: cubre ventanas que cambian de tamaño sin emitir «resize»
    const observador = new ResizeObserver(alRedimensionar)
    observador.observe(document.documentElement)
    window.addEventListener('resize', alRedimensionar)
    window.addEventListener('hashchange', alCambiarHash)
    return () => {
      observador.disconnect()
      window.removeEventListener('resize', alRedimensionar)
      window.removeEventListener('hashchange', alCambiarHash)
    }
  }, [])

  useEffect(() => {
    const alPulsar = (ev: KeyboardEvent) => {
      if (ev.ctrlKey || ev.metaKey || ev.altKey) return
      const enBoton = ev.target instanceof HTMLButtonElement
      switch (ev.key) {
        case 'ArrowRight':
        case 'PageDown':
          ir(idx + 1)
          break
        case ' ':
        case 'Enter':
          if (enBoton) return // el botón enfocado conserva su acción
          ir(idx + 1)
          break
        case 'ArrowLeft':
        case 'PageUp':
        case 'Backspace':
          ir(idx - 1)
          break
        case 'Home':
          ir(0)
          break
        case 'End':
          ir(TOTAL - 1)
          break
        case 'p':
        case 'P':
          setEnPausa((v) => !v)
          break
        case 'f':
        case 'F':
          if (document.fullscreenElement) document.exitFullscreen()
          else document.documentElement.requestFullscreen()
          break
        default:
          return
      }
      ev.preventDefault()
    }
    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  })

  const d = DIAPOSITIVAS[idx]
  return (
    <Pausa.Provider value={enPausa}>
      <div className="marco">
        <div className="escenario" style={{ transform: `translate(-50%, -50%) scale(${escala})` }}>
          <main key={idx} className={`diapositiva ${d.clase ?? ''}`} aria-live="polite">
            {d.contenido}
          </main>
          {enPausa && <div className="aviso-pausa">Simulaciones en pausa · P para reanudar</div>}
          <Pulso idx={idx} portada={idx === 0} ir={ir} />
        </div>
      </div>
    </Pausa.Provider>
  )
}
