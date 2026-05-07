export enum EGetMortgagesErrorCodes {
  GET_MORTGAGES_FAILED = 'GET_ACCOUNT_LIST_AND_BALANCES_FAILED',
  EMPTY_RESPONSE = 'EMPTY_RESPONSE',
  RESPONSE_CODE_ERROR = 'RESPONSE_CODE_ERROR',
  NO_ACTIVE_ACCOUNTS = 'NO_ACTIVE_ACCOUNTS',
}

export const GetMortgagesErrorMapping = {
  [EGetMortgagesErrorCodes.GET_MORTGAGES_FAILED]: {
    status: 604,
    message: 'Failed to retrieve get mortgages from external service',
  },
  [EGetMortgagesErrorCodes.EMPTY_RESPONSE]: {
    status: 610,
    message: 'response is empty',
  },
  [EGetMortgagesErrorCodes.RESPONSE_CODE_ERROR]: {
    status: 500,
    message: 'get mortgages failed, rc!=0',
  }
};