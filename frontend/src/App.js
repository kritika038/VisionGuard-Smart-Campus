// src/App.js

import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import "./App.css";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";

/* Helpers */

function getUser() {
  try {
    return JSON.parse(
      localStorage.getItem("user")
    );
  } catch {
    return null;
  }
}

function ProtectedRoute({
  children,
  role
}) {
  const user = getUser();

  if (!user) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  if (
    role &&
    user.role !== role
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}

function PublicRoute({
  children
}) {
  const user = getUser();

  if (
    user?.role === "admin"
  ) {
    return (
      <Navigate
        to="/admin"
        replace
      />
    );
  }

  if (
    user?.role === "teacher"
  ) {
    return (
      <Navigate
        to="/teacher"
        replace
      />
    );
  }

  if (
    user?.role === "student"
  ) {
    return (
      <Navigate
        to="/student"
        replace
      />
    );
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Login */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Admin unchanged */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Teacher unchanged */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute role="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        {/* Real Student Portal */}
        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;