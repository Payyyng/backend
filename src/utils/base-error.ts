export enum BaseErrors {
  UNKNOWN = 'UNKNOWN',
  INVALID = 'INVALID',
}

export class BaseError extends Error {
  constructor(
    public errorCode: string,
    public message: string,
    public statusCode: number,
    public reasonForDebugPupose?: string,
  ) {
    super();
  }
}
