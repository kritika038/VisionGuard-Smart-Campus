// src/components/TeachersModule.js

import React, { useEffect, useState } from "react";
import api from "../api";

function TeachersModule() {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    employee_id: "",
    department: "",
    email: "",
    mobile: "",
    qualification: "",
    password: ""
  });

  const loadTeachers = async () => {
    try {
      const res = await api.get(
        "/teachers/"
      );

      setTeachers(res.data);

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const change = (key, value) => {
    setForm({
      ...form,
      [key]: value
    });
  };

  const addTeacher = async () => {
    if (!form.name.trim()) {
      alert("Teacher name required");
      return;
    }

    if (!form.employee_id.trim()) {
      alert("Employee ID required");
      return;
    }

    if (!form.email.trim()) {
      alert("Email required");
      return;
    }

    try {
      await api.post(
        "/teachers/add",
        form
      );

      alert("Teacher Added");

      setForm({
        name: "",
        employee_id: "",
        department: "",
        email: "",
        mobile: "",
        qualification: "",
        password: ""
      });

      loadTeachers();

    } catch (error) {
      alert(
        error.response?.data?.detail ||
        "Failed"
      );
    }
  };

  const deleteTeacher = async (id) => {
    try {
      await api.delete(
        `/teachers/${id}`
      );

      loadTeachers();

    } catch (error) {
      alert("Delete failed");
    }
  };

  const filtered = teachers.filter((t) =>
    `${t.name} ${t.employee_id} ${t.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div>

      {/* Header */}
      <div className="content-box">
        <h1>Teachers Management</h1>
        <p>
          Add faculty members, manage
          departments and maintain records.
        </p>
      </div>

      {/* Top Grid */}
      <div className="grid">

        {/* Add Teacher */}
        <div className="content-box">
          <h2>Add New Teacher</h2>

          <div className="form-grid">

            <input
              placeholder="Full Name"
              value={form.name}
              onChange={(e)=>
                change(
                  "name",
                  e.target.value
                )
              }
            />

            <input
              placeholder="Employee ID"
              value={form.employee_id}
              onChange={(e)=>
                change(
                  "employee_id",
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

            <input
              placeholder="Email"
              value={form.email}
              onChange={(e)=>
                change(
                  "email",
                  e.target.value
                )
              }
            />

            <input
              placeholder="Mobile"
              value={form.mobile}
              onChange={(e)=>
                change(
                  "mobile",
                  e.target.value
                )
              }
            />

            <input
              placeholder="Qualification"
              value={form.qualification}
              onChange={(e)=>
                change(
                  "qualification",
                  e.target.value
                )
              }
            />

            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e)=>
                change(
                  "password",
                  e.target.value
                )
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

        {/* Summary Card */}
        <div className="content-box">
          <h2>Faculty Insights</h2>

          <div className="grid">

            <div className="stat-card">
              <h2>
                {teachers.length}
              </h2>
              <p>Total Faculty</p>
            </div>

            <div className="stat-card">
              <h2>
                {
                  [
                    ...new Set(
                      teachers.map(
                        (t)=>
                          t.department
                      )
                    )
                  ].length
                }
              </h2>
              <p>Departments</p>
            </div>

          </div>

          <p style={{
            marginTop:"12px"
          }}>
            Maintain teacher records,
            email IDs and faculty mapping.
          </p>
        </div>

      </div>

      {/* Search */}
      <div className="content-box">
        <input
          placeholder="Search teachers..."
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
        <h2>Faculty Directory</h2>

        <table className="student-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Employee ID</th>
              <th>Department</th>
              <th>Email</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {filtered.map((t) => (
              <tr key={t.id}>

                <td>{t.id}</td>

                <td>{t.name}</td>

                <td>
                  {t.employee_id}
                </td>

                <td>
                  {t.department}
                </td>

                <td>
                  {t.email}
                </td>

                <td>
                  <span className="badge-green">
                    Active
                  </span>
                </td>

                <td>
                  <button
                    className="danger-btn"
                    onClick={() =>
                      deleteTeacher(
                        t.id
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

export default TeachersModule;