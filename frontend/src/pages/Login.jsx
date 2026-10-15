import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/notes" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email, password);
      navigate("/notes");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <h1>Log in</h1>
      {error && <p className="error">{error}</p>}
      <form className="card" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <div className="form-actions">
          <button type="submit" disabled={busy}>
            {busy ? "Logging in…" : "Log in"}
          </button>
        </div>
      </form>
      <p className="muted small">
        No account? <Link to="/register">Register</Link>
      </p>
      <div className="card">
        <p className="small">
          <strong>Demo accounts</strong> (after <code>npm run seed</code> in backend):
        </p>
        <div className="form-actions">
          <button
            type="button"
            className="secondary"
            onClick={() => {
              setEmail("admin@demo.com");
              setPassword("Admin@123");
            }}
          >
            Fill admin
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              setEmail("alice@demo.com");
              setPassword("User@1234");
            }}
          >
            Fill user
          </button>
        </div>
      </div>
    </div>
  );
}
