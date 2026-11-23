// Piezas reutilizables de las diapositivas.
import type { ReactNode } from 'react'

export function Captura({ archivo, alt, ancho = 960 }: { archivo: string; alt: string; ancho?: number }) {
  return <img className="captura" src={`/juego/capturas/${archivo}.png`} alt={alt} width={ancho} height={(ancho * 9) / 16} />
}

export function Sprite({ archivo, escala = 3 }: { archivo: string; escala?: number }) {
  return <span className="sprite" role="img" aria-hidden="true" style={{ backgroundImage: `url(/juego/sprites/${archivo}.png)`, width: 64 * escala, height: 64 * escala, backgroundSize: `${512 * escala}px ${192 * escala}px` }} />
}

export function Retrato({ archivo }: { archivo: string }) {
  return <span className="retrato" role="img" aria-hidden="true" style={{ backgroundImage: `url(/juego/retratos/${archivo}.png)` }} />
}

/** Diapositiva de un modelo: a la izquierda qué se ve, la ecuación y la validación; a la derecha, el modelo corriendo. */
export function Modelo({ titulo, seVe, ecuaciones, validacion, generador, children }: { titulo: string; seVe: string; ecuaciones: ReactNode[]; validacion: string; generador: string; children: ReactNode }) {
  return (
    <>
      <div className="col-texto">
        <h1>{titulo}</h1>
        <p className="entrada">{seVe}</p>
        <div className="ecuaciones">
          {ecuaciones.map((e, k) => (
            <p key={k}>{e}</p>
          ))}
        </div>
        <dl className="ficha">
          <dt>Validación</dt>
          <dd>{validacion}</dd>
          <dt>Generador</dt>
          <dd>{generador}</dd>
        </dl>
      </div>
      <div className="col-visual">{children}</div>
    </>
  )
}

export function Paso({ children }: { children: ReactNode }) {
  return <li>{children}</li>
}
