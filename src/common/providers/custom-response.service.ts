export default class CustomResponse {
  private statusCode: number
  private message: string
  public result: any
  constructor(statusCodes: number, message: string, result?: any) {
    this.statusCode = statusCodes
    this.message = message
    this.result = result
  }
}
