import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { Prop } from '@shared/swagger';

type Test = {
    paginate: any;
};

export enum Status {
    Completed = 'COMPLETED',
    Processing = 'PROCESSING',
    Failed = 'FAILED',
    Canceled = 'CANCELED',
    NeedRefund = 'NEED_REFUND',
    Refunded = 'REFUNDED',
}

export enum Action {
    UpgradeToMember = 'UpgradeToMember',
    BuyNFT = 'BuyNFT',
    Deposit = 'Deposit',
    Withdraw = 'Withdraw',
}

export enum CurrencyType {
    Crypto = 'Crypto',
    Fiat = 'Fiat',
}

export enum RoundType {
    LA = 'LA',
}

export enum PaymentType {
    Circle = 'circle',
    Sendwyre = 'sendWyre',
    Paypal = 'paypal',
}

//   export interface TransactionDocument extends Document {
//     owner: string;
//     action: Action;
//     status: Status;
//     orderId: string;
//     paymentType: PaymentType;
//     sessionId?: string;
//     createdAt: Date;
//     updatedAt: Date;
//     deletedAt: Date;
//     details: Object [];
//     currencyType: CurrencyType;
//     round?: RoundType;
//     isAcceptTermAndCondition?: Boolean;
//   }

export type TransactionDocument = Transaction & Document & Test;

@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    versionKey: false,
    virtuals: true,
})
export class Transaction {
    @Prop({ default: '' })
    owner: string;

    @Prop({ default: '' })
    action: Action;

    @Prop({ default: '' })
    paymentType: PaymentType;

    @Prop({ default: '' })
    orderId: string;

    @Prop({ default: Status.Processing, required: true })
    status: string;

    @Prop({ default: '' })
    sessionId: string;

    @Prop({ default: [] })
    details: object[];

    @Prop({ default: '' })
    currencyType: CurrencyType;

    @Prop({ default: '' })
    round: RoundType;

    @Prop({ default: true })
    isAcceptTermAndCondition: boolean;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
