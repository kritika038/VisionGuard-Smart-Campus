// src/components/StudentsModule.js

import React, { useEffect, useRef, useState } from "react";
import api from "../api";
import Webcam from "react-webcam";

function StudentsModule() {
  const webcamRef = useRef(null);

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");

  const [selectedId, setSelectedId] =
    useState(null);

  const [capturedImage, setCapturedImage] =
    useState(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    enrollment_no: "",
    roll_no: "",
    email: "",
    mobile: "",
    department: "",
    course: "",
    semester: "",
    section: "",
    scholar_type: "",
    password: ""
  });

  const loadStudents = async () => {
    try {
      const res = await api.get(
        "/students/"
      );

      setStudents(res.data);

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const change = (key, value) => {
    setForm({
      ...form,
      [key]: value
    });
  };

  const addStudent = async () => {
  try {
    const payload = {
      ...form,
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      enrollment_no: form.enrollment_no.trim(),
      roll_no: form.roll_no.trim(),
      email: form.email.trim(),
      mobile: form.mobile.trim(),
      department: form.department.trim(),
      course: form.course.trim(),
      semester: form.semester.trim(),
      section: form.section.trim(),
      scholar_type: form.scholar_type.trim(),
      password: form.password.trim() || "123456"
    };

    await api.post("/students/add", payload);

    alert("Student Added Successfully");

    setForm({
      first_name: "",
      last_name: "",
      enrollment_no: "",
      roll_no: "",
      email: "",
      mobile: "",
      department: "",
      course: "",
      semester: "",
      section: "",
      scholar_type: "",
      password: ""
    });

    loadStudents();

  } catch (error) {
    alert(error.response?.data?.detail || "Failed");
  }
};

  const captureFace = () => {
    const img =
      webcamRef.current.getScreenshot();

    setCapturedImage(img);
  };

  const saveFace = async () => {
    try {
      await api.post(
        "/students/save-face",
        {
          student_id: selectedId,
          photo_base64: capturedImage
        }
      );

      alert(
        "Face Registered Successfully"
      );

      setCapturedImage(null);
      setSelectedId(null);

      loadStudents();

    } catch (error) {
      alert(
        error.response?.data?.detail ||
        "Face failed"
      );
    }
  };

  const deleteStudent = async (id) => {
    try {
      await api.delete(
        `/students/${id}`
      );

      loadStudents();

    } catch (error) {
      alert("Delete failed");
    }
  };

  const filtered = students.filter((s) =>
    `${s.first_name} ${s.last_name} ${s.enrollment_no}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div>

      {/* Header */}
      <div className="content-box">
        <h1>Students Management</h1>
        <p>
          Register students, capture face
          identity and manage records.
        </p>
      </div>

      {/* Top Grid */}
      <div className="grid">

        {/* Form */}
        <div className="content-box">
          <h2>Add New Student</h2>

          <div className="form-grid">

            <input
              placeholder="First Name"
              value={form.first_name}
              onChange={(e)=>
                change(
                  "first_name",
                  e.target.value
                )
              }
            />

            <input
              placeholder="Last Name"
              value={form.last_name}
              onChange={(e)=>
                change(
                  "last_name",
                  e.target.value
                )
              }
            />

            <input
              placeholder="Enrollment No"
              value={form.enrollment_no}
              onChange={(e)=>
                change(
                  "enrollment_no",
                  e.target.value
                )
              }
            />

            <input
              placeholder="Roll No"
              value={form.roll_no}
              onChange={(e)=>
                change(
                  "roll_no",
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
              placeholder="Course"
              value={form.course}
              onChange={(e)=>
                change(
                  "course",
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

            <input
              placeholder="Hosteller / Day Scholar"
              value={form.scholar_type}
              onChange={(e)=>
                change(
                  "scholar_type",
                  e.target.value
                )
              }
            />

            <input
              placeholder="Password"
              type="password"
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
            onClick={addStudent}
          >
            Register Student
          </button>
        </div>

        {/* Face Card */}
        <div className="content-box">
          <h2>Face Registration</h2>

          {!selectedId ? (
            <p>
              Select newly registered or
              pending student to register
              face.
            </p>
          ) : (
            <>
              <p>
                Student ID:
                {" "}
                {selectedId}
              </p>

              <br />

              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width={320}
                height={240}
              />

              <br /><br />

              <button
                className="primary-btn"
                onClick={captureFace}
              >
                Capture Face
              </button>

              {capturedImage && (
                <>
                  <br /><br />

                  <img
                    src={capturedImage}
                    alt="preview"
                    width="220"
                  />

                  <br /><br />

                  <button
                    className="success-btn"
                    onClick={saveFace}
                  >
                    Save Face
                  </button>
                </>
              )}
            </>
          )}
        </div>

      </div>

      {/* Search */}
      <div className="content-box">
        <input
          placeholder="Search students..."
          value={search}
          onChange={(e)=>
            setSearch(e.target.value)
          }
        />
      </div>

      {/* Table */}
      <div className="content-box">
        <h2>Registered Students</h2>

        <table className="student-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Enroll</th>
              <th>Dept</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {filtered.map((s) => (
              <tr key={s.id}>

                <td>{s.id}</td>

                <td>
                  {s.first_name}
                  {" "}
                  {s.last_name}
                </td>

                <td>
                  {s.enrollment_no}
                </td>

                <td>
                  {s.department}
                </td>

                <td>
                  {s.photo_path ? (
                    <span className="badge-green">
                      Registered
                    </span>
                  ) : (
                    <span className="badge-yellow">
                      Pending
                    </span>
                  )}
                </td>

                <td>

                  {!s.photo_path && (
                    <button
                      className="primary-btn"
                      onClick={() =>
                        setSelectedId(
                          s.id
                        )
                      }
                    >
                      Face
                    </button>
                  )}

                  <button
                    className="danger-btn"
                    onClick={() =>
                      deleteStudent(
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

export default StudentsModule;
