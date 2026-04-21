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

      console.log("LOGIN RESPONSE:", res.data);

      localStorage.setItem("user", JSON.stringify(res.data));

      const role =
        res.data.role ||
        res.data.user?.role ||
        res.data.data?.role ||
        "admin";

      if (role === "admin") {
        window.location.href = "/admin";
      } else if (role === "teacher") {
        window.location.href = "/teacher";
      } else {
        window.location.href = "/student";
      }

    } catch (err) {
      console.log("LOGIN ERROR:", err.response?.data || err.message);

      const msg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Invalid Email or Password";

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <h1>VisionGuard</h1>
          <span>AI Attendance Management</span>
        </div>

        <div className="login-features">
          <div className="feature-box">Smart QR Attendance</div>
          <div className="feature-box">Face Recognition</div>
          <div className="feature-box">Teacher Dashboard</div>
          <div className="feature-box">Student Analytics</div>
          <div className="feature-box">Admin Reports</div>
        </div>
      </div>

      <div className="login-right">
        <form className="login-card" onSubmit={login}>
          <h2>Welcome Back</h2>
          <p>Login to continue</p>

          <input
            type="email"
            placeholder="Email Address"
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
            <h4>Demo Users</h4>

            <p><strong>Admin Portal</strong></p>
            <p>Email: admin@visionguard.com</p>
            <p>Password: admin123</p>

            <br />

            <p><strong>Teacher Portal</strong></p>
            <p>Email: teacher@visionguard.com</p>
            <p>Password: 123456</p>

            <br />

            <p><strong>Student Portal</strong></p>
            <p>Email: kritikabansal3@gmail.com</p>
            <p>Password: 123456</p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;