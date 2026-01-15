import React, { useEffect, useState } from "react";
import api from "../services/api";
import Polls from "./Polls";

export default function FoodSquad({ user, onMapFocus }) {
  const [name, setName] = useState("");
  const [coords, setCoords] = useState({ lat: 39.92077, lon: 32.85411 });
  const [mySquads, setMySquads] = useState([]);
  const [selectedSquad, setSelectedSquad] = useState(null);
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

  if (selectedSquad) {
    return (
      <div className="card">
        <div className="cardhd" style={{ justifyContent: 'flex-start', gap: 10 }}>
          <button className="btn" onClick={() => setSelectedSquad(null)}>← Back</button>
          <h3>{selectedSquad.name}</h3>
        </div>
        <div className="cardbd">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <span className="tag" style={{ textTransform: 'uppercase', fontSize: 10, letterSpacing: 0.5 }}>{selectedSquad.squad_type}</span>
            </div>
            <div className="small" style={{ color: '#64748b' }}>
              Created by you
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="small" style={{ fontWeight: 700, color: '#475569', display: 'block', marginBottom: 8, textTransform: 'uppercase', fontSize: 11 }}>
              Squad Members ({selectedSquad.members?.length})
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {selectedSquad.members?.map((m) => (
                <div key={m.user_id} title={m.username} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: '#f8fafc', border: '1px solid #e2e8f0',
                  padding: '4px 10px 4px 4px', borderRadius: 20
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', background: '#3b82f6', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700
                  }}>
                    {m.username[0].toUpperCase()}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{m.username}</span>
                </div>
              ))}

              {/* Add Member Button - triggers focus on input below */}
              <button
                onClick={() => document.getElementById('inviteUser').focus()}
                style={{
                  width: 32, height: 32, borderRadius: '50%', border: '1px dashed #cbd5e1',
                  background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8'
                }}
                title="Add member"
              >
                +
              </button>
            </div>
          </div>

          <Polls squadId={selectedSquad._id} currentUser={user} onMapFocus={onMapFocus} />

          <div style={{ marginTop: 24, background: '#f8fafc', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <label className="small" style={{ fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>✉️</span> Invite New Member
            </label>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input
                className="input"
                placeholder="Enter username to invite..."
                id="inviteUser"
                style={{ background: 'white', flex: 1 }}
              />
              <button className="btn primary" onClick={async () => {
                const u = document.getElementById('inviteUser').value;
                if (!u) return alert('Enter username');
                try {
                  await api.post(`/squads/${selectedSquad._id}/invite`, { username: u });
                  alert('Invite sent!');
                  document.getElementById('inviteUser').value = '';
                } catch (e) {
                  alert(e.response?.data?.message || 'Error sending invite');
                }
              }}>Send Invite</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div className="tag">{s.members?.length || 0} members</div>
                  <button className="btn" style={{ fontSize: 11, padding: '2px 8px' }} onClick={() => setSelectedSquad(s)}>Open</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
