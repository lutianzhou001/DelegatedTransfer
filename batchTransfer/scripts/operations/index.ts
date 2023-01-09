import * as readline from 'readline';
import hre, { ethers, config } from 'hardhat';
import { toBN } from '../util/web3utils';
import inquirer from 'inquirer';
import * as dotenv from 'dotenv';
const sigUtil = require('eth-sig-util');
import chalk from 'chalk';
import { signTypedData, SignTypedDataVersion } from '@metamask/eth-sig-util';
const request = require('request');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function question(query: string) {
    return new Promise((resolve) =>
        rl.question(query, (answ) => resolve(answ)),
    );
}

function operation(query: string) {
    return new Promise((resolve) =>
        rl.question(query, (answ) => resolve(answ)),
    );
}

function send(method: string, params?: Array<any>) {
    return hre.ethers.provider.send(method, params === undefined ? [] : params);
}

function mineBlock() {
    return send('evm_mine', []);
}

async function fastForward(seconds: number) {
    const method = 'evm_increaseTime';
    const params = [seconds];
    await send(method, params);
    await mineBlock();
}

async function currentTime() {
    const { timestamp } = await ethers.provider.getBlock('latest');
    return timestamp;
}

async function main() {
    dotenv.config();

    const signers = await hre.ethers.getSigners();
    const _eip712Resolve = await hre.ethers.getContractFactory('EIP712Resolve');
    const eip712Resolve = await _eip712Resolve.attach(
        String(process.env.EIP712Resolve),
    );

    const _testToken = await hre.ethers.getContractFactory('TestERC20');
    const testToken = await _testToken.attach(
        String(process.env.TestERC20),
    );

    let currentSigner = await signers[0];
    let privateKey = Buffer.from('ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', 'hex')

    const prompt = inquirer.createPromptModule();
    const choices = [
        'Generate EIP-712 Signature',
        'Choose your signer',
        'Exit',
    ];

    while (true) {
        const answers = await prompt({
            type: 'list',
            name: 'operation',
            message: 'What do you want to do?',
            choices,
        });

        switch (answers.operation) {
            case 'Choose your signer':
                const signers = await hre.ethers.getSigners();
                const addresses = [];
                for (let i = 0; i < signers.length; i++) {
                    addresses.push(await signers[i].getAddress());
                }
                const chooseAddress = await prompt({
                    type: 'list',
                    name: 'address',
                    message: 'Which signer do you want to choose:)',
                    choices: addresses,
                });
                for (let i = 0; i < signers.length; i++) {
                    if (
                        chooseAddress.address ===
                        (await signers[i].getAddress())
                    ) {
                        currentSigner = signers[i];
                        const accounts = config.networks.hardhat.accounts;
                        const wallet = ethers.Wallet.fromMnemonic(accounts.mnemonic, accounts.path + `/${i}`);
                        privateKey = Buffer.from(wallet.privateKey.slice(2), 'hex');
                    }
                }
                break;
            case 'Generate EIP-712 Signature':
                const token = await prompt({
                    type: 'list',
                    name: 'address',
                    message: 'which token do you want to transfer?',
                    choices: [testToken.address],
                });
                const destinationAddresses = [];
                const signers_ = await hre.ethers.getSigners();
                for (let i = 0; i < signers_.length; i++) {
                    destinationAddresses.push(await signers_[i].getAddress());
                }
                const transferTo = await prompt({
                    type: 'list',
                    name: 'address',
                    message: 'Which address do you want to transfer to:)',
                    choices: destinationAddresses,
                });
                const amount = await prompt({
                    type: 'input',
                    name: 'amount',
                    message: 'How much do you want to transfer to him/her?',
                });
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
                    sender: await currentSigner.getAddress(),
                    x: transferTo.address,
                    token: token.address,
                    amount: amount.amount,
                    deadline: deadline,
                }
                const signature = signTypedData({
                    privateKey,
                    data: {
                        types,
                        primaryType,
                        domain,
                        message,
                    },
                    version: SignTypedDataVersion.V4,
                })
                const payload = {
                    sender: String(await currentSigner.getAddress()).toLowerCase(),
                    x: transferTo.address,
                    token: token.address,
                    amount: amount.amount,
                    deadline: deadline,
                    signature: signature
                }
                console.log(payload);
                const options = {
                    method: 'POST',
                    url: 'http://localhost:8082/signature/new',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                }
                request(options, function (error: string | undefined, response: { body: any; }) {
                    if (error) throw new Error(error);
                    console.log(response.body);
                });
                break;
            case 'Exit':
                process.exit(0);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
