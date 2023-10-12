import { Body, Req, Controller, Get, Inject, Post, BadRequestException, Request, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ErrorConstant } from '@constants/error.constant';

import { LoggerService } from '@shared/modules/loggers/logger.service';
import { TransactionService } from './transaction.service';
import { ClientTCP } from '@nestjs/microservices';
import { CurrentUser } from '@shared/decorators/auth.decorator';
import { ServiceConstant } from '@constants/service.constant';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CmcTokenId, Currency } from '@constants/enum.constant';
import { getClientIp } from 'request-ip';
import { CoinMarketCapService } from '@modules/transaction/coinmarketcap.service';
import { CreateCardType, CreatePaymentIntentType } from '@constants/circle.constant';
import { v4 } from 'uuid';
import { CircleService } from '@modules/transaction/circle.service';
import { CircleConfig } from '@constants/circle.constant';
import { lastValueFrom } from 'rxjs';

@ApiTags('payments')
@Controller('payments')
export class TransactionController {
    constructor(
        private readonly coinMarketCapService: CoinMarketCapService,
        private readonly circleService: CircleService,
        private readonly transactionService: TransactionService,
        private loggerService: LoggerService,
        @Inject(ServiceConstant.OWNER_SERVICE.name) private readonly clientOwnerServiceProxy: ClientTCP,
    ) {}
    private logger = this.loggerService.getLogger('payment');

    @Post('circle/deposit-fiat')
    async DepositFiat(@Req() request: Request, @Body() createPaymentDto: CreatePaymentDto, @CurrentUser() user: any) {
        this.logger.info('Log');
        createPaymentDto.amount = {
            amount: createPaymentDto.amount.amount,
            currency: Currency.Usd,
        };
        createPaymentDto.verification = CircleConfig.circle.card.verifycation;

        createPaymentDto.metadata.ipAddress = getClientIp(request);
        const getOwner = await lastValueFrom(
            this.clientOwnerServiceProxy.send(ServiceConstant.OWNER_SERVICE.patterns.GET_OWNER, {
                ownerId: user.ownerId,
            }),
        );
        this.logger.info('getOwner-TCP_output: ', getOwner);
        if (!getOwner) {
            throw new BadRequestException({
                message: ErrorConstant.PAYMENT.USER_NOT_FOUND,
            });
        }
        const cards = getOwner.owner.circleCardIds;
        const card = cards.filter(cardTemp => cardTemp.cardId === createPaymentDto.source.id);
        createPaymentDto.keyId = card[0].keyId;

        const data = await this.transactionService.createFiatDeposit(user.owner.id, createPaymentDto);
        return data;
    }

    @Post('circle/deposit-crypto')
    async DepositCrypto(
        @Req() request: Request,
        @Body() createPaymentIntent: CreatePaymentIntentType,
        @CurrentUser() user: any,
    ) {
        const getOwner = await lastValueFrom(
            this.clientOwnerServiceProxy.send(ServiceConstant.OWNER_SERVICE.patterns.GET_OWNER, {
                ownerId: user.ownerId,
            }),
        );
        if (!getOwner) {
            throw new BadRequestException({
                message: ErrorConstant.PAYMENT.USER_NOT_FOUND,
            });
        }
        const currency = createPaymentIntent.amount.currency;
        if (currency !== Currency.Usd) {
            const tokenPrice = await this.coinMarketCapService.getTokenPriceById(CmcTokenId[currency]);
            const currencyAmount = Number(createPaymentIntent.amount.amount) / Number(tokenPrice);
            createPaymentIntent.settlementCurrency = Currency.Usd;
            createPaymentIntent.amount.amount = currencyAmount.toFixed(5);
            const data = await this.transactionService.createCryptoDeposit(getOwner, createPaymentIntent);
            return data;
        }
        createPaymentIntent.settlementCurrency = Currency.Usd;
        createPaymentIntent.amount.amount = Number(createPaymentIntent.amount.amount).toFixed(5);
        const data = await this.transactionService.createCryptoDeposit(getOwner, createPaymentIntent);
        return data;
    }

    @Post('circle/card')
    async createCard(@Req() req: Request, @Body() createCardDetail: CreateCardType, @CurrentUser() user: any) {
        createCardDetail.metadata.ipAddress = getClientIp(req);
        createCardDetail.keyId = v4();
        console.log(user);
        const data = await this.circleService.createCard(createCardDetail);
        console.log(data);
        //Call to owner service
        // await saveCircleCardOwner(request.owner.id, data.data.id, createCardDetail.keyId);
    }

    @Get('circle/generatePublicKey')
    async generatePublicKey() {
        const data = await this.circleService.generatePublicKey();
        console.log(data);
    }

    @Post('event/circle')
    @HttpCode(200)
    async handleEvent(@Req() req: any) {
        console.log(req);
        // const result = await this.circleService.handleEvent(req);
        // return result;
    }

    @Post('test')
    async test() {
        const result = await this.circleService.subscribeCircleWebhook();
        return result;
    }
}
