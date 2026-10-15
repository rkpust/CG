import { useCallback, useEffect, useState } from "react";
import { api } from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { Pagination } from "../../components/Pagination.jsx";
import { UserForm } from "../../components/UserForm.jsx";

const LIMIT = 6;

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("");
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Admin user list, paginated — GET /api/users?page=&limit=&role=
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (roleFilter) params.set("role", roleFilter);
      const res = await api(`/users?${params}`);
      setUsers(res.data);
      setMeta({ total: res.total, totalPages: res.totalPages });
      if (res.data.length === 0 && page > 1) setPage(page - 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter]);

  useEffect(() => {
    load();
  }, [load, reloadKey]);

  const refresh = () => setReloadKey((k) => k + 1);
  const run = async (fn, successMessage) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await fn();
      setNotice(successMessage);
      refresh();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handleCreate = async (values) => {
    const ok = await run(
      () => api("/users", { method: "POST", body: values }),
      `User ${values.email} created.`
    );
    if (ok) setCreating(false);
  };

  const handleUpdate = async (values) => {
    const ok = await run(
      () => api(`/users/${editingId}`, { method: "PATCH", body: values }),
      "User updated."
    );
    if (ok) setEditingId(null);
  };

  const handleDelete = async (target) => {
    if (
      !window.confirm(
        `Delete ${target.email}? Their notes and posts will be removed too.`
      )
    )
      return;
    await run(
      () => api(`/users/${target._id}`, { method: "DELETE" }),
      `User ${target.email} deleted.`
    );
  };

  return (
    <div>
      <div className="card-head">
        <h1>Manage Users</h1>
        {!creating && (
          <div className="row-actions">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              style={{ width: "auto" }}
            >
              <option value="">All roles</option>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
            <button className="primary" onClick={() => setCreating(true)}>
              + Add user
            </button>
          </div>
        )}
      </div>

      {error && <p className="error">{error}</p>}
      {notice && <p className="success">{notice}</p>}

      {creating && (
        <UserForm
          busy={busy}
          submitLabel="Create user"
          onSubmit={handleCreate}
          onCancel={() => setCreating(false)}
        />
      )}

      {editingId && users.find((u) => u._id === editingId) && (
        <UserForm
          initial={users.find((u) => u._id === editingId)}
          busy={busy}
          submitLabel="Save changes"
          onSubmit={handleUpdate}
          onCancel={() => setEditingId(null)}
        />
      )}

      <div className="card" style={{ overflowX: "auto" }}>
        {loading ? (
          <p className="muted">Loading users…</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Interests</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role}`}>{u.role}</span>
                  </td>
                  <td className="small">
                    {u.interests?.length ? u.interests.join(", ") : "—"}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="secondary"
                        onClick={() => {
                          setEditingId(u._id);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="danger"
                        disabled={u._id === currentUser?._id}
                        title={
                          u._id === currentUser?._id
                            ? "You cannot delete your own account"
                            : ""
                        }
                        onClick={() => handleDelete(u)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination
        page={page}
        totalPages={meta.totalPages}
        total={meta.total}
        onChange={setPage}
      />
    </div>
  );
}
