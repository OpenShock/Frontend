import { getCircleX, getCircleY } from "./math";

export function calcSvgArcProps(
  center: { x: number; y: number },
  angleStart: number,
  angleEnd: number,
  radius: number,
  strokeWidth: number
) {
  const rx = center.x + getCircleX(radius, angleStart);
  const ry = center.y + getCircleY(radius, angleStart);
  const x = center.x + getCircleX(radius, angleEnd);
  const y = center.y + getCircleY(radius, angleEnd);
  const largeArcFlag = angleEnd - angleStart < 180 ? 0 : 1;

  return {
    d: `M ${rx} ${ry} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x} ${y}`,
    'stroke-width': strokeWidth,
  };
}
