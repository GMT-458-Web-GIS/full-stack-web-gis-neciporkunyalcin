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
      <div className="row" style={{ alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>Challenges</h3>
        <div style={{ flex: 1 }} />
        <button className="btn" onClick={load}>Refresh</button>
      </div>

      {msg && <div className="small" style={{ color: "crimson" }}>{msg}</div>}

      <div className="small">
        {items.length === 0 && <div>No active challenges (create from backend later).</div>}
        {items.slice(0, 5).map((c) => (
          <div key={c._id} style={{ marginTop: 8 }}>
            <b>{c.title}</b>
            <div>{c.description}</div>
            <div className="small">Type: {c.type} • Reward XP: {c?.rewards?.xp ?? "-"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
