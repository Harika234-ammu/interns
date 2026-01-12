import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import "./BookingPage.css";

export default function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const doctor = location.state?.doctor;

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [timings, setTimings] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);

  /* ================= SAFETY ================= */
  useEffect(() => {
    if (!doctor) navigate("/doctors");
  }, [doctor, navigate]);

  /* ================= FETCH DOCTOR TIMINGS ================= */
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/doctor/profile/${doctor.id}`
        );
        setTimings(res.data.timings || "");
      } catch {
        setTimings("");
      }
    };
    fetchDoctor();
  }, [doctor]);

  /* ================= SLOT HELPERS ================= */
  const parseTimings = (timings) => {
    // Example: "10:00 am to 03:00 pm"
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

  /* ================= FETCH SLOTS ================= */
  useEffect(() => {
    if (!selectedDate || !timings) {
      setAvailableSlots([]);
      return;
    }

    const fetchSlots = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `http://localhost:5000/patient/doctor-slots/${doctor.id}/${selectedDate}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const bookedTimes = (res.data || []).map(t => t.slice(0, 5));
        const { start, end } = parseTimings(timings);
        const allSlots = generateSlots(start, end);

        const slotsWithStatus = allSlots.map(time => ({
          time,
          booked: bookedTimes.includes(time)
        }));

        setAvailableSlots(slotsWithStatus);
      } catch {
        setAvailableSlots([]);
      }
    };

    fetchSlots();
  }, [selectedDate, timings, doctor]);

  /* ================= BOOK ================= */
  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      Swal.fire("Missing Data", "Please select date and time", "warning");
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

      Swal.fire("Success", "Appointment booked successfully", "success")
        .then(() => {
          navigate("/confirmation", {
            state: { doctor, date: selectedDate, time: selectedTime }
          });
        });

    } catch {
      Swal.fire("Error", "Selected slot is already booked", "error");
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

      <h4>Step 1: Choose Appointment Date</h4>
      <input
        type="date"
        min={new Date().toISOString().split("T")[0]}
        value={selectedDate}
        onChange={(e) => {
          setSelectedDate(e.target.value);
          setSelectedTime("");
        }}
      />

      <h4>Step 2: Choose Time Slot</h4>

      {!timings && selectedDate && (
        <p className="warning">❌ Doctor not available</p>
      )}

      {timings && availableSlots.length > 0 && (
        <select
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
        >
          <option value="">Select time</option>
          {availableSlots.map(slot => (
            <option
              key={slot.time}
              value={slot.time}
              disabled={slot.booked}
            >
              {slot.time} {slot.booked ? "(Booked)" : ""}
            </option>
          ))}
        </select>
      )}

      {timings &&
        availableSlots.length > 0 &&
        availableSlots.every(s => s.booked) && (
          <p className="warning">ℹ️ All slots are booked for this date</p>
        )}

      <button className="proceed-btn" onClick={handleBooking}>
        Confirm Appointment
      </button>
    </div>
  );
}
