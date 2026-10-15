import { useAuth } from "../context/AuthContext.jsx";

export default function UserProfile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="auth-wrap">
      <h1>Profile</h1>
      <div className="card">
        <table>
          <tbody>
            <tr>
              <th>Name</th>
              <td>{user.name}</td>
            </tr>
            <tr>
              <th>Email</th>
              <td>{user.email}</td>
            </tr>
            <tr>
              <th>Role</th>
              <td>
                <span className={`badge ${user.role}`}>{user.role}</span>
              </td>
            </tr>
            <tr>
              <th>Interests</th>
              <td>
                {user.interests?.length ? (
                  <span className="chips">
                    {user.interests.map((interest) => (
                      <span className="chip" key={interest}>
                        {interest}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className="muted">none</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {user.role === "admin" && (
        <p className="muted small">
          You are an admin — use the admin links above to manage users, read all
          notes, and browse users by interest.
        </p>
      )}
    </div>
  );
}
