import React, { useState } from "react";
import api from "../api";
import "../App.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", {
        email: email.trim(),
        password: password.trim(),
      });

      const user = res.data;

      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "admin") {
        window.location.replace("/admin");
      } else if (user.role === "teacher") {
        window.location.replace("/teacher");
      } else if (user.role === "student") {
        window.location.replace("/student");
      } else {
        setError("Invalid user role");
      }

    } catch (err) {
      console.log(err);

      if (err.response?.status === 401) {
        setError("Invalid Email or Password");
      } else {
        setError("Server connection issue.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <h1>VisionGuard</h1>
          <span>AI Attendance Management</span>
        </div>
      </div>

      <div className="login-right">
        <form className="login-card" onSubmit={login}>
          <h2>Welcome Back</h2>
          <p>Login to continue</p>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <div className="error-box">{error}</div>}

          <button type="submit">
            {loading ? "Please Wait..." : "Login"}
          </button>

          <div className="demo-box">
            <p><b>Admin</b><br />admin@visionguard.com / admin123</p>
            <p><b>Teacher</b><br />teacher@visionguard.com / 123456</p>
            <p><b>Student</b><br />kritikabansal3@gmail.com / 123456</p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;