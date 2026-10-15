/**
 * Displays a single note. Optionally shows the owner (admin all-notes view)
 * and edit/delete actions (my-notes view).
 */
export function NoteCard({ note, onEdit, onDelete, showOwner = false }) {
  return (
    <article className="card">
      <div className="card-head">
        <h3>{note.title}</h3>
        {(onEdit || onDelete) && (
          <div className="card-actions">
            {onEdit && (
              <button className="secondary" onClick={() => onEdit(note)}>
                Edit
              </button>
            )}
            {onDelete && (
              <button className="danger" onClick={() => onDelete(note)}>
                Delete
              </button>
            )}
          </div>
        )}
      </div>
      <p className="prewrap">{note.content}</p>
      <p className="muted small">
        {showOwner && note.owner ? `By ${note.owner.name} (${note.owner.email}) · ` : ""}
        updated {new Date(note.updatedAt).toLocaleString()}
      </p>
    </article>
  );
}
