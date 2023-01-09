import { Injectable } from '@nestjs/common';
import { keccak256 } from 'ethers/lib/utils';
import { BigNumber, ethers, Wallet } from 'ethers';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ValidationService {
    constructor(
        private readonly configService: ConfigService,
        private readonly provider: ethers.providers.JsonRpcProvider,
    ) {
        this.provider = new ethers.providers.JsonRpcProvider(
            this.configService.get('provider'),
        );
    }

    async validate(user: string, signature: string): Promise<boolean> {
        // we mock here.
        if (keccak256(user) === signature) {
            return true;
        } else {
            return false;
        }
    }
}
