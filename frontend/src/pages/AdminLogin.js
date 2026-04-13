import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function AdminLogin() {
  const nav = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = () => {
    if (username && password) {
      nav("/admin/dashboard");
    } else {
      alert("Enter username and password");
    }
  };

  return (
    <div className="login">
      <div className="box">
        <h1>Admin Login</h1>

        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={login}>Login</button>
      </div>
    </div>
  );
}

export default AdminLogin;