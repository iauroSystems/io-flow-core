export default class CustomGrpcResponse {
    private grpcStatusCode: number;
    private message: string;
    public result: any;
    constructor(grpcStatusCode: number, message: string, result?: any) {
      this.grpcStatusCode = grpcStatusCode;
      this.message = message;
      this.result = result;
    }
  }