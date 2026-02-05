const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

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
    let query = `SELECT DISTINCT fp.*, gup.nic, gup.email as user_email, gup.mobile_no as phone, gup.home_phone
                 FROM fin_partner fp
                 LEFT JOIN general_user_profile gup ON fp.user_profile_id = gup.id`;
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
      nic: p.nic || '',
      taxId: p.tax_id || '',
      email: p.user_email || p.email || '',
      phone: p.phone || p.home_phone || '',
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

// Describe a table structure
app.get('/api/describe/:table', async (req, res) => {
  try {
    const [rows] = await pool.execute(`DESCRIBE ${req.params.table}`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create password_reset_token table (admin endpoint)
app.post('/api/admin/create-otp-table', async (req, res) => {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS password_reset_token (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_login_id INT NOT NULL,
        token VARCHAR(6) NOT NULL,
        token_type ENUM('PASSWORD_RESET', 'ACCOUNT_UNLOCK') NOT NULL,
        created_at DATETIME NOT NULL,
        expires_at DATETIME NOT NULL,
        used_at DATETIME NULL,
        is_used BOOLEAN NOT NULL DEFAULT FALSE,
        FOREIGN KEY (user_login_id) REFERENCES user_login(id) ON DELETE CASCADE,
        INDEX idx_user_token (user_login_id, token, token_type),
        INDEX idx_expires (expires_at)
      )
    `);
    res.json({ success: true, message: 'Table password_reset_token created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List auth-related tables
app.get('/api/db-tables', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT table_name FROM information_schema.tables 
       WHERE table_schema = DATABASE() 
       AND (table_name LIKE '%user%' OR table_name LIKE '%auth%' OR table_name LIKE '%login%' 
            OR table_name LIKE '%role%' OR table_name LIKE '%permission%' OR table_name LIKE '%credential%'
            OR table_name LIKE '%account%' OR table_name LIKE '%session%')
       ORDER BY table_name`
    );
    res.json(rows.map(r => r.table_name || r.TABLE_NAME));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check if NIC exists (for signup flow)
app.get('/api/check-nic/:nic', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, full_name, email FROM general_user_profile WHERE nic = ?`,
      [req.params.nic]
    );
    
    if (rows.length > 0) {
      return res.json({ exists: true, message: 'This NIC is already registered. Please login.' });
    }
    res.json({ exists: false, message: 'NIC available for registration' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Signup - create user profile and login credentials
app.post('/api/signup', async (req, res) => {
  try {
    const { nic, firstName, lastName, email } = req.body;
    
    if (!nic || !firstName || !lastName || !email) {
      return res.status(400).json({ error: 'NIC, First Name, Last Name, and Email are required' });
    }
    
    // Check if NIC already exists in general_user_profile
    const [existingProfile] = await pool.execute(
      `SELECT id FROM general_user_profile WHERE nic = ?`, [nic]
    );
    
    if (existingProfile.length > 0) {
      return res.status(409).json({ error: 'A user with this NIC already exists' });
    }
    
    // Check if email already exists in user_login
    const [existingLogin] = await pool.execute(
      `SELECT id FROM user_login WHERE username = ?`, [email]
    );
    
    if (existingLogin.length > 0) {
      return res.status(409).json({ error: 'This email is already registered' });
    }
    
    // Generate temporary password (6 chars alphanumeric)
    const tempPassword = Math.random().toString(36).substring(2, 8).toUpperCase();
    const fullName = `${firstName} ${lastName}`;
    
    // Hash the password with bcrypt
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    // Step 1: Insert into general_user_profile
    const [profileResult] = await pool.execute(
      `INSERT INTO general_user_profile (nic, first_name, last_name, full_name, email, profile_created_date, verification_token) 
       VALUES (?, ?, ?, ?, ?, NOW(), '')`,
      [nic, firstName, lastName, fullName, email]
    );
    
    const userProfileId = profileResult.insertId;
    
    // Step 2: Insert into user_login (with hashed password)
    await pool.execute(
      `INSERT INTO user_login (username, password, is_active, general_user_profile_id, max_login_attempt, count_attempt, updated_at) 
       VALUES (?, ?, 1, ?, 5, 0, NOW())`,
      [email, hashedPassword, userProfileId]
    );
    
    // Log password for testing (in production, send via email)
    console.log(`[SIGNUP] User ${nic} (${email}) - Temp Password: ${tempPassword} (hashed in DB)`);
    
    res.json({ 
      success: true, 
      userId: userProfileId,
      email: email,
      message: `Registration successful! Password sent to ${email.substring(0, 3)}***@${email.split('@')[1]}`
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== AUTHENTICATION APIs ====================

// Login API
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'] || '';
  
  try {
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Find user in user_login
    const [users] = await pool.execute(
      `SELECT ul.id, ul.username, ul.password, ul.is_active, ul.max_login_attempt, 
              ul.count_attempt, ul.general_user_profile_id, ul.user_role_id,
              gup.full_name, gup.first_name, gup.last_name, gup.email, gup.nic
       FROM user_login ul
       LEFT JOIN general_user_profile gup ON ul.general_user_profile_id = gup.id
       WHERE ul.username = ?`,
      [username]
    );
    
    // User not found
    if (users.length === 0) {
      await pool.execute(
        `INSERT INTO com_login_attempt (username, ip_address, user_agent, success, failure_reason) 
         VALUES (?, ?, ?, 0, 'User not found')`,
        [username, ip, userAgent]
      );
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    const user = users[0];
    
    // Check if user is active
    if (!user.is_active) {
      await pool.execute(
        `INSERT INTO com_login_attempt (username, ip_address, user_agent, success, failure_reason) 
         VALUES (?, ?, ?, 0, 'User inactive')`,
        [username, ip, userAgent]
      );
      return res.status(401).json({ error: 'Account is inactive. Please contact support.' });
    }
    
    // Check if max attempts exceeded
    if (user.count_attempt >= user.max_login_attempt) {
      await pool.execute(
        `INSERT INTO com_login_attempt (username, ip_address, user_agent, success, failure_reason) 
         VALUES (?, ?, ?, 0, 'Max attempts exceeded')`,
        [username, ip, userAgent]
      );
      return res.status(401).json({ error: 'Account locked. Too many failed attempts.' });
    }
    
    // Verify password (try bcrypt first, then plain text for legacy)
    let passwordValid = false;
    try {
      passwordValid = await bcrypt.compare(password, user.password);
    } catch (e) {
      // Fallback: check if password matches directly (for legacy non-hashed passwords)
      passwordValid = (password === user.password);
    }
    
    if (!passwordValid) {
      // Increment failed attempt count
      await pool.execute(
        `UPDATE user_login SET count_attempt = count_attempt + 1 WHERE id = ?`,
        [user.id]
      );
      await pool.execute(
        `INSERT INTO com_login_attempt (username, ip_address, user_agent, success, failure_reason) 
         VALUES (?, ?, ?, 0, 'Invalid password')`,
        [username, ip, userAgent]
      );
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Password valid - generate session token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Insert into com_session_token
    await pool.execute(
      `INSERT INTO com_session_token (user_login_id, token_hash, token_type, expires_at, ip_address, user_agent, is_active) 
       VALUES (?, ?, 'ACCESS', ?, ?, ?, 1)`,
      [user.id, token, expiresAt, ip, userAgent]
    );
    
    // Insert into login_session
    await pool.execute(
      `INSERT INTO login_session (start_time, ip, user_login_id) VALUES (NOW(), ?, ?)`,
      [ip, user.id]
    );
    
    // Log successful attempt
    await pool.execute(
      `INSERT INTO com_login_attempt (username, ip_address, user_agent, success) VALUES (?, ?, ?, 1)`,
      [username, ip, userAgent]
    );
    
    // Reset attempt count and update last login
    await pool.execute(
      `UPDATE user_login SET count_attempt = 0, last_login_at = NOW() WHERE id = ?`,
      [user.id]
    );
    
    console.log(`[LOGIN] User ${username} logged in successfully`);
    
    res.json({
      success: true,
      token: token,
      expiresAt: expiresAt.toISOString(),
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        email: user.email,
        nic: user.nic,
        roleId: user.user_role_id
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Logout API
app.post('/api/logout', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(400).json({ error: 'No token provided' });
  }
  
  try {
    // Revoke the token
    await pool.execute(
      `UPDATE com_session_token SET is_active = 0, revoked_at = NOW() WHERE token_hash = ?`,
      [token]
    );
    
    // Update login_session end time
    const [sessions] = await pool.execute(
      `SELECT cst.user_login_id FROM com_session_token cst WHERE cst.token_hash = ?`,
      [token]
    );
    
    if (sessions.length > 0) {
      await pool.execute(
        `UPDATE login_session SET end_time = NOW() 
         WHERE user_login_id = ? AND end_time IS NULL 
         ORDER BY start_time DESC LIMIT 1`,
        [sessions[0].user_login_id]
      );
    }
    
    console.log('[LOGOUT] Token revoked successfully');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Get current user (validate token)
app.get('/api/me', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const [sessions] = await pool.execute(
      `SELECT cst.user_login_id, cst.expires_at, cst.is_active,
              ul.username, ul.user_role_id,
              gup.full_name, gup.first_name, gup.last_name, gup.email, gup.nic
       FROM com_session_token cst
       JOIN user_login ul ON cst.user_login_id = ul.id
       LEFT JOIN general_user_profile gup ON ul.general_user_profile_id = gup.id
       WHERE cst.token_hash = ?`,
      [token]
    );
    
    if (sessions.length === 0) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    const session = sessions[0];
    
    // Check if token is active
    if (!session.is_active) {
      return res.status(401).json({ error: 'Token has been revoked' });
    }
    
    // Check if token is expired
    if (new Date(session.expires_at) < new Date()) {
      return res.status(401).json({ error: 'Token has expired' });
    }
    
    res.json({
      user: {
        id: session.user_login_id,
        username: session.username,
        fullName: session.full_name || `${session.first_name || ''} ${session.last_name || ''}`.trim(),
        email: session.email,
        nic: session.nic,
        roleId: session.user_role_id
      }
    });
  } catch (err) {
    console.error('Auth check error:', err);
    res.status(500).json({ error: 'Authentication check failed' });
  }
});

// Auth middleware for protected routes
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const [sessions] = await pool.execute(
      `SELECT cst.user_login_id, cst.expires_at, cst.is_active, ul.username
       FROM com_session_token cst
       JOIN user_login ul ON cst.user_login_id = ul.id
       WHERE cst.token_hash = ? AND cst.is_active = 1 AND cst.expires_at > NOW()`,
      [token]
    );
    
    if (sessions.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    req.user = sessions[0];
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Get table row count
app.get('/api/count/:table', async (req, res) => {
  try {
    const table = req.params.table.replace(/[^a-zA-Z0-9_]/g, '');
    const [rows] = await pool.execute(`SELECT COUNT(*) as count FROM ${table}`);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search user by name
app.get('/api/search-user', async (req, res) => {
  try {
    const name = req.query.name || '';
    const [rows] = await pool.execute(
      `SELECT id, nic, first_name, last_name, full_name, email, profile_created_date 
       FROM general_user_profile WHERE full_name LIKE ? OR first_name LIKE ? LIMIT 10`,
      [`%${name}%`, `%${name}%`]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List user_login records
app.get('/api/user-logins', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT ul.id, ul.username, ul.password, ul.is_active, ul.general_user_profile_id, ul.updated_at,
              gup.full_name, gup.nic
       FROM user_login ul
       LEFT JOIN general_user_profile gup ON ul.general_user_profile_id = gup.id
       ORDER BY ul.id DESC LIMIT 20`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get users not yet registered as partners (for testing)
app.get('/api/test-users', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT gup.id, gup.full_name, gup.nic, gup.mobile_no, gup.email 
       FROM general_user_profile gup
       WHERE gup.nic IS NOT NULL AND gup.nic != '' AND gup.full_name IS NOT NULL AND gup.full_name != ''
       AND gup.id NOT IN (SELECT DISTINCT user_profile_id FROM fin_partner WHERE user_profile_id IS NOT NULL)
       LIMIT 10`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create test users for Add Partner testing
app.post('/api/create-test-users', async (req, res) => {
  try {
    const testUsers = [
      { nic: '199501234567', name: 'Amal Fernando', phone: '0771234567', email: 'amal.fernando@test.com' },
      { nic: '198712345678', name: 'Kumari Perera', phone: '0772345678', email: 'kumari.perera@test.com' },
      { nic: '199208765432', name: 'Saman Jayawardena', phone: '0773456789', email: 'saman.j@test.com' },
      { nic: '985432109V', name: 'Nimali Silva', phone: '0774567890', email: 'nimali.silva@test.com' },
      { nic: '912345678V', name: 'Ruwan Bandara', phone: '0775678901', email: 'ruwan.b@test.com' }
    ];
    
    for (const u of testUsers) {
      await pool.execute(
        `INSERT INTO general_user_profile (nic, full_name, mobile_no, email, created_at) VALUES (?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE full_name = VALUES(full_name)`,
        [u.nic, u.name, u.phone, u.email]
      );
    }
    res.json({ success: true, message: '5 test users created', users: testUsers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lookup user by NIC for partner verification
app.get('/api/lookup-by-nic/:nic', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, full_name, nic, mobile_no, home_phone, email 
       FROM general_user_profile WHERE nic = ?`,
      [req.params.nic]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No user found with this NIC' });
    }
    
    // Check if already a partner
    const [existing] = await pool.execute(
      `SELECT id, partner_code FROM fin_partner WHERE user_profile_id = ?`,
      [rows[0].id]
    );
    
    if (existing.length > 0) {
      return res.status(409).json({ 
        error: 'This person is already a partner',
        partnerCode: existing[0].partner_code 
      });
    }
    
    res.json({
      userProfileId: rows[0].id,
      fullName: rows[0].full_name,
      nic: rows[0].nic,
      phone: rows[0].mobile_no || rows[0].home_phone || '',
      email: rows[0].email || ''
    });
  } catch (err) {
    console.error('Error looking up NIC:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create new partner from verified user
app.post('/api/partners', async (req, res) => {
  try {
    const { userProfileId, partnerTypes } = req.body;
    
    if (!userProfileId || !partnerTypes || partnerTypes.length === 0) {
      return res.status(400).json({ error: 'userProfileId and partnerTypes are required' });
    }
    
    // Get user profile data
    const [user] = await pool.execute(
      `SELECT full_name, email, mobile_no, address FROM general_user_profile WHERE id = ?`,
      [userProfileId]
    );
    
    if (user.length === 0) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    // Generate unique partner code
    const [maxCode] = await pool.execute(
      `SELECT partner_code FROM fin_partner ORDER BY id DESC LIMIT 1`
    );
    let nextNum = 1;
    if (maxCode.length > 0 && maxCode[0].partner_code) {
      const match = maxCode[0].partner_code.match(/(\d+)$/);
      if (match) nextNum = parseInt(match[1]) + 1;
    }
    const partnerCode = `PAR-${String(nextNum).padStart(6, '0')}`;
    
    // Insert partner
    const [result] = await pool.execute(
      `INSERT INTO fin_partner (partner_code, partner_name, user_profile_id, email, phone, credit_limit, payment_terms_days, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, 0, 30, 1, NOW())`,
      [partnerCode, user[0].full_name, userProfileId, user[0].email || '', user[0].mobile_no || '']
    );
    
    const partnerId = result.insertId;
    
    // Insert partner types
    for (const typeId of partnerTypes) {
      await pool.execute(
        `INSERT INTO fin_partner_has_type (partner_id, partner_type_id) VALUES (?, ?)`,
        [partnerId, typeId]
      );
    }
    
    res.json({
      success: true,
      partnerId,
      partnerCode,
      message: 'Partner created successfully'
    });
  } catch (err) {
    console.error('Error creating partner:', err);
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
