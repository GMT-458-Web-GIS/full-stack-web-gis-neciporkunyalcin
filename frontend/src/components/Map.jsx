import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { restaurantAPI } from '../services/api';
import './Map.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom marker icons
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 16px;">🍽️</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

// Component to handle map interactions
function MapController({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
}

function Map({ restaurants, onCheckIn, showNotification }) {
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [filters, setFilters] = useState({
    cuisine_type: '',
    price_range: '',
    min_rating: ''
  });
  const [filteredRestaurants, setFilteredRestaurants] = useState(restaurants);
  const [mapCenter, setMapCenter] = useState([
    parseFloat(process.env.REACT_APP_MAP_CENTER_LAT),
    parseFloat(process.env.REACT_APP_MAP_CENTER_LON)
  ]);
  const [mapZoom] = useState(parseInt(process.env.REACT_APP_MAP_ZOOM));

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]);
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = restaurants;

    if (filters.cuisine_type) {
      filtered = filtered.filter(r => r.cuisine_type === filters.cuisine_type);
    }

    if (filters.price_range) {
      filtered = filtered.filter(r => r.price_range === filters.price_range);
    }

    if (filters.min_rating) {
      filtered = filtered.filter(r => r.rating >= parseFloat(filters.min_rating));
    }

    setFilteredRestaurants(filtered);
  }, [filters, restaurants]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setFilters({
      cuisine_type: '',
      price_range: '',
      min_rating: ''
    });
  };

  const handleCheckIn = async (restaurantId) => {
    await onCheckIn(restaurantId);
    setSelectedRestaurant(null);
  };

  const getRatingStars = (rating) => {
    const stars = '⭐'.repeat(Math.floor(rating));
    return stars || '☆';
  };

  const getPriceDisplay = (price_range) => {
    const priceMap = {
      'budget': '💰',
      'moderate': '💰💰',
      'expensive': '💰💰💰'
    };
    return priceMap[price_range] || '💰';
  };

  return (
    <div className="map-container-wrapper">
      {/* Filters */}
      <div className="map-filters">
        <h3>🔍 Filter Restaurants</h3>
        <div className="filters-grid">
          <select
            name="cuisine_type"
            value={filters.cuisine_type}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Cuisines</option>
            <option value="Turkish">Turkish</option>
            <option value="Italian">Italian</option>
            <option value="Japanese">Japanese</option>
            <option value="Chinese">Chinese</option>
            <option value="Mexican">Mexican</option>
            <option value="Indian">Indian</option>
            <option value="American">American</option>
            <option value="Vegan">Vegan</option>
            <option value="International">International</option>
          </select>

          <select
            name="price_range"
            value={filters.price_range}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Prices</option>
            <option value="budget">Budget (💰)</option>
            <option value="moderate">Moderate (💰💰)</option>
            <option value="expensive">Expensive (💰💰💰)</option>
          </select>

          <select
            name="min_rating"
            value={filters.min_rating}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Ratings</option>
            <option value="4">4+ Stars</option>
            <option value="4.5">4.5+ Stars</option>
          </select>

          <button onClick={clearFilters} className="btn btn-secondary">
            Clear Filters
          </button>
        </div>
        <div className="filter-results">
          Showing {filteredRestaurants.length} of {restaurants.length} restaurants
        </div>
      </div>

      {/* Map */}
      <div className="map-view">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%', borderRadius: '12px' }}
        >
          <MapController center={mapCenter} zoom={mapZoom} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User Location Marker */}
          {userLocation && (
            <Marker 
              position={userLocation}
              icon={L.divIcon({
                className: 'user-location-marker',
                html: '<div style="background: #667eea; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10],
              })}
            >
              <Popup>
                <div className="popup-content">
                  <strong>📍 Your Location</strong>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Restaurant Markers */}
          {filteredRestaurants.map((restaurant) => (
            <Marker
              key={restaurant.id}
              position={[restaurant.latitude, restaurant.longitude]}
              icon={createCustomIcon('#ff6b6b')}
              eventHandlers={{
                click: () => setSelectedRestaurant(restaurant),
              }}
            >
              <Popup>
                <div className="restaurant-popup">
                  <h3>{restaurant.name}</h3>
                  <p className="popup-cuisine">
                    🍴 {restaurant.cuisine_type}
                  </p>
                  <p className="popup-price">
                    {getPriceDisplay(restaurant.price_range)} {restaurant.price_range}
                  </p>
                  <p className="popup-rating">
                    {getRatingStars(restaurant.rating)} {restaurant.rating?.toFixed(1)} ({restaurant.total_reviews} reviews)
                  </p>
                  <p className="popup-address">
                    📍 {restaurant.address}
                  </p>
                  <button 
                    onClick={() => handleCheckIn(restaurant.id)}
                    className="btn btn-primary btn-sm"
                  >
                    Check In (+10 XP)
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Restaurant Details Sidebar */}
      {selectedRestaurant && (
        <div className="restaurant-details">
          <button 
            className="close-btn"
            onClick={() => setSelectedRestaurant(null)}
          >
            ✕
          </button>
          <h2>{selectedRestaurant.name}</h2>
          <div className="detail-item">
            <span className="detail-label">Cuisine:</span>
            <span className="detail-value">🍴 {selectedRestaurant.cuisine_type}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Price Range:</span>
            <span className="detail-value">{getPriceDisplay(selectedRestaurant.price_range)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Rating:</span>
            <span className="detail-value">
              {getRatingStars(selectedRestaurant.rating)} {selectedRestaurant.rating?.toFixed(1)}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Reviews:</span>
            <span className="detail-value">{selectedRestaurant.total_reviews} reviews</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Address:</span>
            <span className="detail-value">📍 {selectedRestaurant.address}</span>
          </div>
          {selectedRestaurant.phone && (
            <div className="detail-item">
              <span className="detail-label">Phone:</span>
              <span className="detail-value">📞 {selectedRestaurant.phone}</span>
            </div>
          )}
          <button 
            onClick={() => handleCheckIn(selectedRestaurant.id)}
            className="btn btn-success btn-block"
          >
            Check In (+10 XP)
          </button>
        </div>
      )}
    </div>
  );
}

export default Map;