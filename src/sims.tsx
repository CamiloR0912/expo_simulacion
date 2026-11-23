// Simulaciones en vivo de las diapositivas. Usan los mismos generadores y las mismas reglas que el juego.
import { useContext, useEffect, useRef, useState } from 'react'
import { C, Pausa } from './tema'
import { aditivo, exponencial, lcg, minstd, uniforme, type Generador } from './sim/prng'
import { coma, distribucion, erlangC, P_INFECTADO, sir } from './sim/modelos'

type Cuadro = (ctx: CanvasRenderingContext2D, dt: number) => void

/** Lienzo que llama a `cuadro` en cada fotograma mientras la presentación no esté en pausa. */
function Lienzo({ ancho, alto, cuadro, rotulo }: { ancho: number; alto: number; cuadro: Cuadro; rotulo: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const enPausa = useContext(Pausa)
  const fn = useRef(cuadro)
  useEffect(() => {
    fn.current = cuadro
  })
  useEffect(() => {
    const ctx = ref.current?.getContext('2d')
    if (!ctx) return
    let id = 0
    let antes = performance.now()
    const bucle = (ahora: number) => {
      const dt = Math.min(0.05, (ahora - antes) / 1000)
      antes = ahora
      fn.current(ctx, enPausa ? 0 : dt)
      id = requestAnimationFrame(bucle)
    }
    id = requestAnimationFrame(bucle)
    return () => cancelAnimationFrame(id)
  }, [enPausa])
  return <canvas ref={ref} width={ancho} height={alto} className="lienzo" role="img" aria-label={rotulo} />
}

function Dato({ nombre, valor, teorico, color }: { nombre: string; valor: string; teorico?: string; color?: string }) {
  return (
    <div className="dato">
      <span className="dato-nombre">{nombre}</span>
      <span className="dato-valor" style={color ? { color } : undefined}>
        {valor}
      </span>
      {teorico && <span className="dato-teorico">teórico {teorico}</span>}
    </div>
  )
}

function Opcion({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" className="opcion" aria-pressed={activo} onClick={onClick}>
      {children}
    </button>
  )
}

/** Refresca las lecturas unas pocas veces por segundo, no en cada fotograma. */
function useLecturas<T>(inicial: T) {
  const [lecturas, setLecturas] = useState(inicial)
  const reloj = useRef(0)
  const publicar = (dt: number, leer: () => T) => {
    reloj.current += dt
    if (reloj.current > 0.2) {
      reloj.current = 0
      setLecturas(leer())
    }
  }
  return [lecturas, publicar] as const
}

// ------------------------------------------------------------------------------------------ generadores

export function SimGeneradores() {
  const estado = useRef({ gens: [lcg(2026), minstd(2026), aditivo(2026)], n: 0, previos: [0.5, 0.5, 0.5], limpio: false })
  const [lect, publicar] = useLecturas({ n: 0 })
  const cuadro: Cuadro = (ctx, dt) => {
    const e = estado.current
    const lado = 280
    if (!e.limpio) {
      ctx.fillStyle = C.tinta
      ctx.fillRect(0, 0, 960, 300)
      e.limpio = true
    }
    if (dt > 0 && e.n < 6000) {
      const colores = [C.azul, C.verde, C.ambar]
      for (let k = 0; k < 24; k++) {
        e.gens.forEach((g, i) => {
          const u = g.siguiente()
          ctx.fillStyle = colores[i]
          ctx.fillRect(10 + i * 330 + e.previos[i] * lado, 10 + (1 - u) * lado, 4, 4)
          e.previos[i] = u
        })
        e.n++
      }
    }
    publicar(dt, () => ({ n: e.n }))
  }
  return (
    <div className="sim">
      <Lienzo ancho={960} alto={300} cuadro={cuadro} rotulo="Pares consecutivos de cada generador: sin patrón visible" />
      <div className="tres-rotulos">
        <span style={{ color: C.azul }}>Lineal</span>
        <span style={{ color: C.verde }}>Multiplicativo</span>
        <span style={{ color: C.ambar }}>Aditivo</span>
      </div>
      <div className="datos">
        <Dato nombre="Pares (uᵢ, uᵢ₊₁) dibujados" valor={String(lect.n)} />
      </div>
    </div>
  )
}

// ------------------------------------------------------------------------------- Modelo 1: caminata

const DIRS = [
  [0, -1],
  [0, 1],
  [1, 0],
  [-1, 0],
] // N, S, E, O (en pantalla +y baja)

export function SimCaminata() {
  const [ruido, setRuido] = useState(false)
  const cols = 43
  const filas = 26
  const celda = 20
  const estado = useRef({
    gen: lcg(12345) as Generador,
    reloj: 0,
    caminantes: Array.from({ length: 16 }, (_, k) => ({ x: 4 + ((k * 7) % 36), y: 3 + ((k * 5) % 20), rastro: [] as number[][] })),
    pasos: 0,
    haciaFuente: 0,
    conSesgo: 0,
  })
  const [lect, publicar] = useLecturas({ pasos: 0, frac: 0 })
  const fuente = { x: 21, y: 13 }

  const cuadro: Cuadro = (ctx, dt) => {
    const e = estado.current
    e.reloj += dt
    while (e.reloj > 0.09) {
      e.reloj -= 0.09
      for (const c of e.caminantes) {
        // p = 0,25 por dirección; la dirección hacia la fuente recibe p + b y las otras p − b/3
        const dx = fuente.x - c.x
        const dy = fuente.y - c.y
        const dist = Math.hypot(dx, dy)
        const b = ruido && dist > 0 && dist < 14 ? 0.3 * (1 - dist / 14) : 0
        const mejor = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 2 : 3) : dy > 0 ? 1 : 0
        const p = DIRS.map((_, k) => (b > 0 ? (k === mejor ? 0.25 + b : 0.25 - b / 3) : 0.25))
        const u = e.gen.siguiente()
        let k = 0
        let acumulada = p[0]
        while (u >= acumulada && k < 3) acumulada += p[++k]
        const nx = c.x + DIRS[k][0]
        const ny = c.y + DIRS[k][1]
        if (nx >= 0 && nx < cols && ny >= 0 && ny < filas) {
          c.rastro.push([c.x, c.y])
          if (c.rastro.length > 14) c.rastro.shift()
          c.x = nx
          c.y = ny
        }
        e.pasos++
        if (b > 0) {
          e.conSesgo++
          if (k === mejor) e.haciaFuente++
        }
      }
    }
    ctx.fillStyle = C.tinta
    ctx.fillRect(0, 0, cols * celda, filas * celda)
    ctx.fillStyle = C.asfalto
    for (let x = 0; x < cols; x++) for (let y = 0; y < filas; y++) ctx.fillRect(x * celda + 1, y * celda + 1, celda - 2, celda - 2)
    if (ruido) {
      ctx.strokeStyle = C.ambar
      ctx.lineWidth = 2
      ctx.setLineDash([6, 6])
      ctx.beginPath()
      ctx.arc((fuente.x + 0.5) * celda, (fuente.y + 0.5) * celda, 14 * celda, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])
    }
    for (const c of e.caminantes) {
      c.rastro.forEach(([x, y], k) => {
        ctx.globalAlpha = (k + 1) / 30
        ctx.fillStyle = C.verde
        ctx.fillRect(x * celda + 5, y * celda + 5, celda - 10, celda - 10)
      })
      ctx.globalAlpha = 1
      ctx.fillStyle = C.verde
      ctx.fillRect(c.x * celda + 2, c.y * celda + 2, celda - 4, celda - 4)
    }
    ctx.fillStyle = C.blanco
    ctx.fillRect(fuente.x * celda + 1, fuente.y * celda + 1, celda - 2, celda - 2)
    publicar(dt, () => ({ pasos: e.pasos, frac: e.conSesgo ? e.haciaFuente / e.conSesgo : 0 }))
  }

  return (
    <div className="sim">
      <Lienzo ancho={cols * celda} alto={filas * celda} cuadro={cuadro} rotulo="Infectados caminando al azar sobre una cuadrícula" />
      <div className="controles">
        <Opcion activo={!ruido} onClick={() => setRuido(false)}>
          Elena en silencio
        </Opcion>
        <Opcion activo={ruido} onClick={() => setRuido(true)}>
          Elena hace ruido
        </Opcion>
      </div>
      <div className="datos">
        <Dato nombre="Pasos" valor={String(lect.pasos)} />
        <Dato nombre="Pasos hacia la fuente" valor={ruido ? coma(lect.frac) : '—'} teorico="0,25 + b" color={C.ambar} />
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------------------- Modelo 2: cola

export function SimCola() {
  const [c, setC] = useState(2)
  const lam = 1.5
  const mu = 1
  const estado = useRef({
    gen: minstd(12345) as Generador,
    t: 0,
    proxima: 0.3,
    fila: [] as number[], // instantes de llegada
    camillas: [] as number[], // instante en que se libera cada camilla ocupada
    esperas: [] as number[],
    atendidos: 0,
  })
  const [lect, publicar] = useLecturas({ wq: 0, enCola: 0, atendidos: 0 })
  const teo = erlangC(lam, mu, c)

  const cuadro: Cuadro = (ctx, dt) => {
    const e = estado.current
    e.t += dt * 1.2 // 1 minuto de la cola ≈ 0,8 s
    const llenar = () => {
      while (e.camillas.length < c && e.fila.length > 0) {
        e.esperas.push(e.t - (e.fila.shift() as number))
        if (e.esperas.length > 400) e.esperas.shift()
        e.camillas.push(e.t + exponencial(e.gen, mu))
      }
    }
    if (dt > 0) {
      while (e.proxima <= e.t) {
        e.fila.push(e.proxima)
        e.proxima += exponencial(e.gen, lam)
      }
      const antes = e.camillas.length
      e.camillas = e.camillas.filter((fin) => fin > e.t)
      e.atendidos += antes - e.camillas.length
      llenar()
      if (e.fila.length > 60) e.fila.splice(0, e.fila.length - 60)
    }
    ctx.fillStyle = C.tinta
    ctx.fillRect(0, 0, 860, 360)
    // fila de espera
    ctx.font = '22px "Pixel Operator"'
    ctx.fillStyle = C.niebla
    ctx.fillText('SALA DE ESPERA', 20, 34)
    ctx.fillText('CAMILLAS', 640, 34)
    e.fila.slice(0, 44).forEach((_, k) => {
      ctx.fillStyle = k < 10 ? C.verde : C.rojo
      ctx.fillRect(560 - (k % 22) * 25, 70 + Math.floor(k / 22) * 44, 20, 34)
    })
    // camillas
    for (let k = 0; k < 4; k++) {
      const y = 60 + k * 72
      ctx.fillStyle = k < c ? C.concreto : C.asfalto
      ctx.fillRect(640, y, 190, 54)
      if (k < e.camillas.length) {
        ctx.fillStyle = C.azul
        ctx.fillRect(650, y + 10, 34, 34)
        const resto = Math.max(0, Math.min(1, (e.camillas[k] - e.t) / 3))
        ctx.fillStyle = C.blanco
        ctx.fillRect(696, y + 22, 120 * (1 - resto), 10)
      } else if (k >= c) {
        ctx.fillStyle = C.niebla
        ctx.fillText('CERRADA', 668, y + 34)
      }
    }
    publicar(dt, () => ({
      wq: e.esperas.length ? e.esperas.reduce((a, b) => a + b, 0) / e.esperas.length : 0,
      enCola: e.fila.length,
      atendidos: e.atendidos,
    }))
  }

  return (
    <div className="sim">
      <Lienzo ancho={860} alto={360} cuadro={cuadro} rotulo="Pacientes que llegan, esperan y pasan a las camillas abiertas" />
      <div className="controles">
        {[1, 2, 3, 4].map((n) => (
          <Opcion key={n} activo={c === n} onClick={() => setC(n)}>
            c = {n}
          </Opcion>
        ))}
      </div>
      <div className="datos">
        <Dato nombre="En espera" valor={String(lect.enCola)} color={lect.enCola > 10 ? C.rojo : undefined} />
        <Dato nombre="ρ = λ / cμ" valor={coma(teo.rho)} color={teo.rho >= 1 ? C.rojo : undefined} />
        <Dato nombre="W_q medido (min)" valor={coma(lect.wq)} teorico={teo.rho >= 1 ? 'inestable' : coma(teo.wq, 3)} color={C.ambar} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------- Modelo 3: Monte Carlo

export function SimMonteCarlo() {
  const [espalda, setEspalda] = useState(false)
  const nuevo = () => ({ gen: aditivo(12345) as Generador, n: 0, suma: 0, crit: 0, barras: new Array(34).fill(0), barrasCrit: new Array(34).fill(0), medias: [] as number[] })
  const estado = useRef(nuevo())
  const [lect, publicar] = useLecturas({ n: 0, media: 0, crit: 0 })
  const pCrit = espalda ? 0.35 : 0.1
  const esperado = 10 * (1 + pCrit)

  const cambiar = (v: boolean) => {
    estado.current = nuevo()
    setEspalda(v)
  }

  const cuadro: Cuadro = (ctx, dt) => {
    const e = estado.current
    if (dt > 0 && e.n < 20000) {
      for (let k = 0; k < 12; k++) {
        // D = X · (2 si crítico), X ~ U(8, 12), crítico ~ Bernoulli(p)
        const x = uniforme(e.gen, 8, 12)
        const critico = e.gen.siguiente() < pCrit
        const d = critico ? 2 * x : x
        const bin = Math.min(33, Math.floor((d - 8) * 2))
        if (critico) e.barrasCrit[bin]++
        else e.barras[bin]++
        e.n++
        e.suma += d
        if (critico) e.crit++
        if (e.n % 12 === 0) {
          e.medias.push(e.suma / e.n)
          if (e.medias.length > 400) e.medias.splice(0, 2)
        }
      }
    }
    ctx.fillStyle = C.tinta
    ctx.fillRect(0, 0, 860, 420)
    const max = Math.max(1, ...e.barras, ...e.barrasCrit)
    for (let b = 0; b < 34; b++) {
      const x = 14 + b * 24.5
      const h1 = (e.barras[b] / max) * 210
      const h2 = (e.barrasCrit[b] / max) * 210
      ctx.fillStyle = C.blanco
      ctx.fillRect(x, 236 - h1, 21, h1)
      ctx.fillStyle = C.rojo
      ctx.fillRect(x, 236 - h2, 21, h2)
    }
    ctx.font = '22px "Pixel Operator"'
    ctx.fillStyle = C.niebla
    for (const v of [8, 12, 16, 20, 24]) ctx.fillText(String(v), 6 + (v - 8) * 49, 264)
    ctx.fillStyle = C.blanco
    ctx.fillText('golpe normal', 600, 34)
    ctx.fillStyle = C.rojo
    ctx.fillText('crítico ×2', 600, 66)
    // convergencia de la media
    const y = (v: number) => 400 - ((v - (esperado - 2)) / 4) * 110
    ctx.strokeStyle = C.ambar
    ctx.setLineDash([8, 6])
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(14, y(esperado))
    ctx.lineTo(846, y(esperado))
    ctx.stroke()
    ctx.setLineDash([])
    ctx.strokeStyle = C.verde
    ctx.lineWidth = 3
    ctx.beginPath()
    e.medias.forEach((m, k) => {
      const px = 14 + (k / 400) * 832
      const py = Math.max(292, Math.min(418, y(m)))
      if (k === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    })
    ctx.stroke()
    publicar(dt, () => ({ n: e.n, media: e.n ? e.suma / e.n : 0, crit: e.n ? e.crit / e.n : 0 }))
  }

  return (
    <div className="sim">
      <Lienzo ancho={860} alto={420} cuadro={cuadro} rotulo="Histograma del daño del tubo y convergencia de la media" />
      <div className="controles">
        <Opcion activo={!espalda} onClick={() => cambiar(false)}>
          De frente
        </Opcion>
        <Opcion activo={espalda} onClick={() => cambiar(true)}>
          Por la espalda
        </Opcion>
      </div>
      <div className="datos">
        <Dato nombre="Ataques" valor={String(lect.n)} />
        <Dato nombre="Críticos" valor={coma(lect.crit, 3)} teorico={coma(pCrit)} color={C.rojo} />
        <Dato nombre="Daño medio" valor={coma(lect.media)} teorico={coma(esperado)} color={C.verde} />
      </div>
    </div>
  )
}

// ------------------------------------------------------------------------------- Modelo 4: agentes

export function SimBoids() {
  const [alineados, setAlineados] = useState(true)
  const N = 50
  const lado = 50
  const crear = () => {
    const gen = lcg(777)
    const px: number[] = []
    const py: number[] = []
    const vx: number[] = []
    const vy: number[] = []
    for (let i = 0; i < N; i++) {
      px.push(uniforme(gen, 0, lado))
      py.push(uniforme(gen, 0, lado))
    }
    for (let i = 0; i < N; i++) {
      const a = uniforme(gen, 0, Math.PI * 2)
      vx.push(Math.cos(a))
      vy.push(Math.sin(a))
    }
    return { gen, px, py, vx, vy, reloj: 0, phi: 0 }
  }
  const estado = useRef(crear())
  const [lect, publicar] = useLecturas({ phi: 0 })

  const cuadro: Cuadro = (ctx, dt) => {
    const e = estado.current
    // pesos de las configuraciones de validación: w_s = 0,6; w_c = 0,02; w_a = 0 o 0,9
    const wa = alineados ? 0.9 : 0
    const ruido = alineados ? 0.08 : 0.6
    const delta = (d: number) => (d > lado / 2 ? d - lado : d < -lado / 2 ? d + lado : d)
    e.reloj += dt
    while (e.reloj > 0.05) {
      e.reloj -= 0.05
      const nx: number[] = []
      const ny: number[] = []
      for (let i = 0; i < N; i++) {
        let sx = 0
        let sy = 0
        let ax = 0
        let ay = 0
        let cx = 0
        let cy = 0
        let n = 0
        for (let j = 0; j < N; j++) {
          if (i === j) continue
          const dx = delta(e.px[j] - e.px[i])
          const dy = delta(e.py[j] - e.py[i])
          const d2 = dx * dx + dy * dy
          if (d2 > 0 && d2 < 36) {
            n++
            sx -= dx / d2
            sy -= dy / d2
            ax += e.vx[j]
            ay += e.vy[j]
            cx += dx
            cy += dy
          }
        }
        let v0 = e.vx[i]
        let v1 = e.vy[i]
        if (n) {
          v0 += 0.6 * sx + wa * (ax / n - e.vx[i]) + (0.02 * cx) / n
          v1 += 0.6 * sy + wa * (ay / n - e.vy[i]) + (0.02 * cy) / n
        }
        const ang = uniforme(e.gen, 0, Math.PI * 2)
        v0 += ruido * Math.cos(ang)
        v1 += ruido * Math.sin(ang)
        const norma = Math.hypot(v0, v1) || 1
        nx.push(v0 / norma)
        ny.push(v1 / norma)
      }
      e.vx = nx
      e.vy = ny
      let tx = 0
      let ty = 0
      for (let i = 0; i < N; i++) {
        e.px[i] = (e.px[i] + e.vx[i] * 0.35 + lado) % lado
        e.py[i] = (e.py[i] + e.vy[i] * 0.35 + lado) % lado
        tx += e.vx[i]
        ty += e.vy[i]
      }
      e.phi = Math.hypot(tx, ty) / N
    }
    const k = 10.4
    ctx.fillStyle = C.tinta
    ctx.fillRect(0, 0, 860, 520)
    for (let i = 0; i < N; i++) {
      const x = e.px[i] * 17.2
      const y = e.py[i] * k
      ctx.strokeStyle = C.enfermo
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x - e.vx[i] * 18, y - e.vy[i] * 18)
      ctx.stroke()
      ctx.fillStyle = C.verde
      ctx.fillRect(x - 6, y - 6, 12, 12)
    }
    publicar(dt, () => ({ phi: e.phi }))
  }

  return (
    <div className="sim">
      <Lienzo ancho={860} alto={520} cuadro={cuadro} rotulo="Enjambre de cincuenta individuos" />
      <div className="controles">
        <Opcion activo={!alineados} onClick={() => setAlineados(false)}>
          Sin alineación
        </Opcion>
        <Opcion activo={alineados} onClick={() => setAlineados(true)}>
          Con alineación
        </Opcion>
      </div>
      <div className="datos">
        <Dato nombre="Parámetro de orden φ" valor={coma(lect.phi)} teorico={alineados ? '→ 1' : '≈ 0,14'} color={C.verde} />
      </div>
    </div>
  )
}

// ------------------------------------------------------------------------------------ Modelo 5: SIR

export function SimSIR() {
  const [cubrebocas, setCubrebocas] = useState(0)
  const [hospital, setHospital] = useState(false)
  const beta = 0.3 * (1 - 0.4 * cubrebocas)
  const gamma = 0.1 + (hospital ? 0.03 : 0)
  const serie = sir(beta, gamma, 180)
  const pico = Math.max(...serie.map((p) => p.i))
  const W = 860
  const H = 420
  const x = (t: number) => (t / 180) * W
  const y = (v: number) => H - v * H
  const linea = (campo: 's' | 'i' | 'r') => serie.map((p, k) => `${k ? 'L' : 'M'}${x(p.t).toFixed(1)},${y(p[campo]).toFixed(1)}`).join('')
  return (
    <div className="sim">
      <svg viewBox={`0 0 ${W} ${H}`} className="grafica" role="img" aria-label="Curvas de sanos, infectados y recuperados">
        <rect width={W} height={H} fill={C.tinta} />
        <line x1="0" x2={W} y1={y(0.2)} y2={y(0.2)} stroke={C.ambar} strokeWidth="3" strokeDasharray="12 10" />
        <text x="12" y={y(0.2) - 10} fill={C.ambar} className="rotulo-svg">
          colapso: I/N = 20 %
        </text>
        <path d={linea('s')} fill="none" stroke={C.azul} strokeWidth="6" />
        <path d={linea('r')} fill="none" stroke={C.blanco} strokeWidth="6" />
        <path d={linea('i')} fill="none" stroke={C.rojo} strokeWidth="8" />
      </svg>
      <div className="controles">
        {[0, 0.5, 1].map((f) => (
          <Opcion key={f} activo={cubrebocas === f} onClick={() => setCubrebocas(f)}>
            Cubrebocas {f * 100} %
          </Opcion>
        ))}
        <Opcion activo={hospital} onClick={() => setHospital(!hospital)}>
          Hospital atiende
        </Opcion>
      </div>
      <div className="datos">
        <Dato nombre="R₀ = β / γ" valor={coma(beta / gamma)} />
        <Dato nombre="Pico de infectados" valor={`${coma(pico * 100, 1)} %`} color={pico > 0.2 ? C.rojo : C.verde} />
      </div>
    </div>
  )
}

// ------------------------------------------------------------------------------------------- Markov

export function SimMarkov() {
  const N = 300
  const estado = useRef({ gen: lcg(4242) as Generador, tipos: new Array(N).fill(0) as number[], minuto: 0, reloj: 0 })
  const [lect, publicar] = useLecturas({ minuto: 0, cuenta: [N, 0, 0] })
  const colores = [C.verde, C.ambar, C.rojo]
  const cuadro: Cuadro = (ctx, dt) => {
    const e = estado.current
    e.reloj += dt
    if (e.reloj > 0.7 && e.minuto < 40) {
      e.reloj = 0
      e.minuto++
      e.tipos = e.tipos.map((t) => {
        const u = e.gen.siguiente()
        const fila = P_INFECTADO[t]
        return u < fila[0] ? 0 : u < fila[0] + fila[1] ? 1 : 2
      })
    }
    ctx.fillStyle = C.tinta
    ctx.fillRect(0, 0, 860, 260)
    e.tipos.forEach((t, k) => {
      ctx.fillStyle = colores[t]
      ctx.fillRect(10 + (k % 30) * 28, 10 + Math.floor(k / 30) * 24.5, 22, 19)
    })
    publicar(dt, () => ({ minuto: e.minuto, cuenta: [0, 1, 2].map((t) => e.tipos.filter((v) => v === t).length) }))
  }
  const teo = distribucion([1, 0, 0], P_INFECTADO, lect.minuto)
  return (
    <div className="sim">
      <Lienzo ancho={860} alto={260} cuadro={cuadro} rotulo="Trescientos infectados que cambian de tipo minuto a minuto" />
      <div className="datos">
        <Dato nombre="Minuto" valor={String(lect.minuto)} />
        {['Errante', 'Tosedor', 'Corredor'].map((nombre, t) => (
          <Dato key={nombre} nombre={nombre} valor={coma(lect.cuenta[t] / N)} teorico={coma(teo[t])} color={colores[t]} />
        ))}
      </div>
    </div>
  )
}
