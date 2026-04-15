// src/pages/StudentDashboard.js

import React, {
  useCallback,
  useEffect,
  useState
} from "react";

import api from "../api";
import { QrReader } from "react-qr-reader";
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

  const [stats, setStats] =
    useState({
      total: 0,
      present: 0,
      absent: 0,
      percent: 0
    });

  // ------------------------
  // LOAD DATA
  // ------------------------
  const loadData =
    useCallback(async () => {
      try {
        // Student details
        const stu =
          await api.get(
            "/students/"
          );

        const me =
          (stu.data || []).find(
            (x) =>
              Number(x.id) ===
              Number(user.id)
          );

        // Timetable
        const tt =
          await api.get(
            "/timetable/"
          );

        let filtered =
          tt.data || [];

        if (me) {
          filtered =
            filtered.filter(
              (x) =>
                String(
                  x.section
                ) ===
                String(
                  me.section
                )
            );
        }

        setTimetable(
          filtered
        );

        // Attendance
        const res =
          await api.get(
            "/attendance/"
          );

        const myLogs =
          res.data.filter(
            (x) =>
              Number(
                x.student_id
              ) ===
              Number(
                user.id
              )
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

  // ------------------------
  // QR SCAN
  // ------------------------
  const handleScan =
    async (value) => {
      if (!value) return;

      try {
        const res =
          await api.post(
            "/qr/mark-attendance",
            {
              token: value,
              student_id:
                user.id
            }
          );

        setScanMsg(
          res.data.message
        );

        setCameraOpen(false);

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
          <h2>
            Student
          </h2>
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

        {/* DASHBOARD */}
        {tab ===
          "dashboard" && (
          <>
            <div className="grid">

              <div className="stat-card">
                <h2>
                  {
                    stats.total
                  }
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
                <p>
                  Present
                </p>
              </div>

              <div className="stat-card">
                <h2>
                  {
                    stats.absent
                  }
                </h2>
                <p>
                  Absent
                </p>
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
          </>
        )}

        {/* SCAN */}
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
                ? "Close Camera"
                : "Open Camera"}
            </button>

            {cameraOpen && (
              <QrReader
                constraints={{
                  facingMode:
                    "environment"
                }}
                onResult={(
                  result
                ) => {
                  if (
                    result
                  ) {
                    handleScan(
                      result?.text
                    );
                  }
                }}
              />
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

        {/* FILTERED TIMETABLE */}
        {tab ===
          "timetable" && (
          <div className="content-box">

            <h1>
              My Timetable
            </h1>

            <table className="student-table">
              <thead>
                <tr>
                  <th>
                    Day
                  </th>
                  <th>
                    Time
                  </th>
                  <th>
                    Subject
                  </th>
                  <th>
                    Room
                  </th>
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
                        }{" "}
                        -
                        {" "}
                        {
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

        {/* ATTENDANCE */}
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
                  <th>
                    Date
                  </th>
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

        {/* PROFILE */}
        {tab ===
          "profile" && (
          <div className="content-box">

            <h1>
              Profile
            </h1>

            <p>
              Name:
              {" "}
              {user.name}
            </p>

            <p>
              ID:
              {" "}
              {user.id}
            </p>

          </div>
        )}

      </div>

    </div>
  );
}

export default StudentDashboard;