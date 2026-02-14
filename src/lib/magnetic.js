// src/lib/magnetic.js
// Small helper to compute the magnet transform for a link's inner text
// Returns a CSS translate(...) string to apply to the element.
// Parameters:
//  - node: the link DOM node (element bounding box is used)
//  - mouseEvent: native MouseEvent from onMouseMove
//  - opts: { strengthX, strengthY, baseShiftX } optional tuning
//
// Example usage:
//   const transform = calcMagnetTransform(node, e, { strengthX:0.06, strengthY:0.02, baseShiftX: -5 });
//   textEl.style.transform = transform;

export function calcMagnetTransform(node, mouseEvent, opts = {}) {
  const { strengthX = 0.05, strengthY = 0.02, baseShiftX = -5 } = opts;

  if (!node || !mouseEvent) {
    return `translate(${baseShiftX}px, 0px)`;
  }

  const rect = node.getBoundingClientRect();
  const relX = mouseEvent.clientX - rect.left - rect.width / 2; // center-based x
  const relY = mouseEvent.clientY - rect.top - rect.height / 2; // center-based y

  // scale relative position by strengths and clamp small values to avoid subpixel jitter
  const moveX = Math.round(relX * strengthX);
  const moveY = Math.round(relY * strengthY);

  // combine base left shift (so hover still shifts left) with magnet offset
  const finalX = baseShiftX + moveX;
  const finalY = moveY;

  return `translate(${finalX}px, ${finalY}px)`;
}
