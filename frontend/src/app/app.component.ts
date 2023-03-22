import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { BigNumber, Contract, ethers, utils, Wallet } from 'ethers';
import tokenJson from '../assets/MyToken.json';


const API_URL = "http://localhost:3000/contract-address";
const API_URL_MINT = "http://localhost:3000/request-tokens";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  blockNumber: number | string | undefined;
  provider: ethers.providers.BaseProvider;
  userWallet: Wallet | undefined;
  userEthBalance: number | undefined;
  userTokenBalance: number | string | undefined;
  tokenContractAddress: string | undefined;
  tokenContract: Contract | undefined;
  tokenTotalSupply: number | string | undefined;
  txHash: string | undefined;

  constructor(private http: HttpClient) {
    this.provider = ethers.getDefaultProvider("goerli");
  }

  getTokenAddress() {
    return this.http.get<{address: string}>(API_URL);
  }

  syncBlock() {
    this.blockNumber = "Loading...";
    this.provider.getBlock("latest").then((block) => {
      this.blockNumber = block.number;
    });
    this.getTokenAddress().subscribe((response) => {
      this.tokenContractAddress = response.address;
      this.updateTokenInfo(null);
    });
  }

  updateTokenInfo(address: string | null) {
    if (!this.tokenContractAddress) return;
    this.tokenContract = new Contract(
      this.tokenContractAddress,
      tokenJson.abi,
      this.userWallet ?? this.provider
    );
    this.tokenTotalSupply = "...Loading";
    this.tokenContract['totalSupply']().then((totalSupplyBN: BigNumber) => {
      const totalSupplyStr = utils.formatEther(totalSupplyBN);
      this.tokenTotalSupply = parseFloat(totalSupplyStr);
    });
    if (address = null) return;
    this.userTokenBalance = "...Loading";
    this.tokenContract['balanceOf'](address).then((balanceOfBN: BigNumber) => {
      const balanceOfStr = utils.formatEther(balanceOfBN);
      this.userTokenBalance = parseFloat(balanceOfStr);
    });
  }

  // updateBalanceOf(address: string) {
  //   this.userTokenBalance = "...Loading";
  //   this.tokenContract?['balanceOf']().then((balanceOfBN: BigNumber) => {
  //     const balanceOfStr = utils.formatEther(balanceOfBN);
  //     this.userTokenBalance = parseFloat(balanceOfStr);
  //   });
  // }

  clearBlock() {
    this.blockNumber = 0;
  }

  createWallet() {
    this.userWallet = Wallet.createRandom().connect(this.provider);
    this.userWallet.getBalance().then((balanceBN) => {
      const balanceStr = utils.formatEther(balanceBN);
      this.userEthBalance = parseFloat(balanceStr);
    })
  }

  requestTokens(amountStr: string) {
    const amount = parseFloat(amountStr);
    const body = {address: this.userWallet?.address, amount: amount};
    this.http.post<{result: string}>(API_URL_MINT, body).subscribe((result) => {
      console.log('Requested ' + amount + ' tokens for address ' + this.userWallet?.address);
      console.log('Transaction hash: ' + result.result);
      this.txHash = result.result;
    });
    if (!this.userWallet) return;
    this.updateTokenInfo(this.userWallet.address);
  }
}
