/**
 * Shared pagination controls for every list view.
 */
export function Pagination({ page, totalPages, total, onChange }) {
  if (totalPages <= 1) {
    return (
      <p className="muted small" style={{ textAlign: "center" }}>
        {total} item{total === 1 ? "" : "s"}
      </p>
    );
  }
  return (
    <div className="pagination">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ← Prev
      </button>
      <span className="small">
        Page {page} of {totalPages} ({total} items)
      </span>
      <button disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next →
      </button>
    </div>
  );
}
