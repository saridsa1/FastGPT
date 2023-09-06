export const ERROR_CODE: { [key: number]: string } = {
  400: 'Request failed',
  401: 'No access',
  403: 'Nervous access',
  404: 'The request does not exist',
  405: 'Request method error',
  406: 'The requested format is wrong',
  410: 'The resource has been deleted',
  422: 'Verification error',
  500: 'A server error occurred',
  502: 'Gateway Error',
  503: 'The server is temporarily overloaded or under maintenance',
  504: 'Gateway Timeout'
};

export const TOKEN_ERROR_CODE: Record<number, string> = {
  403: 'Login status is invalid, please log in again'
};

export const openaiError: Record<string, string> = {
  context_length_exceeded: 'The content is too long, please reset the dialog',
  Unauthorized: 'API-KEY is invalid',
  rate_limit_reached: 'API is limited, please try again later',
  'Bad Request': 'Bad Request~ There may be too much content',
  'Bad Gateway': 'Gateway exception, please try again'
};
export const openaiAccountError: Record<string, string> = {
  insufficient_quota: 'API balance is insufficient',
  invalid_api_key: 'openai account is abnormal',
  account_deactivated: 'Account has been deactivated',
  invalid_request_error: 'Invalid request'
};
export const proxyError: Record<string, boolean> = {
  ECONNABORTED: true,
  ECONNRESET: true
};

export enum ERROR_ENUM {
  unAuthorization = 'unAuthorization',
  insufficientQuota = 'insufficientQuota',
  unAuthModel = 'unAuthModel',
  unAuthKb = 'unAuthKb',
  unAuthFile = 'unAuthFile'
}
export const ERROR_RESPONSE: Record<
  any,
  {
    code: number;
    statusText: string;
    message: string;
    data?: any;
  }
> = {
  [ERROR_ENUM.unAuthorization]: {
    code: 403,
    statusText: ERROR_ENUM.unAuthorization,
    message: 'Credential error',
    data: null
  },
  [ERROR_ENUM.insufficientQuota]: {
    code: 510,
    statusText: ERROR_ENUM.insufficientQuota,
    message: 'Account balance insufficient',
    data: null
  },
  [ERROR_ENUM.unAuthModel]: {
    code: 511,
    statusText: ERROR_ENUM.unAuthModel,
    message: 'Do not have permission to use this model',
    data: null
  },
  [ERROR_ENUM.unAuthKb]: {
    code: 512,
    statusText: ERROR_ENUM.unAuthKb,
    message: 'Do not have permission to use this knowledge base',
    data: null
  },
  [ERROR_ENUM.unAuthFile]: {
    code: 513,
    statusText: ERROR_ENUM.unAuthFile,
    message: 'Do not have permission to read this file',
    data: null
  }
};
