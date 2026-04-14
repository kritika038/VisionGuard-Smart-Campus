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
      name: form.first_name + " " + form.last_name,
      email: form.email,
      roll_number: form.enrollment_no,
      class: form.section || "CSE"
    };

    await api.post("/students/add", payload);

    alert("Student Added Successfully");

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
              onChange={(e)=>
                change(
                  "first_name",
                  e.target.value
                )
              }
            />

            <input
              placeholder="Last Name"
              onChange={(e)=>
                change(
                  "last_name",
                  e.target.value
                )
              }
            />

            <input
              placeholder="Enrollment No"
              onChange={(e)=>
                change(
                  "enrollment_no",
                  e.target.value
                )
              }
            />

            <input
              placeholder="Roll No"
              onChange={(e)=>
                change(
                  "roll_no",
                  e.target.value
                )
              }
            />

            <input
              placeholder="Email"
              onChange={(e)=>
                change(
                  "email",
                  e.target.value
                )
              }
            />

            <input
              placeholder="Mobile"
              onChange={(e)=>
                change(
                  "mobile",
                  e.target.value
                )
              }
            />

            <input
              placeholder="Department"
              onChange={(e)=>
                change(
                  "department",
                  e.target.value
                )
              }
            />

            <input
              placeholder="Course"
              onChange={(e)=>
                change(
                  "course",
                  e.target.value
                )
              }
            />

            <input
              placeholder="Semester"
              onChange={(e)=>
                change(
                  "semester",
                  e.target.value
                )
              }
            />

            <input
              placeholder="Section"
              onChange={(e)=>
                change(
                  "section",
                  e.target.value
                )
              }
            />

            <input
              placeholder="Hosteller / Day Scholar"
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