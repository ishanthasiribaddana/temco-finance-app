const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'temco123',
  database: process.env.DB_NAME || 'temco_system'
};

let pool;

async function initDb() {
  try {
    pool = mysql.createPool(dbConfig);
    const conn = await pool.getConnection();
    console.log('Database connected successfully');
    conn.release();
  } catch (err) {
    console.error('Database connection failed:', err.message);
  }
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', application: 'TEMCO Finance API' });
});

app.get('/api/customers', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        id,
        nic,
        first_name,
        last_name,
        full_name,
        mobile_no,
        home_phone,
        email,
        address1,
        address2,
        address3,
        is_active
      FROM general_user_profile 
      WHERE is_active = 1 
      ORDER BY id
      LIMIT 100
    `);

    const customers = rows.map(user => ({
      id: user.id,
      partnerCode: `C${String(user.id).padStart(4, '0')}`,
      partnerName: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown',
      partnerType: 'CUSTOMER',
      taxId: user.nic || '',
      email: user.email || '',
      phone: user.mobile_no || user.home_phone || '',
      address: [user.address1, user.address2, user.address3].filter(Boolean).join(', '),
      creditLimit: 100000,
      paymentTermsDays: 30,
      isActive: user.is_active === 1
    }));

    res.json(customers);
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/customers/count', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM general_user_profile WHERE is_active = 1');
    res.json({ count: rows[0].count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 8086;
app.listen(PORT, async () => {
  await initDb();
  console.log(`Finance API server running on http://localhost:${PORT}`);
});
