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

app.get('/api/partner-types', async (req, res) => {
  try {
    const [rows] = await pool.execute(`SELECT id, type_code, type_name FROM fin_partner_type WHERE is_active = 1 ORDER BY id`);
    const types = rows.map(r => ({
      id: r.id,
      typeCode: r.type_code,
      typeName: r.type_name
    }));
    res.json(types);
  } catch (err) {
    console.error('Error fetching partner types:', err);
    // Fallback to static types if table doesn't exist
    res.json([
      { id: 1, typeCode: 'CUSTOMER_VENDOR', typeName: 'Customer & Vendor' },
      { id: 2, typeCode: 'MEMBER', typeName: 'Member' },
      { id: 3, typeCode: 'EMPLOYEE', typeName: 'Employee' },
      { id: 4, typeCode: 'LOAN_CUSTOMER', typeName: 'Loan Customer' }
    ]);
  }
});

app.get('/api/partners', async (req, res) => {
  try {
    const typeId = req.query.typeId;
    let query = `SELECT DISTINCT fp.* FROM fin_partner fp`;
    let params = [];
    
    if (typeId && typeId !== 'all') {
      query += ` INNER JOIN fin_partner_has_type fpht ON fp.id = fpht.partner_id WHERE fpht.partner_type_id = ?`;
      params.push(typeId);
    }
    query += ` ORDER BY fp.id`;
    
    const [rows] = await pool.execute(query, params);

    const partners = rows.map(p => ({
      id: p.id,
      partnerCode: p.partner_code,
      partnerName: p.partner_name,
      taxId: p.tax_id || '',
      email: p.email || '',
      phone: p.phone || '',
      address: p.address || '',
      creditLimit: Number(p.credit_limit) || 0,
      paymentTermsDays: p.payment_terms_days || 30,
      isActive: p.is_active === 1
    }));

    res.json(partners);
  } catch (err) {
    console.error('Error fetching partners:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/partner-types/cleanup', async (req, res) => {
  try {
    await pool.execute("DELETE FROM fin_partner_type WHERE type_code IN ('CUSTOMER', 'VENDOR')");
    res.json({ success: true, message: 'CUSTOMER and VENDOR deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/partner-types/:id', async (req, res) => {
  try {
    await pool.execute("DELETE FROM fin_partner_type WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: `Partner type ${req.params.id} deleted` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/partner-types/fix-junction', async (req, res) => {
  try {
    await pool.execute("SET FOREIGN_KEY_CHECKS = 0");
    await pool.execute("UPDATE fin_partner_has_type SET partner_type_id = 1 WHERE partner_type_id = 4");
    await pool.execute("UPDATE fin_partner_has_type SET partner_type_id = 2 WHERE partner_type_id = 5");
    await pool.execute("SET FOREIGN_KEY_CHECKS = 1");
    res.json({ success: true, message: 'Junction table fixed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 8086;
app.listen(PORT, async () => {
  await initDb();
  console.log(`Finance API server running on http://localhost:${PORT}`);
});
