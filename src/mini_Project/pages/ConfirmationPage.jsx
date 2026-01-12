import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./BookingPage.css";

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ SAFE STATE ACCESS
  const state = location.state;

  const [paymentMethod, setPaymentMethod] = useState("");
  const [upiOption, setUpiOption] = useState("");
  const [processing, setProcessing] = useState(false);

  // ✅ REDIRECT IF PAGE IS REFRESHED OR OPENED DIRECTLY
  useEffect(() => {
    if (!state || !state.doctor || !state.date || !state.time) {
      navigate("/doctors"); // safe fallback
    }
  }, [state, navigate]);

  // ✅ PREVENT RENDER CRASH
  if (!state || !state.doctor) {
    return null;
  }

  const { doctor, date, time } = state;

  const confirmSlot = () => {
    const bookedSlots = JSON.parse(localStorage.getItem("bookedSlots") || "[]");

    const slotExists = bookedSlots.some(
      (s) =>
        s.doctorId === doctor.id &&
        s.date === date &&
        s.time === time
    );

    if (slotExists) {
      alert("This slot is already booked. Please choose another time.");
      navigate("/doctors");
      return;
    }

    const newSlot = {
      doctorId: doctor.id,
      date,
      time,
      paymentMethod,
      upiOption
    };

    localStorage.setItem(
      "bookedSlots",
      JSON.stringify([...bookedSlots, newSlot])
    );

    alert(
      `Appointment confirmed with ${doctor.fullname}\nDate: ${date}\nTime: ${time}\nPayment: ${paymentMethod}`
    );

    navigate("/");
  };

  const handleConfirmPayment = () => {
    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    if (paymentMethod === "UPI") {
      if (!upiOption) {
        alert("Please select a UPI option.");
        return;
      }

      setProcessing(true);
      setTimeout(() => {
        setProcessing(false);
        alert(`Payment successful via ${upiOption}`);
        confirmSlot();
      }, 2000);
    } else {
      confirmSlot();
    }
  };

  return (
    <div className="booking-page">
      <h2>Confirm Your Appointment</h2>

      <div className="confirmation-details">
        <p><strong>Doctor:</strong> {doctor.fullname}</p>
        <p><strong>Specialty:</strong> {doctor.specialization}</p>
        <p><strong>Clinic:</strong> {doctor.hospital || "N/A"}</p>
        <p><strong>Date:</strong> {date}</p>
        <p><strong>Time:</strong> {time}</p>
        <p><strong>Fee:</strong> ₹{doctor.fee}</p>
      </div>

      <h3>Select Payment Method</h3>

      <label>
        <input
          type="radio"
          value="Cash"
          checked={paymentMethod === "Cash"}
          onChange={(e) => setPaymentMethod(e.target.value)}
          disabled={processing}
        />
        Cash
      </label>

      <br />

      <label>
        <input
          type="radio"
          value="UPI"
          checked={paymentMethod === "UPI"}
          onChange={(e) => setPaymentMethod(e.target.value)}
          disabled={processing}
        />
        UPI
      </label>

      {paymentMethod === "UPI" && (
        <div style={{ marginTop: 10 }}>
          <label>
            <input
              type="radio"
              value="PhonePe"
              checked={upiOption === "PhonePe"}
              onChange={(e) => setUpiOption(e.target.value)}
              disabled={processing}
            />
            PhonePe
          </label>
          <br />
          <label>
            <input
              type="radio"
              value="GPay"
              checked={upiOption === "GPay"}
              onChange={(e) => setUpiOption(e.target.value)}
              disabled={processing}
            />
            GPay
          </label>
        </div>
      )}

      <button
        className="confirm-btn"
        onClick={handleConfirmPayment}
        disabled={processing}
        style={{ marginTop: 20 }}
      >
        {processing ? "Processing Payment..." : "Confirm & Pay"}
      </button>

      <button
        className="back-btn"
        onClick={() => navigate(-1)}
        disabled={processing}
        style={{ marginTop: 10 }}
      >
        Back
      </button>
    </div>
  );
}
