export const twTextColor = {
  gray: 'text-gray-500',
  red: 'text-red-500',
  orange: 'text-orange-500',
  yellow: 'text-yellow-500',
  green: 'text-green-500',
  cyan: 'text-cyan-500',
  blue: 'text-blue-500',
} as const;

export type TwTextColor = keyof typeof twTextColor;
