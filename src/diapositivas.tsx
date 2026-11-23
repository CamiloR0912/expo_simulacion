// Contenido de la exposición: historia → modelos de simulación → funcionamiento del juego.
// Las cifras salen del GDD, de modelos/README.md y de las validaciones del proyecto.
import type { ReactNode } from 'react'
import { Captura, Modelo, Paso, Retrato, Sprite } from './piezas'
import { SimBoids, SimCaminata, SimCola, SimGeneradores, SimMarkov, SimMonteCarlo, SimSIR } from './sims'

/** Único dato pendiente: reemplazar por los apellidos del equipo. */
export const EQUIPO = 'Apellido1 · Apellido2 · Apellido3'

export interface Diapositiva {
  clase?: string
  contenido: ReactNode
}

export const DIAPOSITIVAS: Diapositiva[] = [
  // ------------------------------------------------------------------------------------------- portada
  {
    clase: 'd-portada',
    contenido: (
      <>
        <div className="portada-cielo" />
        <div className="portada-ciudad" />
        <img className="portada-logo" src="/juego/logo.png" alt="Cuarentena: La Fiebre Gris" width={1200} height={360} />
        <p className="portada-gancho">
          Una epidemia simulada en tiempo real. <strong>Pelear es curar.</strong>
        </p>
        <p className="portada-pie">
          {EQUIPO}
          <span>ExpoSimu 2026 · Simulación por Computador · UPTC</span>
        </p>
      </>
    ),
  },

  // ------------------------------------------------------------------------------------------ historia
  {
    clase: 'd-dos',
    contenido: (
      <>
        <div className="col-texto">
          <h1>Tunja, 2031</h1>
          <ul className="puntos">
            <Paso>Un virus respiratorio, «la Fiebre Gris», se propaga en pocos días.</Paso>
            <Paso>Los infectados pierden el juicio. No son zombis: son personas enfermas que aún pueden salvarse.</Paso>
            <Paso>El gobierno cierra la ciudad. Nadie entra y nadie sale.</Paso>
          </ul>
        </div>
        <div className="col-visual">
          <Captura archivo="dialogo_intro2" alt="Introducción del juego: Don Álvaro llama por radio a la doctora Ruiz" />
        </div>
      </>
    ),
  },
  {
    clase: 'd-ancha',
    contenido: (
      <>
        <h1>Tres voces en una ciudad cerrada</h1>
        <div className="voces">
          <div>
            <Retrato archivo="elena_portrait_determined" />
            <h2>Dra. Elena Ruiz</h2>
            <p>Médica residente. Sin armas de fuego: un tubo, jeringas y lo que sabe de medicina.</p>
          </div>
          <div>
            <Retrato archivo="alvaro_neutral" />
            <h2>Don Álvaro</h2>
            <p>La radio del hospital. Antes de cada salida calcula la probabilidad de volver.</p>
          </div>
          <div>
            <Retrato archivo="mena_hopeful" />
            <h2>Dra. Mena</h2>
            <p>Espera en el laboratorio. Con diez muestras virales puede sintetizar la cura.</p>
          </div>
        </div>
      </>
    ),
  },
  {
    clase: 'd-dos',
    contenido: (
      <>
        <div className="col-texto">
          <h1>Pelear es curar</h1>
          <p className="entrada">El combate no es letal. Un infectado neutralizado es un paciente.</p>
          <ol className="ciclo">
            <li>Sedar al infectado</li>
            <li>Cargarlo hasta la ambulancia</li>
            <li>Entra a la fila del hospital</li>
            <li>La epidemia pierde fuerza</li>
          </ol>
        </div>
        <div className="col-visual">
          <Captura archivo="nivel1" alt="Elena golpea a un infectado en el barrio; aparece el número de daño" />
        </div>
      </>
    ),
  },
  {
    clase: 'd-ancha',
    contenido: (
      <>
        <h1>Cada enemigo obedece a un modelo</h1>
        <div className="enemigos">
          {[
            ['errante', 'Errante', 'Caminata aleatoria'],
            ['tosedor', 'Tosedor', 'Caminata y difusión'],
            ['corredor', 'Corredor', 'Máquina de estados'],
            ['masa_a', 'Masa', 'Enjambre (boids)'],
            ['paciente_cero', 'Paciente Cero', 'Cadena de Markov'],
          ].map(([archivo, nombre, modelo]) => (
            <div key={archivo}>
              <Sprite archivo={archivo} escala={5} />
              <h2>{nombre}</h2>
              <p>{modelo}</p>
            </div>
          ))}
        </div>
      </>
    ),
  },

  // ------------------------------------------------------------------------------------------- modelos
  {
    clase: 'd-ancha',
    contenido: (
      <>
        <h1>Cinco mecánicas, cinco modelos</h1>
        <table className="tabla">
          <thead>
            <tr>
              <th>Mecánica del juego</th>
              <th>Modelo de simulación</th>
              <th>Generador</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Deambular de los infectados', 'Caminata aleatoria 2D', 'Congruencial lineal'],
              ['Triaje del hospital', 'Cola M/M/c', 'Multiplicativo (MINSTD)'],
              ['Combate, drops y radio', 'Monte Carlo', 'Aditivo (Fibonacci)'],
              ['Corredores, masas y ciudadanos', 'Basado en agentes', 'Congruencial lineal'],
              ['Pulso de la ciudad', 'Dinámica de sistemas (SIR)', 'Lineal, en la sensibilidad'],
            ].map((fila) => (
              <tr key={fila[0]}>
                {fila.map((celda, k) => (
                  <td key={k}>{celda}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="nota">Más una cadena de Markov para la progresión del infectado y las fases del jefe.</p>
      </>
    ),
  },
  {
    clase: 'd-dos',
    contenido: (
      <>
        <div className="col-texto">
          <h1>Los generadores son propios</h1>
          <p className="entrada">Vienen del taller anterior. El juego no usa el generador de Godot.</p>
          <div className="ecuaciones">
            <p>Lineal: a = 1 664 525, c = 1 013 904 223, m = 2³²</p>
            <p>Multiplicativo: a = 16 807, m = 2³¹ − 1</p>
            <p>
              Aditivo: x<sub>n</sub> = (x<sub>n−24</sub> + x<sub>n−55</sub>) mod 2³²
            </p>
          </div>
          <dl className="ficha">
            <dt>Pruebas</dt>
            <dd>Medias, varianza, χ², Kolmogórov-Smirnov y póker: los tres aprueban (N = 10 000, α = 0,05)</dd>
          </dl>
        </div>
        <div className="col-visual">
          <SimGeneradores />
        </div>
      </>
    ),
  },
  {
    clase: 'd-dos',
    contenido: (
      <Modelo
        titulo="Caminata aleatoria"
        seVe="Errantes y tosedores deambulan por casillas. El ruido de Elena sesga sus pasos hacia ella."
        ecuaciones={['Sin sesgo: p = 0,25 por dirección', 'E[R²] = n·ℓ²', 'Con ruido: p + b hacia la fuente, p − b/3 las demás']}
        validacion="E[R²] con n = 100: teórico 100, obtenido 100,79 (0,79 %)"
        generador="Congruencial lineal"
      >
        <SimCaminata />
      </Modelo>
    ),
  },
  {
    clase: 'd-dos',
    contenido: (
      <Modelo
        titulo="Cola M/M/c"
        seVe="El hospital. Los pacientes llegan al azar y el jugador decide cuántas camillas abrir. Quien espera más de seis minutos, abandona."
        ecuaciones={['Llegadas Poisson(λ), servicio Exp(μ)', 'ρ = λ / (c·μ)', 'W_q = L_q / λ   (Erlang C)']}
        validacion="W_q con λ = 1,5 y c = 2: teórico 1,286 min, obtenido 1,264 (1,67 %)"
        generador="Multiplicativo (MINSTD)"
      >
        <SimCola />
      </Modelo>
    ),
  },
  {
    clase: 'd-dos',
    contenido: (
      <Modelo
        titulo="Monte Carlo"
        seVe="Cada golpe, cada objeto que suelta un infectado y la probabilidad que anuncia la radio."
        ecuaciones={['D = X · (2 si es crítico)', 'E[D] = μ_X · (1 + p_crit)', 'Por la espalda: p_crit + 0,25']}
        validacion="E[D] del tubo: teórico 11,00, obtenido 11,05 (0,50 %)"
        generador="Aditivo (Fibonacci retrasado)"
      >
        <SimMonteCarlo />
      </Modelo>
    ),
  },
  {
    clase: 'd-dos',
    contenido: (
      <Modelo
        titulo="Agentes"
        seVe="Las masas se mueven como un enjambre. Los corredores patrullan, se alertan, persiguen y buscan. Los ciudadanos entran en pánico."
        ecuaciones={['Separación + alineación + cohesión', 'φ = |Σ v| / (N · v_max)', 'φ ≈ 1: movimiento coordinado']}
        validacion="φ con alineación: esperado 1,000, obtenido 0,991 (0,92 %)"
        generador="Congruencial lineal"
      >
        <SimBoids />
      </Modelo>
    ),
  },
  {
    clase: 'd-dos',
    contenido: (
      <Modelo
        titulo="Dinámica de sistemas"
        seVe="Los 180 000 habitantes de Tunja. Es la barra superior del juego y la curva de esta presentación."
        ecuaciones={['dS/dt = −β·S·I / N', 'dI/dt = β·S·I / N − γ·I', 'dR/dt = γ·I      R₀ = β / γ']}
        validacion="Pico I/N con R₀ = 3: teórico 0,3005, obtenido 0,3004 (0,01 %)"
        generador="Integración RK4, Δt = 0,1 día"
      >
        <SimSIR />
      </Modelo>
    ),
  },
  {
    clase: 'd-dos',
    contenido: (
      <Modelo
        titulo="Cadena de Markov"
        seVe="Un infectado que nadie atiende empeora con el tiempo. También decide las fases del Paciente Cero."
        ecuaciones={['Errante → Tosedor: 0,10 por minuto', 'Tosedor → Corredor: 0,15 por minuto', 'E[T] = 1/0,10 + 1/0,15 = 16,67 min']}
        validacion="Tiempo hasta Corredor: teórico 16,67 min, obtenido 16,78 (0,70 %)"
        generador="Congruencial lineal"
      >
        <SimMarkov />
      </Modelo>
    ),
  },
  {
    clase: 'd-ancha',
    contenido: (
      <>
        <h1>Todo está conectado</h1>
        <svg className="acople" viewBox="0 0 1760 600" role="img" aria-label="La epidemia define cuántos infectados aparecen; se mueven por caminata o como agentes; el combate los seda; los sedados llenan la cola del hospital, y los atendidos frenan la epidemia.">
          <defs>
            <marker id="punta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0 0L10 5L0 10z" fill="#B4BAC0" />
            </marker>
          </defs>
          <g fill="none" stroke="#B4BAC0" strokeWidth="5" markerEnd="url(#punta)">
            <path d="M330 150H470" />
            <path d="M810 110H950" />
            <path d="M810 200H870V330H950" />
            <path d="M1290 110H1390" />
            <path d="M1290 330H1345V200H1390" />
            <path d="M1575 250V410" />
            <path d="M1390 480H190V250" />
          </g>
          {[
            [30, 60, 300, 'SIR', 'la epidemia', '#E0503F'],
            [480, 60, 330, 'Aparición', 'más I/N, más infectados', '#B4BAC0'],
            [960, 60, 330, 'Caminata', 'errantes, tosedores', '#B5C95A'],
            [960, 280, 330, 'Agentes', 'corredores, masas', '#B5C95A'],
            [1400, 60, 350, 'Monte Carlo', 'daño, críticos, drops', '#E0A030'],
            [1400, 420, 350, 'Cola M/M/c', 'el hospital', '#4FA3D1'],
          ].map(([x, y, w, titulo, sub, color]) => (
            <g key={titulo as string}>
              <rect x={x as number} y={y as number} width={w as number} height="180" fill="#2B2F33" stroke={color as string} strokeWidth="6" />
              <text x={(x as number) + 24} y={(y as number) + 78} className="acople-titulo" fill="#EAF2F5">
                {titulo}
              </text>
              <text x={(x as number) + 24} y={(y as number) + 132} className="acople-sub" fill="#B4BAC0">
                {sub}
              </text>
            </g>
          ))}
          <text x="760" y="548" className="acople-sub" fill="#B5C95A">
            pacientes atendidos: sube γ
          </text>
          <text x="210" y="548" className="acople-sub" fill="#E0503F">
            abandonos: sube I
          </text>
        </svg>
      </>
    ),
  },
  {
    clase: 'd-ancha',
    contenido: (
      <>
        <h1>Lo simulado coincide con la teoría</h1>
        <table className="tabla tabla-numeros">
          <thead>
            <tr>
              <th>Modelo</th>
              <th>Medida</th>
              <th>Teórico</th>
              <th>Obtenido</th>
              <th>Diferencia</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Caminata aleatoria', 'E[R²], n = 100', '100', '100,79', '0,79 %'],
              ['Cola M/M/c', 'W_q, c = 2', '1,286', '1,264', '1,67 %'],
              ['Monte Carlo', 'E[D] del tubo', '11,00', '11,05', '0,50 %'],
              ['Agentes', 'Tamaño final del contagio', '0,9405', '0,9473', '0,72 %'],
              ['SIR', 'Pico I/N, R₀ = 3', '0,3005', '0,3004', '0,01 %'],
              ['Markov', 'Tiempo hasta Corredor', '16,67', '16,78', '0,70 %'],
            ].map((fila) => (
              <tr key={fila[0]}>
                {fila.map((celda, k) => (
                  <td key={k}>{celda}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="nota">Cada modelo se ejecuta solo, por consola, con tres configuraciones. Aquí, una por modelo.</p>
      </>
    ),
  },

  // ------------------------------------------------------------------------------------------ el juego
  {
    clase: 'd-ancha',
    contenido: (
      <>
        <h1>Cuatro niveles</h1>
        <div className="niveles">
          {[
            ['level_1_barrio', 'El barrio', 'Triaje de calle: tres sedados a la ambulancia y el antiviral.'],
            ['level_2_hospital', 'El hospital', 'Resistir tres noches gestionando las camillas.'],
            ['level_3_centro', 'El centro', 'Rescatar ocho ciudadanos y reunir cinco muestras.'],
            ['level_4_laboratorio', 'El laboratorio', 'Sedar al Paciente Cero y entregar diez muestras.'],
          ].map(([archivo, nombre, objetivo]) => (
            <div key={archivo}>
              <img src={`/juego/${archivo}.png`} alt="" width={400} height={225} className="captura" />
              <h2>{nombre}</h2>
              <p>{objetivo}</p>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    clase: 'd-dos',
    contenido: (
      <>
        <div className="col-texto">
          <h1>El barrio</h1>
          <p className="entrada">El retén del hospital no abre con las manos vacías.</p>
          <ul className="puntos">
            <Paso>Agachada hace menos ruido: los errantes no se sesgan hacia ella.</Paso>
            <Paso>Por la espalda, el crítico sube de 10 % a 35 %.</Paso>
            <Paso>Cargando a un sedado va lenta y no puede atacar.</Paso>
          </ul>
        </div>
        <div className="col-visual">
          <Captura archivo="dialogo_nivel1" alt="Nivel 1: Don Álvaro explica el triaje de calle por radio" />
        </div>
      </>
    ),
  },
  {
    clase: 'd-dos',
    contenido: (
      <>
        <div className="col-texto">
          <h1>El hospital</h1>
          <p className="entrada">De día se gestiona; de noche se defiende la entrada.</p>
          <ul className="puntos">
            <Paso>Cada camilla abierta gasta suministros.</Paso>
            <Paso>El panel compara el W_q medido con el de Erlang C.</Paso>
            <Paso>Sala llena veinte segundos: el hospital colapsa.</Paso>
          </ul>
        </div>
        <div className="col-visual">
          <Captura archivo="nivel2_noche" alt="Nivel 2 de noche, con el panel de la cola M/M/c" />
        </div>
      </>
    ),
  },
  {
    clase: 'd-ancha',
    contenido: (
      <>
        <h1>El centro y el laboratorio</h1>
        <div className="par">
          <figure>
            <Captura archivo="nivel3" alt="Nivel 3: la Plaza de Bolívar con masas, corredores y ciudadanos" ancho={840} />
            <figcaption>Masas, corredores y vecinos que rescatar.</figcaption>
          </figure>
          <figure>
            <Captura archivo="dialogo_jefe" alt="Nivel 4: aparece el Paciente Cero" ancho={840} />
            <figcaption>El Paciente Cero cambia de fase sin aviso.</figcaption>
          </figure>
        </div>
      </>
    ),
  },
  {
    clase: 'd-ancha',
    contenido: (
      <>
        <h1>La simulación, a la vista</h1>
        <div className="par">
          <figure>
            <Captura archivo="panel_f1" alt="Panel F1 con las métricas en vivo de los cinco modelos" ancho={840} />
            <figcaption>F1: cada modelo con su valor teórico al lado.</figcaption>
          </figure>
          <figure>
            <Captura archivo="briefing" alt="Briefing: la radio estima la probabilidad de volver" ancho={840} />
            <figcaption>La radio: probabilidad de volver con IC del 95 %.</figcaption>
          </figure>
        </div>
      </>
    ),
  },
  {
    clase: 'd-ancha',
    contenido: (
      <>
        <h1>Controles</h1>
        <div className="controles-juego">
          {[
            ['W A S D', 'Moverse'],
            ['Ratón · clic', 'Apuntar y atacar'],
            ['Shift', 'Agacharse: menos ruido'],
            ['Ctrl', 'Correr: más ruido'],
            ['E', 'Cargar a un sedado, usar estaciones'],
            ['Q · 1 a 4', 'Cambiar de arma'],
            ['F', 'Usar el consumible'],
            ['+  −', 'Abrir o cerrar camillas'],
            ['F1', 'Panel de simulación'],
            ['Esc', 'Pausa'],
          ].map(([tecla, accion]) => (
            <div key={tecla}>
              <kbd>{tecla}</kbd>
              <span>{accion}</span>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    clase: 'd-dos',
    contenido: (
      <>
        <div className="col-texto">
          <h1>Cómo está hecho</h1>
          <ul className="puntos">
            <Paso>Godot 4.7 y GDScript. Ejecutable de Windows y versión web.</Paso>
            <Paso>El juego usa las mismas clases que se validan por consola.</Paso>
            <Paso>Paso fijo de 60 Hz y semillas configurables: las partidas se pueden reproducir.</Paso>
            <Paso>Música y efectos sintetizados por código.</Paso>
          </ul>
        </div>
        <div className="col-visual">
          <Captura archivo="menu" alt="Menú principal del juego" />
        </div>
      </>
    ),
  },

  // -------------------------------------------------------------------------------------------- cierre
  {
    clase: 'd-cierre',
    contenido: (
      <>
        <div className="cierre-fondo" />
        <div className="cierre-texto">
          <h1>Tunja vuelve a respirar</h1>
          <p>Cada infectado neutralizado era una persona que podía volver a casa.</p>
          <p className="cierre-gracias">Gracias. ¿Preguntas?</p>
        </div>
      </>
    ),
  },
]

/** Secciones de la banda inferior: nombre y primera diapositiva (índice desde 0). */
export const SECCIONES = [
  { nombre: 'Historia', desde: 1 },
  { nombre: 'Modelos', desde: 5 },
  { nombre: 'El juego', desde: 15 },
  { nombre: 'Cierre', desde: 22 },
]
