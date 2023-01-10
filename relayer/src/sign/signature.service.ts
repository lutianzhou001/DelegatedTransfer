import { Injectable } from '@nestjs/common';
import { BigNumber, Contract, ethers, providers } from 'ethers';
import { signTypedData, SignTypedDataVersion } from '@metamask/eth-sig-util';
import { transferERC20ABI } from '../abis/transferERC20.abi';
import { ZERO_ADDRESS } from '../common/utils/web3utils';
import { Model } from 'mongoose';
import { Add_signatureDto } from './dto/add_signature.dto';
import { SignatureDocument } from './schema/signature.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sigUtil = require('eth-sig-util');

@Injectable()
export class SignatureService {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor(
        @InjectModel('Signature')
        private readonly signatureModel: Model<SignatureDocument>,
        private readonly configService: ConfigService,
    ) {}

    async getProvider(): Promise<providers.Provider> {
        return new ethers.providers.JsonRpcProvider(
            this.configService.get('ProviderUrl'),
            {
                name: this.configService.get('ProviderName'),
                chainId: Number(this.configService.get('ProviderChainId')),
            },
        );
    }
    async getInstance(): Promise<Contract> {
        const localHostProvider = new ethers.providers.JsonRpcProvider(
            String(this.configService.get('ProviderUrl')),
            {
                name: String(this.configService.get('ProviderName')),
                chainId: Number(this.configService.get('ProviderChainId')),
            },
        );
        return new ethers.Contract(
            String(this.configService.get('ContractAddress')),
            transferERC20ABI,
            localHostProvider,
        );
    }

    async newSig(add_signatureDto: Add_signatureDto): Promise<any> {
        const types = {
            EIP712Domain: [
                { name: 'name', type: 'string' },
                { name: 'version', type: 'string' },
                { name: 'chainId', type: 'uint256' },
                { name: 'verifyingContract', type: 'address' },
            ],
            transfer: [
                { name: 'sender', type: 'address' },
                { name: 'x', type: 'address' },
                { name: 'token', type: 'address' },
                { name: 'amount', type: 'uint' },
                { name: 'deadline', type: 'uint' },
            ],
        };
        const primaryType = 'transfer';
        const domain = {
            name: 'TransferTest',
            version: '1',
            chainId: Number(this.configService.get('ProviderChainId')),
            verifyingContract: this.configService.get('ContractAddress'),
        };
        const message = {
            sender: add_signatureDto.sender,
            x: add_signatureDto.x,
            token: add_signatureDto.token,
            amount: add_signatureDto.amount,
            deadline: add_signatureDto.deadline,
        };

        if (add_signatureDto.signature.length !== 132) {
            throw new Error('INVALID_SIGNATURE: INVALID_SIGNATURE_LENGTH');
        } else {
            const recovered = sigUtil.recoverTypedSignature_v4({
                data: {
                    types,
                    primaryType,
                    domain,
                    message,
                },
                sig: add_signatureDto.signature,
            });
            if (recovered != add_signatureDto.sender) {
                throw new Error('INVALID_SIGNATURE: INVALID_SIGNATURE');
            } else {
                // record to the database;
                const signatureExisted = await this.signatureModel.findOne({
                    signature: add_signatureDto.signature,
                });
                if (signatureExisted) {
                    throw new Error('SIGNATURE_EXISTED');
                } else {
                    return await new this.signatureModel(
                        add_signatureDto,
                    ).save();
                }
            }
        }
    }

    @Cron(CronExpression.EVERY_SECOND)
    async batch(): Promise<any> {
        const unexecutedSignatures = await this.signatureModel.find({
            executed: undefined,
        });
        const batchTransfer = await this.getInstance();
        const payload = [];
        for (let i = 0; i < unexecutedSignatures.length; i++) {
            const unexecutedSignatureModified =
                unexecutedSignatures[i].signature.substring(2);
            const r = '0x' + unexecutedSignatureModified.substring(0, 64);
            const s = '0x' + unexecutedSignatureModified.substring(64, 128);
            const v = parseInt(
                unexecutedSignatureModified.substring(128, 130),
                16,
            );
            payload.push([
                v,
                r,
                s,
                unexecutedSignatures[i].sender,
                unexecutedSignatures[i].deadline,
                unexecutedSignatures[i].x,
                unexecutedSignatures[i].amount,
                unexecutedSignatures[i].token,
            ]);
            const estimatedGas =
                await batchTransfer.estimateGas.batchExecuteSetIfSignatureMatch(
                    payload,
                );
            if (
                estimatedGas.gte(
                    BigNumber.from(this.configService.get('GasLimit')),
                )
            ) {
                payload.pop();
                break;
            }
        }
        // privateKey from ethers.js default mnemonic, do not use that in real env
        const privateKey = Buffer.from(
            String(this.configService.get('PrivateKey')),
            'hex',
        );
        const localHostProvider = await this.getProvider();
        if (payload.length > 0) {
            const signer = new ethers.Wallet(privateKey, localHostProvider);
            await batchTransfer
                .connect(signer)
                .batchExecuteSetIfSignatureMatch(payload);
        }
        // update the mongoDB
        for (let i = 0; i < payload.length; i++) {
            await this.signatureModel.updateOne(
                { signature: unexecutedSignatures[i].signature },
                { executed: true },
            );
        }
    }
}
