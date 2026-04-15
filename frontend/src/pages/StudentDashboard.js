// src/pages/StudentDashboard.js

import React, {
  useCallback,
  useEffect,
  useState
} from "react";

import api from "../api";
import "../App.css";

function StudentDashboard() {
  const user =
    JSON.parse(
      localStorage.getItem("user")
    ) || {};

  const [tab, setTab] =
    useState("dashboard");

  const [logs, setLogs] =
    useState([]);

  const [timetable, setTimetable] =
    useState([]);

  const [cameraOpen, setCameraOpen] =
    useState(false);

  const [scanMsg, setScanMsg] =
    useState("");

  const [qrToken, setQrToken] =
    useState("");

  const [stats, setStats] =
    useState({
      total: 0,
      present: 0,
      absent: 0,
      percent: 0
    });

  const loadData =
    useCallback(async () => {
      try {
        const stu =
          await api.get("/students/");

        const me =
          (stu.data || []).find(
            (x) =>
              Number(x.id) ===
              Number(user.id)
          );

        const tt =
          await api.get("/timetable/");

        let filtered =
          tt.data || [];

        if (me) {
          filtered =
            filtered.filter(
              (x) =>
                String(x.section) ===
                String(me.section)
            );
        }

        setTimetable(filtered);

        const res =
          await api.get("/attendance/");

        const myLogs =
          (res.data || []).filter(
            (x) =>
              Number(
                x.student_id
              ) ===
              Number(user.id)
          );

        setLogs(myLogs);

        const total =
          myLogs.length;

        const present =
          myLogs.filter(
            (x) =>
              x.status ===
              "Present"
          ).length;

        const absent =
          myLogs.filter(
            (x) =>
              x.status ===
              "Absent"
          ).length;

        const percent =
          total > 0
            ? Math.round(
                (present /
                  total) *
                  100
              )
            : 0;

        setStats({
          total,
          present,
          absent,
          percent
        });
      } catch (error) {
        console.log(error);
      }
    }, [user.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleScan =
    async () => {
      if (!qrToken.trim()) {
        setScanMsg(
          "Enter QR Code"
        );
        return;
      }

      try {
        const res =
          await api.post(
            "/qr/mark-attendance",
            {
              token: qrToken,
              student_id:
                user.id
            }
          );

        setScanMsg(
          res.data.message
        );

        setQrToken("");

        loadData();
      } catch (error) {
        setScanMsg(
          error?.response
            ?.data
            ?.detail ||
            "Scan Failed"
        );
      }
    };

  const logout = () => {
    localStorage.clear();
    window.location.href =
      "/";
  };

  return (
    <div className="admin-layout">

      <div className="sidebar">

        <div className="brand-box">
          <h2>Student</h2>
          <span>
            Premium Portal
          </span>
        </div>

        {[
          "dashboard",
          "scan",
          "timetable",
          "attendance",
          "profile"
        ].map((item) => (
          <div
            key={item}
            className={
              tab === item
                ? "menu active-menu"
                : "menu"
            }
            onClick={() =>
              setTab(item)
            }
          >
            {item}
          </div>
        ))}

        <button
          className="logout-btn"
          onClick={logout}
        >
          Logout
        </button>

      </div>

      <div className="main-panel">

        <div className="topbar">
          <h2>
            Welcome, {user.name}
          </h2>
        </div>

        {tab ===
          "dashboard" && (
          <div className="grid">

            <div className="stat-card">
              <h2>
                {stats.total}
              </h2>
              <p>
                Total Classes
              </p>
            </div>

            <div className="stat-card">
              <h2>
                {
                  stats.present
                }
              </h2>
              <p>Present</p>
            </div>

            <div className="stat-card">
              <h2>
                {stats.absent}
              </h2>
              <p>Absent</p>
            </div>

            <div className="stat-card">
              <h2>
                {
                  stats.percent
                }%
              </h2>
              <p>
                Attendance %
              </p>
            </div>

          </div>
        )}

        {tab === "scan" && (
          <div className="content-box">

            <h1>
              QR Attendance
            </h1>

            <button
              className="primary-btn"
              onClick={() =>
                setCameraOpen(
                  !cameraOpen
                )
              }
            >
              {cameraOpen
                ? "Close QR Entry"
                : "Open QR Entry"}
            </button>

            {cameraOpen && (
              <div
                style={{
                  marginTop:
                    "20px"
                }}
              >
                <input
                  type="text"
                  value={qrToken}
                  onChange={(
                    e
                  ) =>
                    setQrToken(
                      e.target
                        .value
                    )
                  }
                  placeholder="Paste / Enter QR Token"
                  style={{
                    width:
                      "100%",
                    padding:
                      "12px",
                    marginBottom:
                      "12px"
                  }}
                />

                <button
                  className="primary-btn"
                  onClick={
                    handleScan
                  }
                >
                  Submit QR
                </button>
              </div>
            )}

            {scanMsg && (
              <div className="stat-card">
                <h2>
                  {scanMsg}
                </h2>
              </div>
            )}

          </div>
        )}

        {tab ===
          "timetable" && (
          <div className="content-box">

            <h1>
              My Timetable
            </h1>

            <table className="student-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Time</th>
                  <th>
                    Subject
                  </th>
                  <th>Room</th>
                </tr>
              </thead>

              <tbody>
                {timetable.map(
                  (x) => (
                    <tr
                      key={
                        x.id
                      }
                    >
                      <td>
                        {
                          x.day_name
                        }
                      </td>

                      <td>
                        {
                          x.start_time
                        } - {
                          x.end_time
                        }
                      </td>

                      <td>
                        {
                          x.subject_name
                        }
                      </td>

                      <td>
                        {
                          x.room_no
                        }
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>

          </div>
        )}

        {tab ===
          "attendance" && (
          <div className="content-box">

            <h1>
              Attendance
            </h1>

            <table className="student-table">
              <thead>
                <tr>
                  <th>
                    Subject
                  </th>
                  <th>
                    Status
                  </th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {logs.map(
                  (x) => (
                    <tr
                      key={
                        x.id
                      }
                    >
                      <td>
                        {
                          x.subject_name
                        }
                      </td>

                      <td>
                        {
                          x.status
                        }
                      </td>

                      <td>
                        {
                          x.date_marked
                        }
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>

          </div>
        )}

        {tab ===
          "profile" && (
          <div className="content-box">

            <h1>
              Profile
            </h1>

            <p>
              Name: {user.name}
            </p>

            <p>
              ID: {user.id}
            </p>

          </div>
        )}

      </div>

    </div>
  );
}

export default StudentDashboard;