import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function FoodSquad({ user }) {
  const [name, setName] = useState("");
  const [coords, setCoords] = useState({ lat: 39.92077, lon: 32.85411 });
  const [mySquads, setMySquads] = useState([]);
  const [msg, setMsg] = useState("");

  const locate = () => {
    setMsg("");
    if (!navigator.geolocation) return setMsg("No geolocation.");
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => setMsg("Location denied.")
    );
  };

  const loadMy = async () => {
    if (!user) return;
    try {
      const r = await api.get("/squads/my");
      setMySquads(r.data?.data || []);
    } catch (e) {
      setMsg("Load squads failed.");
    }
  };

  useEffect(() => { loadMy(); }, [user]);

  const create = async () => {
    setMsg("");
    try {
      if (!name) return setMsg("Squad name required");
      await api.post("/squads", {
        name,
        squad_type: "casual",
        coordinates: [coords.lon, coords.lat] // [lon, lat]
      });
      setName("");
      setMsg("Squad created!");
      loadMy();
    } catch (e) {
      setMsg(e?.response?.data?.message || "Create squad failed (login?)");
    }
  };

  return (
    <div className="card">
      <div className="cardhd">
        <h3>👥 Food Squads</h3>
        <button className="btn" style={{ padding: '4px 10px', fontSize: 12 }} onClick={loadMy} disabled={!user}>Refresh</button>
      </div>

      <div className="cardbd">
        {!user && <div className="small" style={{ color: "crimson", marginBottom: 16 }}>Login required to manage squads.</div>}

        <div className="small" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Current Loc: {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}</span>
          <button className="btn" style={{ padding: '2px 8px', fontSize: 11 }} onClick={locate}>Update</button>
        </div>

        <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
          <label className="small" style={{ fontWeight: 600, marginBottom: 4, display: 'block' }}>Create New Squad</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="input"
              placeholder="Squad Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ padding: '6px 10px', fontSize: 13 }}
            />
            <button className="btn primary" onClick={create} disabled={!user}>Create</button>
          </div>
          {msg && <div className="small" style={{ marginTop: 8, color: msg.includes("created") ? "#10b981" : "#ef4444" }}>{msg}</div>}
        </div>

        <div style={{ marginTop: 16 }}>
          <div className="small" style={{ fontWeight: 700, marginBottom: 8, color: 'var(--text-light)', textTransform: 'uppercase', fontSize: 11 }}>My Squads</div>
          {mySquads.length === 0 && <div className="small" style={{ color: '#94a3b8' }}>You haven't joined any squads yet.</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {mySquads.map((s) => (
              <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                  <div className="small" style={{ fontSize: 11 }}>{s.squad_type}</div>
                </div>
                <div className="tag">{s.members?.length || 0} members</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
