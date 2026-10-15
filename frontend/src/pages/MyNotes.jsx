import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { NoteCard } from "../components/NoteCard.jsx";
import { NoteForm } from "../components/NoteForm.jsx";
import { Pagination } from "../components/Pagination.jsx";

const LIMIT = 6;

export default function MyNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const refresh = () => setReloadKey((k) => k + 1);

  // Own notes, paginated — GET /api/notes?page=&limit=
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api(`/notes?page=${page}&limit=${LIMIT}`);
      setNotes(res.data);
      setMeta({ total: res.total, totalPages: res.totalPages });
      // Last item removed from the last page -> step back one page.
      if (res.data.length === 0 && page > 1) setPage(page - 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load, reloadKey]);

  const handleCreate = async (values) => {
    setBusy(true);
    setError("");
    try {
      await api("/notes", { method: "POST", body: values });
      setCreating(false);
      refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleUpdate = async (values) => {
    setBusy(true);
    setError("");
    try {
      await api(`/notes/${editingId}`, { method: "PATCH", body: values });
      setEditingId(null);
      refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (note) => {
    if (!window.confirm(`Delete "${note.title}"?`)) return;
    setError("");
    try {
      await api(`/notes/${note._id}`, { method: "DELETE" });
      refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-head">
        <h1>My Notes</h1>
        {!creating && (
          <button className="primary" onClick={() => setCreating(true)}>
            + New note
          </button>
        )}
      </div>
      <p className="muted small">
        Signed in as {user?.email} — your notes are private to you.
      </p>

      {error && <p className="error">{error}</p>}
      {creating && (
        <NoteForm
          busy={busy}
          submitLabel="Create note"
          onSubmit={handleCreate}
          onCancel={() => setCreating(false)}
        />
      )}

      {loading ? (
        <p className="muted loading">Loading notes…</p>
      ) : notes.length === 0 && !creating ? (
        <div className="empty-state">
          <span className="icon">🗒️</span>
          No notes yet — create your first one.
        </div>
      ) : (
        <div className="grid">
          {notes.map((note) =>
            note._id === editingId ? (
              <NoteForm
                key={note._id}
                initial={note}
                busy={busy}
                submitLabel="Save changes"
                onSubmit={handleUpdate}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <NoteCard
                key={note._id}
                note={note}
                onEdit={(n) => setEditingId(n._id)}
                onDelete={handleDelete}
              />
            )
          )}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={meta.totalPages}
        total={meta.total}
        onChange={setPage}
      />
    </div>
  );
}
