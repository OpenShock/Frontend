/**
 * Captures the pointer on the element that received `start` and reports every move until release.
 * Handles pointer capture and listener cleanup, so callers only compute the new position.
 */
export function trackPointerDrag(start: PointerEvent, onMove: (e: PointerEvent) => void) {
  start.preventDefault();
  const target = start.currentTarget as HTMLElement;
  target.setPointerCapture(start.pointerId);

  function cleanup() {
    target.removeEventListener('pointermove', onMove);
    target.removeEventListener('pointerup', cleanup);
    target.removeEventListener('pointercancel', cleanup);
    target.removeEventListener('lostpointercapture', cleanup);
  }

  target.addEventListener('pointermove', onMove);
  target.addEventListener('pointerup', cleanup);
  target.addEventListener('pointercancel', cleanup);
  target.addEventListener('lostpointercapture', cleanup);
}
