import { RadToDeg, getCircleX, getCircleY } from "$lib/utils/math";

export function dragcircle(node: HTMLElement, { centerX, centerY, radius, angleStart, angleEnd }: { centerX: number, centerY: number, radius: number, angleStart: number, angleEnd: number }) {
  const handler = (event: TouchEvent | MouseEvent) => {
    let clientX: number;
    let clientY: number;
    if ('touches' in event) {
      const touch = (event as TouchEvent).touches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      const mouse = (event as MouseEvent);
      clientX = mouse.clientX;
      clientY = mouse.clientY;
    }

    const rect = node.getBoundingClientRect();
    const x = clientX - rect.left - rect.width / 2;
    const y = clientY - rect.top - rect.height / 2;
    let angle = Math.atan2(y, x) * RadToDeg;
    if (angle < 0) {
      angle += 360;
    }
    const newAngle = Math.min(angleEnd, Math.max(angleStart, angle));

    node.style.left = `${centerX + getCircleX(radius, newAngle)}px`;
    node.style.top = `${centerY + getCircleY(radius, newAngle)}px`;

    node.dispatchEvent(new CustomEvent("sliderdrag", { detail: { angle: newAngle } }));
  };

  const dragEnd = (event: TouchEvent | MouseEvent) => {
    handler(event);

    if ('ontouchstart' in document.documentElement) {
      node.removeEventListener("touchmove", dragMove);
      node.removeEventListener("touchend", dragEnd);
    } else {
      document.removeEventListener("mousemove", dragMove);
      document.removeEventListener("mouseup", dragEnd);
    }
  }

  const dragMove = (event: TouchEvent | MouseEvent) => {
    handler(event);
  }

  const dragStart = (event: TouchEvent | MouseEvent) => {
    event.preventDefault();

    handler(event);

    if ('ontouchstart' in document.documentElement) {
      node.addEventListener("touchmove", dragMove);
      node.addEventListener("touchend", dragEnd);
    } else {
      document.addEventListener("mousemove", dragMove);
      document.addEventListener("mouseup", dragEnd);
    }
  }

  if ('ontouchstart' in document.documentElement) {
    node.addEventListener("touchstart", dragStart)
  } else {
    node.addEventListener("mousedown", dragStart)
  }

  return {
    update() {
    },
    destroy() {
      if ('ontouchstart' in document.documentElement) {
        node.removeEventListener("touchstart", dragStart);
      } else {
        node.removeEventListener("mousedown", dragStart);
      }
    }
  };
}
