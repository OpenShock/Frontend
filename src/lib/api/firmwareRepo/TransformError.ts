export class TransformError extends Error {
  override name = 'TransformError';
  constructor(message: string) {
    super(message);
  }
}
