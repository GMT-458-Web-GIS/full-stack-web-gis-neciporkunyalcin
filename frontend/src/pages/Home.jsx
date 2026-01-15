import React, { useEffect, useState } from "react";
import MapView from "../components/MapView";
import Leaderboard from "../components/Leaderboard";
import Challenges from "../components/Challenges";
import FoodSquad from "../components/FoodSquad";
import api from "../services/api";

export default function Home({ user }) {
  const [restaurants, setRestaurants] = useState([]);
  const [center, setCenter] = useState({ lat: 39.92077, lon: 32.85411 });
  const [msg, setMsg] = useState("");

  const loadAll = async () => {
    setMsg("");
    try {
      const r = await api.get("/restaurants");
      setRestaurants(r.data?.data || []);
    } catch (e) {
      setMsg(e?.response?.data?.message || "Failed to load restaurants");
    }
  };

  useEffect(() => { loadAll(); }, []);

  const locate = () => {
    setMsg("");
    if (!navigator.geolocation) return setMsg("Geolocation not supported.");
    navigator.geolocation.getCurrentPosition(
      (pos) => setCenter({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => setMsg("Location permission denied.")
    );
  };

  const nearby = async () => {
    setMsg("");
    try {
      const r = await api.get("/restaurants/nearby", {
        params: { lat: center.lat, lon: center.lon, radius: 2500 }
      });
      setRestaurants(r.data?.data || []);
    } catch (e) {
      setMsg(e?.response?.data?.message || "Nearby search failed");
    }
  };

  return (
    <div className="content">
      {/* Main Column: Map */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
        <div className="card" style={{ flex: 1, minHeight: 600 }}>
          <div className="cardhd">
            <h3>Explore Map</h3>
            <div className="row">
              <button className="btn" onClick={locate} title="Use my location">📍 Me</button>
              <button className="btn" onClick={nearby}>Nearby</button>
              <button className="btn primary" onClick={loadAll}>Global</button>
            </div>
          </div>
          <div className="cardbd" style={{ flex: 1, padding: 0, position: 'relative' }}>
            {msg && (
              <div
                style={{
                  position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
                  zIndex: 999, background: '#fee2e2', padding: '0.5rem 1rem',
                  borderRadius: '2rem', color: '#b91c1c', fontSize: 13, fontWeight: 500,
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}
              >
                {msg}
              </div>
            )}

            <div style={{ position: 'absolute', bottom: 12, left: 12, zIndex: 500, background: 'rgba(255,255,255,0.9)', padding: '4px 8px', borderRadius: 6, fontSize: 12 }}>
              Center: {center.lat.toFixed(5)}, {center.lon.toFixed(5)} • {restaurants.length} places
            </div>

            <MapView
              center={center}
              restaurants={restaurants}
              canCreate={!!user}
              onCreated={loadAll}
            />
          </div>
        </div>
      </div>

      {/* Side Column: Widgets */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <Leaderboard />
        <Challenges />
        <FoodSquad user={user} onMapFocus={setCenter} />
      </div>
    </div>
  );
}
