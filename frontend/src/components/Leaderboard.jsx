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
        <h3>🏆 Leaderboard</h3>
        <button className="btn" style={{ padding: '4px 10px', fontSize: 12 }} onClick={load}>Refresh</button>
      </div>
      <div className="cardbd" style={{ padding: 0 }}>
        {msg && <div className="small" style={{ padding: '1rem', color: "#fca5a5" }}>{msg}</div>}

        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          {rows.slice(0, 10).map((u, i) => {
            let rankIcon = `#${u.rank}`;
            if (u.rank === 1) rankIcon = "🥇";
            if (u.rank === 2) rankIcon = "🥈";
            if (u.rank === 3) rankIcon = "🥉";

            return (
              <div
                key={u.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--border)",
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div className="row">
                  <div style={{ width: 24, fontSize: 16, fontWeight: 700, textAlign: 'center' }}>{rankIcon}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{u.username}</div>
                    <div className="small" style={{ color: '#94a3b8' }}>Level {u.level}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, color: "var(--primary)", fontSize: 14 }}>{u.total_xp} XP</div>
                </div>
              </div>
            );
          })}
        </div>

        {rows.length === 0 && <div className="small" style={{ padding: '1.5rem', textAlign: 'center' }}>No users yet.</div>}
      </div>
    </div>
  );
}
