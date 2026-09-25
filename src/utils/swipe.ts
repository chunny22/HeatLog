/** Only ever drag downward; upward movement is ignored. */
export function dragDistance(startY: number, currentY: number): number {
  return Math.max(0, currentY - startY)
}

/** A downward drag dismisses once it passes a third of the element's height (at least 40px). */
export function shouldDismiss(dragY: number, elementHeight: number): boolean {
  return dragY > Math.max(40, elementHeight / 3)
}
