import {
  BadRequestException,
  Injectable,
  Logger,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '@moveotech/logger';
import { getServerIp, normalizeIp, validateIpFormat } from '../utils/ip-utils';

// TODO: forward to common libs

@Injectable()
export class ExtendHeadersMiddleware implements NestMiddleware {
  private readonly nestLogger = new Logger(ExtendHeadersMiddleware.name);
  constructor(private readonly logger: LoggerService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.body.Header) req.body.Header = {};
      if (!req.body.Header.EnvironmentInfo)
        req.body.Header.EnvironmentInfo = {};

      if (req.body.Header.EnvironmentInfo.ClientIP !== '') {
        throw new BadRequestException(
          `Invalid ClientIP format: ${req.body.Header.EnvironmentInfo.ClientIP}. Must be empty string`,
        );
      }
      if (req.body.Header.EnvironmentInfo.ApplicationServerIP !== '') {
        throw new BadRequestException(
          `Invalid ApplicationServerIP format: ${req.body.Header.EnvironmentInfo.ApplicationServerIP}. Must be empty string`,
        );
      }

      const clientIP = normalizeIp(req.ip);
      req.body.Header.EnvironmentInfo.ClientIP = clientIP;

      let applicationServerIP = '1.1.1.1';

      try {
        const rawServerIp = getServerIp();
        applicationServerIP = validateIpFormat(rawServerIp);
      } catch (error) {
        this.logger.error(error);
      }

      req.body.Header.EnvironmentInfo.ApplicationServerIP = applicationServerIP;

      next();
    } catch (error) {
      this.logger.error('error adding client and server IP');
      next();
    }
  }
}
