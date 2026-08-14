export class ResponseError extends Error {
  override name = 'ResponseError';
  constructor(
    public response: Response,
    msg?: string
  ) {
    super(msg ?? `HTTP ${response.status} ${response.statusText}`);
  }
}
