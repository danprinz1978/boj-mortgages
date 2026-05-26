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

const formatAmount = (
  amount: string,
  currencyCode: string,
  symbols: Map<string, string>,
) => `${symbols.get(normalizeCode(currencyCode)) ?? currencyCode}${amount}`;

const formatAmountOptional = (
  amount: string | null | undefined,
  currencyCode: string,
  symbols: Map<string, string>,
) => {
  if (amount == null || amount === '') return '';
  return formatAmount(amount, currencyCode, symbols);
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
          AmlatHivaWithCurrency: formatAmountOptional(
            loan.AmlatHiva,
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
        }),
      ),
    
  };
}
