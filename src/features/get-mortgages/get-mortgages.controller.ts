import { Body, Controller, Post } from '@nestjs/common';
import { GetMortgagesService } from './get-mortgages.service';
import { GetMortgagesRequestDto } from './dto/get-mortgages.dto';

@Controller('get-mortgages')
export class GetMortgagesController {
  constructor(private readonly service: GetMortgagesService) {}

  @Post()
  async getMortgages(@Body() dto: GetMortgagesRequestDto) {
    try {
      return await this.service.getMortgages(dto);
    } catch (error) {
      throw error;
    } 
  }
}
