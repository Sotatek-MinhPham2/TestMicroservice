import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ServiceConstant } from '@constants/service.constant';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import TransactionRepository from '@models/repositories/Transaction.repository';
import { Transaction, TransactionSchema } from '@models/entities/Transaction.entity';
import { CircleService } from './circle.service';
import { CoinMarketCapService } from './coinmarketcap.service';
import { ConfigModule } from '@nestjs/config';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Transaction.name,
                schema: TransactionSchema,
            },
        ]),
        ClientsModule.register([
            {
                name: ServiceConstant.OWNER_SERVICE.name,
                transport: Transport.TCP,
                options: {
                    port: 5003,
                    host: 'localhost',
                },
            },
        ]),
        ConfigModule,
    ],
    controllers: [TransactionController],
    providers: [TransactionService, TransactionRepository, CircleService, CoinMarketCapService],
})
export class TransactionModule {}
