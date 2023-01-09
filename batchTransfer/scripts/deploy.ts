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
  const _TestERC20 = await hre.ethers.getContractFactory('TestERC20');
  const TestERC20 = await _TestERC20.deploy(
      'testQuoteAsset',
      'TQA',
  );
  console.log('successfully deployed TestERC20: ' + TestERC20.address,);
  fs.appendFileSync(
        './.env', 'TestERC20 =' + '"' + TestERC20.address + '"' + '\n',
  );

  const [signer1, signer2] = await hre.ethers.getSigners();
  await TestERC20.mint(await signer1.getAddress(), toBN('100000'));
  await TestERC20.mint(await signer2.getAddress(), toBN('100000'));
  await TestERC20.connect(signer1).approve(EIP712Resolve.address, toBN('100000'));
  await TestERC20.connect(signer2).approve(EIP712Resolve.address, toBN('100000'));

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
