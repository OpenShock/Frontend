export interface ValidationResult {
  valid: boolean;
  message: string;
}

export function ValidationResultIcon(result: ValidationResult): string {
  const IconOk = 'fa-circle-check text-success-500';
  const IconError = 'fa-circle-exclamation text-error-500';
  const IconMissing = 'fa-circle-minus text-gray-500';

  return result.valid ? IconOk : result.message.length > 0 ? IconError : IconMissing;
}
