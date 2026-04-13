// src/components/AttendanceModule.js

import React, { useEffect, useState } from "react";
import api from "../api";

function AttendanceModule() {
  const [logs, setLogs] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    student_id: "",
    student_name: "",
    subject_name: "",
    status: "Present"
  });

  const loadAll = async () => {
    try {
      const a = await api.get(
        "/attendance/"
      );

      const s = await api.get(
        "/students/"
      );

      const sub = await api.get(
        "/subjects/"
      );

      setLogs(a.data);
      setStudents(s.data);
      setSubjects(sub.data);

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const markAttendance = async () => {
    if (!form.student_id) {
      alert("Select student");
      return;
    }

    if (!form.subject_name) {
      alert("Select subject");
      return;
    }

    try {
      await api.post(
        "/attendance/add",
        form
      );

      alert("Attendance Marked");

      setForm({
        student_id: "",
        student_name: "",
        subject_name: "",
        status: "Present"
      });

      loadAll();

    } catch (error) {
      alert(
        error.response?.data?.detail ||
        "Failed"
      );
    }
  };

  const deleteLog = async (id) => {
    try {
      await api.delete(
        `/attendance/${id}`
      );

      loadAll();

    } catch (error) {
      alert("Delete failed");
    }
  };

  const filtered = logs.filter((l) =>
    `${l.student_name} ${l.subject_name} ${l.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const presentCount = logs.filter(
    (l) => l.status === "Present"
  ).length;

  const absentCount = logs.filter(
    (l) => l.status === "Absent"
  ).length;

  const lateCount = logs.filter(
    (l) => l.status === "Late"
  ).length;

  return (
    <div>

      {/* Header */}
      <div className="content-box">
        <h1>Attendance Management</h1>
        <p>
          Mark attendance manually and
          prepare for AI face attendance.
        </p>
      </div>

      {/* Stats */}
      <div className="grid">

        <div className="stat-card">
          <h2>{logs.length}</h2>
          <p>Total Logs</p>
        </div>

        <div className="stat-card">
          <h2>{presentCount}</h2>
          <p>Present</p>
        </div>

        <div className="stat-card">
          <h2>{absentCount}</h2>
          <p>Absent</p>
        </div>

        <div className="stat-card">
          <h2>{lateCount}</h2>
          <p>Late</p>
        </div>

      </div>

      {/* Form */}
      <div className="content-box">
        <h2>Mark Attendance</h2>

        <div className="form-grid">

          <select
            value={form.student_id}
            onChange={(e) => {
              const id = e.target.value;

              const selected =
                students.find(
                  (s) =>
                    String(s.id) ===
                    String(id)
                );

              setForm({
                ...form,
                student_id: id,
                student_name:
                  selected
                    ? `${selected.first_name} ${selected.last_name}`
                    : ""
              });
            }}
          >
            <option value="">
              Select Student
            </option>

            {students.map((s) => (
              <option
                key={s.id}
                value={s.id}
              >
                {s.first_name} {s.last_name}
              </option>
            ))}
          </select>

          <select
            value={form.subject_name}
            onChange={(e) =>
              setForm({
                ...form,
                subject_name:
                  e.target.value
              })
            }
          >
            <option value="">
              Select Subject
            </option>

            {subjects.map((s) => (
              <option
                key={s.id}
                value={s.subject_name}
              >
                {s.subject_name}
              </option>
            ))}
          </select>

          <select
            value={form.status}
            onChange={(e) =>
              setForm({
                ...form,
                status:
                  e.target.value
              })
            }
          >
            <option>Present</option>
            <option>Absent</option>
            <option>Late</option>
          </select>

        </div>

        <button
          className="primary-btn"
          onClick={markAttendance}
        >
          Mark Attendance
        </button>
      </div>

      {/* Search */}
      <div className="content-box">
        <input
          placeholder="Search logs..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />
      </div>

      {/* Logs */}
      <div className="content-box">
        <h2>Attendance Logs</h2>

        <table className="student-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Student</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {filtered.map((l) => (
              <tr key={l.id}>

                <td>{l.id}</td>

                <td>
                  {l.student_name}
                </td>

                <td>
                  {l.subject_name}
                </td>

                <td>

                  {l.status === "Present" && (
                    <span className="badge-green">
                      Present
                    </span>
                  )}

                  {l.status === "Absent" && (
                    <span className="badge-red">
                      Absent
                    </span>
                  )}

                  {l.status === "Late" && (
                    <span className="badge-yellow">
                      Late
                    </span>
                  )}

                </td>

                <td>
                  {l.date_marked}
                </td>

                <td>
                  <button
                    className="danger-btn"
                    onClick={() =>
                      deleteLog(l.id)
                    }
                  >
                    Delete
                  </button>
                </td>

              </tr>
            ))}

          </tbody>

        </table>
      </div>

    </div>
  );
}

export default AttendanceModule;