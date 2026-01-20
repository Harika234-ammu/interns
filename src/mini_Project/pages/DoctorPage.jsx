import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./DoctorPage.css";

export default function DoctorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { doctors, specialty } = location.state || {};

  if (!doctors || doctors.length === 0) {
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>
        No doctors found for {specialty}
      </p>
    );
  }

  return (
    <div className="doctor-page">
      <h2 className="page-title">{specialty} Doctors</h2>

      <div className="doctor-page-container">
        {doctors.map((doc) => (
          <div key={doc.id} className="doctor-card">
            <div className="doctor-info">
              <h3>{doc.fullname}</h3>

              <p><strong>Specialty:</strong> {doc.specialization}</p>
              <p><strong>Fee:</strong> ₹{doc.fee}</p>
              <p><strong>Rating:</strong> ⭐ {doc.rating ?? "0.0"} / 5</p>

              <p><strong>Hospital:</strong> {doc.hospital}</p>
              <p><strong>Experience:</strong> {doc.experience_years} years</p>

              <p>
                <strong>Timings:</strong>{" "}
                {doc.start_time && doc.end_time
                  ? `${doc.start_time.slice(0,5)} - ${doc.end_time.slice(0,5)}`
                  : "Not available"}
              </p>

              <p><strong>Bio:</strong> {doc.bio}</p>
            </div>

            <button
              className="profile-btn"
              onClick={() =>
                navigate("/doctor/" + doc.id, { state: { doctor: doc } })
              }
            >
              View Profile
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
