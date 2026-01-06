import React from "react";
import { jwtDecode } from "jwt-decode";
import DoctorProfile from "./DoctorProfile";
import Appointments from "./Appointments";
import Notifications from "./Notifications";
import Reviews from "./Reviews";
import "../styles/DocDashboard.css";

const DoctorDashboard = () => {
  const token = localStorage.getItem("token");
  const doctorId = token ? jwtDecode(token)?.id : null;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>👨‍⚕️ Doctor Dashboard</h2>
      </div>

      <div className="dashboard-grid">
        {/* LEFT: Profile */}
        <div className="profile-widget">
          <DoctorProfile doctorId={doctorId} token={token} />
        </div>

        {/* RIGHT: stacked collapsible widgets */}
        <div className="right-stack">
          <div className="dashboard-widget">
            {/* Appointments component already renders a collapse header/content */}
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
