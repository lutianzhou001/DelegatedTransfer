import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ValidationService } from './validation/validation.service';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { ScheduleModule } from '@nestjs/schedule';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SignatureController } from './sign/signature.controller';
import { SignatureService } from './sign/signature.service';
import { SignatureSchema } from './sign/schema/signature.schema';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'GREEK_SERVICE',
                transport: Transport.RMQ,
                options: {
                    urls: ['amqp://localhost:5672'],
                    queue: 'cats_queue',
                    queueOptions: {
                        durable: false,
                    },
                },
            },
        ]),
        ConfigModule.forRoot({
            envFilePath: ['.env.development', '.env.production'],
        }),

        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get('MONGODB_URI'),
                useNewUrlParser: true,
                useUnifiedTopology: true,
            }),
        }),

        HttpModule,
        ScheduleModule.forRoot(),
        MongooseModule.forFeature([
            { name: 'Signature', schema: SignatureSchema },
        ]),
    ],
    controllers: [AppController, SignatureController],
    providers: [
        AppService,
        ValidationService,
        SignatureService,
        ethers.providers.JsonRpcProvider,
    ],
})
export class AppModule {}
