const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const paymentRoutes = require('./routes/paymentRoutes');
// const authenticate = require('./middleware/auth');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3007;

app.use(cors());
app.use(express.json());

// Routes
app.use('/payments', paymentRoutes); // Có thể thêm authenticate nếu cần

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'Payment Service' });
});

app.listen(PORT, () => {
    console.log(`✅ Payment Service running on port ${PORT}`);
});