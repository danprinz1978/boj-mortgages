import {
  TimestampDto,
  ServiceInfoDto,
  PagingInfoDto,
  EnvironmentInfoDto,
  UserInfoDto,
  AccountInfoDto,
} from 'src/shared/dtos/headers.dto';


export interface ParamsBlock {
  AccountsBlock: AccountBlock[];
 
}

export interface GetMortgagesResponseDto {
  Header: GetMortgagesResponseHeader;
  Params: ParamsBlock;
}

export interface GetMortgagesResponseMessage {
  ResponseCode: number;
  SeverityCode: string;
  MessageText: string;
}

export interface GetMortgagesResponseMessages {
  Message: GetMortgagesResponseMessage | GetMortgagesResponseMessage[];
}



export interface GetMortgagesResponseHeader {
  Timestamp: TimestampDto;
  ServiceInfo: ServiceInfoDto;
  ResponseMessages: GetMortgagesResponseMessages;
  PagingInfo: PagingInfoDto;
  EnvironmentInfo: EnvironmentInfoDto;
  UserInfo: UserInfoDto;
  AccountInfo: AccountInfoDto;
}

export interface GetMortgagesLoanEntry {
  MortgageContractNumber: string | null;
  ProductNumber: string;
  ProductName: string;
  LoanContractNumber: string;
  CurrencyCode: string;
  Principal: string;
  PrincipalNIS: string;
  Balance: string;
  BalanceNIS: string;
  RegistrationDate: string;
  InterestRateTypeCode: string;
  LinkageTypeCode: string;
  LinkageTypeDescription: string;
  VariableInterestRateTypeCode: string;
  MarginSign: string;
  MarginInterestRate: string;
  ActualInterestRate: string;
  BaseInterestRate: string;
  VariableInterestChangeFrequencyUnit: string;
  VariableInterestChangeFrequency: string;
  NextPaymentAmount: string;
  NextPaymentAmountNIS: string;
  LastPaymentAmount: string;
  LastPaymentAmountNIS: string;
LoanArrearsAmount: string | null;
AmortizationDate: string;
NextPaymentDate: string;
LastPaymentDate: string;
ItratKeren:string;
ItratKerenNIS:string;
ItratRibi:string;
ItratRibitNIS:string;
ItratHazmada:string | null;
ItratHazmadaNIS:string | null;
FirstPaymentDate:string | null;
SugLuach: string;
SugHatzmada:string | null;
ShaarBasis:string | null;
RibitMetoemet:string;
DateShinuiRibitHaba:string | null;
AmlatHiva:string | null;
AmlatHodaMerosh:string | null;
AmlatPizuiMadad:string | null;
AmlatTeful:string | null;
SumAmlotPeraonMukdam:string | null;
SumAmlotPeraonMukdamNIS:string | null;
LoanPurpose:string;
ShiurRibitRishon:string | null;
ShiurRibitMetuemetRishon:string | null;
ShiurRibitOgenRishon:string | null;
ShiurRibitOgenNow:string | null;
ShiurRibitKoleletNow:string;
ShiurRibitCompare:string;
SugLoanFlag:string;
SugLoanCode:string;
ShaarBasis451:string | null;
ShiurRibitKoleletHeskem:string | null;
ShiurRibitCompoareHeskem:string | null;
YitraHeskem:string | null;
InterestType:string;
RateCode:string;
LinkageDescriptionBS:string;
BojRate:string;
BojRateRishon:string;
BojVariableInterestChangeFrequency:string | null;
ExtraExpenses:string | null;
}

export interface AccountBlock {
  AccountEntry: GetMortgagesAccountEntry[];
}

export interface GetMortgagesAccountEntry {
  BranchNumber: string;
  AccountNumber: string;
  LoansBlock: GetMortgagesLoansBlock | null;
}

export interface GetMortgagesLoansBlock {
  LoanEntry: GetMortgagesLoanEntry[];
}

export type UpstreamResponseMessage = {
  ResponseCode?: number | string;
  responseCode?: number | string;
};

