import { HeaderDto } from "../dtos/headers.dto";
import { v4 as uuidv4 } from 'uuid';

export function injectTransactionId(request: {
  Channel: any;
  Header: HeaderDto;
}): { Channel: any; Header: HeaderDto } {
  const newRequest = JSON.parse(JSON.stringify(request));

  if (!newRequest.Header) {
    newRequest.Header = {};
  }

  if (!newRequest.Header.EnvironmentInfo) {
    newRequest.Header.EnvironmentInfo = {};
  }

  newRequest.Header.EnvironmentInfo.TransactionId = uuidv4();

  return newRequest;
}