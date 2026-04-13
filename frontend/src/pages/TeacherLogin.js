import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function TeacherLogin() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = () => {
    if (email && password) {
      nav("/teacher/dashboard");
    } else {
      alert("Enter email and password");
    }
  };

  return (
    <div className="login">
      <div className="box">
        <h1>Teacher Login</h1>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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

export default TeacherLogin;