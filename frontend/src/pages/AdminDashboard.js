// src/pages/AdminDashboard.js

import React, { useEffect, useState } from "react";
import api from "../api";
import "../App.css";

import StudentsModule from "../components/StudentsModule";
import TeachersModule from "../components/TeachersModule";
import SubjectsModule from "../components/SubjectsModule";
import TimetableModule from "../components/TimetableModule";
import AttendanceModule from "../components/AttendanceModule";
import ReportsModule from "../components/ReportsModule";

function AdminDashboard() {
  const [page, setPage] = useState("dashboard");

  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const menu = [
    { key: "dashboard", icon: "📊", label: "Dashboard" },
    { key: "students", icon: "🎓", label: "Students" },
    { key: "teachers", icon: "👨‍🏫", label: "Teachers" },
    { key: "subjects", icon: "📚", label: "Subjects" },
    { key: "timetable", icon: "🗓️", label: "Timetable" },
    { key: "attendance", icon: "✅", label: "Attendance" },
    { key: "reports", icon: "📈", label: "Reports" },
    { key: "settings", icon: "⚙️", label: "Settings" }
  ];

  const loadDashboard = async () => {
    try {
      const [s, t, sub, a] = await Promise.all([
        api.get("/students/"),
        api.get("/teachers/"),
        api.get("/subjects/"),
        api.get("/attendance/")
      ]);

      setStudents(s.data);
      setTeachers(t.data);
      setSubjects(sub.data);
      setAttendance(a.data);

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const presentCount = attendance.filter(
    (x) => x.status === "Present"
  ).length;

  const attendanceRate =
    attendance.length > 0
      ? Math.round(
          (presentCount /
            attendance.length) *
            100
        )
      : 0;

  const pendingFace =
    students.filter(
      (x) => !x.photo_path
    ).length;

  const registeredFace =
    students.filter(
      (x) => x.photo_path
    ).length;

  const renderPage = () => {
    switch (page) {
      case "students":
        return <StudentsModule />;

      case "teachers":
        return <TeachersModule />;

      case "subjects":
        return <SubjectsModule />;

      case "timetable":
        return <TimetableModule />;

      case "attendance":
        return <AttendanceModule />;

      case "reports":
        return <ReportsModule />;

      case "settings":
        return (
          <div className="content-box">
            <h1>Settings</h1>
            <p>
              Admin settings and profile
              management.
            </p>
          </div>
        );

      default:
        return (
          <>
            {/* Real Stats */}
            <div className="grid">

              <div className="stat-card">
                <h2>
                  {students.length}
                </h2>
                <p>Total Students</p>
              </div>

              <div className="stat-card">
                <h2>
                  {teachers.length}
                </h2>
                <p>Total Teachers</p>
              </div>

              <div className="stat-card">
                <h2>
                  {subjects.length}
                </h2>
                <p>Total Subjects</p>
              </div>

              <div className="stat-card">
                <h2>
                  {attendanceRate}%
                </h2>
                <p>Attendance Rate</p>
              </div>

            </div>

            {/* Secondary Cards */}
            <div className="grid">

              <div className="content-box">
                <h2>
                  Face Registration
                </h2>

                <p>
                  Registered:
                  {" "}
                  {registeredFace}
                </p>

                <p>
                  Pending:
                  {" "}
                  {pendingFace}
                </p>
              </div>

              <div className="content-box">
                <h2>
                  Attendance Logs
                </h2>

                <p>
                  Total Logs:
                  {" "}
                  {attendance.length}
                </p>

                <p>
                  Present:
                  {" "}
                  {presentCount}
                </p>
              </div>

            </div>

            {/* Welcome */}
            <div className="content-box">
              <h1>Welcome Admin</h1>

              <p>
                Live VisionGuard ERP
                dashboard connected with
                backend database.
              </p>
            </div>
          </>
        );
    }
  };

  return (
    <div className="admin-layout">

      {/* Sidebar */}
      <div className="sidebar">

        <div className="brand-box">
          <h2>VisionGuard</h2>
          <span>
            Premium ERP Panel
          </span>
        </div>

        {menu.map((item) => (
          <div
            key={item.key}
            className={
              page === item.key
                ? "menu active-menu"
                : "menu"
            }
            onClick={() =>
              setPage(item.key)
            }
          >
            {item.icon} {item.label}
          </div>
        ))}

        <button
          className="logout-btn"
          onClick={logout}
        >
          Logout
        </button>

      </div>

      {/* Main */}
      <div className="main-panel">

        <div className="topbar">

          <div>
            <h2>
              {
                menu.find(
                  (m) =>
                    m.key === page
                )?.label
              }
            </h2>

            <p>
              VisionGuard Smart Campus
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center"
            }}
          >
            <input
              placeholder="Search..."
              style={{
                width: "220px"
              }}
            />

            <div>
              🔔
            </div>

            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                background:
                  "#2563eb",
                display: "flex",
                justifyContent:
                  "center",
                alignItems:
                  "center",
                fontWeight: "700"
              }}
            >
              A
            </div>
          </div>

        </div>

        {renderPage()}

      </div>

    </div>
  );
}

export default AdminDashboard;