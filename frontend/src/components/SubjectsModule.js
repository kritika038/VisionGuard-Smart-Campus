// src/components/SubjectsModule.js

import React, { useEffect, useState } from "react";
import api from "../api";

function SubjectsModule() {
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    subject_name: "",
    subject_code: "",
    semester: "",
    department: "",
    teacher_name: "",
    credits: ""
  });

  const loadAll = async () => {
    try {
      const s = await api.get(
        "/subjects/"
      );

      const t = await api.get(
        "/teachers/"
      );

      setSubjects(s.data);
      setTeachers(t.data);

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

  const addSubject = async () => {
    if (!form.subject_name.trim()) {
      alert("Subject name required");
      return;
    }

    if (!form.subject_code.trim()) {
      alert("Subject code required");
      return;
    }

    try {
      await api.post(
        "/subjects/add",
        form
      );

      alert("Subject Added");

      setForm({
        subject_name: "",
        subject_code: "",
        semester: "",
        department: "",
        teacher_name: "",
        credits: ""
      });

      loadAll();

    } catch (error) {
      alert(
        error.response?.data?.detail ||
        "Failed"
      );
    }
  };

  const deleteSubject = async (id) => {
    try {
      await api.delete(
        `/subjects/${id}`
      );

      loadAll();

    } catch (error) {
      alert("Delete failed");
    }
  };

  const filtered = subjects.filter((s) =>
    `${s.subject_name} ${s.subject_code} ${s.teacher_name}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const departments = [
    ...new Set(
      subjects.map((s) => s.department)
    )
  ].filter(Boolean);

  return (
    <div>

      {/* Header */}
      <div className="content-box">
        <h1>Subjects Management</h1>
        <p>
          Create academic subjects and
          assign faculty intelligently.
        </p>
      </div>

      {/* Top Grid */}
      <div className="grid">

        {/* Add Subject */}
        <div className="content-box">
          <h2>Add New Subject</h2>

          <div className="form-grid">

            <input
              placeholder="Subject Name"
              value={form.subject_name}
              onChange={(e)=>
                change(
                  "subject_name",
                  e.target.value
                )
              }
            />

            <input
              placeholder="Subject Code"
              value={form.subject_code}
              onChange={(e)=>
                change(
                  "subject_code",
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
              placeholder="Department"
              value={form.department}
              onChange={(e)=>
                change(
                  "department",
                  e.target.value
                )
              }
            />

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
                Assign Teacher
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
              placeholder="Credits"
              value={form.credits}
              onChange={(e)=>
                change(
                  "credits",
                  e.target.value
                )
              }
            />

          </div>

          <button
            className="primary-btn"
            onClick={addSubject}
          >
            Add Subject
          </button>
        </div>

        {/* Summary */}
        <div className="content-box">
          <h2>Academic Insights</h2>

          <div className="grid">

            <div className="stat-card">
              <h2>
                {subjects.length}
              </h2>
              <p>Total Subjects</p>
            </div>

            <div className="stat-card">
              <h2>
                {
                  departments.length
                }
              </h2>
              <p>Departments</p>
            </div>

          </div>

          <p style={{
            marginTop:"12px"
          }}>
            Subject mapping helps automate
            timetable and attendance flows.
          </p>
        </div>

      </div>

      {/* Search */}
      <div className="content-box">
        <input
          placeholder="Search subjects..."
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
        <h2>Subject Directory</h2>

        <table className="student-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Code</th>
              <th>Semester</th>
              <th>Teacher</th>
              <th>Credits</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {filtered.map((s) => (
              <tr key={s.id}>

                <td>{s.id}</td>

                <td>
                  {s.subject_name}
                </td>

                <td>
                  {s.subject_code}
                </td>

                <td>
                  {s.semester}
                </td>

                <td>
                  {s.teacher_name}
                </td>

                <td>
                  <span className="badge-green">
                    {s.credits || 0} Cr
                  </span>
                </td>

                <td>
                  <button
                    className="danger-btn"
                    onClick={() =>
                      deleteSubject(
                        s.id
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

export default SubjectsModule;