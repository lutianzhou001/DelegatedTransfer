import * as fs from 'fs-extra';
import {TestERC20} from '../typechain-types';
import {toBN} from "./util/web3utils";
const hre = require('hardhat');

async function main() {
  const Signers = await hre.ethers.getSigners();
  fs.writeFileSync('./.env', '\n');

  const _EIP712Resolve = await hre.ethers.getContractFactory('EIP712Resolve');
  const EIP712Resolve = await _EIP712Resolve.deploy();
  console.log('successfully deployed EIP712Resolve: ' + EIP712Resolve.address);
  fs.appendFileSync(
      './.env',
      'EIP712Resolve =' + '"' + EIP712Resolve.address + '"' + '\n',
  );
  const _TestERC20A = await hre.ethers.getContractFactory('TestERC20');
  const TestERC20A = await _TestERC20A.deploy(
      'testQuoteAsset',
      'TQAA',
  );
  console.log('successfully deployed TestERC20A: ' + TestERC20A.address,);
  fs.appendFileSync(
        './.env', 'TestERC20A =' + '"' + TestERC20A.address + '"' + '\n',
  );
  const _TestERC20B = await hre.ethers.getContractFactory('TestERC20');
  const TestERC20B = await _TestERC20B.deploy(
        'testBaseAsset',
       'TQAB',
  );
  console.log('successfully deployed TestERC20B: ' + TestERC20B.address,);
  fs.appendFileSync(
      './.env', 'TestERC20B =' + '"' + TestERC20B.address + '"' + '\n',
  );
  const [signer1, signer2, signer3, sign4] = await hre.ethers.getSigners();
  await TestERC20A.mint(await signer1.getAddress(), toBN('100000'));
  await TestERC20A.mint(await signer2.getAddress(), toBN('100000'));
  await TestERC20A.connect(signer1).approve(EIP712Resolve.address, toBN('100000'));
  await TestERC20A.connect(signer2).approve(EIP712Resolve.address, toBN('100000'));
  await TestERC20B.mint(await signer3.getAddress(), toBN('100000'));
  await TestERC20B.mint(await sign4.getAddress(), toBN('100000'));
  await TestERC20B.connect(signer3).approve(EIP712Resolve.address, toBN('100000'));
  await TestERC20B.connect(sign4).approve(EIP712Resolve.address, toBN('100000'));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
