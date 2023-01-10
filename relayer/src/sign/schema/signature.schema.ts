import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SignatureDocument = Signature & Document;

@Schema()
export class Signature {
    @Prop()
    signature: string;

    @Prop()
    v: string;

    @Prop()
    r: string;

    @Prop()
    s: string;

    @Prop()
    executed: boolean;

    @Prop()
    timestamp: number;

    @Prop()
    sender: string;

    @Prop()
    x: string;

    @Prop()
    token: string;

    @Prop()
    amount: string;

    @Prop()
    nonce: string;

    @Prop()
    deadline: number;

    @Prop()
    isSuccess: boolean;
}

export const SignatureSchema = SchemaFactory.createForClass(Signature);
