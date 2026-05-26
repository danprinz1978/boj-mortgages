import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { CurrencyMatRow } from './static-data.types';


@Injectable()
export class StaticDataService {
  constructor(private readonly configService: ConfigService) {}

  async getS3Table<T = unknown>(tableName: string): Promise<T> {
    const baseUrl = this.configService.get<string>('STATIC_DATA_BASE_URL')?.trim();
    if (!baseUrl) {
      throw new InternalServerErrorException(
        'STATIC_DATA_BASE_URL is not configured',
      );
    }

    const url = `${baseUrl.replace(/\/$/, '')}/s3-tables/${tableName}`;
    const res = await axios.get<T>(url);
    return res.data;
  }

  async getMatCurrencies(): Promise<CurrencyMatRow[]> {
    const data = await this.getS3Table<CurrencyMatRow[]>('MAT');
    return Array.isArray(data) ? data : [];
  }
  
}
