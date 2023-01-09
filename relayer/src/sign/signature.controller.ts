import { Body, Controller, Post } from '@nestjs/common';
import { IResponse } from '../common/interfaces/response.interface';
import { ResponseError, ResponseSuccess } from '../common/dto/response.dto';
import { SignatureService } from './signature.service';
import { Add_signatureDto } from './dto/add_signature.dto';

@Controller('signature')
export class SignatureController {
    constructor(private readonly signatureService: SignatureService) {}

    @Post('new')
    async signature(
        @Body() add_signatureDto: Add_signatureDto,
    ): Promise<IResponse> {
        try {
            return new ResponseSuccess(
                'VALIDATION_SUCCESS',
                await this.signatureService.newSig(add_signatureDto),
            );
        } catch (e) {
            return new ResponseError('SIGNATURE_ERROR', (e as Error).message);
        }
    }

    @Post('batch')
    async batch(): Promise<IResponse> {
        try {
            return new ResponseSuccess(
                'BATCH_SUCCESS',
                await this.signatureService.batch(),
            );
        } catch (e) {
            return new ResponseError('BATCH_ERROR', (e as Error).message);
        }
    }

    @Post('mock')
    async mock(): Promise<IResponse> {
        try {
            return new ResponseSuccess(
                'SIGNATURE_SUCCESS',
                await this.signatureService.mock(),
            );
        } catch (e) {
            return new ResponseError('SIGNATURE_ERROR', (e as Error).message);
        }
    }
}
