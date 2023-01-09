import { Signer } from 'ethers';
import {
    deployTestSystem,
    TestSystemContractsType,
} from '../utils/deployTestSystem';
import { ethers } from 'hardhat';
import { restoreSnapshot, takeSnapshot } from '../utils';
import {ZERO_ADDRESS} from "../../scripts/util/web3utils";

describe('EIP712 - uint tests', async () => {
    let deployer: Signer;
    let contracts: TestSystemContractsType;
    let snapshotId: number;

    before(async function () {
        [deployer] = await ethers.getSigners();
        contracts = await deployTestSystem(deployer);
        snapshotId = await takeSnapshot();
    });

    beforeEach(async function () {
        await restoreSnapshot(snapshotId);
        snapshotId = await takeSnapshot();
    });

    describe('blockId', async () => {
        it('should resolve blockId', async () => {
            const blockId = await contracts.eip712Resolve.getChainId();
            console.log(blockId);
        });
    });

    describe('EIP712Resolve', async () => {
        it('should console result correctly', async () => {
            [deployer] = await ethers.getSigners();
            const transfer = await contracts.eip712Resolve.executeSetIfSignatureMatch(
                '28',
                '0xa206b82709b2255ba07f1bd2a20d11446587d1334a0b386f59c1b6bc64f2d5a2',
                '0x6d1be887b46900cfd06c947c0554de85c28502ae875e4e682a1c00f4cd268527',
                '0xCFc93EDDAaa65472724F4564BCBA792592fe2B58',
                '1673194191',
                100,
            );
            console.log(transfer);
        });
    });
});
