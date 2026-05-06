import {
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// Regex constants
export const REGEX_ISO_TIMESTAMP =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
export const REGEX_TIMEZONE = /^[0-9a-zA-Z _+\./:\-]*$/;
export const REGEX_SERVICE_NAME = /^$|^[A-Za-z][A-Za-z0-9_]{0,49}$/;
export const REGEX_STEP = /^[a-zA-Z0-9]*$/;
export const REGEX_ACTION = /^[0-9]*$/;
export const REGEX_ID_NUMBER = /^[0-9a-zA-Z \-״ \._:\*,]*$/;
export const REGEX_LANGUAGE = /^(HEB|ENG|ARB|RUS|GEN|THA|CHS|ARA|CHI)$/;
export const REGEX_ACCOUNT = /^[0-9]*$/;
export const REGEX_GENERIC = /^[0-9a-zA-Z״ \._:\*\-\?]*$/;
export const REGEX_USER_ID = /^[0-9a-zA-Z \-״ \._:\*,]*$/;
export const REGEX_TRANSACTION_ID = /^[0-9a-zA-Z\\״ \\._:\\*\\-\\?]*$/;
export const IP_REGEX = /^(|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))$/;

export class TimestampDto {
  @Matches(REGEX_ISO_TIMESTAMP)
  @IsString()
  RequestTimestamp: string;

  @IsNumber()
  RequestTimeout: number;

  @Matches(REGEX_TIMEZONE)
  @IsString()
  TimeZone: string;
}

export class ServiceInfoDto {
  @Matches(REGEX_SERVICE_NAME)
  @IsOptional()
  @IsString()
  ServiceName?: string;

  @Matches(REGEX_SERVICE_NAME)
  @IsOptional()
  @IsString()
  SubService?: string;

  @Matches(REGEX_STEP)
  @IsOptional()
  @IsString()
  Step?: string;

  @IsNumber()
  Priority: number;

  @Matches(REGEX_STEP)
  @IsOptional()
  @IsString()
  MessageId?: string;

  @Matches(IP_REGEX)
  @IsOptional()
  @IsString()
  From?: string;

  @Matches(IP_REGEX)
  @IsOptional()
  @IsString()
  ReplyTo?: string;

  @Matches(IP_REGEX)
  @IsOptional()
  @IsString()
  FaultTo?: string;

  @Matches(IP_REGEX)
  @IsOptional()
  @IsString()
  RelatedTo?: string;

  @Matches(REGEX_ACTION)
  @IsOptional()
  @IsString()
  Action?: string;
}

export class PagingInfoDto {
  @IsNumber() MaxNumberOfRecords: number;
  @IsNumber() LastSentRecordNumber: number;
}

export class EnvironmentInfoDto {
  @Matches(REGEX_GENERIC)
  @IsString()
  ChannelName: string;

  @Matches(REGEX_GENERIC)
  @IsOptional()
  @IsString()
  Site?: string;

  @Matches(IP_REGEX)
  @IsString()
  ClientIP: string;

  @Matches(IP_REGEX)
  @IsString()
  ApplicationServerIP: string;

  @Matches(REGEX_GENERIC)
  @IsString()
  SessionId: string;

  @Matches(REGEX_GENERIC)
  @IsOptional()
  @IsString()
  CoreSessionID?: string;

  @Matches(REGEX_TRANSACTION_ID)
  @IsString()
  TransactionId: string;

  @Matches(REGEX_LANGUAGE)
  @IsOptional()
  @IsString()
  Language?: string;

  @Matches(REGEX_GENERIC)
  @IsString()
  versionId: string;

  @Matches(REGEX_GENERIC)
  @IsString()
  Device: string;

  @Matches(REGEX_GENERIC)
  @IsString()
  Platform: string;

  @Matches(REGEX_GENERIC)
  @IsString()
  OS: string;

  @Matches(REGEX_USER_ID)
  @IsOptional()
  @IsString()
  UserId?: string;

  @IsOptional() @IsString() UserTypeId?: string;
}

export class UserInfoDto {
  @Matches(REGEX_ACTION)
  @IsOptional()
  @IsString()
  IdType?: string;

  @Matches(REGEX_ID_NUMBER)
  @IsOptional()
  @IsString()
  IdNumber?: string;
}

export class AccountInfoDto {
  @Matches(REGEX_ACCOUNT)
  @IsOptional()
  @IsString()
  BankNumber?: string;

  @Matches(REGEX_ACCOUNT)
  @IsOptional()
  @IsString()
  BranchNumber?: string;

  @Matches(REGEX_ACCOUNT)
  @IsOptional()
  @IsString()
  AccountNumber?: string;
}

export class HeaderDto {
  @ValidateNested() @Type(() => TimestampDto) Timestamp: TimestampDto;
  @ValidateNested() @Type(() => ServiceInfoDto) ServiceInfo: ServiceInfoDto;
  @ValidateNested() @Type(() => PagingInfoDto) PagingInfo: PagingInfoDto;
  @ValidateNested()
  @Type(() => EnvironmentInfoDto)
  EnvironmentInfo: EnvironmentInfoDto;
  @ValidateNested() @Type(() => UserInfoDto) UserInfo: UserInfoDto;
  @ValidateNested() @Type(() => AccountInfoDto) AccountInfo: AccountInfoDto;
}
