// src/components/admin/AnalyticsModule.js

import React, {
  useEffect,
  useState
} from "react";
import api from "../../api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";

function AnalyticsModule() {
  const [logs, setLogs] =
    useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res =
        await api.get(
          "/attendance/"
        );

      setLogs(res.data);

    } catch (error) {
      console.log(error);
    }
  };

  // -------------------------
  // BASIC STATS
  // -------------------------
  const totalLogs =
    logs.length;

  const presentLogs =
    logs.filter(
      (x) =>
        x.status ===
        "Present"
    ).length;

  const absentLogs =
    logs.filter(
      (x) =>
        x.status ===
        "Absent"
    ).length;

  const lateLogs =
    logs.filter(
      (x) =>
        x.status ===
        "Late"
    ).length;

  // -------------------------
  // SUBJECT WISE
  // -------------------------
  const subjectMap = {};

  logs.forEach((item) => {
    const key =
      item.subject_name ||
      "General";

    subjectMap[key] =
      (subjectMap[key] || 0) +
      1;
  });

  const subjectData =
    Object.keys(subjectMap).map(
      (key) => ({
        name: key,
        total:
          subjectMap[key]
      })
    );

  // -------------------------
  // DATE WISE
  // -------------------------
  const dateMap = {};

  logs.forEach((item) => {
    const key =
      item.date_marked;

    dateMap[key] =
      (dateMap[key] || 0) +
      1;
  });

  const lineData =
    Object.keys(dateMap).map(
      (key) => ({
        date: key,
        total:
          dateMap[key]
      })
    );

  const pieData = [
    {
      name: "Present",
      value: presentLogs
    },
    {
      name: "Absent",
      value: absentLogs
    },
    {
      name: "Late",
      value: lateLogs
    }
  ];

  const COLORS = [
    "#10b981",
    "#ef4444",
    "#f59e0b"
  ];

  return (
    <div>

      {/* Top Cards */}
      <div className="grid">

        <div className="stat-card">
          <h2>
            {totalLogs}
          </h2>
          <p>
            Total Logs
          </p>
        </div>

        <div className="stat-card">
          <h2>
            {presentLogs}
          </h2>
          <p>
            Present
          </p>
        </div>

        <div className="stat-card">
          <h2>
            {absentLogs}
          </h2>
          <p>
            Absent
          </p>
        </div>

        <div className="stat-card">
          <h2>
            {lateLogs}
          </h2>
          <p>
            Late
          </p>
        </div>

      </div>

      {/* Subject Chart */}
      <div className="content-box">
        <h1>
          Subject Wise
          Attendance
        </h1>

        <div
          style={{
            width: "100%",
            height: 350
          }}
        >
          <ResponsiveContainer>
            <BarChart
              data={
                subjectData
              }
            >
              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip />

              <Bar dataKey="total" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie */}
      <div className="content-box">
        <h1>
          Status Split
        </h1>

        <div
          style={{
            width: "100%",
            height: 350
          }}
        >
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={
                  pieData
                }
                dataKey="value"
                outerRadius={
                  120
                }
                label
              >
                {pieData.map(
                  (
                    entry,
                    index
                  ) => (
                    <Cell
                      key={
                        index
                      }
                      fill={
                        COLORS[
                          index
                        ]
                      }
                    />
                  )
                )}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend */}
      <div className="content-box">
        <h1>
          Daily Trend
        </h1>

        <div
          style={{
            width: "100%",
            height: 350
          }}
        >
          <ResponsiveContainer>
            <LineChart
              data={
                lineData
              }
            >
              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis dataKey="date" />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="total"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}

export default AnalyticsModule;