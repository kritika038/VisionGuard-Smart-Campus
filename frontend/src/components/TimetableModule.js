// src/components/TimetableModule.js

import React, { useEffect, useState } from "react";
import api from "../api";

function TimetableModule() {
  const [rows, setRows] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    day_name: "",
    start_time: "",
    end_time: "",
    subject_name: "",
    teacher_name: "",
    room_no: "",
    semester: "",
    section: ""
  });

  const loadAll = async () => {
    try {
      const tt = await api.get(
        "/timetable/"
      );

      const sub = await api.get(
        "/subjects/"
      );

      const tea = await api.get(
        "/teachers/"
      );

      setRows(tt.data);
      setSubjects(sub.data);
      setTeachers(tea.data);

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const change = (key, value) => {
    setForm({
      ...form,
      [key]: value
    });
  };

  const addTimetable = async () => {
    if (!form.day_name) {
      alert("Select day");
      return;
    }

    if (!form.subject_name) {
      alert("Select subject");
      return;
    }

    try {
      await api.post(
        "/timetable/add",
        form
      );

      alert("Schedule Added");

      setForm({
        day_name: "",
        start_time: "",
        end_time: "",
        subject_name: "",
        teacher_name: "",
        room_no: "",
        semester: "",
        section: ""
      });

      loadAll();

    } catch (error) {
      alert(
        error.response?.data?.detail ||
        "Failed"
      );
    }
  };

  const deleteRow = async (id) => {
    try {
      await api.delete(
        `/timetable/${id}`
      );

      loadAll();

    } catch (error) {
      alert("Delete failed");
    }
  };

  const filtered = rows.filter((r) =>
    `${r.day_name} ${r.subject_name} ${r.teacher_name}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const uniqueDays = [
    ...new Set(
      rows.map((r) => r.day_name)
    )
  ].filter(Boolean);

  return (
    <div>

      {/* Header */}
      <div className="content-box">
        <h1>Timetable Management</h1>
        <p>
          Build smart schedules and manage
          academic lecture planning.
        </p>
      </div>

      {/* Top Grid */}
      <div className="grid">

        {/* Add Schedule */}
        <div className="content-box">
          <h2>Create Schedule</h2>

          <div className="form-grid">

            <select
              value={form.day_name}
              onChange={(e)=>
                change(
                  "day_name",
                  e.target.value
                )
              }
            >
              <option value="">
                Select Day
              </option>
              <option>Monday</option>
              <option>Tuesday</option>
              <option>Wednesday</option>
              <option>Thursday</option>
              <option>Friday</option>
              <option>Saturday</option>
            </select>

            <input
              type="time"
              value={form.start_time}
              onChange={(e)=>
                change(
                  "start_time",
                  e.target.value
                )
              }
            />

            <input
              type="time"
              value={form.end_time}
              onChange={(e)=>
                change(
                  "end_time",
                  e.target.value
                )
              }
            />

            <select
              value={form.subject_name}
              onChange={(e)=>
                change(
                  "subject_name",
                  e.target.value
                )
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
              value={form.teacher_name}
              onChange={(e)=>
                change(
                  "teacher_name",
                  e.target.value
                )
              }
            >
              <option value="">
                Select Teacher
              </option>

              {teachers.map((t) => (
                <option
                  key={t.id}
                  value={t.name}
                >
                  {t.name}
                </option>
              ))}
            </select>

            <input
              placeholder="Room No"
              value={form.room_no}
              onChange={(e)=>
                change(
                  "room_no",
                  e.target.value
                )
              }
            />

            <input
              placeholder="Semester"
              value={form.semester}
              onChange={(e)=>
                change(
                  "semester",
                  e.target.value
                )
              }
            />

            <input
              placeholder="Section"
              value={form.section}
              onChange={(e)=>
                change(
                  "section",
                  e.target.value
                )
              }
            />

          </div>

          <button
            className="primary-btn"
            onClick={addTimetable}
          >
            Add Schedule
          </button>
        </div>

        {/* Summary */}
        <div className="content-box">
          <h2>Planner Insights</h2>

          <div className="grid">

            <div className="stat-card">
              <h2>
                {rows.length}
              </h2>
              <p>Total Entries</p>
            </div>

            <div className="stat-card">
              <h2>
                {uniqueDays.length}
              </h2>
              <p>Working Days</p>
            </div>

          </div>

          <p style={{
            marginTop:"12px"
          }}>
            Timetable drives attendance,
            subject flow and class planning.
          </p>
        </div>

      </div>

      {/* Search */}
      <div className="content-box">
        <input
          placeholder="Search schedules..."
          value={search}
          onChange={(e)=>
            setSearch(
              e.target.value
            )
          }
        />
      </div>

      {/* Table */}
      <div className="content-box">
        <h2>Schedule Directory</h2>

        <table className="student-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Day</th>
              <th>Time</th>
              <th>Subject</th>
              <th>Teacher</th>
              <th>Room</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {filtered.map((r) => (
              <tr key={r.id}>

                <td>{r.id}</td>

                <td>
                  {r.day_name}
                </td>

                <td>
                  {r.start_time}
                  {" - "}
                  {r.end_time}
                </td>

                <td>
                  {r.subject_name}
                </td>

                <td>
                  {r.teacher_name}
                </td>

                <td>
                  <span className="badge-green">
                    {r.room_no}
                  </span>
                </td>

                <td>
                  <button
                    className="danger-btn"
                    onClick={() =>
                      deleteRow(
                        r.id
                      )
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

export default TimetableModule;