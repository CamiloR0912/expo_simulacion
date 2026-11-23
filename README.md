# Diapositivas de «Cuarentena» · ExpoSimu 2026

Presentación del proyecto en React + Vite. Recorre la historia del juego, los modelos de simulación y el
funcionamiento del juego. Una curva SIR calculada con el mismo RK4 del proyecto sirve de línea de tiempo, y
cada modelo se muestra corriendo en vivo con los generadores del taller anterior.

## Cómo presentarla

```bash
npm install
npm run build
npm run preview        # abre http://localhost:4173
```

`npm run dev` sirve para editar con recarga en caliente. Una vez instalada no necesita conexión: las fuentes,
las capturas y los datos van incluidos.

| Tecla | Acción |
|---|---|
| → / Espacio / Av Pág | Diapositiva siguiente |
| ← / Re Pág / Retroceso | Diapositiva anterior |
| Inicio / Fin | Primera / última |
| F | Pantalla completa |
| P | Pausar o reanudar las simulaciones |

También se puede navegar con las flechas y los nombres de sección de la banda inferior. La dirección
`#12` en la URL abre directamente la diapositiva 12.

Las simulaciones tienen botones propios (por ejemplo «Elena hace ruido» o «c = 3»); se pulsan con el ratón.

## Qué editar

| Archivo | Contenido |
|---|---|
| `src/diapositivas.tsx` | El texto y el orden de las 23 diapositivas. `EQUIPO`, al inicio, son los nombres de la portada. |
| `src/sims.tsx` | Las simulaciones en vivo (caminata, cola, Monte Carlo, enjambre, SIR, Markov, generadores). |
| `src/sim/` | Generadores y fórmulas, portados de `juego/modelos/`. |
| `src/index.css` | Estilos. El escenario mide 1920×1080 y se escala a la ventana. |
| `public/juego/` | Capturas, retratos y sprites tomados del juego. |

Las cifras de validación salen de `modelos/README.md`. Si se vuelven a ejecutar las validaciones y cambian,
hay que actualizarlas en `src/diapositivas.tsx`.

## Pendiente

- Reemplazar `Apellido1 · Apellido2 · Apellido3` en `src/diapositivas.tsx`.
- Las capturas de `public/juego/capturas/` se generaron con Godot; si el juego cambia, conviene regenerarlas.
