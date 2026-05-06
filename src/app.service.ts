import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    // function for testing purpose
    return 'server is running';
  }
}
