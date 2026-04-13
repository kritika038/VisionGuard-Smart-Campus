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
  const loadData = useCallback(async () => {
    try {
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

      {/* SIDEBAR */}
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

      {/* MAIN */}
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
                  }
                  %
                </h2>
                <p>
                  Attendance %
                </p>
              </div>

            </div>

            <div className="content-box">
              <h1>
                Student Overview
              </h1>

              <p>
                Scan QR code to
                mark attendance,
                monitor your
                records and
                maintain good
                percentage.
              </p>
            </div>
          </>
        )}

        {/* QR SCAN */}
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
              <div
                style={{
                  marginTop:
                    "20px",
                  borderRadius:
                    "18px",
                  overflow:
                    "hidden"
                }}
              >
                <QrReader
                  constraints={{
                    facingMode:
                      "environment"
                  }}
                  onResult={(
                    result,
                    error
                  ) => {
                    if (
                      result
                    ) {
                      handleScan(
                        result?.text
                      );
                    }
                  }}
                  style={{
                    width:
                      "100%"
                  }}
                />
              </div>
            )}

            {scanMsg && (
              <div
                className="stat-card"
                style={{
                  marginTop:
                    "20px"
                }}
              >
                <h2>
                  {scanMsg}
                </h2>
              </div>
            )}

          </div>
        )}

        {/* ATTENDANCE */}
        {tab ===
          "attendance" && (
          <div className="content-box">

            <h1>
              Attendance
              Records
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
              My Profile
            </h1>

            <p>
              Name:{" "}
              {user.name}
            </p>

            <p>
              Role:
              Student
            </p>

            <p>
              ID:
              {user.id}
            </p>

          </div>
        )}

      </div>

    </div>
  );
}

export default StudentDashboard;