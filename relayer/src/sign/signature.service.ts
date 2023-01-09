import { Injectable } from '@nestjs/common';
import { Contract, ethers } from 'ethers';
import { signTypedData, SignTypedDataVersion } from '@metamask/eth-sig-util';
import { transferERC20ABI } from '../abis/transferERC20.abi';
import { ZERO_ADDRESS } from '../common/utils/web3utils';
import mongoose, { Model } from 'mongoose';
import { Add_signatureDto } from './dto/add_signature.dto';
import { SignatureDocument } from './schema/signature.schema';
import { InjectModel } from '@nestjs/mongoose';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sigUtil = require('eth-sig-util');

@Injectable()
export class SignatureService {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() {}
    private setValueContract: Contract;

    @InjectModel('Signature')
    private readonly signatureModel: Model<SignatureDocument>;

    async mock() {
        const localHostProvider = new ethers.providers.JsonRpcProvider(
            'http://127.0.0.1:8545',
            { name: 'localhost', chainId: 31337 },
        );
        this.setValueContract = new ethers.Contract(
            '0x5fbdb2315678afecb367f032d93f642f64180aa3',
            transferERC20ABI,
            localHostProvider,
        );

        console.log(this.setValueContract);

        // privateKey from ethers.js default mnemonic, do not use that in real env
        const privateKey = Buffer.from(
            'ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
            'hex',
        );

        const signer = new ethers.Wallet(privateKey, localHostProvider);

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
            chainId: 31337,
            verifyingContract: '0x5fbdb2315678afecb367f032d93f642f64180aa3',
        };
        const milsec_deadline = Date.now() / 1000 + 100;
        const deadline = parseInt(String(milsec_deadline).slice(0, 10));

        const message = {
            sender: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
            x: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
            token: ZERO_ADDRESS,
            amount: '5000',
            deadline: deadline,
        };

        const signature = signTypedData({
            privateKey,
            data: {
                types,
                primaryType,
                domain,
                message,
            },
            version: SignTypedDataVersion.V4,
        });
        console.log(ZERO_ADDRESS);
        console.log(deadline);
        console.log(signature);
        const signatureModified = signature.substring(2);
        const r = '0x' + signatureModified.substring(0, 64);
        const s = '0x' + signatureModified.substring(64, 128);
        const v = parseInt(signatureModified.substring(128, 130), 16);

        const u = await this.setValueContract.connect(signer).getChainId();
        console.log(u);

        await this.setValueContract
            .connect(signer)
            .executeSetIfSignatureMatch(
                v,
                r,
                s,
                '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
                deadline,
                '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
                '5000',
                ZERO_ADDRESS,
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
            chainId: 31337,
            verifyingContract: '0x5fbdb2315678afecb367f032d93f642f64180aa3',
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

    async batch() {}
}
