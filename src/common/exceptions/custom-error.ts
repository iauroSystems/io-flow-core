export default class CustomError extends Error {
  statusCode = 500;
  timestamp = new Date().toISOString();
  error: any
  constructor(statusCode: number, message: string, error?: any) {
    super();
    this.statusCode = statusCode;
    this.message = message;
    this.error = error;
    // Object.setPrototypeOf(this, CustomError.prototype);
  }
}
