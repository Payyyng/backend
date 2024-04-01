import { BaseError } from 'src/utils/base-error';
export enum AuthErrors {
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_DATA = 'INVALID_DATA',
  INVALID_TOKEN = 'INVALID_TOKEN',
  UNPROCESSABLE_ENTITY = 'UNPROCESSABLE',
  ALREADY_EXISTING = 'ALREADY_EXISTING',
}

export class AuthError extends BaseError {}
