// Colores del juego y contexto de pausa compartidos por las simulaciones y el motor.
import { createContext } from 'react'

export const C = {
  tinta: '#121417',
  asfalto: '#2B2F33',
  concreto: '#4A5058',
  niebla: '#B4BAC0',
  azul: '#4FA3D1',
  rojo: '#E0503F',
  blanco: '#EAF2F5',
  ambar: '#E0A030',
  verde: '#B5C95A',
  enfermo: '#7A8F4E',
}

export const Pausa = createContext(false)
