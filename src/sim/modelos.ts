// Fórmulas de los modelos, iguales a las de juego/modelos/*.gd.

export interface PuntoSIR {
  t: number
  s: number
  i: number
  r: number
}

/** SIR con RK4 (Δt = 0,1 día). Devuelve fracciones de la población por día. */
export function sir(beta: number, gamma: number, dias: number, n = 180000, i0 = 10): PuntoSIR[] {
  let s = n - i0
  let i = i0
  let r = 0
  const dt = 0.1
  const f = (s_: number, i_: number) => {
    const c = (beta * s_ * i_) / n
    return [-c, c - gamma * i_, gamma * i_]
  }
  const serie: PuntoSIR[] = [{ t: 0, s: s / n, i: i / n, r: 0 }]
  for (let d = 0; d < dias; d++) {
    for (let k = 0; k < 10; k++) {
      const k1 = f(s, i)
      const k2 = f(s + (dt / 2) * k1[0], i + (dt / 2) * k1[1])
      const k3 = f(s + (dt / 2) * k2[0], i + (dt / 2) * k2[1])
      const k4 = f(s + dt * k3[0], i + dt * k3[1])
      s += (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0])
      i += (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])
      r += (dt / 6) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2])
    }
    serie.push({ t: d + 1, s: s / n, i: i / n, r: r / n })
  }
  return serie
}

/** Erlang C: métricas teóricas de la cola M/M/c. */
export function erlangC(lam: number, mu: number, c: number) {
  const a = lam / mu
  const rho = a / c
  if (rho >= 1) return { rho, wq: Infinity, lq: Infinity }
  const fact = (k: number) => {
    let v = 1
    for (let j = 2; j <= k; j++) v *= j
    return v
  }
  let suma = 0
  for (let k = 0; k < c; k++) suma += a ** k / fact(k)
  const cola = a ** c / (fact(c) * (1 - rho))
  const p0 = 1 / (suma + cola)
  const lq = (p0 * a ** c * rho) / (fact(c) * (1 - rho) ** 2)
  return { rho, wq: lq / lam, lq }
}

/** Cadena de Markov del infectado (por minuto): Errante → Tosedor → Corredor. */
export const P_INFECTADO = [
  [0.9, 0.1, 0],
  [0, 0.85, 0.15],
  [0, 0, 1],
]

export function distribucion(pi0: number[], p: number[][], n: number) {
  let pi = pi0
  for (let k = 0; k < n; k++) {
    pi = p[0].map((_, j) => pi.reduce((acc, v, i) => acc + v * p[i][j], 0))
  }
  return pi
}

export const coma = (v: number, d = 2) => (Number.isFinite(v) ? v.toFixed(d).replace('.', ',') : '∞')
