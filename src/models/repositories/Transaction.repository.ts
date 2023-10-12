import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Transaction, TransactionDocument } from '../entities/Transaction.entity';

@Injectable()
export default class TransactionRepository {
    constructor(@InjectModel(Transaction.name) public transactionDocumentModel: Model<TransactionDocument>) {}
    findTemplate(id: string): Promise<TransactionDocument> {
        return this.transactionDocumentModel.findOne({ _id: id }).exec();
    }
}
