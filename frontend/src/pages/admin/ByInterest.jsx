import { useEffect, useState } from "react";
import { api } from "../../api/client.js";

/**
 * Aggregation Scenario 1 — users grouped by their interests
 * (GET /api/users/by-interests, one aggregate() call on the backend).
 */
export default function ByInterest() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/users/by-interests")
      .then((res) => setGroups(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1>Users by Interest</h1>
      <p className="muted small">
        Served by a single aggregation pipeline (<code>$unwind → $group → $sort</code>).
      </p>
      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="muted">Loading groups…</p>
      ) : groups.length === 0 ? (
        <p className="muted">No interests recorded yet.</p>
      ) : (
        groups.map((group) => (
          <section className="card" key={group._id}>
            <div className="card-head">
              <h2 style={{ textTransform: "capitalize" }}>{group._id}</h2>
              <span className="badge">
                {group.count} user{group.count === 1 ? "" : "s"}
              </span>
            </div>
            <ul className="small">
              {group.users.map((u) => (
                <li key={u._id}>
                  {u.name} <span className="muted">({u.email})</span>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
