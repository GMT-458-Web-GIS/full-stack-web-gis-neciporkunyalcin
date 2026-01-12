import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setMsg("");
    try {
      const r = await api.get("/users/leaderboard");
      setRows(r.data?.data || []);
    } catch {
      setMsg("Leaderboard load failed.");
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="card">
      <div className="cardhd">
        <h3>LEADERBOARD</h3>
        <button className="btn" onClick={load}>Refresh</button>
      </div>
      <div className="cardbd">
        {msg && <div className="small" style={{ color: "#fca5a5" }}>{msg}</div>}

        {rows.slice(0, 10).map((u) => (
          <div
            key={u.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: "1px solid rgba(255,255,255,.06)"
            }}
          >
            <div>
              <div style={{ fontWeight: 700 }}>#{u.rank} {u.username}</div>
              <div className="small">Level {u.level}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 800, color: "#93c5fd" }}>{u.total_xp} XP</div>
              <div className="small">progress</div>
            </div>
          </div>
        ))}

        {rows.length === 0 && <div className="small">No users yet.</div>}
      </div>
    </div>
  );
}
