import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { SecretsManagerService } from '../../infrastructure/aws-secrets/aws-secrets.service';
import { PrismaClient } from '@prisma/client';
import { ESecretKey } from 'src/shared/enums/secretKey.enum';

// Mock PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  })),
}));

describe('PrismaService', () => {
  let prismaService: PrismaService;
  let secretsManagerService: jest.Mocked<SecretsManagerService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        {
          provide: SecretsManagerService,
          useValue: {
            onModuleInit: jest.fn(),
            getSecrets: jest.fn(),
          },
        },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
    secretsManagerService = module.get(SecretsManagerService);

    // Reset the static prismaClient before each test
    (PrismaService as any).prismaClient = null;
  });

  it('should be defined', () => {
    expect(prismaService).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should initialize PrismaClient with correct database URL', async () => {
      const mockSecrets = ['user', 'pass', 'host', '5432', 'dbname'];
      secretsManagerService.getSecrets.mockResolvedValue(mockSecrets);

      await prismaService.onModuleInit();

      expect(secretsManagerService.onModuleInit).toHaveBeenCalled();
      expect(secretsManagerService.getSecrets).toHaveBeenCalledWith([
        ESecretKey.DB_USERNAME,
        ESecretKey.DB_PASSWORD,
        ESecretKey.DB_HOST,
        ESecretKey.DB_PORT,
        ESecretKey.DB_NAME,
      ]);

      expect(PrismaClient).toHaveBeenCalledWith({
        datasources: {
          db: {
            url: 'postgresql://user:pass@host:5432/dbname?schema=public',
          },
        },
      });

      expect((PrismaClient as jest.Mock).mock.results[0].value.$connect).toHaveBeenCalled();
    });

    it('should throw an error if database connection fails', async () => {
      secretsManagerService.getSecrets.mockRejectedValue(new Error('Secret fetch failed'));

      await expect(prismaService.onModuleInit()).rejects.toThrow('Failed to connect to the database');
    });
  });

  describe('onModuleDestroy', () => {
    it('should disconnect PrismaClient', async () => {
      // Manually set the prismaClient
      (PrismaService as any).prismaClient = new (PrismaClient as jest.Mock)();

      await prismaService.onModuleDestroy();

      expect((PrismaService as any).prismaClient.$disconnect).toHaveBeenCalled();
    });
  });

  describe('static client', () => {
    it('should throw an error if client is not initialized', () => {
      expect(() => PrismaService.client).toThrow('Prisma Client is not initialized');
    });

    it('should return the client if initialized', async () => {
        const mockPrismaClient = new (PrismaClient as jest.Mock)();
        (PrismaService as any).prismaClient = mockPrismaClient;
      
        expect(PrismaService.client).toBe(mockPrismaClient);
      });
  });
});
