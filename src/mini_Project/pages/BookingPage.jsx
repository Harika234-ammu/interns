import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./BookingPage.css";

export default function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ SAFE access (no crash)
  const doctor = location.state?.doctor || null;

  // ✅ Hooks FIRST (always)
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  // ✅ Hook ALWAYS called
  useEffect(() => {
    if (!doctor) {
      navigate("/doctors");
    }
  }, [doctor, navigate]);

  // ✅ Conditional render AFTER hooks
  if (!doctor) {
    return <p style={{ textAlign: "center" }}>No doctor selected.</p>;
  }

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      alert("Please select date and time.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const decoded = jwtDecode(token);
      const patientId = decoded.id;

      const appointmentDateTime = `${selectedDate} ${selectedTime}:00`;

      await axios.post(
        "http://localhost:5000/patient/book",
        {
          patient_id: patientId,
          doctor_id: doctor.id,
          appointment_time: appointmentDateTime,
          symptoms: ["General Checkup"],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      navigate("/confirmation", {
        state: { doctor, date: selectedDate, time: selectedTime },
      });

    } catch (err) {
      alert("❌ Slot not available");
    }
  };

  return (
    <div className="booking-page">
      <h2>Book Appointment</h2>

      <div className="doctor-info">
        <p><strong>Doctor:</strong> {doctor.fullname}</p>
        <p><strong>Specialty:</strong> {doctor.specialization}</p>
      </div>

      <label>Select Date</label>
      <input
        type="date"
        value={selectedDate}
        min={new Date().toISOString().split("T")[0]}
        onChange={(e) => setSelectedDate(e.target.value)}
      />

      <label>Select Time</label>
      <input
        type="time"
        value={selectedTime}
        onChange={(e) => setSelectedTime(e.target.value)}
      />

      <button className="proceed-btn" onClick={handleBooking}>
        Confirm Appointment
      </button>
    </div>
  );
}
