// src/pages/TeacherDashboard.js

import React, { useCallback, useEffect, useState, useRef } from "react";
import api from "../api";
import QRCode from "react-qr-code";
import Webcam from "react-webcam";
import "../App.css";

function TeacherDashboard() {
  const user =
    JSON.parse(localStorage.getItem("user")) || {};

  const webcamRef = useRef(null);

  const [tab, setTab] = useState("dashboard");
  const [timetable, setTimetable] = useState([]);
  const [students, setStudents] = useState([]);
  const [logs, setLogs] = useState([]);

  const [sessionOpen, setSessionOpen] =
    useState(false);

  const [selectedClass, setSelectedClass] =
    useState(null);

  const [qrToken, setQrToken] = useState("");
  const [seconds, setSeconds] = useState(60);

  const [cameraOpen, setCameraOpen] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [attendanceMap, setAttendanceMap] =
    useState({});

  // ----------------------------
  // LOAD DATA
  // ----------------------------
  const loadData = useCallback(async () => {
    try {
      const tt = await api.get(
        "/timetable/"
      );

      const stu = await api.get(
        "/students/"
      );

      const lg = await api.get(
        "/attendance/"
      );

      setTimetable(
        tt.data.filter(
          (x) =>
            x.teacher_name === user.name
        )
      );

      setStudents(stu.data);
      setLogs(lg.data);

    } catch (err) {
      console.log(err);
    }
  }, [user.name]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ----------------------------
  // QR SESSION
  // ----------------------------
  const generateQR = useCallback(async () => {
    if (!selectedClass) return;

    try {
      const res = await api.post(
        "/qr/generate",
        {
          teacher_id: user.id,
          teacher_name: user.name,
          subject_name:
            selectedClass.subject_name
        }
      );

      setQrToken(res.data.token);

    } catch {}
  }, [selectedClass, user.id, user.name]);

  const startSession = (row) => {
    setSelectedClass(row);
    setSessionOpen(true);
    setSeconds(60);
    setCameraOpen(false);
    setMessage("");
    setAttendanceMap({});
  };

  const stopSession = () => {
    setSessionOpen(false);
    setSelectedClass(null);
    setQrToken("");
    setSeconds(60);
    setCameraOpen(false);
    setMessage("");
  };

  useEffect(() => {
    if (!sessionOpen || !selectedClass)
      return;

    let total = 60;

    generateQR();

    const timer = setInterval(() => {
      total--;
      setSeconds(total);

      if (total <= 0) stopSession();
    }, 1000);

    const qr = setInterval(() => {
      generateQR();
    }, 10000);

    return () => {
      clearInterval(timer);
      clearInterval(qr);
    };
  }, [generateQR, selectedClass, sessionOpen]);

  // ----------------------------
  // FILTERED CLASS STUDENTS
  // ----------------------------
  const classStudents = selectedClass
    ? students.filter(
        (s) =>
          String(s.section) ===
          String(selectedClass.section)
      )
    : [];

  // ----------------------------
  // MANUAL MARK
  // ----------------------------
  const mark = (id, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [id]: status
    }));
  };

  const saveAttendance = async () => {
    try {
      for (const s of classStudents) {
        const status =
          attendanceMap[s.id] ||
          "Absent";

        await api.post(
          "/attendance/manual-mark",
          {
            student_id: s.id,
            subject_name:
              selectedClass.subject_name,
            status
          }
        );
      }

      setMessage(
        "Attendance Saved Successfully"
      );

      loadData();

    } catch {
      setMessage("Save Failed");
    }
  };

  // ----------------------------
  // FACE SCAN
  // ----------------------------
  const singleScan = async () => {
    try {
      const image =
        webcamRef.current.getScreenshot();

      const res = await api.post(
        "/attendance/real-face-scan",
        {
          image,
          subject_name:
            selectedClass.subject_name
        }
      );

      setMessage(res.data.message);
      loadData();

    } catch {
      setMessage("Scan Failed");
    }
  };

  const multiScan = async () => {
    try {
      const image =
        webcamRef.current.getScreenshot();

      const res = await api.post(
        "/attendance/multi-face-scan",
        {
          image,
          subject_name:
            selectedClass.subject_name
        }
      );

      setMessage(
        `${res.data.count} Students Marked`
      );

      loadData();

    } catch {
      setMessage(
        "Classroom Scan Failed"
      );
    }
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // ----------------------------
  // DASHBOARD STATS
  // ----------------------------
  const todayLogs = logs.length;

  const presentCount = logs.filter(
    (x) => x.status === "Present"
  ).length;

  // ----------------------------
  return (
    <div className="admin-layout">

      {/* SIDEBAR */}
      <div className="sidebar">

        <div className="brand-box">
          <h2>Teacher</h2>
          <span>Premium Portal</span>
        </div>

        {[
          "dashboard",
          "classes",
          "students",
          "reports"
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
        {tab === "dashboard" && (
          <>
            <div className="grid">

              <div className="stat-card">
                <h2>
                  {timetable.length}
                </h2>
                <p>Today's Classes</p>
              </div>

              <div className="stat-card">
                <h2>
                  {students.length}
                </h2>
                <p>Total Students</p>
              </div>

              <div className="stat-card">
                <h2>
                  {todayLogs}
                </h2>
                <p>Attendance Logs</p>
              </div>

              <div className="stat-card">
                <h2>
                  {presentCount}
                </h2>
                <p>Present</p>
              </div>

            </div>

            <div className="content-box">
              <h1>
                Teacher Overview
              </h1>
              <p>
                Manage live attendance,
                classes and reports.
              </p>
            </div>
          </>
        )}

        {/* CLASSES */}
        {tab === "classes" && (
          <div className="content-box">
            <h1>My Classes</h1>

            <table className="student-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Subject</th>
                  <th>Section</th>
                  <th>Room</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {timetable.map((t) => (
                  <tr key={t.id}>
                    <td>{t.day_name}</td>
                    <td>
                      {t.start_time} -{" "}
                      {t.end_time}
                    </td>
                    <td>
                      {t.subject_name}
                    </td>
                    <td>{t.section}</td>
                    <td>{t.room_no}</td>
                    <td>
                      <button
                        className="primary-btn"
                        onClick={() =>
                          startSession(t)
                        }
                      >
                        Start
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* STUDENTS */}
        {tab === "students" && (
          <div className="content-box">
            <h1>Students</h1>

            <table className="student-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Enrollment</th>
                  <th>Section</th>
                </tr>
              </thead>

              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td>
                      {s.first_name}{" "}
                      {s.last_name}
                    </td>
                    <td>
                      {s.enrollment_no}
                    </td>
                    <td>{s.section}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORTS */}
        {tab === "reports" && (
          <div className="content-box">
            <h1>Attendance Logs</h1>

            <table className="student-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {logs.map((x) => (
                  <tr key={x.id}>
                    <td>
                      {x.student_name}
                    </td>
                    <td>
                      {x.subject_name}
                    </td>
                    <td>{x.status}</td>
                    <td>
                      {x.date_marked}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* SESSION MODAL */}
      {sessionOpen &&
        selectedClass && (
          <div className="modal-overlay">

            <div className="modal-box">

              <h2>
                Live Attendance Session
              </h2>

              <p>
                {
                  selectedClass.subject_name
                }{" "}
                | Section{" "}
                {
                  selectedClass.section
                }
              </p>

              <div
                style={{
                  background: "#fff",
                  padding: "15px",
                  borderRadius: "18px",
                  margin:
                    "15px auto",
                  width:
                    "fit-content"
                }}
              >
                <QRCode
                  value={qrToken}
                  size={190}
                />
              </div>

              <div className="stat-card">
                <h2>{seconds}s</h2>
                <p>
                  Session Remaining
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginTop: "15px"
                }}
              >
                <button
                  className="primary-btn"
                  onClick={() =>
                    setCameraOpen(
                      !cameraOpen
                    )
                  }
                >
                  Camera
                </button>

                <button
                  className="primary-btn"
                  onClick={
                    singleScan
                  }
                >
                  Face Scan
                </button>

                <button
                  className="primary-btn"
                  onClick={
                    multiScan
                  }
                >
                  Classroom Scan
                </button>

                <button
                  className="primary-btn"
                  onClick={
                    saveAttendance
                  }
                >
                  Save
                </button>

                <button
                  className="logout-btn"
                  onClick={
                    stopSession
                  }
                >
                  End
                </button>
              </div>

              {cameraOpen && (
                <div
                  style={{
                    marginTop:
                      "15px"
                  }}
                >
                  <Webcam
                    ref={
                      webcamRef
                    }
                    screenshotFormat="image/jpeg"
                    style={{
                      width:
                        "100%",
                      borderRadius:
                        "18px"
                    }}
                  />
                </div>
              )}

              {message && (
                <div
                  className="stat-card"
                  style={{
                    marginTop:
                      "15px"
                  }}
                >
                  <h2>
                    {message}
                  </h2>
                </div>
              )}

              {/* STUDENT LIST */}
              <div
                className="content-box"
                style={{
                  marginTop:
                    "15px",
                  maxHeight:
                    "320px",
                  overflowY:
                    "auto"
                }}
              >
                <h3>
                  Students List
                </h3>

                <table className="student-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>P</th>
                      <th>A</th>
                      <th>L</th>
                    </tr>
                  </thead>

                  <tbody>
                    {classStudents.map(
                      (s) => (
                        <tr
                          key={
                            s.id
                          }
                        >
                          <td>
                            {
                              s.first_name
                            }{" "}
                            {
                              s.last_name
                            }
                          </td>

                          <td>
                            <button
                              className="primary-btn"
                              onClick={() =>
                                mark(
                                  s.id,
                                  "Present"
                                )
                              }
                            >
                              ✓
                            </button>
                          </td>

                          <td>
                            <button
                              className="logout-btn"
                              onClick={() =>
                                mark(
                                  s.id,
                                  "Absent"
                                )
                              }
                            >
                              ✕
                            </button>
                          </td>

                          <td>
                            <button
                              className="primary-btn"
                              onClick={() =>
                                mark(
                                  s.id,
                                  "Late"
                                )
                              }
                            >
                              L
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>

              </div>

            </div>

          </div>
        )}

    </div>
  );
}

export default TeacherDashboard;