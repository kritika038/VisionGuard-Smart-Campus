import React from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Home() {
  const nav = useNavigate();

  return (
    <div className="main">
      <div className="container">
        <h1>VisionGuard AI</h1>
        <p>AI Powered Smart Attendance Management System</p>

        <div className="cards">
          <div className="card">
            <h2>Admin Portal</h2>
            <span>Manage students, teachers, reports & analytics</span>
            <button onClick={() => nav("/admin-login")}>Open</button>
          </div>

          <div className="card">
            <h2>Teacher Portal</h2>
            <span>QR attendance, face scan & manual marking</span>
            <button onClick={() => nav("/teacher-login")}>Open</button>
          </div>

          <div className="card">
            <h2>Student Portal</h2>
            <span>Attendance %, scan QR & timetable</span>
            <button onClick={() => nav("/student-login")}>Open</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;