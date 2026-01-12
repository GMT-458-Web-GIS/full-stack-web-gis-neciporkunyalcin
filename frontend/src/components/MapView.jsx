import React, { useMemo, useState } from "react";
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
      setPick(null);
      setForm({ name: "", cuisine_type: "", price_range: "", address: "", phone: "" });
      onCreated?.();
    } catch (e) {
      setMsg(e?.response?.data?.message || "Create failed (login required?)");
    }
  };

  return (
    <div>
      <MapContainer center={mapCenter} zoom={13} scrollWheelZoom>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickToAdd canCreate={canCreate} onPick={setPick} />

        {restaurants.map((r) => (
          <Marker key={r.id} position={[r.latitude, r.longitude]}>
            <Popup>
              <b>{r.name}</b>
              <div className="small">
                {r.cuisine_type || "Unknown cuisine"} • {r.price_range || "-"} • ⭐ {r.rating ?? 0}
              </div>
              <div className="small">{r.address || ""}</div>
            </Popup>
          </Marker>
        ))}

        {pick && (
          <Marker position={[pick.lat, pick.lon]}>
            <Popup>
              <b>New Restaurant</b>
              <div className="small">Lat: {pick.lat.toFixed(5)} Lon: {pick.lon.toFixed(5)}</div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      <div className="card" style={{ marginTop: 12 }}>
        <h3 style={{ marginTop: 0 }}>Add restaurant (click on map)</h3>
        {!canCreate && (
          <div className="small" style={{ color: "crimson" }}>
            Login required to create restaurants.
          </div>
        )}
        {msg && <div className="small" style={{ color: msg.includes("Created") ? "green" : "crimson" }}>{msg}</div>}

        <label>Name</label>
        <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

        <div className="row">
          <div>
            <label>Cuisine</label>
            <input className="input" value={form.cuisine_type} onChange={(e) => setForm({ ...form, cuisine_type: e.target.value })} />
          </div>
          <div>
            <label>Price range</label>
            <input className="input" placeholder="e.g. 100-200" value={form.price_range} onChange={(e) => setForm({ ...form, price_range: e.target.value })} />
          </div>
        </div>

        <label>Address</label>
        <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />

        <label>Phone</label>
        <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />

        <button className="btn" disabled={!canCreate} onClick={createRestaurant}>
          Create
        </button>

        <div className="small">
          Tip: Haritaya tıklayıp nokta seçmeden create yapma.
        </div>
      </div>
    </div>
  );
}
