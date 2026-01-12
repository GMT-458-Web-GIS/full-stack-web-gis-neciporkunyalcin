const pool = require('../config/database');

class Restaurant {
  // Create restaurants table
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS restaurants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        cuisine_type VARCHAR(50),
        price_range VARCHAR(20),
        location GEOMETRY(Point, 4326) NOT NULL,
        address TEXT,
        phone VARCHAR(20),
        opening_hours JSONB,
        rating DECIMAL(2,1) DEFAULT 0,
        total_reviews INTEGER DEFAULT 0,
        owner_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_restaurants_location ON restaurants USING GIST(location);
      CREATE INDEX IF NOT EXISTS idx_restaurants_rating ON restaurants(rating DESC);
      CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine ON restaurants(cuisine_type);
    `;
    await pool.query(query);
  }

  // Create new restaurant
  static async create(restaurantData) {
    const { name, cuisine_type, price_range, lat, lon, address, phone, owner_id } = restaurantData;
    const query = `
      INSERT INTO restaurants (name, cuisine_type, price_range, location, address, phone, owner_id)
      VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326), $6, $7, $8)
      RETURNING id, name, cuisine_type, price_range, 
                ST_X(location) as longitude, ST_Y(location) as latitude,
                address, phone, rating, created_at
    `;
    const result = await pool.query(query, [name, cuisine_type, price_range, lon, lat, address, phone, owner_id]);
    return result.rows[0];
  }

  // Find nearby restaurants
  static async findNearby(lat, lon, radius = 2000, filters = {}) {
    let query = `
      SELECT id, name, cuisine_type, price_range, rating, total_reviews,
             ST_X(location) as longitude, ST_Y(location) as latitude,
             address, phone,
             ST_Distance(location::geography, ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography) as distance
      FROM restaurants
      WHERE ST_DWithin(
        location::geography,
        ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
        $3
      )
    `;
    
    const params = [lat, lon, radius];
    let paramIndex = 4;

    // Add filters
    if (filters.cuisine_type) {
      query += ` AND cuisine_type = $${paramIndex}`;
      params.push(filters.cuisine_type);
      paramIndex++;
    }

    if (filters.price_range) {
      query += ` AND price_range = $${paramIndex}`;
      params.push(filters.price_range);
      paramIndex++;
    }

    if (filters.min_rating) {
      query += ` AND rating >= $${paramIndex}`;
      params.push(filters.min_rating);
      paramIndex++;
    }

    query += ` ORDER BY distance ASC`;

    const result = await pool.query(query, params);
    return result.rows;
  }

  // Get restaurant by ID
  static async findById(id) {
    const query = `
      SELECT id, name, cuisine_type, price_range, rating, total_reviews,
             ST_X(location) as longitude, ST_Y(location) as latitude,
             address, phone, opening_hours, created_at
      FROM restaurants
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Update restaurant rating
  static async updateRating(restaurantId, newRating) {
    const query = `
      UPDATE restaurants
      SET rating = (rating * total_reviews + $2) / (total_reviews + 1),
          total_reviews = total_reviews + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, name, rating, total_reviews
    `;
    const result = await pool.query(query, [restaurantId, newRating]);
    return result.rows[0];
  }

  // Get all restaurants (for map display)
  static async getAll(limit = 1000) {
    const query = `
      SELECT id, name, cuisine_type, price_range, rating,
             ST_X(location) as longitude, ST_Y(location) as latitude
      FROM restaurants
      ORDER BY rating DESC
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  // Search restaurants by name
  static async search(searchTerm) {
    const query = `
      SELECT id, name, cuisine_type, price_range, rating,
             ST_X(location) as longitude, ST_Y(location) as latitude,
             address
      FROM restaurants
      WHERE name ILIKE $1 OR cuisine_type ILIKE $1
      ORDER BY rating DESC
      LIMIT 20
    `;
    const result = await pool.query(query, [`%${searchTerm}%`]);
    return result.rows;
  }
}

module.exports = Restaurant;