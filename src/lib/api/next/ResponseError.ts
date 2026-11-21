export class ResponseError extends Error {
  override name = 'ResponseError';
  constructor(
    public response: Response,
    msg?: string,
    /**
     * The parsed response body, if it was read before throwing.
     * Same contract as the generated client's ResponseError.
     */
    public body?: unknown
  ) {
    super(msg ?? `HTTP ${response.status} ${response.statusText}`);
  }
}
