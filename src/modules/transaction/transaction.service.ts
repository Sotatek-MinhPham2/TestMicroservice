import { Action, CurrencyType, RoundType, Status } from '@models//entities/Transaction.entity';
import TransactionRepository from '@models/repositories/Transaction.repository';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CircleService } from '@modules/transaction/circle.service';
import { CreatePaymentIntentType } from '@constants/circle.constant';

@Injectable()
export class TransactionService {
    constructor(
        private transactionRepository: TransactionRepository,
        @Inject(forwardRef(() => CircleService)) private readonly circleService: CircleService,
    ) {}
    createFiatDeposit = async (ownerId: string, paymentData: CreatePaymentDto) => {
        const transaction = await this.transactionRepository.transactionDocumentModel.create({
            owner: ownerId,
            action: Action.Deposit,
            status: Status.Processing,
            paymentType: 'circle',
            currencyType: CurrencyType.Fiat,
        });
        try {
            const payment = await this.circleService.createPayment(paymentData);
            //call to owner service
            // await updateLastCardActive(ownerId, paymentData.source.id);
            transaction.sessionId = payment.data.id;
            transaction.details = [payment.data];
            transaction.save();
            return payment;
        } catch (e) {}
    };

    createCryptoDeposit = async (owner: any, paymentData: CreatePaymentIntentType) => {
        const transaction = await this.transactionRepository.transactionDocumentModel.create({
            owner: owner.id,
            action: Action.BuyNFT,
            status: Status.Processing,
            paymentType: 'circle',
            currencyType: CurrencyType.Crypto,
            round: owner.fromLA ? RoundType.LA : null,
        });
        const payment = await this.circleService.createPaymentIntent(paymentData);
        await this.transactionRepository.transactionDocumentModel.create(
            { _id: transaction.id },
            { sessionId: payment.data.id, details: [payment.data] },
        );
        return {
            ...payment,
            transactionId: transaction.id,
        };
    };
}
