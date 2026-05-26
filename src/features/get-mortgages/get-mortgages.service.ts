import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpProxyService } from '@moveotech/http-proxy';
import { SecretsManagerService } from 'src/infrastructure/aws-secrets/aws-secrets.service';
import { LoggerService } from '@moveotech/logger';
import { ESecretKey } from 'src/shared/enums/secretKey.enum';
import { AxiosResponse } from 'axios';
import { injectTransactionId } from 'src/shared/utils/injects-transaction-id';
import { throwMappedError } from 'src/shared/exception/bank.exception';
import { GetMortgagesRequestDto } from './dto/get-mortgages.dto';
import {
  GetMortgagesResponseDto,
  GetMortgagesClientResponseDto,
  UpstreamResponseMessage,
} from './types/get-mortgages-response.type';
import {
  EGetMortgagesErrorCodes,
  GetMortgagesErrorMapping,
} from './types/error-map/get-mortgages-error.type';
import {
  extractMortgagesAccountsBlockPayload,
  hasAccountsData,
  normalizeAccountBlockPayload,
  normalizeResponseMessages,
} from './helpers/get-mortgages.helpers';
import { StaticDataService } from './static-data/static-data.service';
import { buildCurrencySymbolMap } from './utils/get-mortgages-currency.util';
import { mapGetMortgagesToClientDto } from './mappers/get-mortgages.mapper';
import { enrichGetMortgagesWithCurrencySymbols } from './utils/get-mortgages-currency.util';

@Injectable()
export class GetMortgagesService {
  private xAuthValidator: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpProxyService: HttpProxyService,
    private readonly secretsManagerService: SecretsManagerService,
    private readonly BOJLogger: LoggerService,
    private readonly staticDataService: StaticDataService,
  ) {}
  
  

  async onModuleInit() {
    await this.secretsManagerService.onModuleInit();
    const secretKeys: ESecretKey[] = [ESecretKey.X_AUTH_VALIDATOR];

    const [xAuthValidator] =
      await this.secretsManagerService.getSecrets(secretKeys);

    this.xAuthValidator = xAuthValidator;
  }

  async getMortgages(dto: GetMortgagesRequestDto) {
    const apiUrl = this.configService.get<string>('GET_MORTGAGES_API');

    const extraHeaders = {
      'X-Auth-Validator': this.xAuthValidator,
      'Content-Type': 'application/json',
    };

    try {
      this.BOJLogger.log('Get mortgages request with the following payload', {
        payload: dto,
      });

      let response: AxiosResponse<GetMortgagesResponseDto>;

      const requestPayload = injectTransactionId({ Channel: dto.Header, Header: dto.Header });

      try {
        response = await this.httpProxyService.post(
          apiUrl,
          requestPayload,
          extraHeaders,
        );
      } catch {
        throwMappedError({
          errorCode: EGetMortgagesErrorCodes.GET_MORTGAGES_FAILED,
          errorMapping: GetMortgagesErrorMapping,
        });
      }

      const responseDataRaw = response.data as GetMortgagesResponseDto & {
        header?: { responseMessages?: { messages?: UpstreamResponseMessage[] } };
        params?: { accountsBlock?: unknown };
      };

      const messages = normalizeResponseMessages(
        responseDataRaw?.Header?.ResponseMessages?.Message ??
          responseDataRaw?.header?.responseMessages?.messages,
      );

      if (messages.length === 0) {
        this.BOJLogger.error(
          'Get mortgages response missing Header.ResponseMessages.Message',
          {
            responseData: response.data,
          },
        );
        throwMappedError({
          errorCode: EGetMortgagesErrorCodes.EMPTY_RESPONSE,
          errorMapping: GetMortgagesErrorMapping,
        });
      }

      const failedMessage = messages.find((m) => m.ResponseCode !== 0);
      if (failedMessage) {
        this.BOJLogger.error('Get mortgages response with non-zero response code', {
          responseData: response.data,
        });
        throwMappedError({
          errorCode: EGetMortgagesErrorCodes.RESPONSE_CODE_ERROR,
          responseCode: failedMessage.ResponseCode,
          errorMapping: GetMortgagesErrorMapping,
        });
      }

      const responseData = extractMortgagesAccountsBlockPayload(responseDataRaw);

      if (!hasAccountsData(responseData)) {
        throwMappedError({
          errorCode: EGetMortgagesErrorCodes.EMPTY_RESPONSE,
          errorMapping: GetMortgagesErrorMapping,
        });
      }

      this.BOJLogger.log('Get  mortgages retrieved successfully', {
        response: response.data,
      });

      const [matCurrencies] = await Promise.all([
        this.staticDataService.getMatCurrencies(),
      ]);
      const codeToSymbol = buildCurrencySymbolMap(matCurrencies);

      const header =
        responseDataRaw.Header ?? responseDataRaw.header;
      if (!header) {
        this.BOJLogger.error(
          'Get mortgages response missing Header',
          { responseData: response.data },
        );
        throwMappedError({
          errorCode: EGetMortgagesErrorCodes.EMPTY_RESPONSE,
          errorMapping: GetMortgagesErrorMapping,
        });
      }

      const accountBlock = normalizeAccountBlockPayload(responseData);

      const mapped = mapGetMortgagesToClientDto(accountBlock);
      const enriched = enrichGetMortgagesWithCurrencySymbols(mapped, codeToSymbol);

      return {
        Header: header as GetMortgagesResponseDto['Header'],
        Params: {
          AccountsBlock: [enriched],
        },
      } satisfies GetMortgagesClientResponseDto;

    } catch (error) {
      this.BOJLogger.error(
        `Error getting mortgages: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}