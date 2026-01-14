import React, { useMemo, useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import api from "../services/api";

// Leaflet marker icon fix (CRA)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function ClickToAdd({ canCreate, onPick }) {
  useMapEvents({
    click(e) {
      if (!canCreate) return;
      onPick({ lat: e.latlng.lat, lon: e.latlng.lng });
    },
  });
  return null;
}

export default function MapView({ center, restaurants, canCreate, onCreated }) {
  const [pick, setPick] = useState(null);
  const [form, setForm] = useState({
    name: "",
    cuisine_type: "",
    price_range: "",
    address: "",
    phone: "",
  });
  const [msg, setMsg] = useState("");

  const mapCenter = useMemo(() => [center.lat, center.lon], [center]);

  // Auto-fill address when pick changes
  useEffect(() => {
    if (pick) {
      setForm(prev => ({ ...prev, address: "Loading address..." }));
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pick.lat}&lon=${pick.lon}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.display_name) {
            setForm(prev => ({ ...prev, address: data.display_name }));
          } else {
            setForm(prev => ({ ...prev, address: "" }));
          }
        })
        .catch(() => {
          setForm(prev => ({ ...prev, address: "" }));
        });
    }
  }, [pick]);

  const createRestaurant = async () => {
    setMsg("");
    try {
      if (!pick) return setMsg("Pick a point on the map first.");
      if (!form.name) return setMsg("Name required.");
      await api.post("/restaurants", {
        ...form,
        lat: pick.lat,
        lon: pick.lon,
      });
      setMsg("Created! (+100 XP)");
      setTimeout(() => {
        setPick(null);
        setForm({ name: "", cuisine_type: "", price_range: "", address: "", phone: "" });
        onCreated?.();
      }, 1500);
    } catch (e) {
      setMsg(e?.response?.data?.message || "Create failed (login required?)");
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <MapContainer center={mapCenter} zoom={13} scrollWheelZoom style={{ height: '100%', width: '100%', borderRadius: 0 }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickToAdd canCreate={canCreate} onPick={setPick} />

        {restaurants.map((r) => (
          <Marker key={r.id} position={[r.latitude, r.longitude]}>
            <Popup>
              <div style={{ minWidth: 200 }}>
                <b style={{ fontSize: 15 }}>{r.name}</b>
                <div className="small" style={{ margin: '4px 0', color: '#64748b' }}>
                  {r.cuisine_type || "Unknown"} • {r.price_range || "-"} • ⭐ {r.rating ?? 0}
                </div>
                <div className="small">{r.address || ""}</div>
                <div style={{ marginTop: 8, fontSize: 11, color: '#94a3b8' }}>Check-in to earn XP</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {pick && (
          <Marker position={[pick.lat, pick.lon]}>
            <Popup>New Location</Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Floating Add Panel */}
      {pick && (
        <div
          className="card"
          style={{
            position: 'absolute', top: 12, right: 12, width: 320, zIndex: 1000,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)'
          }}
        >
          <div className="cardhd">
            <h3>Add Spot</h3>
            <button className="btn" style={{ padding: '2px 8px', fontSize: 12 }} onClick={() => setPick(null)}>✕</button>
          </div>
          <div className="cardbd">
            {!canCreate && (
              <div className="small" style={{ color: "crimson", marginBottom: 8 }}>
                Login required to create restaurants.
              </div>
            )}
            {msg && (
              <div className="small" style={{
                color: msg.includes("Created") ? "#10b981" : "#ef4444",
                marginBottom: 10, fontWeight: 500
              }}>
                {msg}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label className="small" style={{ fontWeight: 600 }}>Name</label>
                <input className="input" placeholder="Awesome place" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>

              <div className="row">
                <div style={{ flex: 1 }}>
                  <label className="small" style={{ fontWeight: 600 }}>Cuisine</label>
                  <input className="input" placeholder="Pizza" value={form.cuisine_type} onChange={(e) => setForm({ ...form, cuisine_type: e.target.value })} />
                </div>
                <div style={{ width: 120 }}>
                  <label className="small" style={{ fontWeight: 600 }}>Price (TL)</label>
                  <input
                    className="input"
                    placeholder="200-300 TL"
                    value={form.price_range}
                    onChange={(e) => setForm({ ...form, price_range: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="small" style={{ fontWeight: 600 }}>Address</label>
                <input className="input" placeholder="Street..." value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>

              <button className="btn primary" disabled={!canCreate} onClick={createRestaurant}>
                Create Location
              </button>
            </div>
          </div>
        </div>
      )}

      {!pick && canCreate && (
        <div
          style={{
            position: 'absolute', bottom: 24, right: 12, zIndex: 900,
            background: 'var(--primary)', color: 'white', padding: '8px 16px',
            borderRadius: 24, fontSize: 13, fontWeight: 500, boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            cursor: 'default', opacity: 0.9
          }}
        >
          👆 Click on map to add
        </div>
      )}
    </div>
  );
}
