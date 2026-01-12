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
      <h3 style={{ marginTop: 0 }}>Food Squad</h3>

      {!user && <div className="small" style={{ color: "crimson" }}>Login required.</div>}

      <div className="small">
        Location: {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
      </div>
      <div className="row">
        <button className="btn" onClick={locate}>Use my location</button>
        <button className="btn" onClick={loadMy} disabled={!user}>Refresh</button>
      </div>

      <hr />
      <label>New squad name</label>
      <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
      {msg && <div className="small" style={{ color: msg.includes("created") ? "green" : "crimson" }}>{msg}</div>}
      <button className="btn" onClick={create} disabled={!user}>Create squad</button>

      <hr />
      <div className="small">
        <b>My squads:</b>
        {mySquads.length === 0 && <div>None yet.</div>}
        {mySquads.map((s) => (
          <div key={s._id} style={{ marginTop: 8 }}>
            <b>{s.name}</b> • members: {s.members?.length || 0}
          </div>
        ))}
      </div>
    </div>
  );
}
