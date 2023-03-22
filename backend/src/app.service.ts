import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import * as tokenJson from './assets/MyToken.json';
import * as dotenv from 'dotenv';
import { ConfigService } from '@nestjs/config';

dotenv.config();

const CONTRACT_ADDRESS = '0xbA3F65C92DD04673e3e69528BE893Ae61adAfD7e';

@Injectable()
export class AppService {
  provider: ethers.providers.Provider;
  contract: ethers.Contract;

  constructor(protected configService: ConfigService) {
    this.provider = ethers.getDefaultProvider('goerli');
    this.contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      tokenJson.abi,
      this.provider,
    );
    console.log('Bootstrap!');
  }

  async getTotalSupply(): Promise<number> {
    const totalSupplyBN = await this.contract.totalSupply();
    const totalSupplyString = ethers.utils.formatEther(totalSupplyBN);
    const totalSupplyNumber = parseFloat(totalSupplyString);
    return totalSupplyNumber;
  }

  getContractAddress(): string {
    return this.contract.address;
  }

  async getAllowance(from: string, to: string): Promise<number> {
    const allowanceBN = await this.contract.allowance(from, to);
    const allowanceString = ethers.utils.formatEther(allowanceBN);
    const allowanceNumber = parseFloat(allowanceString);
    return allowanceNumber;
  }

  async getTransactionStatus(hash: string): Promise<string> {
    const tx = await this.provider.getTransaction(hash);
    const txReceipt = await tx.wait();
    return txReceipt.status == 1 ? 'Completed' : 'Reverted';
  }

  async requestTokens(address: string, amount: number): Promise<string> {
    const pkey = process.env.PRIVATE_KEY;
    const signer = new ethers.Wallet(pkey, this.provider);
    const mintTx = await this.contract
      .connect(signer)
      .mint(address, ethers.utils.parseEther(amount.toString()));
    const mintTxReciept = await mintTx.wait();
    const mintTxHash = await mintTxReciept.transactionHash;
    return mintTxHash;
  }

  async getTokenBalance(address: string) {
    const balanceBN = await this.contract.balanceOf(address);
    await balanceBN;
    const balance = ethers.utils.formatEther(balanceBN);
    return parseFloat(balance);
  }
}
