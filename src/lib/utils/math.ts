export const DegToRad = Math.PI / 180;
export const RadToDeg = 180 / Math.PI;

export function getCircleX(radius: number, degrees: number): number {
  return radius * Math.cos(degrees * DegToRad);
}
export function getCircleY(radius: number, degrees: number): number {
  return radius * Math.sin(degrees * DegToRad);
}
