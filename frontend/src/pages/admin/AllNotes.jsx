import { useCallback, useEffect, useState } from "react";
import { api } from "../../api/client.js";
import { NoteCard } from "../../components/NoteCard.jsx";
import { Pagination } from "../../components/Pagination.jsx";

const LIMIT = 6;

/** Admin view: everyone's notes, paginated (GET /api/admin/notes). */
export default function AllNotes() {
  const [notes, setNotes] = useState([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api(`/admin/notes?page=${page}&limit=${LIMIT}`);
      setNotes(res.data);
      setMeta({ total: res.total, totalPages: res.totalPages });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <h1>All Notes</h1>
      <p className="muted small">
        Admin-only view — every user's private notes, read-only.
      </p>
      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="muted">Loading notes…</p>
      ) : notes.length === 0 ? (
        <p className="muted">No notes exist yet.</p>
      ) : (
        <div className="grid">
          {notes.map((note) => (
            <NoteCard key={note._id} note={note} showOwner />
          ))}
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
