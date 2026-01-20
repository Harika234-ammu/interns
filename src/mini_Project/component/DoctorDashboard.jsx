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
  const doctorName = localStorage.getItem("fullname") || "Doctor";


  const [showMenu, setShowMenu] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>👨‍⚕️ Doctor Dashboard</h2>

        <div style={{ position: "relative" }}>
          <div
            onClick={() => setShowMenu(!showMenu)}
            className="avatar"
            title={doctorName}
          >
            👤
          </div>

          {notificationCount > 0 && (
            <span className="notification-badge">{notificationCount}</span>
          )}

          {showMenu && (
            <div className="dropdown-menu">
              <div className="dropdown-header">{doctorName}</div>
              <button onClick={handleLogout} className="logout-btn">
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="profile-widget">
          <DoctorProfile doctorId={doctorId} token={token} />
        </div>

        <div className="right-stack">
          <div className="dashboard-widget">
            <Appointments doctorId={doctorId} token={token} />
          </div>

          <div className="dashboard-widget">
            <Notifications
              doctorId={doctorId}
              token={token}
              setNotificationCount={setNotificationCount}
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
