import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function StudentLogin() {
  const nav = useNavigate();

  const [roll, setRoll] = useState("");
  const [password, setPassword] = useState("");

  const login = () => {
    if (roll && password) {
      nav("/student/dashboard");
    } else {
      alert("Enter roll number and password");
    }
  };

  return (
    <div className="login">
      <div className="box">
        <h1>Student Login</h1>

        <input
          placeholder="Roll Number"
          value={roll}
          onChange={(e) => setRoll(e.target.value)}
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

export default StudentLogin;