import { Signer } from 'ethers';
import { ethers } from 'hardhat';
import {EIP712Resolve, TestERC20} from '../../typechain-types';

export type TestSystemContractsType = {
    eip712Resolve: EIP712Resolve;
    test: {
        quoteToken: TestERC20;
    };
};

export async function deployTestContracts(
    deployer: Signer,
): Promise<TestSystemContractsType> {
    // Deploy mocked contracts

    // Deploy real contracts
    const eip712Resolve = (await (
        await ethers.getContractFactory('EIP712Resolve')
    )
        .connect(deployer)
        .deploy()) as EIP712Resolve;

    const quoteToken = (await (
        await ethers.getContractFactory('TestERC20')
    )
        .connect(deployer)
        .deploy('TQA', 'TQA')) as TestERC20;

    return {
        eip712Resolve,
        test: {
            quoteToken,
        }
    };
}

export async function initTestSystem(
    c: TestSystemContractsType,
    overrides: any,
) {}

export async function deployTestSystem(
    deployer: Signer,
): Promise<TestSystemContractsType> {
    const c = await deployTestContracts(deployer);
    const deployerAddress = await deployer.getAddress();
    return c;
}
