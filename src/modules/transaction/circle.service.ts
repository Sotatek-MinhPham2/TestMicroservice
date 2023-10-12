import axios from 'axios';
import MessageValidator from 'sns-validator';
import { CircleConfig } from '@constants/circle.constant';
import https from 'https';
import { CreateCardType, CreatePaymentType, CreatePaymentIntentType } from '@constants/circle.constant';
import { CircleNotificationType, CirclePaymentStatus, CirclePaymentIntentStatus } from '@constants/enum.constant';
import { Status, Action } from '@models/entities/Transaction.entity';
import TransactionRepository from '@models/repositories/Transaction.repository';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EEnvKey } from '@constants/env.constant';

@Injectable()
export class CircleService {
    private axiosInstance;
    constructor(private transactionRepository: TransactionRepository, private configService: ConfigService) {
        this.axiosInstance = axios.create({
            baseURL: this.configService.get(EEnvKey.CIRCLE_API_URL),
            headers: {
                Authorization: `Bearer ${this.configService.get(EEnvKey.CIRCLE_API_KEY)}`,
            },
        });
    }

    generatePublicKey = async (): Promise<any> => {
        try {
            const response = await this.axiosInstance.get(CircleConfig.circle.api.getPublicKey);
            return response?.data?.data;
        } catch (error) {}
    };

    createCard = async (createCardDetail: CreateCardType): Promise<any> => {
        try {
            delete createCardDetail.metadata.phoneNumber;
            delete createCardDetail.keyId;
            const response = await this.axiosInstance.post(CircleConfig.circle.api.cards, createCardDetail, {
                headers: { content_type: 'application/json' },
            });
            return response.data;
        } catch (error) {}
    };

    createPayment = async (createPaymentDetail: CreatePaymentType): Promise<any> => {
        try {
            delete createPaymentDetail.metadata.phoneNumber;
            delete createPaymentDetail.keyId;
            const response = await this.axiosInstance.post(CircleConfig.circle.api.payments, createPaymentDetail, {
                headers: { content_type: 'application/json' },
            });
            return response.data;
        } catch (error) {}
    };

    getPayment = async (paymentId: string): Promise<any> => {
        try {
            const response = await this.axiosInstance.get(`${CircleConfig.circle.api.payments}/${paymentId}`);
            return response.data;
        } catch (error) {}
    };

    createPaymentIntent = async (createPaymenIntenttDetail: CreatePaymentIntentType): Promise<any> => {
        try {
            const response = await this.axiosInstance.post(
                CircleConfig.circle.api.paymentIntents,
                createPaymenIntenttDetail,
                {
                    headers: {
                        content_type: 'application/json',
                    },
                },
            );
            return response.data;
        } catch (error) {}
    };

    getPaymentIntents = async (paymentIntendId: string): Promise<any> => {
        try {
            const response = await this.axiosInstance.get(
                `${CircleConfig.circle.api.paymentIntents}/${paymentIntendId}`,
            );
            return response.data;
        } catch (error) {}
    };

    getCardInfo = async (cardId: string): Promise<any> => {
        try {
            const response = await this.axiosInstance.get(`${CircleConfig.circle.api.cards}/${cardId}`);
            return response.data;
        } catch (error) {}
    };

    getListPayment = async (queryParam: any): Promise<any> => {
        try {
            const response = await this.axiosInstance.get(CircleConfig.circle.api.payments, {
                params: {
                    ...queryParam,
                },
            });
            return response.data;
        } catch (error) {}
    };

    handlePaymentEvent = async (data: any) => {
        const { payment } = data;
        const transaction = await this.transactionRepository.transactionDocumentModel.findOne({
            sessionId: payment.id,
        });
        if (!transaction) {
            return;
        }

        transaction.details = [...transaction.details, payment];

        switch (payment.status) {
            case CirclePaymentStatus.Failed:
                transaction.status = Status.Failed;
                break;
            default:
                break;
        }
        await transaction.save();
    };

    handlePaymentIntentEvent = async (data: any) => {
        const { paymentIntent } = data;
        const transaction = await this.transactionRepository.transactionDocumentModel.findOne({
            sessionId: paymentIntent.id,
        });
        if (!transaction) {
            return;
        }
        transaction.details = [...transaction.details, paymentIntent];
        if (transaction.action === Action.BuyNFT) {
            const currentStage = paymentIntent.timeline[0];
            switch (currentStage.status) {
                case CirclePaymentIntentStatus.Complete:
                    if (transaction.status !== Status.Canceled) {
                        transaction.status = Status.Completed;
                    }
                    break;
                case CirclePaymentIntentStatus.Expired:
                    transaction.status = Status.Failed;
                    break;
                default:
                    break;
            }
        }
        await transaction.save();
    };

    handleEvent = async (eventData: any) => {
        const validator = new MessageValidator();
        validator.validate(eventData, async (err, message) => {
            if (err) {
                return;
            }
            if (message.Type === 'SubscriptionConfirmation') {
                https.get(message.SubscribeURL, (res: any) => {
                    console.log('SubscriptionConfirmation--------------', res);
                });
            }
            if (message.Type === 'Notification') {
                const data = JSON.parse(message.Message as any);
                switch (data.notificationType) {
                    case CircleNotificationType.Payments:
                        await this.handlePaymentEvent(data);
                        break;
                    case CircleNotificationType.PaymentIntents:
                        await this.handlePaymentIntentEvent(data);
                        break;
                    default:
                        break;
                }
            }
        });
    };

    subscribeCircleWebhook = async () => {
        try {
            console.log('vao day');
            console.log(`${this.configService.get(EEnvKey.BACKEND_APIS_DOMAIN)}/payments/event/circle`);
            let isSubcriptionExist = false;
            const { data } = await this.axiosInstance.get(CircleConfig.circle.api.notification);
            await data.data.map(async subscriptions => {
                if (
                    subscriptions.endpoint ===
                    `${this.configService.get(EEnvKey.BACKEND_APIS_DOMAIN)}/payments/event/circle`
                ) {
                    isSubcriptionExist = true;
                }
            });
            console.log('data', data.data[0]);
            console.log('isSubcriptionExist', isSubcriptionExist);

            if (!isSubcriptionExist) {
                console.log('response');

                console.log(CircleConfig.circle.api.notification);

                const response = await this.axiosInstance.post(
                    CircleConfig.circle.api.notification,
                    {
                        endpoint: `${this.configService.get(EEnvKey.BACKEND_APIS_DOMAIN)}/payments/event/circle`,
                        // endpoint: 'https://webhook.site/953ec223-f34f-4963-a31c-a32b866d75ad',
                    },
                    {
                        headers: {
                            content_type: 'application/json',
                            accept: 'application/json',
                        },
                    },
                );
                console.log('response---------------------------: ', response.data);
                return;
            }
        } catch (error) {
            console.log('error-------', error);
        }
    };
}
