// src/components/TeachersModule.js

import React, { useEffect, useState } from "react";
import api from "../api";

function TeachersModule() {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    department: ""
  });

  // Load Teachers
  const loadTeachers = async () => {
    try {
      const res = await api.get("/teachers/");
      setTeachers(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  // Handle Input Change
  const change = (key, value) => {
    setForm({
      ...form,
      [key]: value
    });
  };

  // Add Teacher
  const addTeacher = async () => {
    if (!form.name.trim()) {
      alert("Teacher name required");
      return;
    }

    if (!form.email.trim()) {
      alert("Email required");
      return;
    }

    try {
      await api.post("/teachers/add", {
        name: form.name,
        email: form.email,
        subject: form.department || "General"
      });

      alert("Teacher Added Successfully");

      setForm({
        name: "",
        email: "",
        department: ""
      });

      loadTeachers();
    } catch (error) {
      alert(
        error.response?.data?.detail ||
        "Failed to add teacher"
      );
    }
  };

  // Delete Teacher
  const deleteTeacher = async (id) => {
    try {
      await api.delete(`/teachers/${id}`);
      loadTeachers();
    } catch (error) {
      alert("Delete failed");
    }
  };

  // Search Filter
  const filtered = teachers.filter((t) =>
    JSON.stringify(t)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div>

      {/* Header */}
      <div className="content-box">
        <h1>Teachers Management</h1>
        <p>
          Add, manage and remove faculty members.
        </p>
      </div>

      {/* Add Teacher Section */}
      <div className="grid">

        <div className="content-box">
          <h2>Add New Teacher</h2>

          <div className="form-grid">

            <input
              placeholder="Full Name"
              value={form.name}
              onChange={(e) =>
                change("name", e.target.value)
              }
            />

            <input
              placeholder="Email Address"
              value={form.email}
              onChange={(e) =>
                change("email", e.target.value)
              }
            />

            <input
              placeholder="Department / Subject"
              value={form.department}
              onChange={(e) =>
                change("department", e.target.value)
              }
            />

          </div>

          <button
            className="primary-btn"
            onClick={addTeacher}
          >
            Add Teacher
          </button>
        </div>

        {/* Summary */}
        <div className="content-box">
          <h2>Faculty Stats</h2>

          <div className="grid">

            <div className="stat-card">
              <h2>{teachers.length}</h2>
              <p>Total Teachers</p>
            </div>

            <div className="stat-card">
              <h2>
                {
                  [
                    ...new Set(
                      teachers.map(
                        (t) => t.subject
                      )
                    )
                  ].length
                }
              </h2>
              <p>Departments</p>
            </div>

          </div>

          <p style={{ marginTop: "12px" }}>
            VisionGuard faculty database live connected.
          </p>
        </div>

      </div>

      {/* Search */}
      <div className="content-box">
        <input
          placeholder="Search teachers..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />
      </div>

      {/* Teachers Table */}
      <div className="content-box">
        <h2>Faculty Directory</h2>

        <table className="student-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {filtered.map((t) => (
              <tr key={t.id}>

                <td>{t.id}</td>

                <td>{t.name}</td>

                <td>{t.email}</td>

                <td>{t.subject}</td>

                <td>
                  <span className="badge-green">
                    Active
                  </span>
                </td>

                <td>
                  <button
                    className="danger-btn"
                    onClick={() =>
                      deleteTeacher(t.id)
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

export default TeachersModule;