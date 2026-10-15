import { useState } from "react";

/**
 * Admin create/edit form for users.
 * When editing (initial._id set) the password field is optional —
 * leave it blank to keep the current password.
 */
export function UserForm({
  initial = {},
  busy = false,
  submitLabel = "Save",
  onSubmit,
  onCancel,
}) {
  const isEdit = Boolean(initial._id);
  const [name, setName] = useState(initial.name ?? "");
  const [email, setEmail] = useState(initial.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(initial.role ?? "user");
  const [interests, setInterests] = useState((initial.interests ?? []).join(", "));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name,
      email,
      role,
      interests: interests
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    if (password) payload.password = password;
    onSubmit(payload);
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <label>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label>
        {isEdit ? "New password (leave blank to keep current)" : "Password"}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={!isEdit}
          minLength={isEdit || password === "" ? undefined : 8}
          placeholder={isEdit ? "••••••••" : "Min 8 characters"}
        />
      </label>
      <label>
        Role
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
      </label>
      <label>
        Interests (comma separated)
        <input
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          placeholder="chess, reading, travel"
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
