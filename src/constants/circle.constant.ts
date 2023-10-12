export type BillingDetailType = {
    name: string;
    city: string;
    country: string;
    line1: string;
    line2: string;
    district: string;
    postalCode: string;
};

export type MetadataType = {
    email: string;
    phoneNumber?: string;
    sessionId: string;
    ipAddress?: string;
};

export type CreateCardType = {
    idempotencyKey: string;
    keyId?: string;
    encryptedData: string;
    billingDetails: BillingDetailType;
    expMonth: number;
    expYear: number;
    metadata: MetadataType;
};

export type CreatePaymentType = {
    idempotencyKey: string;
    metadata: MetadataType;
    amount?: {
        amount: string;
        currency: string;
    };
    source: {
        id: string;
        type: string;
    };
    encryptedData?: string;
    keyId?: string;
    verification?: string;
    isAcceptTermAndCondition?: boolean;
};

export type CreatePaymentIntentType = {
    amount: {
        amount?: string;
        currency: string;
    };
    paymentMethods: [
        {
            type: string;
            chain: string;
        },
    ];
    settlementCurrency: string;
    isAcceptTermAndCondition?: boolean;
};

export const CircleConfig = {
    circle: {
        api: {
            getPublicKey: '/v1/encryption/public',
            cards: '/v1/cards',
            payments: '/v1/payments',
            paymentIntents: '/v1/paymentIntents',
            notification: '/v1/notifications/subscriptions',
        },
        card: {
            verifycation: 'cvv',
            keyId: 'key1',
        },
    },
};

export const CoinmarketcapConfig = {
    coinmarketcap: {
        api: {
            getTokenPrice: '/v2/cryptocurrency/quotes/latest',
        },
    },
};
