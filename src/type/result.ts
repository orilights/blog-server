export class ResultData {
  constructor(code = 0, msg?: string, data?: any) {
    this.code = code;
    this.msg = msg || 'ok';
    this.data = data || null;
  }

  code: number;
  msg?: string;
  data?: any;

  static ok(data?: any, msg?: string): ResultData {
    return new ResultData(0, msg, data);
  }

  static fail(code: number, msg?: string, data?: any): ResultData {
    return new ResultData(code || -1, msg || 'fail', data);
  }
}
