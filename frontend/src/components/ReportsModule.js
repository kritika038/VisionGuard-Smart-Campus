// src/components/ReportsModule.js

import React, { useEffect, useMemo, useState } from "react";
import api from "../api";

function ReportsModule() {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [search, setSearch] = useState("");

  const loadAll = async () => {
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
    loadAll();
  }, []);

  const presentCount = useMemo(
    () =>
      attendance.filter(
        (x) => x.status === "Present"
      ).length,
    [attendance]
  );

  const absentCount = useMemo(
    () =>
      attendance.filter(
        (x) => x.status === "Absent"
      ).length,
    [attendance]
  );

  const lateCount = useMemo(
    () =>
      attendance.filter(
        (x) => x.status === "Late"
      ).length,
    [attendance]
  );

  const faceRegistered = useMemo(
    () =>
      students.filter(
        (x) => x.photo_path
      ).length,
    [students]
  );

  const facePending =
    students.length - faceRegistered;

  const filteredLogs = attendance.filter((r) =>
    `${r.student_name} ${r.subject_name} ${r.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const rows = [
      [
        "ID",
        "Student",
        "Subject",
        "Status",
        "Date"
      ]
    ];

    filteredLogs.forEach((r) => {
      rows.push([
        r.id,
        r.student_name,
        r.subject_name,
        r.status,
        r.date_marked
      ]);
    });

    const csv =
      "data:text/csv;charset=utf-8," +
      rows.map((x) => x.join(",")).join("\n");

    const link =
      document.createElement("a");

    link.href = encodeURI(csv);
    link.download =
      "visionguard_report.csv";

    document.body.appendChild(link);
    link.click();
  };

  return (
    <div>

      {/* Header */}
      <div className="content-box">
        <h1>Reports & Analytics</h1>
        <p>
          Export reports, monitor system
          usage and review attendance
          intelligence.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid">

        <div className="stat-card">
          <h2>{students.length}</h2>
          <p>Total Students</p>
        </div>

        <div className="stat-card">
          <h2>{teachers.length}</h2>
          <p>Total Teachers</p>
        </div>

        <div className="stat-card">
          <h2>{subjects.length}</h2>
          <p>Total Subjects</p>
        </div>

        <div className="stat-card">
          <h2>{attendance.length}</h2>
          <p>Total Logs</p>
        </div>

      </div>

      {/* Secondary Metrics */}
      <div className="grid">

        <div className="content-box">
          <h2>Attendance Summary</h2>

          <p>
            <span className="badge-green">
              Present
            </span>
            {" "}
            {presentCount}
          </p>

          <br />

          <p>
            <span className="badge-red">
              Absent
            </span>
            {" "}
            {absentCount}
          </p>

          <br />

          <p>
            <span className="badge-yellow">
              Late
            </span>
            {" "}
            {lateCount}
          </p>
        </div>

        <div className="content-box">
          <h2>Face Registration</h2>

          <p>
            <span className="badge-green">
              Registered
            </span>
            {" "}
            {faceRegistered}
          </p>

          <br />

          <p>
            <span className="badge-yellow">
              Pending
            </span>
            {" "}
            {facePending}
          </p>
        </div>

      </div>

      {/* Export */}
      <div className="content-box">
        <h2>Export Data</h2>

        <div className="form-grid">

          <input
            placeholder="Search logs before export..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        <button
          className="primary-btn"
          onClick={exportCSV}
        >
          Export CSV
        </button>
      </div>

      {/* Latest Logs */}
      <div className="content-box">
        <h2>Latest Attendance Logs</h2>

        <table className="student-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Student</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>

            {filteredLogs
              .slice(0, 12)
              .map((r) => (
                <tr key={r.id}>

                  <td>{r.id}</td>

                  <td>
                    {r.student_name}
                  </td>

                  <td>
                    {r.subject_name}
                  </td>

                  <td>

                    {r.status ===
                      "Present" && (
                      <span className="badge-green">
                        Present
                      </span>
                    )}

                    {r.status ===
                      "Absent" && (
                      <span className="badge-red">
                        Absent
                      </span>
                    )}

                    {r.status ===
                      "Late" && (
                      <span className="badge-yellow">
                        Late
                      </span>
                    )}

                  </td>

                  <td>
                    {r.date_marked}
                  </td>

                </tr>
              ))}

          </tbody>

        </table>
      </div>

    </div>
  );
}

export default ReportsModule;