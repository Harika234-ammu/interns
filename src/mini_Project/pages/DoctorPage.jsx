import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./DoctorPage.css";

export default function DoctorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { doctors, specialty } = location.state || {};

  if (!doctors || doctors.length === 0) {
    return <p style={{ textAlign: "center", marginTop: "50px" }}>
      No doctors found for {specialty}
    </p>;
  }

  return (
    <div className="doctor-page">
      <h2 className="page-title">{specialty} Doctors</h2>

      <div className="doctor-page-container">
        {doctors.map((doc) => (
          <div key={doc._id || doc.id} className="doctor-card">
            <div className="doctor-info">
              <h3>{doc.fullname}</h3>

              <p><strong>Specialty:</strong> {doc.specialization}</p>
              <p><strong>Fee:</strong> ₹{doc.fee}</p>
              <p><strong>Rating:</strong> ⭐ {doc.rating}</p>

              <p>
                <strong>Hospital:</strong>{" "}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(doc.hospital)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {doc.hospital}
                </a>
              </p>

              <p><strong>Experience:</strong> {doc.experience_years} years</p>
              <p><strong>Timings:</strong> {doc.timings}</p>
              <p><strong>Bio:</strong> {doc.bio}</p>
            </div>

            <button
              className="profile-btn"
              onClick={() =>
                navigate("/doctor/" + (doc._id || doc.id), {
                  state: { doctor: doc }
                })
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