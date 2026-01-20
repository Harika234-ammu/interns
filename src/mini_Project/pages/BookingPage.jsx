import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import "./BookingPage.css";

export default function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const passedDoctor = location.state?.doctor;
  const [doctor, setDoctor] = useState(null);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);

  /* ================= FETCH FULL DOCTOR PROFILE ================= */
  useEffect(() => {
    if (!passedDoctor?.id) {
      navigate("/doctors");
      return;
    }

    const token = localStorage.getItem("token");

    axios
      .get(`http://localhost:5000/doctor/profile/${passedDoctor.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setDoctor(res.data))
      .catch(() => navigate("/doctors"));
  }, [passedDoctor, navigate]);

  const toMinutes = (time) => {
    const [h, m] = time.slice(0, 5).split(":").map(Number);
    return h * 60 + m;
  };

  const generateSlots = (start, end) => {
    const slots = [];
    for (let t = start; t < end; t += 30) {
      const h = Math.floor(t / 60);
      const m = t % 60;
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
    return slots;
  };

  /* ================= FETCH AVAILABLE SLOTS ================= */
  useEffect(() => {
    if (!selectedDate || !doctor?.start_time || !doctor?.end_time) {
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

        const booked = (res.data || []).map(t => t.slice(0, 5));

        const allSlots = generateSlots(
          toMinutes(doctor.start_time),
          toMinutes(doctor.end_time)
        );

        setAvailableSlots(
          allSlots.map(time => ({
            time,
            booked: booked.includes(time)
          }))
        );
      } catch {
        setAvailableSlots([]);
      }
    };

    fetchSlots();
  }, [selectedDate, doctor]);

  /* ================= BOOK ================= */
  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      Swal.fire("Missing", "Select date & time", "warning");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const decoded = jwtDecode(token);

      await axios.post(
        "http://localhost:5000/patient/book",
        {
          doctor_id: doctor.id,
          appointment_time: `${selectedDate} ${selectedTime}:00`,
          symptoms: ["General Checkup"]
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("Success", "Appointment booked", "success").then(() =>
        navigate("/confirmation", {
          state: { doctor, date: selectedDate, time: selectedTime }
        })
      );
    } catch {
      Swal.fire("Error", "Slot already booked", "error");
    }
  };

  if (!doctor) return <p>Loading...</p>;

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

      <select
        value={selectedTime}
        onChange={(e) => setSelectedTime(e.target.value)}
      >
        <option value="">
          {availableSlots.length === 0
            ? "No slots available"
            : "Select time"}
        </option>

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

      <button className="proceed-btn" onClick={handleBooking}>
        Confirm Appointment
      </button>
    </div>
  );
}
