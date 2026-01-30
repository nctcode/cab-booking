const Payment = require('../models/Payment');

class PaymentService {
    async createPayment(rideId, amount, method) {
        // Kiểm tra thanh toán đã tồn tại chưa
        const existing = await Payment.findByRideId(rideId);
        if (existing.length > 0) {
            throw new Error('Payment already exists for this ride');
        }

        return await Payment.create({ rideId, amount, method });
    }

    async getPayment(id) {
        const payment = await Payment.findById(id);
        if (!payment) throw new Error('Payment not found');
        return payment;
    }

    async getPaymentsByRide(rideId) {
        return await Payment.findByRideId(rideId);
    }

    async confirmPayment(id) {
        const payment = await Payment.findById(id);
        if (!payment) throw new Error('Payment not found');
        if (payment.status !== 'PENDING') throw new Error('Payment is not pending');

        // Giả lập gọi PSP (Stripe, VNPay, MoMo...)
        const pspSuccess = await this.mockPSP(payment.amount);
        if (!pspSuccess) throw new Error('PSP payment failed');

        return await Payment.confirm(id);
    }

    async refundPayment(id) {
        const payment = await Payment.findById(id);
        if (!payment) throw new Error('Payment not found');
        if (payment.status !== 'SUCCESS') throw new Error('Cannot refund non-successful payment');

        // Giả lập refund PSP
        const refundSuccess = await this.mockRefund(payment.amount);
        if (!refundSuccess) throw new Error('Refund failed');

        return await Payment.refund(id);
    }

    async mockPSP(amount) {
        // Giả lập 90% thành công
        return Math.random() < 0.9;
    }

    async mockRefund(amount) {
        // Giả lập refund
        return Math.random() < 0.95;
    }
}

module.exports = new PaymentService();