import { useState } from "react";

/** Create/edit form for notes (title + content). */
export function NoteForm({
  initial = {},
  busy = false,
  submitLabel = "Save",
  onSubmit,
  onCancel,
}) {
  const [title, setTitle] = useState(initial.title ?? "");
  const [content, setContent] = useState(initial.content ?? "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, content });
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
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
          {busy ? "Saving…" : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
