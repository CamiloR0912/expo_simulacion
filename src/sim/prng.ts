// Generadores del taller anterior, portados de juego/modelos/apellido1_apellido2_prng.gd.
// Misma semilla => misma secuencia que en el juego (a·x < 2^53, sin desbordamiento en doble precisión).

export interface Generador {
  nombre: string
  siguiente(): number // R ∈ [0, 1)
}

const M32 = 2 ** 32

export function lcg(semilla = 12345): Generador {
  let x = semilla
  return {
    nombre: 'Congruencial lineal',
    siguiente() {
      x = (1664525 * x + 1013904223) % M32
      return x / M32
    },
  }
}

export function minstd(semilla = 12345): Generador {
  const m = 2 ** 31 - 1
  let x = semilla
  return {
    nombre: 'Multiplicativo MINSTD',
    siguiente() {
      x = (16807 * x) % m
      return x / m
    },
  }
}

// x_n = (x_{n-24} + x_{n-55}) mod 2^32, sembrado con el lineal
export function aditivo(semilla = 12345, j = 24, k = 55): Generador {
  const semillas = lcg(semilla)
  const buf: number[] = []
  for (let i = 0; i < k; i++) buf.push(Math.floor(semillas.siguiente() * M32))
  let pos = 0
  return {
    nombre: 'Aditivo (Fibonacci retrasado)',
    siguiente() {
      const x = (buf[(pos + k - j) % k] + buf[pos]) % M32
      buf[pos] = x
      pos = (pos + 1) % k
      return x / M32
    },
  }
}

export const uniforme = (g: Generador, a: number, b: number) => a + (b - a) * g.siguiente()

export function exponencial(g: Generador, tasa: number) {
  const r = g.siguiente() || 1e-10
  return -Math.log(r) / tasa
}
