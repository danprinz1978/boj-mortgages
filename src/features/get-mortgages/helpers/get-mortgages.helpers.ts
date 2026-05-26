import {
  AccountBlock,
  GetMortgagesLoanEntry,
  GetMortgagesResponseMessage,
  UpstreamResponseMessage,
} from '../types/get-mortgages-response.type';

type LooseRecord = Record<string, unknown>;

function asRecord(value: unknown): LooseRecord | null {
  if (value && typeof value === 'object') return value as LooseRecord;
  return null;
}

/** Proxies often return `{ data: { Header, Params } }` (or `body` / string JSON). */
function unwrapGatewayResponse(raw: unknown): LooseRecord | null {
  let node = asRecord(raw);
  if (!node) return null;

  for (let depth = 0; depth < 4; depth++) {
    let inner: LooseRecord | null = null;

    const dataVal = node.data ?? node.Data;
    if (typeof dataVal === 'string') {
      try {
        inner = asRecord(JSON.parse(dataVal));
      } catch {
        inner = null;
      }
    } else {
      inner =
        asRecord(dataVal) ??
        asRecord(node.body) ??
        asRecord(node.Body) ??
        asRecord(node.payload) ??
        asRecord(node.Payload);
    }

    if (!inner) break;

    const looksLikeEnvelope =
      inner.Header != null ||
      inner.header != null ||
      inner.Params != null ||
      inner.params != null ||
      inner.Channel != null ||
      inner.channel != null;

    if (!looksLikeEnvelope) break;
    node = inner;
  }

  return node;
}

function normalizeLoansBlockToFlat(
  loans: unknown,
): GetMortgagesLoanEntry[] | null {
  if (loans == null) return null;
  if (Array.isArray(loans)) {
    return loans.length > 0 ? (loans as GetMortgagesLoanEntry[]) : null;
  }
  const lr = asRecord(loans);
  if (!lr) return null;
  const le =
    lr.LoanEntry ?? lr.loanEntry ?? lr.loan_entry;
  if (Array.isArray(le) && le.length > 0) {
    return le as GetMortgagesLoanEntry[];
  }
  return null;
}

function coerceAccountBlock(rec: LooseRecord): AccountBlock {
  return {
    BranchNumber: String(rec.BranchNumber ?? rec.branchNumber ?? ''),
    AccountNumber: String(rec.AccountNumber ?? rec.accountNumber ?? ''),
    LoansBlock: normalizeLoansBlockToFlat(rec.LoansBlock ?? rec.loansBlock),
  };
}

function isPopulatedAccountBlock(a: AccountBlock): boolean {
  const hasIds =
    String(a.BranchNumber ?? '').length > 0 &&
    String(a.AccountNumber ?? '').length > 0;
  const hasLoans =
    Array.isArray(a.LoansBlock) && a.LoansBlock.length > 0;
  return hasIds || hasLoans;
}

function looksLikeMortgagesAccountEntry(rec: LooseRecord): boolean {
  return isPopulatedAccountBlock(coerceAccountBlock(rec));
}

/**
 * Reads accounts block from common gateway / legacy response layouts.
 */
export function extractMortgagesAccountsBlockPayload(
  responseDataRaw: unknown,
): unknown {
  const root = unwrapGatewayResponse(responseDataRaw) ?? asRecord(responseDataRaw);
  if (!root) return undefined;

  const params = asRecord(root.Params) ?? asRecord(root.params);
  const fromParams =
    params?.AccountsBlock ??
    params?.accountsBlock ??
    params?.accounts_block;

  if (fromParams != null) return fromParams;

  const paramsGetM =
    asRecord(params?.GetMortgages) ?? asRecord(params?.getMortgages);
  const paramsResp =
    asRecord(paramsGetM?.Response) ?? asRecord(paramsGetM?.response);
  const fromParamsNested =
    paramsResp?.AccountsBlock ??
    paramsResp?.accountsBlock ??
    paramsResp?.accounts_block;
  if (fromParamsNested != null) return fromParamsNested;

  if (params) {
    const scavenged = firstDeepAccountPayload(params);
    if (scavenged != null) return scavenged;
  }

  const channel = asRecord(root.Channel) ?? asRecord(root.channel);
  const getMortgages =
    asRecord(channel?.GetMortgages) ?? asRecord(channel?.getMortgages);
  const response =
    asRecord(getMortgages?.Response) ?? asRecord(getMortgages?.response);

  const fromChannel =
    response?.AccountsBlock ??
    response?.accountsBlock ??
    response?.accounts_block;

  if (fromChannel != null) return fromChannel;

  const rootResponse =
    asRecord(root.Response) ?? asRecord(root.response);
  if (rootResponse) {
    const fromRootResponse =
      rootResponse.AccountsBlock ??
      rootResponse.accountsBlock ??
      rootResponse.accounts_block;
    if (fromRootResponse != null) return fromRootResponse;
  }

  const fromRoot = root.AccountsBlock ?? root.accountsBlock ?? root.accounts_block;
  if (fromRoot != null) return fromRoot;

  const scavengedRoot = firstDeepAccountPayload(root);
  return scavengedRoot ?? undefined;
}

function accountEntriesFromBlock(block: LooseRecord): unknown[] {
  const ae =
    block.AccountEntry ??
    block.accountEntry ??
    block.account_entry;
  if (Array.isArray(ae)) return ae;

  const nested =
    asRecord(block.AccountsBlock) ??
    asRecord(block.accountsBlock) ??
    asRecord(block.accounts_block);
  if (!nested) return [];

  const inner =
    nested.AccountEntry ??
    nested.accountEntry ??
    nested.account_entry;
  return Array.isArray(inner) ? inner : [];
}

function firstDeepAccountPayload(rec: LooseRecord): unknown {
  for (const v of Object.values(rec)) {
    if (v == null || typeof v !== 'object') continue;
    const vr = asRecord(v);
    if (vr) {
      if (accountEntriesFromBlock(vr).length > 0) return v;
      if (looksLikeMortgagesAccountEntry(vr)) return v;
    }
    if (Array.isArray(v) && v.length > 0) {
      const first = asRecord(v[0]);
      if (!first) continue;
      if (
        accountEntriesFromBlock(first).length > 0 ||
        looksLikeMortgagesAccountEntry(first)
      ) {
        return v;
      }
    }
  }
  return undefined;
}

/**
 * Reduces upstream payloads to one {@link AccountBlock}. Multiple upstream rows use the first.
 * Supports nested {@code LoansBlock: { LoanEntry: [...] }} and flat {@code LoansBlock: [...]}.
 */
export function normalizeAccountBlockPayload(raw: unknown): AccountBlock {
  const empty: AccountBlock = {
    BranchNumber: '',
    AccountNumber: '',
    LoansBlock: null,
  };

  const takeFirstEntryFromLegacyWrapper = (
    rec: LooseRecord,
  ): AccountBlock | null => {
    const ae =
      rec.AccountEntry ??
      rec.accountEntry ;
    if (!Array.isArray(ae) || ae.length === 0) return null;
    const first = asRecord(ae[0]);
    if (!first) return null;
    return coerceAccountBlock(first);
  };

  const rec = asRecord(raw);
  if (rec) {
    const fromWrapper = takeFirstEntryFromLegacyWrapper(rec);
    if (fromWrapper && isPopulatedAccountBlock(fromWrapper)) {
      return fromWrapper;
    }
    const coerced = coerceAccountBlock(rec);
    if (isPopulatedAccountBlock(coerced)) return coerced;
  }

  if (Array.isArray(raw)) {
    for (const item of raw) {
      const r = asRecord(item);
      if (!r) continue;
      const c = coerceAccountBlock(r);
      if (isPopulatedAccountBlock(c)) return c;
    }

    const entries = raw.flatMap((item) => {
      const r = asRecord(item);
      if (!r) return [];
      return accountEntriesFromBlock(r);
    });
    for (const e of entries) {
      const er = asRecord(e);
      if (!er) continue;
      const c = coerceAccountBlock(er);
      if (isPopulatedAccountBlock(c)) return c;
    }
    return empty;
  }

  return empty;
}

export function hasAccountsData(responseData: unknown): boolean {
  return isPopulatedAccountBlock(normalizeAccountBlockPayload(responseData));
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