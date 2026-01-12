-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create database (run this separately if needed)
-- CREATE DATABASE nerede_yesek;

-- Sample data for testing
-- Insert sample users (passwords are all: "password123" hashed)
INSERT INTO users (username, email, password, user_type, total_xp, level) VALUES
('foodie_ali', 'ali@example.com', '$2a$10$rKvH5rqJ5WJZqGvX9qYwLeqH5c8T8jLKzP8bPvV1yZ8xZqGvX9qYw', 'free', 250, 3),
('ayse_eats', 'ayse@example.com', '$2a$10$rKvH5rqJ5WJZqGvX9qYwLeqH5c8T8jLKzP8bPvV1yZ8xZqGvX9qYw', 'premium', 850, 9),
('mehmet_chef', 'mehmet@example.com', '$2a$10$rKvH5rqJ5WJZqGvX9qYwLeqH5c8T8jLKzP8bPvV1yZ8xZqGvX9qYw', 'free', 120, 2);

-- Sample restaurants in Ankara
INSERT INTO restaurants (name, cuisine_type, price_range, location, address, phone, rating, total_reviews) VALUES
('Günaydın Steakhouse', 'Turkish', 'expensive', ST_SetSRID(ST_MakePoint(32.8597, 39.9208), 4326), 'Kavaklıdere, Ankara', '+90 312 123 4567', 4.5, 245),
('Sushico', 'Japanese', 'moderate', ST_SetSRID(ST_MakePoint(32.8573, 39.9179), 4326), 'Tunalı Hilmi, Ankara', '+90 312 234 5678', 4.3, 189),
('Nusr-Et', 'Turkish', 'expensive', ST_SetSRID(ST_MakePoint(32.8612, 39.9234), 4326), 'Çankaya, Ankara', '+90 312 345 6789', 4.7, 567),
('Pizza Locale', 'Italian', 'moderate', ST_SetSRID(ST_MakePoint(32.8550, 39.9150), 4326), 'Kızılay, Ankara', '+90 312 456 7890', 4.4, 320),
('Köfteci Ramiz', 'Turkish', 'budget', ST_SetSRID(ST_MakePoint(32.8590, 39.9195), 4326), 'Kızılay, Ankara', '+90 312 567 8901', 4.6, 890),
('Vegan Kitchen', 'Vegan', 'moderate', ST_SetSRID(ST_MakePoint(32.8565, 39.9170), 4326), 'Kavaklıdere, Ankara', '+90 312 678 9012', 4.2, 156),
('Dönerci Mustafa', 'Turkish', 'budget', ST_SetSRID(ST_MakePoint(32.8580, 39.9185), 4326), 'Sıhhiye, Ankara', '+90 312 789 0123', 4.5, 678),
('Big Chefs', 'International', 'moderate', ST_SetSRID(ST_MakePoint(32.8605, 39.9220), 4326), 'Çankaya, Ankara', '+90 312 890 1234', 4.3, 234);

-- Create spatial index
CREATE INDEX idx_restaurants_location ON restaurants USING GIST(location);

-- Sample query to test
-- Find restaurants within 2km of a point
-- SELECT name, ST_Distance(location::geography, ST_SetSRID(ST_MakePoint(32.8597, 39.9208), 4326)::geography) as distance
-- FROM restaurants
-- WHERE ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint(32.8597, 39.9208), 4326)::geography, 2000)
-- ORDER BY distance;