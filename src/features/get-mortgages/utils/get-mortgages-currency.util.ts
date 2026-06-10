import { CurrencyMatRow } from '../static-data/static-data.types';
import {
  AccountBlockDto,
  GetMortgagesLoanEntryDto,
} from '../types/get-mortgages-response.type';

const normalizeCode = (value?: string | number | null) => {
  const code = String(value ?? '').trim();
  if (!code) return '';

  const num = Number(code);
  return Number.isFinite(num) ? String(num) : code.replace(/^0+/, '') || '0';
};

export function buildCurrencySymbolMap(
  rows: CurrencyMatRow[],
): Map<string, string> {
  const map = new Map<string, string>();

  rows.forEach((row) => {
    const code = normalizeCode(row.DECIMAL_SYMBOL);
    if (code) map.set(code, row.CURCY_SYMBOL);
  });

  return map;
}

// Formats "<symbol><grouped amount>" — e.g. "₪420,000.00" — matching the
// client's number formatting (he-IL grouping + 2 fraction digits) so the
// consumer can render the string as-is without re-formatting.
const formatAmount = (
  amount: string,
  currencyCode: string,
  symbols: Map<string, string>,
) => {
  const symbol = symbols.get(normalizeCode(currencyCode)) ?? currencyCode;
  const num = Number(amount);
  const formatted = Number.isFinite(num)
    ? num.toLocaleString('he-IL', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : amount;
  return `${symbol}${formatted}`;
};

const formatAmountOptional = (
  amount: string | null | undefined,
  currencyCode: string,
  symbols: Map<string, string>,
) => {
  if (amount == null || amount === '') return '';
  return formatAmount(amount, currencyCode, symbols);
};

// Picks the first non-empty amount (FX-currency field, then NIS fallback) and
// formats it with the loan's currency symbol. Used for fields whose value lives
// in either the foreign-currency or the NIS column depending on the loan.
const formatAmountWithFallback = (
  primary: string | null | undefined,
  fallback: string | null | undefined,
  currencyCode: string,
  symbols: Map<string, string>,
) => {
  const amount = primary != null && primary !== '' ? primary : fallback;
  return formatAmountOptional(amount, currencyCode, symbols);
};

export function enrichGetMortgagesWithCurrencySymbols(
  accountBlock: AccountBlockDto,
  symbols: Map<string, string>,
): AccountBlockDto {
  return {
    ...accountBlock,
    LoansBlock: accountBlock.LoansBlock && 
       accountBlock.LoansBlock.map(
        (loan): GetMortgagesLoanEntryDto => ({
          ...loan,
          LastPaymentAmountWithCurrency: formatAmount(
            loan.LastPaymentAmount,
            loan.CurrencyCode,
            symbols,
          ),
          YitraHeskemWithCurrency: formatAmountOptional(
            loan.YitraHeskem,
            loan.CurrencyCode,
            symbols,
          ),
          BalanceWithCurrency: formatAmount(
            loan.Balance,
            loan.CurrencyCode,
            symbols,
          ),
          ItratKerenWithCurrency: formatAmount(
            loan.ItratKeren,
            loan.CurrencyCode,
            symbols,
          ),
          ItratRibitWithCurrency: formatAmount(
            loan.ItratRibit,
            loan.CurrencyCode,
            symbols,
          ),
          ItratHazmadaWithCurrency: formatAmountOptional(
            loan.ItratHazmada,
            loan.CurrencyCode,
            symbols,
          ),
          AmlatHivonWithCurrency: formatAmountOptional(
            loan.AmlatHivon,
            loan.CurrencyCode,
            symbols,
          ),
          AmlatHodaMeroshWithCurrency: formatAmountOptional(
            loan.AmlatHodaMerosh,
            loan.CurrencyCode,
            symbols,
          ),
          AmlatPizuiMadadWithCurrency: formatAmountOptional(
            loan.AmlatPizuiMadad,
            loan.CurrencyCode,
            symbols,
          ),
          SumAmlotPeraonMukdamWithCurrency: formatAmountOptional(
            loan.SumAmlotPeraonMukdam,
            loan.CurrencyCode,
            symbols,
          ),
          PrincipalWithCurrency: formatAmountWithFallback(
            loan.Principal,
            loan.PrincipalNIS,
            loan.CurrencyCode,
            symbols,
          ),
          NextPaymentAmountWithCurrency: formatAmountWithFallback(
            loan.NextPaymentAmount,
            loan.NextPaymentAmountNIS,
            loan.CurrencyCode,
            symbols,
          ),
          LoanArrearsAmountWithCurrency: formatAmountOptional(
            loan.LoanArrearsAmount,
            loan.CurrencyCode,
            symbols,
          ),
        }),
      ),
    
  };
}
