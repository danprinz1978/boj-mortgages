import {
  GetMortgagesLoanEntryDto,
  GetMortgagesLoanEntry,
  AccountBlockDto,
  AccountBlock,
} from '../types/get-mortgages-response.type';

type LooseRow = Record<string, unknown>;

function pascalToCamelKey(key: string): string {
  return key.charAt(0).toLowerCase() + key.slice(1);
}

/** Gateway / JSON often uses camelCase; bank payloads use PascalCase. */
function pickRawRow(row: LooseRow, key: string): unknown {
  return row[key] ?? row[pascalToCamelKey(key)];
}

function pickStrRow(row: LooseRow, key: string): string {
  const v = pickRawRow(row, key);
  if (v === undefined || v === null) return '';
  return String(v);
}

/** Gateway / JSON often uses camelCase; bank payloads use PascalCase. */
function pickRaw(row: GetMortgagesLoanEntry, key: string): unknown {
  return pickRawRow(row as unknown as LooseRow, key);
}

function pickStr(row: GetMortgagesLoanEntry, key: string): string {
  const v = pickRaw(row, key);
  if (v === undefined || v === null) return '';
  return String(v);
}

function pickStrNull(row: GetMortgagesLoanEntry, key: string): string | null {
  const v = pickRaw(row, key);
  if (v === undefined || v === null) return null;
  return String(v);
}

function mapLoan(p: GetMortgagesLoanEntry): GetMortgagesLoanEntryDto {
  return {
    MortgageContractNumber: pickStrNull(p, 'MortgageContractNumber'),
    ProductNumber: pickStr(p, 'ProductNumber'),
    ProductName: pickStr(p, 'ProductName'),
    LoanContractNumber: pickStr(p, 'LoanContractNumber'),
    CurrencyCode: pickStr(p, 'CurrencyCode'),
    Principal: pickStr(p, 'Principal'),
    PrincipalNIS: pickStr(p, 'PrincipalNIS'),
    Balance: pickStr(p, 'Balance'),
    BalanceNIS: pickStr(p, 'BalanceNIS'),
    RegistrationDate: pickStr(p, 'RegistrationDate'),
    InterestRateTypeCode: pickStr(p, 'InterestRateTypeCode'),
    LinkageTypeCode: pickStr(p, 'LinkageTypeCode'),
    LinkageTypeDescription: pickStr(p, 'LinkageTypeDescription'),
    VariableInterestRateTypeCode: pickStr(p, 'VariableInterestRateTypeCode'),
    MarginSign: pickStr(p, 'MarginSign'),
    MarginInterestRate: pickStr(p, 'MarginInterestRate'),
    ActualInterestRate: pickStr(p, 'ActualInterestRate'),
    BaseInterestRate: pickStr(p, 'BaseInterestRate'),
    VariableInterestChangeFrequencyUnit: pickStr(
      p,
      'VariableInterestChangeFrequencyUnit',
    ),
    VariableInterestChangeFrequency: pickStr(
      p,
      'VariableInterestChangeFrequency',
    ),
    NextPaymentAmount: pickStr(p, 'NextPaymentAmount'),
    NextPaymentAmountNIS: pickStr(p, 'NextPaymentAmountNIS'),
    LastPaymentAmount: pickStr(p, 'LastPaymentAmount'),
    LastPaymentAmountNIS: pickStr(p, 'LastPaymentAmountNIS'),
    LoanArrearsAmount: pickStrNull(p, 'LoanArrearsAmount'),
    AmortizationDate: pickStr(p, 'AmortizationDate'),
    NextPaymentDate: pickStr(p, 'NextPaymentDate'),
    LastPaymentDate: pickStr(p, 'LastPaymentDate'),
    ItratKeren: pickStr(p, 'ItratKeren'),
    ItratKerenNIS: pickStr(p, 'ItratKerenNIS'),
    ItratRibit: pickStr(p, 'ItratRibit'),
    ItratRibitNIS: pickStr(p, 'ItratRibitNIS'),
    ItratHazmada: pickStrNull(p, 'ItratHazmada'),
    ItratHazmadaNIS: pickStrNull(p, 'ItratHazmadaNIS'),
    FirstPaymentDate: pickStrNull(p, 'FirstPaymentDate'),
    SugLuach: pickStr(p, 'SugLuach'),
    SugHatzmada: pickStrNull(p, 'SugHatzmada'),
    ShaarBasis: pickStrNull(p, 'ShaarBasis'),
    RibitMetoemet: pickStr(p, 'RibitMetoemet'),
    DateShinuiRibitHaba: pickStrNull(p, 'DateShinuiRibitHaba'),
    AmlatHiva: pickStrNull(p, 'AmlatHiva'),
    AmlatHodaMerosh: pickStrNull(p, 'AmlatHodaMerosh'),
    AmlatPizuiMadad: pickStrNull(p, 'AmlatPizuiMadad'),
    AmlatTeful: pickStrNull(p, 'AmlatTeful'),
    SumAmlotPeraonMukdam: pickStrNull(p, 'SumAmlotPeraonMukdam'),
    SumAmlotPeraonMukdamNIS: pickStrNull(p, 'SumAmlotPeraonMukdamNIS'),
    LoanPurpose: pickStr(p, 'LoanPurpose'),
    ShiurRibitRishon: pickStrNull(p, 'ShiurRibitRishon'),
    ShiurRibitMetuemetRishon: pickStrNull(p, 'ShiurRibitMetuemetRishon'),
    ShiurRibitOgenRishon: pickStrNull(p, 'ShiurRibitOgenRishon'),
    ShiurRibitOgenNow: pickStrNull(p, 'ShiurRibitOgenNow'),
    ShiurRibitKoleletNow: pickStr(p, 'ShiurRibitKoleletNow'),
    ShiurRibitCompare: pickStr(p, 'ShiurRibitCompare'),
    SugLoanFlag: pickStr(p, 'SugLoanFlag'),
    SugLoanCode: pickStr(p, 'SugLoanCode'),
    ShaarBasis451: pickStrNull(p, 'ShaarBasis451'),
    ShiurRibitKoleletHeskem: pickStrNull(p, 'ShiurRibitKoleletHeskem'),
    ShiurRibitCompoareHeskem: pickStrNull(p, 'ShiurRibitCompoareHeskem'),
    YitraHeskem: pickStrNull(p, 'YitraHeskem'),
    InterestType: pickStr(p, 'InterestType'),
    RateCode: pickStr(p, 'RateCode'),
    LinkageDescriptionBS: pickStr(p, 'LinkageDescriptionBS'),
    BojRate: pickStr(p, 'BojRate'),
    BojRateRishon: pickStr(p, 'BojRateRishon'),
    BojVariableInterestChangeFrequency: pickStrNull(
      p,
      'BojVariableInterestChangeFrequency',
    ),
    ExtraExpenses: pickStrNull(p, 'ExtraExpenses'),
    LastPaymentAmountWithCurrency: '',
    YitraHeskemWithCurrency: '',
    BalanceWithCurrency: '',
    ItratKerenWithCurrency: '',
    ItratRibitWithCurrency: '',
    ItratHazmadaWithCurrency: '',
    AmlatHivaWithCurrency: '',
    AmlatHodaMeroshWithCurrency: '',
    AmlatPizuiMadadWithCurrency: '',
    SumAmlotPeraonMukdamWithCurrency: ''
  };
}

export function mapGetMortgagesToClientDto(account: AccountBlock): AccountBlockDto {
  const row = account as unknown as LooseRow;
  const loansEntry = account.LoansBlock?.map(mapLoan) ?? [];
  const loansBlock = account.LoansBlock == null ? null : loansEntry;

  return {
    BranchNumber: pickStrRow(row, 'BranchNumber'),
    AccountNumber: pickStrRow(row, 'AccountNumber'),
    LoansBlock: loansBlock,
  };
}
