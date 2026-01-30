const paymentService = require('../services/paymentService');

class PaymentController {
    async createPayment(req, res) {
        try {
            const { rideId, amount, method } = req.body;
            if (!rideId || !amount) {
                return res.status(400).json({ error: 'rideId and amount are required' });
            }

            const payment = await paymentService.createPayment(rideId, amount, method);
            res.status(201).json(payment);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getPayment(req, res) {
        try {
            const { id } = req.params;
            const payment = await paymentService.getPayment(id);
            res.json(payment);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    async getPaymentsByRide(req, res) {
        try {
            const { rideId } = req.params;
            const payments = await paymentService.getPaymentsByRide(rideId);
            res.json(payments);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async confirmPayment(req, res) {
        try {
            const { id } = req.params;
            const payment = await paymentService.confirmPayment(id);
            res.json({ message: 'Payment confirmed', payment });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async refundPayment(req, res) {
        try {
            const { id } = req.params;
            const payment = await paymentService.refundPayment(id);
            res.json({ message: 'Payment refunded', payment });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new PaymentController();