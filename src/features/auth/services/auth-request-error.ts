export class AuthRequestError extends Error {
  constructor(readonly status: number) {
    super("Authentication request failed");
  }
}
