import { Controller, Get, Post, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { LoggerService } from '@moveotech/logger';
import { error } from 'console';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly loggerService: LoggerService,
  ) {}

  @Get()
  async getHello(@Req() req: Request) {
    return {
      message: 'Hello World',
    };
  }
}