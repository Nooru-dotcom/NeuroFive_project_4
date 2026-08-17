import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { api } from "../api";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .dashboardData()
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="page-center">
      <div className="auth-card">
        <h1>Dashboard</h1>
        <p>
          You're logged in as <strong>{user?.name}</strong> ({user?.email}).
        </p>

        {data && <p className="server-message">{data.message}</p>}
        {error && <p className="server-error">{error}</p>}

        <button onClick={handleLogout}>Log out</button>
      </div>
    </div>
  );
}
