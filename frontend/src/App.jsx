import { Link, NavLink, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Posts from "./pages/Posts.jsx";
import MyNotes from "./pages/MyNotes.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import Users from "./pages/admin/Users.jsx";
import AllNotes from "./pages/admin/AllNotes.jsx";
import ByInterest from "./pages/admin/ByInterest.jsx";

function NavBar() {
  const { user, logout } = useAuth();

  return (
    <header className="nav">
      <Link to="/" className="brand">
        📓 Notes App
      </Link>
      <nav>
        <NavLink to="/" end>
          Posts
        </NavLink>
        {user && <NavLink to="/notes">My Notes</NavLink>}
        {user && <NavLink to="/profile">Profile</NavLink>}
        {user?.role === "admin" && (
          <>
            <NavLink to="/admin/users">Users</NavLink>
            <NavLink to="/admin/notes">All Notes</NavLink>
            <NavLink to="/admin/interests">By Interest</NavLink>
          </>
        )}
      </nav>
      <div className="nav-right">
        {user ? (
          <>
            <span className="muted small">{user.email}</span>
            <span className={`badge ${user.role}`}>{user.role}</span>
            <button className="secondary" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </header>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavBar />
      <main className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Public home */}
          <Route path="/" element={<Posts />} />

          {/* Authenticated users */}
          <Route element={<ProtectedRoute />}>
            <Route path="/notes" element={<MyNotes />} />
            <Route path="/profile" element={<UserProfile />} />
          </Route>

          {/* Admin only */}
          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/notes" element={<AllNotes />} />
            <Route path="/admin/interests" element={<ByInterest />} />
          </Route>

          <Route path="*" element={<Posts />} />
        </Routes>
      </main>
    </AuthProvider>
  );
}
