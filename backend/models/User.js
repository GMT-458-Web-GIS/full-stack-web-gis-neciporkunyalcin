const pool = require('../config/database');

class User {
  // Create users table
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        user_type VARCHAR(20) DEFAULT 'free' CHECK (user_type IN ('free', 'premium', 'restaurant_owner', 'admin')),
        total_xp INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        location GEOMETRY(Point, 4326),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_users_xp ON users(total_xp DESC);
      CREATE INDEX IF NOT EXISTS idx_users_location ON users USING GIST(location);
    `;
    await pool.query(query);
  }

  // Create new user
  static async create(userData) {
    const { username, email, password, user_type = 'free' } = userData;
    const query = `
      INSERT INTO users (username, email, password, user_type)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, email, user_type, total_xp, level, created_at
    `;
    const result = await pool.query(query, [username, email, password, user_type]);
    return result.rows[0];
  }

  // Find user by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  // Find user by ID
  static async findById(id) {
    const query = 'SELECT id, username, email, user_type, total_xp, level, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Update user XP and level
  static async updateXP(userId, xpToAdd) {
    const query = `
      UPDATE users 
      SET total_xp = total_xp + $2,
          level = FLOOR((total_xp + $2) / 100) + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, username, total_xp, level
    `;
    const result = await pool.query(query, [userId, xpToAdd]);
    return result.rows[0];
  }

  // Get leaderboard
  static async getLeaderboard(limit = 50) {
    const query = `
      SELECT id, username, total_xp, level,
        RANK() OVER (ORDER BY total_xp DESC) as rank
      FROM users
      ORDER BY total_xp DESC
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  // Update user location
  static async updateLocation(userId, lat, lon) {
    const query = `
      UPDATE users 
      SET location = ST_SetSRID(ST_MakePoint($2, $3), 4326),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, ST_X(location) as longitude, ST_Y(location) as latitude
    `;
    const result = await pool.query(query, [userId, lon, lat]);
    return result.rows[0];
  }
}

module.exports = User;