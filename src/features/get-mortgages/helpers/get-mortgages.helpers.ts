import { GetMortgagesResponseMessage, UpstreamResponseMessage } from '../types/get-mortgages-response.type';

export function hasAccountsData(responseData: unknown): boolean {
  if (Array.isArray(responseData)) {
    return responseData.length > 0 && Boolean(responseData[0]?.AccountEntry);
  }

  if (!responseData || typeof responseData !== 'object') {
    return false;
  }

  const accountBlock = responseData as {
    loansBlock?: unknown[];
    accountNumber?: string;
    branchNumber?: string;
  };

  return Array.isArray(accountBlock.loansBlock) && accountBlock.loansBlock.length > 0;
}

export function normalizeResponseMessages(
  message?:
    | GetMortgagesResponseMessage
    | GetMortgagesResponseMessage[]
    | UpstreamResponseMessage
    | UpstreamResponseMessage[],
): GetMortgagesResponseMessage[] {
  if (!message) {
    return [];
  }

  const messages = Array.isArray(message) ? message : [message];

  return messages.map((item) => ({
    ...(item as GetMortgagesResponseMessage),
    ResponseCode:
      Number(
        (item as UpstreamResponseMessage).ResponseCode ??
          (item as UpstreamResponseMessage).responseCode ??
          0,
      ) || 0,
  }));
}