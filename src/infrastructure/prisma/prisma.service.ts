import {
  Injectable,
  OnModuleInit,
  Logger,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { SecretsManagerService } from '../../infrastructure/aws-secrets/aws-secrets.service';
import { ESecretKey } from 'src/shared/enums/secretKey.enum';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private static prismaClient: PrismaClient; // Singleton Prisma Client
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly secretsManagerService: SecretsManagerService) {}

  // `onModuleInit` is triggered when the module is initialized now 
  async onModuleInit() {
    try {

      await this.secretsManagerService.onModuleInit(); // make sure prisma service is up only after we fetch the keys for the first time.

      if (!PrismaService.prismaClient) {
        const secretKeys: ESecretKey[] = [
          ESecretKey.DB_USERNAME,
          ESecretKey.DB_PASSWORD,
          ESecretKey.DB_HOST,
          ESecretKey.DB_PORT,
          ESecretKey.DB_NAME,
        ];
  
        const [dbUsername, dbPassword, dbHost, dbPort, dbName] = await this.secretsManagerService.getSecrets(secretKeys);

        const dbUrl = `postgresql://${dbUsername}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?schema=public`;

        PrismaService.prismaClient = new PrismaClient({
          datasources: {
            db: {
              url: dbUrl,
            },
          },
        });

        // Connect to the database using the dynamically configured Prisma instance
        await PrismaService.prismaClient.$connect();

        this.logger.log('Connected to the database successfully.');
      }
    } catch (error) {
      this.logger.error('Error connecting to the database:', error.stack);
      throw new Error('Failed to connect to the database');
    }
  }

  async onModuleDestroy() {
    if (PrismaService.prismaClient) {
      // Disconnect dynamically created Prisma client
      await PrismaService.prismaClient.$disconnect();
      this.logger.log('Disconnected from the database.');
    }
  }

  // Static getter to access the PrismaClient instance
  static get client() {
    if (!PrismaService.prismaClient) {
      throw new Error('Prisma Client is not initialized');
    }
    return PrismaService.prismaClient;
  }
}
