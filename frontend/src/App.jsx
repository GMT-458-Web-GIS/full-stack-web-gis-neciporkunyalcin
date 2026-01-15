import React, { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";

import api from "./services/api";
import { getToken, getUser, clearSession, saveSession } from "./services/auth";
import { setAuthToken } from "./services/api";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";

import Notifications from "./components/Notifications";

function Shell({ user, onLogout, onSearch, onLogin }) {
  const nav = useNavigate();
  const [q, setQ] = useState("");

  const chips = useMemo(() => ([
    { label: "Nearby", onClick: () => nav("/") },
    { label: "Top rated", onClick: () => onSearch?.("top") },
    { label: "Budget", onClick: () => onSearch?.("budget") },
    { label: "Vegan", onClick: () => onSearch?.("vegan") },
  ]), [nav, onSearch]);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand" onClick={() => nav("/")}>
          <span style={{ fontSize: 24 }}>🥙</span>
          Nerede Yesek
        </div>

        <div className="navgroup">
          <div className="navitem active" onClick={() => nav("/")}>
            <span>🗺️</span> Explore
          </div>
          <div className="navitem" onClick={() => nav("/profile")}>
            <span>👤</span> Profile
          </div>
          <div className="navitem" onClick={() => nav("/login")}>
            <span>🔐</span> Auth
          </div>
        </div>

        <div className="sep" />

        <div className="navgroup">
          <div className="cardhd" style={{ background: 'transparent', padding: '0 0 8px 0', border: 0 }}>
            <h3>Discover</h3>
          </div>
          <div className="navitem"><span>🧩</span> Challenges</div>
          <div className="navitem"><span>👥</span> Food Squads</div>
        </div>

        <div style={{ flex: 1 }} />

        <div className="card" style={{ background: '#eff6ff', border: '1px solid #dbeafe' }}>
          <div className="cardbd" style={{ padding: '1rem' }}>
            <div style={{ fontWeight: 600, color: '#1e40af', marginBottom: 4 }}>Did you know?</div>
            <div className="small" style={{ color: '#1e3a8a' }}>
              Create a Squad to decide where to eat with friends by voting!
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="header">
          <div className="search">
            <span style={{ color: 'var(--text-light)' }}>🔍</span>
            <input
              placeholder="Search restaurant or cuisine..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch?.(q)}
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {chips.map((c) => (
              <button key={c.label} className="btn" style={{ fontSize: 13, padding: '4px 12px' }} onClick={c.onClick}>
                {c.label}
              </button>
            ))}
          </div>

          <div style={{ flex: 1 }} />

          <div className="row" style={{ gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{user ? user.username : "Guest"}</div>
              <div className="small">{user ? `Lvl ${user.level} • ${user.total_xp} XP` : "Sign in to explore"}</div>
            </div>
            <div
              style={{
                width: 40, height: 40, borderRadius: '50%', background: '#e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
              }}
            >
              {user ? user.username[0].toUpperCase() : 'Guest'[0]}
            </div>

            {user && (
              <button className="btn" style={{ marginLeft: 8 }} onClick={onLogout}>Logout</button>
            )}
            {!user && (
              <button className="btn primary" style={{ marginLeft: 8 }} onClick={() => nav("/login")}>Login</button>
            )}
            {user && <Notifications />}
          </div>
        </div>

        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={<Login onLogin={onLogin} />} />
          <Route path="/profile" element={<Profile user={user} />} />
        </Routes>
      </main>
    </div>
  );
}

function AppShell() {
  const [user, setUser] = useState(getUser());
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (token) setAuthToken(token);
  }, []);

  const logout = () => {
    clearSession();
    setUser(null);
    navigate("/login");
  };

  // optional: keep user fresh
  useEffect(() => {
    (async () => {
      const token = getToken();
      if (!token) return;
      try {
        const res = await api.get("/users/me");
        const me = res.data?.data;
        saveSession(token, me);
        setUser(me);
      } catch {
        // ignore
      }
    })();
  }, []);

  return (
    <Shell
      user={user}
      onLogout={logout}
      onLogin={(u) => { setUser(u); navigate("/"); }}
      onSearch={(q) => setSearchQuery(q)}
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
