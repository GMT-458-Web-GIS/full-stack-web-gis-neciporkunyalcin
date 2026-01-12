import React, { useEffect, useState } from "react";
import MapView from "../components/MapView";
import Leaderboard from "../components/Leaderboard";
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
      <div className="card">
        <div className="cardhd">
          <h3>MAP</h3>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn" onClick={locate}>Use my location</button>
            <button className="btn" onClick={nearby}>Nearby (2.5km)</button>
            <button className="btn" onClick={loadAll}>All</button>
          </div>
        </div>
        <div className="cardbd">
          {msg && <div className="small" style={{ color: "#fca5a5" }}>{msg}</div>}
          <div className="small" style={{ marginBottom: 10 }}>
            Center: {center.lat.toFixed(5)}, {center.lon.toFixed(5)}
            <span className="tag">OSM tiles</span>
            <span className="tag">{restaurants.length} results</span>
          </div>

          <MapView
            center={center}
            restaurants={restaurants}
            canCreate={!!user}
            onCreated={loadAll}
          />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Leaderboard />

        <div className="card">
          <div className="cardhd">
            <h3>CHALLENGES</h3>
            <span className="small">Coming soon (Mongo disabled)</span>
          </div>
          <div className="cardbd">
            <div className="small">
              Challenges şu an kapalı çünkü MongoDB’yi devre dışı bıraktık.
              İstersen bunu profesyonel “empty state” olarak bırakırız.
            </div>
          </div>
        </div>

        <div className="card">
          <div className="cardhd">
            <h3>FOOD SQUAD</h3>
            <span className="small">Coming soon (Mongo disabled)</span>
          </div>
          <div className="cardbd">
            <div className="small">
              Squad kısmı Mongo ile çalışıyor. Atlas IP whitelist vs uğraşmamak için şimdilik kapalı.
              Sonra tek tıkla açacağız.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
