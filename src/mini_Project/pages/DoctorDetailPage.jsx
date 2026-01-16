import React, { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./DoctorDetailPage.css";
import Reviews from "../component/Reviews";

export default function DoctorDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const doctor = location.state?.doctor;
  const [showReviews, setShowReviews] = useState(false);

  if (!doctor) {
    return <h2 style={{ textAlign: "center" }}>Doctor not found</h2>;
  }

  return (
    <div className="doctor-detail-page">
      {!showReviews ? (
        <div className="doctor-info-box">
          <h1 className="doctor-name">{doctor.fullname}</h1>

          <p><strong>Specialty:</strong> {doctor.specialization}</p>
          <p><strong>Qualification:</strong> {doctor.qualification}</p>
          <p><strong>Experience:</strong> {doctor.experience_years} years</p>
          <p><strong>Clinic / Hospital:</strong> {doctor.hospital}</p>

          <p>
            <strong>Timings:</strong>{" "}
            {doctor.start_time && doctor.end_time
              ? `${doctor.start_time.slice(0,5)} - ${doctor.end_time.slice(0,5)}`
              : "Not available"}
          </p>

          <p><strong>Contact:</strong> {doctor.contact}</p>
          <p><strong>Bio:</strong> {doctor.bio}</p>

          <div className="button-group">
            <button
              className="book-btn"
              onClick={() => navigate("/book", { state: { doctor } })}
            >
              Book Appointment
            </button>

            <button
              className="review-btn"
              onClick={() => setShowReviews(true)}
            >
              Reviews
            </button>
          </div>
        </div>
      ) : (
        <div className="review-box">
          <Reviews doctorId={doctor.id} token={localStorage.getItem("token")} />
          <button className="back-btn" onClick={() => setShowReviews(false)}>
            Back
          </button>
        </div>
      )}
    </div>
  );
}
