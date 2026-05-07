import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested, IsOptional, IsString, IsNumber, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { HeaderDto } from 'src/shared/dtos/headers.dto';

export const REGEX = {
  ACCOUNT_CURRENCY_CODE: /^[A-Za-z0-9]{0,2}$/,
  AGRAGATING_BRANCH: /^[A-Za-z0-9]{0,3}$/,
};

export class ParamsDto {
  @ApiProperty({ 
    description: 'currency code',
    example: '00'
  })
  @Matches(REGEX.ACCOUNT_CURRENCY_CODE)
  @IsString()
  AccountCurrencyCode: string;

  @ApiProperty({ 
    description: 'Flag to indicate whether to call service to get account alerts',
    example: '1'
  })
  @IsNumber()
  GetAccountAlerts: Int8Array;

  @ApiProperty({ 
    description: 'aggragating branch',
    example: '001'
  })
  @Matches(REGEX.AGRAGATING_BRANCH)
  @IsString()
  AgragatingBranch: string;
}

export class GetMortgagesRequestDto {
  @ApiProperty({ type: HeaderDto })
  @ValidateNested()
  @Type(() => HeaderDto)
  Header: HeaderDto;

  @ApiProperty({ type: ParamsDto })
  @ValidateNested()
  @Type(() => ParamsDto)
  Params: ParamsDto;
}
