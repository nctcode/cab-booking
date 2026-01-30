const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Payment {
    static async create({ rideId, amount, method = 'CASH' }) {
        const id = uuidv4();
        const query = `
      INSERT INTO payments (id, ride_id, amount, method, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
        const values = [id, rideId, amount, method, 'PENDING'];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async findById(id) {
        const query = `SELECT * FROM payments WHERE id = $1`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async findByRideId(rideId) {
        const query = `SELECT * FROM payments WHERE ride_id = $1 ORDER BY created_at DESC`;
        const result = await pool.query(query, [rideId]);
        return result.rows;
    }

    static async updateStatus(id, status) {
        const query = `
      UPDATE payments
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *;
    `;
        const result = await pool.query(query, [status, id]);
        return result.rows[0];
    }

    static async confirm(id) {
        return this.updateStatus(id, 'SUCCESS');
    }

    static async refund(id) {
        return this.updateStatus(id, 'REFUNDED');
    }
}

module.exports = Payment;