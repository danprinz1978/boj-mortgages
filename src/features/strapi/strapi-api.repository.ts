import { Inject, OnModuleInit } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { BaseEntity } from './entities/base.entity';
import { SecretsManagerService } from 'src/infrastructure/aws-secrets/aws-secrets.service';
import { ManagementAPIResponse } from './types';
import { DataItem } from './types';
import { ESecretKey } from 'src/shared/enums/secretKey.enum';
import { APIException } from 'src/shared/exception/api.exception';
import { EAPIErrorType } from 'src/shared/enums/exceptions';
import { ManagementAPIConfig } from './config/strapi-api.config';

export abstract class StrapiAPIRepository implements OnModuleInit {
  private baseUrl: string;
  private axiosInstance: AxiosInstance;
  private managementApiToken: string;

  constructor(
    @Inject(SecretsManagerService)
    private readonly secretsManagerService: SecretsManagerService,
    @Inject(ManagementAPIConfig)
    private readonly managementAPIConfig: ManagementAPIConfig,
  ) {
    this.baseUrl = this.managementAPIConfig.url;
    this.initAxiosInstance();
  }
  protected abstract getResource(): string;

  async onModuleInit() {
    await this.secretsManagerService.onModuleInit();
    const secretKeys: ESecretKey[] = [ESecretKey.MANAGEMENT_API_TOKEN];
    const result = await this.secretsManagerService.getSecrets(secretKeys);
    const managementApiToken = Array.isArray(result) ? result[0] : result;
    this.managementApiToken = managementApiToken;
  }

  private async initAxiosInstance() {
    await this.onModuleInit();
    this.axiosInstance = axios.create({
      baseURL: `${this.baseUrl}${this.getResource()}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.managementApiToken}`,
      },
    });
  }

  async create<T extends Partial<BaseEntity>>(
    item: T,
    status: string = 'draft',
  ): Promise<any> {
    try {
      const processedItem = await this.processRelations(item);

      const response = await this.axiosInstance.post(
        '',
        { data: processedItem },
        { params: { status: status } },
      );
      return response.data;
    } catch (error) {
      throw new APIException(
        EAPIErrorType.CREATE_ENTITY_ERROR,
        error.response.data,
      );
    }
  }

  private async processRelations<T extends Partial<BaseEntity>>(
    item: T,
  ): Promise<T> {
    let processedItem = { ...item };
    let relationMissing = false;

    // Process family relation based on iconName
    if (
      processedItem &&
      typeof processedItem === 'object' &&
      'iconName' in processedItem &&
      processedItem.iconName
    ) {
      const iconName = processedItem.iconName;

      if (iconName && iconName.toString().trim() !== '') {
        try {
          const existingFamily = await this.findFamilyByName(
            iconName.toString(),
          );
          if (existingFamily) {
            processedItem = {
              ...processedItem,
              family: { connect: [existingFamily.documentId] },
            };
          } else {
            relationMissing = true;
          }
        } catch (error) {
          console.warn(
            `Failed to process family relation for iconName: ${iconName}`,
            error.message,
          );
        }
      }
    }

    // Process document relation based on signatureAppendixCode
    if (
      processedItem &&
      typeof processedItem === 'object' &&
      'signatureAppendixCode' in processedItem &&
      processedItem.signatureAppendixCode
    ) {
      const signatureCode = processedItem.signatureAppendixCode;

      if (signatureCode && signatureCode.toString().trim() !== '') {
        try {
          const existingDocument = await this.findDocumentByName(
            signatureCode.toString(),
          );
          if (existingDocument) {
            processedItem = {
              ...processedItem,
              signatureAppendixCodeRelation: {
                connect: [existingDocument.documentId],
              },
            };
          } else {
            relationMissing = true;
          }
        } catch (error) {
          console.warn(
            `Failed to process document relation for signatureAppendixCode: ${signatureCode}`,
            error.message,
          );
        }
      }
    }

    if (relationMissing) {
      processedItem = { ...processedItem, valid: false } as T;
    }
    return processedItem;
  }

  /**
   * Finds a family by familyName
   */
  private async findFamilyByName(familyName: string): Promise<any> {
    try {
      const familyAxios = axios.create({
        baseURL: `${this.baseUrl}/familys`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.managementApiToken}`,
        },
      });

      const response = await familyAxios.get(
        `/?filters[familyName][$eq]=${familyName}`,
      );
      return response.data?.data?.[0] || null;
    } catch (error) {
      console.warn(
        `Error finding family by name: ${familyName}`,
        error.message,
      );
      return null;
    }
  }

  /**
   * Finds a document by name
   */
  private async findDocumentByName(idDocument: string): Promise<any> {
    try {
      const documentAxios = axios.create({
        baseURL: `${this.baseUrl}/docs`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.managementApiToken}`,
        },
      });

      const response = await documentAxios.get(
        `/?filters[idDocument][$eq]=${idDocument}`,
      );

      return response?.data?.data?.[0] || null;
    } catch (error) {
      console.warn(
        `Error finding document by name: ${idDocument}`,
        error.message,
      );
      return null;
    }
  }

  async findByProductId(productId: string): Promise<any> {
    try {
      const response = await this.axiosInstance.get('', {
        params: {
          'filters[productId][$eq]': productId,
          publicationState: 'preview',
          status: 'draft',
        },
      });
      return this.mapAPIResponseToEntities(response.data)[0] || null;
    } catch (error) {
      console.error(
        `Error searching for productId ${productId}:`,
        error.message,
      );
      return null;
    }
  }

  // // Modify the updateById method to handle 401/403 errors
  async updateById(
    documentId: string,
    item: any,
    status: string = 'draft',
  ): Promise<any> {
    try {
      const processedItem = await this.processRelations(item);
      const response = await this.axiosInstance.put(
        `/${documentId}`,
        {
          data: processedItem,
        },
        {
          params: { status: status },
        },
      );

      return response.data;
    } catch (error) {
      throw new APIException(EAPIErrorType.CREATE_ENTITY_ERROR, error);
    }
  }

  async update(id: number, item: any, status: string = 'draft'): Promise<any> {
    try {
      const response = await this.axiosInstance.put(
        `/${id}`,
        {
          data: item,
        },
        {
          params: { status: status },
        },
      );
      return this.mapAPIResponseToEntities(response.data)[0];
    } catch (error) {
      throw new APIException(EAPIErrorType.UPDATE_ENTITY_ERROR);
    }
  }

  async delete(id: number): Promise<any> {
    try {
      const response = await this.axiosInstance.delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw new APIException(EAPIErrorType.DELETE_ENTITY_ERROR);
    }
  }

  async findAll(query?: string): Promise<any[]> {
    const url = query ? `/?${query}` : '/';
    return this.getRequest<any>(url);
  }

  async findById(id: number): Promise<any> {
    const url = `/${id}`;
    return this.getRequest<any>(url);
  }

  async findOneBy<T extends BaseEntity>(
    query: Record<string, any>,
  ): Promise<T> {
    const field = Object.keys(query)[0];
    const value = query[field];
    const url = `/?filters[${field}][$eq]=${value}`;
    const entities = await this.getRequest<T>(url);
    return entities[0];
  }

  /**
   * Performs a GET request to the specified URL and maps the API response to an array of entities.
   *
   * @template T - The type of entity extending BaseEntity.
   * @param {string} url - The endpoint URL to send the GET request to.
   * @returns {Promise<T[]>} - A promise that resolves to an array of mapped entities of type T.
   *
   * @throws {APIException} - Throws specific APIException based on:
   *   - 404 response: RESOURCE_NOT_FOUND
   *   - URL pattern: FETCH_ENTITIES_ERROR, FETCH_ENTITY_BY_ID_ERROR, or FETCH_ENTITY_BY_FIELD_ERROR
   *   - All other errors: TECHNICAL_ERROR
   *
   * @example
   * const users = await getRequest<UserEntity>('/users');
   */
  private async getRequest<T extends BaseEntity>(url: string): Promise<T[]> {
    try {
      const response = await this.axiosInstance.get(url);
      return this.mapAPIResponseToEntities(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        throw new APIException(EAPIErrorType.RESOURCE_NOT_FOUND);
      }

      let errorType = EAPIErrorType.TECHNICAL_ERROR;
      if (url === '/') {
        errorType = EAPIErrorType.FETCH_ENTITIES_ERROR;
      } else if (url.match(/^\/(\d+)$/)) {
        errorType = EAPIErrorType.FETCH_ENTITY_BY_ID_ERROR;
      } else if (url.includes('filters[')) {
        errorType = EAPIErrorType.FETCH_ENTITY_BY_FIELD_ERROR;
      }

      throw new APIException(errorType);
    }
  }

  private mapAPIResponseToEntities<T extends BaseEntity>(
    response: ManagementAPIResponse,
  ): T[] {
    const data = Array.isArray(response.data) ? response.data : [response.data];
    return data.map((item: DataItem) => {
      return this.mapItemToEntity<T>(item);
    });
  }

  private mapItemToEntity<T extends BaseEntity>(item: DataItem): T {
    const mapped = { id: item.id, ...(item.attributes as Partial<T>) } as any;
    if (item.documentId && !mapped.documentId) {
      mapped.documentId = item.documentId;
    }
    return mapped as T;
  }
}