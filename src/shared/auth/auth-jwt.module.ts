import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

import { SecretsManagerService } from '../../infrastructure/aws-secrets/aws-secrets.service';
import { AwsSecretsModule } from '../../infrastructure/aws-secrets/aws-secrets.module';
import { ESecretKey } from '../enums/secretKey.enum';
import { JWT_DEV_FALLBACK_SECRET } from './auth-jwt.constants';
import { JwtAuthGuard } from './jwt-auth.guard';

@Global()
@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [AwsSecretsModule],
      inject: [SecretsManagerService],
      useFactory: async (awsSecretsService: SecretsManagerService) => {
        let secret = JWT_DEV_FALLBACK_SECRET;

        try {
          const fromAws = await awsSecretsService.getSecrets([
            ESecretKey.SESSION_JWT_SECRET,
          ]);
          if (fromAws && typeof fromAws === 'string') {
            secret = fromAws;
          }
        } catch (e) {
          console.warn(
            '[AuthJwtModule] Failed to load JWT secret from AWS, using fallback',
            e?.message || e,
          );
        }

        return { secret };
      },
    }),
  ],
  providers: [JwtAuthGuard],
  exports: [JwtModule, JwtAuthGuard],
})
export class AuthJwtModule {}

