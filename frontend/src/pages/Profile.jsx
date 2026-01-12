import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function Profile({ user, onRefreshMe }) {
  const [me, setMe] = useState(user);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setMsg("");
    try {
      const r = await api.get("/users/me");
      setMe(r.data?.data);
      onRefreshMe?.();
    } catch (e) {
      setMsg("Please login.");
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 640 }}>
        <h2>Profile</h2>
        {msg && <div className="small" style={{ color: "crimson" }}>{msg}</div>}

        {me ? (
          <>
            <div><b>Username:</b> {me.username}</div>
            <div><b>Email:</b> {me.email}</div>
            <div><b>User type:</b> {me.user_type}</div>
            <div><b>Total XP:</b> {me.total_xp}</div>
            <div><b>Level:</b> {me.level}</div>
            <hr />
            <button className="btn" onClick={load}>Refresh</button>
          </>
        ) : (
          <div className="small">Not logged in.</div>
        )}
      </div>
    </div>
  );
}
