# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Un equipo de estudiantes de Simulación por Computador (8.º semestre, UPTC) que expone su proyecto final en ExpoSimu 2026. Presentan de pie, proyectando desde un portátil, y hablan sobre cada diapositiva. La audiencia son el docente (Alex Puertas González), que evalúa, y los demás grupos del curso, sentados a distancia de una pantalla de proyector.

## Product Purpose

Diapositivas de apoyo para una exposición de 15 a 25 minutos sobre el videojuego «Cuarentena». Deben recorrer, en este orden: la historia del juego, los modelos de simulación implementados y el funcionamiento del juego. Tiene éxito si la audiencia entiende qué modelo hay detrás de cada cosa que ve en el juego y el docente reconoce los cinco modelos exigidos.

## Positioning

El juego no usa la simulación como adorno: cinco modelos validados (caminata aleatoria, cola M/M/c, Monte Carlo, agentes, SIR) y una cadena de Markov están acoplados entre sí y cada uno gobierna algo visible. El gancho narrativo es que el combate no es letal: neutralizar a un infectado lo convierte en paciente. «Pelear es curar».

## Operating Context

- Se proyecta a pantalla completa en un aula; se avanza con teclado o control de presentación.
- Los presentadores hablan: la diapositiva es apoyo visual, no el guion.
- La demo en vivo o el video de gameplay van aparte; las diapositivas llevan capturas reales del juego.
- El proyecto es React 19 + Vite + TypeScript (`expo_simulacion/`), sin dependencias adicionales.

## Capabilities and Constraints

- Contenido fijado por el usuario: 1) historia, 2) modelos de simulación, 3) funcionamiento del juego.
- Los datos (ecuaciones, parámetros, resultados de validación, controles, niveles) salen de `GDD_Cuarentena.md`, `README.md`, `modelos/README.md` y el código en `juego/`. No se inventan cifras.
- Los nombres del equipo aún no están definidos (en todo el proyecto figuran como `apellido1_apellido2`): quedan como un único dato editable.
- Debe funcionar sin conexión (el aula puede no tener red).

## Brand Commitments

- Nombre: «Cuarentena», subtítulo «La Fiebre Gris». Logo y arte del juego en `juego/assets/`.
- Paleta e identidad del juego documentadas en `designs/00_art_style_guide.md` y GDD §12 (pixel art, atmósfera apagada, fría y clínica; el color como información).
- Fuente del juego: Pixel Operator (CC0), en `juego/assets/fonts/`.
- Idioma: español. Tono del taller: técnico e impersonal.

## Evidence on Hand

- Capturas reales del juego generables con Godot (menú, intro, niveles, hospital, panel F1, briefing, victoria).
- Retratos, sprites, logo, tarjetas de nivel y fondos del menú en `juego/assets/`.
- Gráficos de validación en `modelos/resultados/<modelo>/*.png` y tabla de resultados en `modelos/README.md`.
- No hay video de gameplay todavía ni fotos del equipo: no se fabrican.

## Product Principles

1. Cada modelo se explica por lo que el jugador ve, y luego por su ecuación.
2. Cifras reales del proyecto, con su valor teórico al lado.
3. La diapositiva apoya al presentador: una idea por pantalla, legible desde el fondo del aula.
4. El orden pedido (historia → modelos → funcionamiento) no se altera.

## Accessibility & Inclusion

Legibilidad a distancia en proyector (texto grande, contraste alto). Navegación completa por teclado.
