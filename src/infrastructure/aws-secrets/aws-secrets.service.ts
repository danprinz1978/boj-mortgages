import { SecretsManager } from '@aws-sdk/client-secrets-manager';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ESecretKey } from '../../shared/enums/secretKey.enum';

@Injectable()
export class SecretsManagerService {
  private readonly secretsManager: SecretsManager;
  private secrets: Record<string, string> | null = null;
  private readonly logger = new Logger(SecretsManagerService.name);
  private secretsGroupName: string;
  private lastFetched: number | null = null;
  private readonly MS_SECRET_REFRESH_INTERVAL: number;

  constructor(
    private readonly configService: ConfigService, // Inject ConfigService
  ) {
    this.secretsManager = new SecretsManager({
      region: this.configService.get<string>('AWS_REGION'), // Get the region from environment variables
    });
    this.secretsGroupName = this.configService.get<string>('SECRET_NAME');
    this.MS_SECRET_REFRESH_INTERVAL = parseInt(
      this.configService.get<string>('MS_SECRET_REFRESH_INTERVAL'),
      10,
    );
  }

  async onModuleInit() {
    await this.fetchSecrets(); // Load secrets when the service is initialized
  }

  private async fetchSecrets() {
    try {
      const secretValue = await this.secretsManager.getSecretValue({
        SecretId: this.secretsGroupName,
      });
      this.secrets = secretValue.SecretString
        ? JSON.parse(secretValue.SecretString)
        : this.secrets;

      this.lastFetched = Date.now();
      this.logger.log('secret fetched successfully');
    } catch (error) {
      this.logger.error('Error fetching secret from AWS', error.stack);
    }
  }

  async refreshSecrets() {
    try {
      this.secrets = null;
      await this.fetchSecrets();
      this.logger.log('Secrets refreshed successfully.');
    } catch (error) {
      this.logger.error('Error refreshing secrets from AWS', error.stack);
    }
  }

  async getSecrets(secretIds: ESecretKey[]): Promise<string | string[]> {
    try {
      if (
        this.lastFetched &&
        Date.now() - this.lastFetched > this.MS_SECRET_REFRESH_INTERVAL
      ) {
        await this.refreshSecrets();
      }

      const secrets = secretIds.map((secretId) => {
        const secret = this.secrets ? this.secrets[secretId] : undefined;
        if (!secret) {
          throw new Error(`Secret ${secretId} not found`);
        }
        return secret;
      });

      return secretIds.length === 1 ? secrets[0] : secrets;
    } catch (error) {
      this.logger.error(
        `Error fetching secrets "${secretIds.join(', ')}"`,
        error.stack,
      );
      throw error;
    }
  }
}
