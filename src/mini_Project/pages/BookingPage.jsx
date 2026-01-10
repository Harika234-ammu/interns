import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./BookingPage.css";

export default function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const doctor = location.state?.doctor;

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [timings, setTimings] = useState("");

  /* ================= SAFETY ================= */
  useEffect(() => {
    if (!doctor) navigate("/doctors");
  }, [doctor, navigate]);

  /* ================= FETCH DOCTOR TIMINGS ================= */
  useEffect(() => {
    const fetchDoctor = async () => {
      const res = await axios.get(
        `http://localhost:5000/doctor/profile/${doctor.id}`
      );
      setTimings(res.data.timings);
    };
    fetchDoctor();
  }, [doctor]);

  /* ================= SLOT HELPERS ================= */
  const parseTimings = (timings) => {
    // "09:00 am to 05:00 pm"
    const [startRaw, endRaw] = timings.toLowerCase().split("to");

    const to24 = (t) => {
      let [time, mer] = t.trim().split(" ");
      let [h, m] = time.split(":").map(Number);
      if (mer === "pm" && h !== 12) h += 12;
      if (mer === "am" && h === 12) h = 0;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    };

    return { start: to24(startRaw), end: to24(endRaw) };
  };

  const generateSlots = (start, end) => {
    const slots = [];
    let cur = new Date();
    let [sh, sm] = start.split(":").map(Number);
    let [eh, em] = end.split(":").map(Number);

    cur.setHours(sh, sm, 0, 0);
    const endTime = new Date();
    endTime.setHours(eh, em, 0, 0);

    while (cur < endTime) {
      slots.push(
        `${String(cur.getHours()).padStart(2, "0")}:${String(
          cur.getMinutes()
        ).padStart(2, "0")}`
      );
      cur.setMinutes(cur.getMinutes() + 30);
    }
    return slots;
  };

  /* ================= FETCH BOOKED SLOTS ================= */
  useEffect(() => {
    if (!selectedDate || !timings) return;

    const fetchSlots = async () => {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `http://localhost:5000/patient/doctor-slots/${doctor.id}/${selectedDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const booked = (res.data || []).map(t => t.slice(0, 5));
      setBookedSlots(booked);

      const { start, end } = parseTimings(timings);
      const allSlots = generateSlots(start, end);
      setAvailableSlots(allSlots.filter(s => !booked.includes(s)));
    };

    fetchSlots();
  }, [selectedDate, timings, doctor]);

  /* ================= BOOK ================= */
  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      alert("Please select date & time");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const decoded = jwtDecode(token);

      await axios.post(
        "http://localhost:5000/patient/book",
        {
          patient_id: decoded.id,
          doctor_id: doctor.id,
          appointment_time: `${selectedDate} ${selectedTime}:00`,
          symptoms: ["General Checkup"]
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate("/confirmation", {
        state: { doctor, date: selectedDate, time: selectedTime }
      });
    } catch {
      alert("❌ Slot not available");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="booking-page">
      <h2>Book Appointment</h2>

      <div className="doctor-info">
        <p><b>Doctor:</b> {doctor.fullname}</p>
        <p><b>Specialty:</b> {doctor.specialization}</p>
      </div>

      <label>Select Date</label>
      <input
        type="date"
        min={new Date().toISOString().split("T")[0]}
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />

      <label>Select Time</label>

      {availableSlots.length === 0 && selectedDate ? (
        <p className="warning">❌ No slots available</p>
      ) : (
        <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
          <option value="">Select time</option>
          {availableSlots.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      )}

      <button className="proceed-btn" onClick={handleBooking}>
        Confirm Appointment
      </button>
    </div>
  );
}
