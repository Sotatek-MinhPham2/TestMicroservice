export enum Currency {
    Usd = 'USD',
    Eth = 'ETH',
    Btc = 'BTC',
}

export enum CircleNotificationType {
    Settlements = 'settlements',
    Payments = 'payments',
    PaymentIntents = 'paymentIntents',
}

export enum CirclePaymentStatus {
    Pending = 'pending',
    Confirmed = 'confirmed',
    Failed = 'failed',
    Paid = 'paid',
}

export enum CirclePaymentIntentStatus {
    Created = 'created',
    Pending = 'pending',
    Expired = 'expired',
    Complete = 'complete',
}

export enum CmcTokenId {
    ETH = 1027,
    BTC = 1,
}
