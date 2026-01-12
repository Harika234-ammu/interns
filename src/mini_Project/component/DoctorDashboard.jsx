import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

import DoctorProfile from "./DoctorProfile";
import Appointments from "./Appointments";
import Notifications from "./Notifications";
import Reviews from "./Reviews";

import "../styles/DocDashboard.css";

const DoctorDashboard = () => {
  const navigate = useNavigate();

  /* ================= AUTH ================= */
  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const doctorId = decoded?.id;
  const doctorName = decoded?.fullname || "Doctor";

  /* ================= STATE ================= */
  const [showMenu, setShowMenu] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      {/* ================= HEADER ================= */}
      <div
        className="dashboard-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <h2>👨‍⚕️ Doctor Dashboard</h2>

        {/* ===== AVATAR + BADGE ===== */}
        <div style={{ position: "relative" }}>
          <div
            onClick={() => setShowMenu(!showMenu)}
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              backgroundColor: "#1e3a8a",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              cursor: "pointer",
              userSelect: "none"
            }}
            title={doctorName}
          >
            👤
          </div>

          {/* 🔴 Notification badge */}
          {notificationCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                background: "red",
                color: "#fff",
                borderRadius: "50%",
                fontSize: 12,
                padding: "2px 6px",
                fontWeight: "bold"
              }}
            >
              {notificationCount}
            </span>
          )}

          {/* ===== DROPDOWN MENU ===== */}
          {showMenu && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 52,
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: 8,
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                width: 180,
                zIndex: 1000
              }}
            >
              <div
                style={{
                  padding: "10px",
                  borderBottom: "1px solid #eee",
                  fontWeight: "bold"
                }}
              >
                {doctorName}
              </div>

              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  color: "#dc2626",
                  fontWeight: "bold"
                }}
              >
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="dashboard-grid">
        {/* LEFT */}
        <div className="profile-widget">
          <DoctorProfile doctorId={doctorId} token={token} />
        </div>

        {/* RIGHT */}
        <div className="right-stack">
          <div className="dashboard-widget">
            <Appointments doctorId={doctorId} token={token} />
          </div>

          <div className="dashboard-widget">
            <Notifications
              doctorId={doctorId}
              token={token}
              setNotificationCount={setNotificationCount}   // ⭐ IMPORTANT
            />
          </div>

          <div className="dashboard-widget">
            <Reviews doctorId={doctorId} token={token} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
