import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SecretsManagerService } from './aws-secrets.service';
import { SecretsManager } from '@aws-sdk/client-secrets-manager';
import { ESecretKey } from '../../shared/enums/secretKey.enum';

jest.mock('@aws-sdk/client-secrets-manager');

describe('SecretsManagerService', () => {
  let service: SecretsManagerService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecretsManagerService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<SecretsManagerService>(SecretsManagerService);
    configService = module.get<ConfigService>(ConfigService);

    // Mock the AWS SDK calls
    (SecretsManager.prototype.getSecretValue as jest.Mock).mockResolvedValue({
      SecretString: JSON.stringify({
        API_KEY: 'BOJ-TEMPLATE',
        DB_USERNAME: 'danielasegal',
        DB_PASSWORD: 'postgres',
        DB_HOST: 'localhost',
        DB_PORT: '5432',
        DB_NAME: 'postgres',
      }),
    });

    // Set up config values
    mockConfigService.get.mockImplementation((key: string) => {
      const config = {
        AWS_REGION: 'us-west-2',
        SECRET_NAME: 'test-secrets',
        MS_SECRET_REFRESH_INTERVAL: '3600000',
      };
      return config[key];
    });

    // Initialize secrets
    await service.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fetchSecrets', () => {
    it('should log an error when fetching secrets fails', async () => {
      const mockError = new Error('AWS Error');
      (
        SecretsManager.prototype.getSecretValue as jest.Mock
      ).mockRejectedValueOnce(mockError);
      const loggerErrorSpy = jest.spyOn(service['logger'], 'error');
      await service.onModuleInit();
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Error fetching secret from AWS',
        mockError.stack,
      );
    });

    it('should not change secrets when SecretString does not exist', async () => {
      const originalSecrets = { existingKey: 'existingValue' };
      service['secrets'] = originalSecrets;
      (SecretsManager.prototype.getSecretValue as jest.Mock).mockResolvedValueOnce({});
      await service['fetchSecrets']();
      expect(service['secrets']).toEqual(originalSecrets);
    });
  
    // ... existing error test case ...
  });

  describe('refreshSecrets', () => {
    it('should refresh secrets when the refresh interval has passed', async () => {
      jest.spyOn(service as any, 'refreshSecrets');

      // Set lastFetched to a time that exceeds the refresh interval
      (service as any).lastFetched = Date.now() - 3600001;

      await service.getSecrets([ESecretKey.API_KEY]);

      expect((service as any).refreshSecrets).toHaveBeenCalled();
    });

    it('should successfully refresh secrets', async () => {
      const loggerLogSpy = jest.spyOn(service['logger'], 'log');
      await service.refreshSecrets();
      expect(loggerLogSpy).toHaveBeenCalledWith('Secrets refreshed successfully.');
    });

    it('should log an error when refreshing secrets fails', async () => {
      const mockError = new Error('AWS Refresh Error');
      // Mock fetchSecrets to throw an error
      jest.spyOn(service as any, 'fetchSecrets').mockRejectedValueOnce(mockError);
      const loggerErrorSpy = jest.spyOn(service['logger'], 'error');
      await service.refreshSecrets();
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Error refreshing secrets from AWS',
        mockError.stack
      );
    });
  });

  describe('getSecrets', () => {
    it('should return a single secret when one key is provided', async () => {
      const result = await service.getSecrets([ESecretKey.API_KEY]);
      expect(result).toBe('BOJ-TEMPLATE');
    });

    it('should return multiple secrets when multiple keys are provided', async () => {
      const result = await service.getSecrets([
        ESecretKey.DB_USERNAME,
        ESecretKey.DB_PASSWORD,
      ]);
      expect(result).toEqual(['danielasegal', 'postgres']);
    });

    it('should throw an error when a secret is not found', async () => {
      await expect(
        service.getSecrets([ESecretKey.NON_EXISTING_SECRET as any]),
      ).rejects.toThrow('Secret NON_EXISTING_SECRET not found');
    });

    it('should throw an error when secretIds contain a mix of valid and invalid secrets', async () => {
      await expect(
        service.getSecrets([
          ESecretKey.API_KEY,
          ESecretKey.NON_EXISTING_SECRET as any,
        ]),
      ).rejects.toThrow('Secret NON_EXISTING_SECRET not found');
    });

    it('should not refresh secrets if the refresh interval has not passed', async () => {
      const spy = jest.spyOn(service as any, 'refreshSecrets');
      (service as any).lastFetched = Date.now(); // within the interval

      await service.getSecrets([ESecretKey.API_KEY]);

      expect(spy).not.toHaveBeenCalled(); // Should not refresh secrets
    });

    it('should throw an error when this.secrets is null', async () => {
      (service as any).secrets = null;
      await expect(service.getSecrets([ESecretKey.API_KEY])).rejects.toThrow('Secret API_KEY not found');
    });
  });
});
