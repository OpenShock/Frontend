
type color
  = 'slate'
  | 'gray'
  | 'zinc'
  | 'neutral'
  | 'stone'
  | 'red'
  | 'orange'
  | 'amber'
  | 'yellow'
  | 'lime'
  | 'green'
  | 'emerald'
  | 'teal'
  | 'cyan'
  | 'sky'
  | 'blue'
  | 'indigo'
  | 'violet'
  | 'purple'
  | 'fuchsia'
  | 'pink'
  | 'rose';

type shade
  = 50
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900;

export type TwColor = 'transparent' | 'current' | 'black' | 'white' | 'inherit' | `${color}-${shade}`;
export type TwBgColor = `bg-${TwColor}`;
export type TwTextColor = `text-${TwColor}`;
export type TwBorderColor = `border-${TwColor}`;
