import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { RequestTokensDTO } from './dtos/requestTokens.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('contract-address')
  getContractAddress(): { address: string } {
    return { address: this.appService.getContractAddress() };
  }

  @Get('total-supply')
  async getTotalSupply(): Promise<number> {
    return await this.appService.getTotalSupply();
  }

  // @Get('allowance/:from/:to')
  // async getAllowance(
  //   @Param('from') from: string,
  //   @Param('to') to: string,
  // ): Promise<number> {
  //   return await this.appService.getAllowance(from, to);
  // }

  @Get('allowance')
  async getAllowance(
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<number> {
    return await this.appService.getAllowance(from, to);
  }

  @Get('transaction-status')
  async getTransactionStatus(@Query('hash') hash: string): Promise<string> {
    return await this.appService.getTransactionStatus(hash);
  }

  @Get('balance-of')
  async getTokenBalance(@Query('address') address: string): Promise<number> {
    return await this.appService.getTokenBalance(address);
  }

  @Post('request-tokens')
  async requestTokens(@Body() body: RequestTokensDTO) {
    return {
      result: await this.appService.requestTokens(body.address, body.amount),
    };
  }
}
