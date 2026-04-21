// src/pages/TeacherDashboard.js

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import api from "../api";
import QRCode from "react-qr-code";
import Webcam from "react-webcam";
import "../App.css";

function TeacherDashboard() {
  const user =
    JSON.parse(
      localStorage.getItem("user")
    ) || {};

  const webcamRef = useRef(null);

  const [tab, setTab] =
    useState("dashboard");

  const [timetable, setTimetable] =
    useState([]);

  const [students, setStudents] =
    useState([]);

  const [logs, setLogs] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [sessionOpen, setSessionOpen] =
    useState(false);

  const [selectedClass, setSelectedClass] =
    useState(null);

  const [qrToken, setQrToken] =
    useState("");

  const [seconds, setSeconds] =
    useState(60);

  const [cameraOpen, setCameraOpen] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [attendanceMap, setAttendanceMap] =
    useState({});

  const [presentCount, setPresentCount] =
    useState(0);

  // -----------------------------
  // LOAD DATA
  // -----------------------------
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const tt = await api.get(
        "/timetable/"
      );

      const stu = await api.get(
        "/students/"
      );

      const lg = await api.get(
        "/attendance/"
      );

      const myClasses =
        tt.data?.filter(
          (x) =>
            x.teacher_name ===
            user.name
        ) || [];

      setTimetable(myClasses);
      setStudents(stu.data || []);
      setLogs(lg.data || []);

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [user.name]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // -----------------------------
  // QR GENERATE
  // -----------------------------
  const generateQR = useCallback(async () => {
    if (!selectedClass) return;

    try {
      const res = await api.post(
        "/qr/generate",
        {
          teacher_id: user.id,
          teacher_name: user.name,
          subject_name:
            selectedClass.subject_name,
          section:
            selectedClass.section
        }
      );

      setQrToken(
        res.data.token ||
          JSON.stringify({
            subject:
              selectedClass.subject_name,
            section:
              selectedClass.section
          })
      );

    } catch {
      setQrToken(
        JSON.stringify({
          subject:
            selectedClass.subject_name,
          section:
            selectedClass.section
        })
      );
    }
  }, [
    selectedClass,
    user.id,
    user.name
  ]);

  // -----------------------------
  // SESSION START/STOP
  // -----------------------------
  const startSession = (row) => {
    setSelectedClass(row);
    setSessionOpen(true);
    setSeconds(60);
    setQrToken("");
    setCameraOpen(false);
    setMessage(
      "Live Session Started"
    );
    setAttendanceMap({});
    setPresentCount(0);
  };

  const stopSession = () => {
    setSessionOpen(false);
    setSelectedClass(null);
    setQrToken("");
    setSeconds(60);
    setCameraOpen(false);
    setMessage("Session Ended");
  };

  useEffect(() => {
    if (
      !sessionOpen ||
      !selectedClass
    )
      return;

    generateQR();

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          stopSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const qrTimer = setInterval(() => {
      generateQR();
    }, 10000);

    return () => {
      clearInterval(timer);
      clearInterval(qrTimer);
    };
  }, [
    sessionOpen,
    selectedClass,
    generateQR
  ]);

  // -----------------------------
  // FILTER CLASS STUDENTS
  // -----------------------------
  const classStudents =
    useMemo(() => {
      if (!selectedClass)
        return [];

      return students.filter(
        (s) =>
          String(s.section) ===
          String(
            selectedClass.section
          )
      );
    }, [
      students,
      selectedClass
    ]);

  const saveAttendance =
    async () => {
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
          "Attendance Saved"
        );

        loadData();

      } catch {
        setMessage(
          "Save Failed"
        );
      }
    };

  // -----------------------------
  // REAL FACE AI SCAN
  // -----------------------------
  const realFaceScan =
    async () => {
      try {
        const image =
          webcamRef.current.getScreenshot();

        const res =
          await api.post(
            "/attendance/real-face-scan",
            
              {
                image:image,
                subject_name:selectedClass.subject_name,

            }
          );

        setMessage(
          `${res.data.student} - ${res.data.message}`
        );

        setPresentCount(
          (p) => p + 1
        );

        loadData();

      } catch (err) {
        setMessage(
          err?.response?.data
            ?.detail ||
            "Face Not Recognized"
        );
      }
    };

  // -----------------------------
  // DEMO MULTI FACE
  // -----------------------------
  const multiScan =
    async () => {
      try {
        const image =
          webcamRef.current.getScreenshot();

        const res =
          await api.post(
            "/attendance/multi-face-scan",
            {
              image,
              subject_name:
                selectedClass.subject_name
            }
          );

        const count =
          res.data.count || 0;

        setPresentCount(
          (p) => p + count
        );

        setMessage(
          `${count} Students Marked`
        );

        loadData();

      } catch {
        setMessage(
          "Classroom Scan Failed"
        );
      }
    };

  // -----------------------------
  // DASHBOARD STATS
  // -----------------------------
  const totalLogs =
    logs.length;

  const totalPresent =
    logs.filter(
      (x) =>
        x.status ===
        "Present"
    ).length;

  const rate =
    totalLogs === 0
      ? 0
      : Math.round(
          (totalPresent /
            totalLogs) *
            100
        );

  // -----------------------------
  // LOGOUT
  // -----------------------------
  const logout = () => {
    localStorage.clear();
    window.location.href =
      "/";
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="admin-layout">

      {/* SIDEBAR */}
      <div className="sidebar">

        <div className="brand-box">
          <h2>Teacher</h2>
          <span>
            AI Portal
          </span>
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
            Welcome,{" "}
            {user.name ||
              "Teacher"}
          </h2>
        </div>

        {loading && (
          <div className="content-box">
            Loading...
          </div>
        )}

        {/* DASHBOARD */}
        {!loading &&
          tab ===
            "dashboard" && (
            <>
              <div className="grid">

                <div className="stat-card">
                  <h2>
                    {
                      timetable.length
                    }
                  </h2>
                  <p>
                    My Classes
                  </p>
                </div>

                <div className="stat-card">
                  <h2>
                    {
                      students.length
                    }
                  </h2>
                  <p>
                    Students
                  </p>
                </div>

                <div className="stat-card">
                  <h2>
                    {totalLogs}
                  </h2>
                  <p>
                    Logs
                  </p>
                </div>

                <div className="stat-card">
                  <h2>
                    {rate}%
                  </h2>
                  <p>
                    Accuracy
                  </p>
                </div>

              </div>

              <div className="content-box">
                <h1>
                  Smart
                  Teacher
                  Dashboard
                </h1>

                <p>
                  Face AI +
                  QR Attendance
                  + Reports
                </p>
              </div>
            </>
          )}

        {/* CLASSES */}
        {!loading &&
          tab ===
            "classes" && (
            <div className="content-box">
              <h1>
                My Classes
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
                      Section
                    </th>
                    <th>
                      Room
                    </th>
                    <th>
                      Start
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {timetable.map(
                    (t) => (
                      <tr
                        key={
                          t.id
                        }
                      >
                        <td>
                          {
                            t.day_name
                          }
                        </td>
                        <td>
                          {
                            t.start_time
                          }{" "}
                          -
                          {" "}
                          {
                            t.end_time
                          }
                        </td>
                        <td>
                          {
                            t.subject_name
                          }
                        </td>
                        <td>
                          {
                            t.section
                          }
                        </td>
                        <td>
                          {
                            t.room_no
                          }
                        </td>
                        <td>
                          <button
                            className="primary-btn"
                            onClick={() =>
                              startSession(
                                t
                              )
                            }
                          >
                            Start
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}

        {/* STUDENTS */}
        {!loading &&
          tab ===
            "students" && (
            <div className="content-box">
              <h1>
                Students
              </h1>

              <table className="student-table">
                <thead>
                  <tr>
                    <th>
                      Name
                    </th>
                    <th>
                      Enrollment
                    </th>
                    <th>
                      Section
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {students.map(
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
                          {
                            s.enrollment_no
                          }
                        </td>
                        <td>
                          {
                            s.section
                          }
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}

        {/* REPORTS */}
        {!loading &&
          tab ===
            "reports" && (
            <div className="content-box">
              <h1>
                Reports
              </h1>

              <table className="student-table">
                <thead>
                  <tr>
                    <th>
                      Student
                    </th>
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
                            x.student_name
                          }
                        </td>
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

      </div>

      {/* SESSION */}
      {sessionOpen &&
        selectedClass && (
          <div className="modal-overlay">

            <div className="modal-box">

              <h2>
                Live
                Attendance
                Session
              </h2>

              <p>
                {
                  selectedClass.subject_name
                }{" "}
                |
                Section{" "}
                {
                  selectedClass.section
                }
              </p>

              <div className="grid">

                <div className="stat-card">
                  <h2>
                    {seconds}s
                  </h2>
                  <p>
                    Session
                    Remaining
                  </p>
                </div>

                <div className="stat-card">
                  <h2>
                    {
                      presentCount
                    }
                  </h2>
                  <p>
                    Present
                  </p>
                </div>

                <div className="stat-card">
                  <h2>
                    {
                      classStudents.length
                    }
                  </h2>
                  <p>
                    Students
                  </p>
                </div>

              </div>

              <div
                style={{
                  background:
                    "#fff",
                  padding:
                    "15px",
                  borderRadius:
                    "18px",
                  width:
                    "fit-content",
                  margin:
                    "15px auto"
                }}
              >
                <QRCode
                  value={
                    qrToken
                  }
                  size={180}
                />
              </div>

              <p>
                QR Refresh
                Every 10 sec
              </p>

              <div
                style={{
                  display:
                    "flex",
                  gap:
                    "10px",
                  flexWrap:
                    "wrap",
                  marginTop:
                    "15px"
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
                    realFaceScan
                  }
                >
                  Real Face
                  AI
                </button>

                <button
                  className="primary-btn"
                  onClick={
                    multiScan
                  }
                >
                  Classroom
                  Scan
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
                    {
                      message
                    }
                  </h2>
                </div>
              )}

            </div>

          </div>
        )}

    </div>
  );
}

export default TeacherDashboard;
