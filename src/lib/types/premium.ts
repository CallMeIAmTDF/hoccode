export interface PaymentLinkResponse {
    bin: string;
    accountNumber: string;
    accountName: string;
    amount: number;
    description: string;
    orderCode: number;
    currency: string;
    paymentLinkId: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
    expiredAt: string | null;
    checkoutUrl: string;
    qrCode: string;
}

export function getVietQRUrl(payment: PaymentLinkResponse) {
    return `https://img.vietqr.io/image/${payment.bin}-${payment.accountNumber}-vietqr_pro.jpg?addInfo=${payment.description}&amount=${payment.amount}`;
}