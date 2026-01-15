import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { setAuthToken } from "../services/api";
import { saveSession } from "../services/auth";

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login"); // login | register
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const navigate = useNavigate();

  const submit = async () => {
    setMsg("");
    try {
      if (mode === "register") {
        const r = await api.post("/auth/register", { username, email, password });
        const { token, data } = r.data;
        saveSession(token, data);
        setAuthToken(token); // Set token in axios
        onLogin(data);
        navigate("/");
      } else {
        const r = await api.post("/auth/login", { email, password });
        const { token, data } = r.data;
        saveSession(token, data);
        setAuthToken(token); // Set token in axios
        onLogin(data);
        navigate("/");
      }
    } catch (e) {
      setMsg(e?.response?.data?.message || "Error");
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 520 }}>
        <h2>{mode === "login" ? "Login" : "Register"}</h2>

        {mode === "register" && (
          <>
            <label>Username</label>
            <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
          </>
        )}

        <label>Email</label>
        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />

        <label>Password</label>
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        {msg && <div className="small" style={{ color: "crimson" }}>{msg}</div>}

        <button className="btn" onClick={submit}>
          {mode === "login" ? "Login" : "Create account"}
        </button>

        <hr />
        <div className="small">
          {mode === "login" ? (
            <span>
              No account?{" "}
              <button className="btn" onClick={() => setMode("register")}>Register</button>
            </span>
          ) : (
            <span>
              Already have account?{" "}
              <button className="btn" onClick={() => setMode("login")}>Login</button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
