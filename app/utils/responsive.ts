import { Dimensions, PixelRatio } from "react-native"

const BASE_WIDTH = 375  // iPhone SE — pantalla de referencia

const { width: SCREEN_WIDTH } = Dimensions.get("window")

const scale = SCREEN_WIDTH / BASE_WIDTH

// Para fuentes y tamaños pequeños (escala moderada)
export const rs = (size: number): number => {
  const newSize = size * scale
  return Math.round(PixelRatio.roundToNearestPixel(newSize))
}

// Para fuentes — escala más suave para no agrandar demasiado
export const rf = (size: number): number => {
  const newSize = size + (scale - 1) * 8
  return Math.round(PixelRatio.roundToNearestPixel(newSize))
}

// Para espaciados y dimensiones — escala completa
export const rw = (size: number): number => {
  return Math.round(PixelRatio.roundToNearestPixel(size * scale))
}