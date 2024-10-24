export const DegToRad = Math.PI / 180;
export const RadToDeg = 180 / Math.PI;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
export function invLerp(a: number, b: number, value: number): number {
  return (value - a) / (b - a);
}

export function getCircleX(radius: number, degrees: number): number {
  return radius * Math.cos(degrees * DegToRad);
}
export function getCircleY(radius: number, degrees: number): number {
  return radius * Math.sin(degrees * DegToRad);
}
