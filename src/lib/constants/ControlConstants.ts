export const ControlIntensityDefault = 25;
export const ControlIntensityProps = {
    min: 0,
    max: 100,
    step: 1
} as const;

export const ControlDurationDefault = 1;
export const ControlDurationProps = {
  min: 0.3,
  max: 30,
  step: 0.1
} as const;