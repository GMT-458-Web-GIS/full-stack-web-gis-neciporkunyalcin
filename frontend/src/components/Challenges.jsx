import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function Challenges() {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setMsg("");
    try {
      const r = await api.get("/challenges/active");
      setItems(r.data?.data || []);
    } catch (e) {
      setMsg("Challenges load failed.");
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="card">
      <div className="cardhd">
        <h3>🧩 Active Challenges</h3>
        <button className="btn" style={{ padding: '4px 10px', fontSize: 12 }} onClick={load}>Refresh</button>
      </div>

      <div className="cardbd">
        {msg && <div className="small" style={{ color: "crimson", marginBottom: 8 }}>{msg}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.length === 0 && (
            <div className="small" style={{ textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: 8 }}>
              No active challenges right now.
              <br />
              Check back later for seasonal events!
            </div>
          )}

          {items.slice(0, 5).map((c) => (
            <div key={c._id} style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 8, background: '#fff' }}>
              <div className="row" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                <b style={{ fontSize: 14 }}>{c.title}</b>
                <span className="tag" style={{ background: '#ecfdf5', color: '#047857' }}>+{c?.rewards?.xp ?? 0} XP</span>
              </div>
              <div className="small" style={{ marginBottom: 8 }}>{c.description}</div>
              <div className="small" style={{ color: '#94a3b8', fontSize: 11 }}>
                {c.type.toUpperCase()} • Diff: {c.difficulty}/5
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
