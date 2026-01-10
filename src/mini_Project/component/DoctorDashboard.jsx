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
  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const doctorId = decoded?.id;
  const doctorName = decoded?.fullname || "Doctor";

  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
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

        {/* ===== AVATAR ===== */}
        <div style={{ position: "relative" }}>
          <div
            onClick={() => setShowMenu(!showMenu)}
            title={doctorName}
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              backgroundColor: "#1e3a8a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer"
            }}
          >
            {/* PERSON ICON SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              fill="white"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />
            </svg>
          </div>

          {/* ===== DROPDOWN ===== */}
          {showMenu && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 50,
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: 8,
                boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                width: 160,
                zIndex: 1000
              }}
            >
              <div
                style={{
                  padding: "10px 12px",
                  borderBottom: "1px solid #eee",
                  fontWeight: 600
                }}
              >
                {doctorName}
              </div>

              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  color: "#dc2626",
                  fontWeight: 600,
                  textAlign: "left"
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
        {/* LEFT: PROFILE */}
        <div className="profile-widget">
          <DoctorProfile doctorId={doctorId} token={token} />
        </div>

        {/* RIGHT: STACKED WIDGETS */}
        <div className="right-stack">
          <div className="dashboard-widget">
            <Appointments doctorId={doctorId} token={token} />
          </div>

          <div className="dashboard-widget">
            <Notifications doctorId={doctorId} token={token} />
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
