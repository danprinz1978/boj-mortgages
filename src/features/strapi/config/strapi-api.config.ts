import { Injectable } from '@nestjs/common';
import * as env from 'env-var';

@Injectable()
export class ManagementAPIConfig {
  public readonly url = env
    .get('STRAPI_API_BASE_URL')
    .required()
    .example('http://localhost:1337/api')
    .asString();
}
