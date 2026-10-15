import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Pagination } from "../components/Pagination.jsx";

const LIMIT = 6;

export default function Posts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // "Create post" form state
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);

  // $lookup view: posts of one author (GET /api/posts/user/:userId)
  const [author, setAuthor] = useState(null);
  const [authorLoading, setAuthorLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api(`/posts?page=${page}&limit=${LIMIT}`);
      setPosts(res.data);
      setMeta({ total: res.total, totalPages: res.totalPages });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load, reloadKey]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/posts", { method: "POST", body: { title, content } });
      setTitle("");
      setContent("");
      setCreating(false);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  // Aggregation Scenario 2: single $lookup pipeline on the backend.
  const viewAuthorPosts = async (userId) => {
    setAuthorLoading(true);
    setError("");
    try {
      const res = await api(`/posts/user/${userId}`);
      setAuthor(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setAuthorLoading(false);
    }
  };

  return (
    <div>
      <div className="page-head">
        <h1>Posts</h1>
        {user && !creating && (
          <button className="primary" onClick={() => setCreating(true)}>
            + New post
          </button>
        )}
      </div>
      <p className="muted small">
        Public feed — everyone can read posts.{" "}
        {!user && "Log in to write your own."}
      </p>

      {error && <p className="error">{error}</p>}

      {creating && (
        <form className="card" onSubmit={handleCreatePost}>
          <label>
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              autoFocus
            />
          </label>
          <label>
            Content
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={busy}>
              {busy ? "Publishing…" : "Publish"}
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => setCreating(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* $lookup result panel */}
      {authorLoading && <p className="muted loading">Loading author posts…</p>}
      {author && !authorLoading && (
        <section className="card">
          <div className="card-head">
            <h2>
              Posts by {author.name}{" "}
              <span className="muted small">({author.email}) — {author.posts.length}{" "}
                post{author.posts.length === 1 ? "" : "s"}
              </span>
            </h2>
            <button className="secondary" onClick={() => setAuthor(null)}>
              × Close
            </button>
          </div>
          <p className="muted small">
            Served by the aggregation pipeline (<code>$match → $lookup → $project</code>).
          </p>
          {author.posts.length === 0 ? (
            <p className="muted">This user has not posted anything yet.</p>
          ) : (
            author.posts.map((p) => (
              <div key={p._id} style={{ borderTop: "1px solid #e3e6ea", padding: "8px 0" }}>
                <strong>{p.title}</strong>
                <p className="prewrap small">{p.content}</p>
              </div>
            ))
          )}
        </section>
      )}

      {loading ? (
        <p className="muted loading">Loading posts…</p>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <span className="icon">📝</span>
          No posts yet.
        </div>
      ) : (
        posts.map((post) => (
          <article className="card" key={post._id}>
            <div className="card-head">
              <h3>{post.title}</h3>
              {post.author && (
                <button
                  className="secondary"
                  onClick={() => viewAuthorPosts(post.author._id)}
                  disabled={authorLoading}
                >
                  View author's posts
                </button>
              )}
            </div>
            <p className="prewrap">{post.content}</p>
            <p className="muted small">
              By {post.author ? `${post.author.name} (${post.author.email})` : "unknown"} ·{" "}
              {new Date(post.createdAt).toLocaleString()}
            </p>
          </article>
        ))
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
