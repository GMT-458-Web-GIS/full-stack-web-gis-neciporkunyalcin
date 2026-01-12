import React, { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";

import api from "./services/api";
import { getToken, getUser, clearSession, saveSession } from "./services/auth";
import { setAuthToken } from "./services/api";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";

function Shell({ user, onLogout, onSearch }) {
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
        <div className="brand" onClick={() => nav("/")} style={{ cursor: "pointer" }}>
          <div className="logo" />
          Nerede Yeşek
        </div>

        <div className="navgroup">
          <div className="navitem active">🗺️ Explore</div>
          <div className="navitem" onClick={() => nav("/profile")}>👤 Profile</div>
          <div className="navitem" onClick={() => nav("/login")}>🔐 Auth</div>
          <div className="navitem" title="Mongo kapalıyken burada hata göstermek yerine yakında 'Coming soon' yapacağız">
            🧩 Challenges (soon)
          </div>
          <div className="navitem">👥 Squads (soon)</div>
        </div>

        <div className="sep" />

        <div className="small">
          <div style={{ marginBottom: 8, color: "#cbd5e1", fontWeight: 700 }}>Tips</div>
          <div>• Haritadan nokta seç → restoran ekle</div>
          <div>• Leaderboard XP: create +100, check-in +10</div>
          <div>• Mongo’yu sonra açınca Challenges & Squads aktif olacak</div>
        </div>
      </aside>

      <main className="main">
        <div className="header">
          <div className="search">
            🔎
            <input
              placeholder="Search restaurant or cuisine (e.g. kebab, sushi)..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch?.(q)}
            />
          </div>

          <div className="chips">
            {chips.map((c) => (
              <button key={c.label} className="chip" onClick={c.onClick}>{c.label}</button>
            ))}
          </div>

          <div className="userpill">
            <div className="avatar" />
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
              <span style={{ fontSize: 12, color: "#cbd5e1" }}>{user ? user.username : "Guest"}</span>
              <span className="small">{user ? `Lv ${user.level} • XP ${user.total_xp}` : "Login to contribute"}</span>
            </div>
            {user ? (
              <button className="btn" onClick={onLogout}>Logout</button>
            ) : (
              <button className="btn primary" onClick={() => nav("/login")}>Login</button>
            )}
          </div>
        </div>

        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={<Login onLogin={() => nav("/")} />} />
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
