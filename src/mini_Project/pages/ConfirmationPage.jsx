import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./BookingPage.css";

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { doctor, date, time } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState("");
  const [upiOption, setUpiOption] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!doctor || !date || !time) {
      navigate("/book");
    }
  }, [doctor, date, time, navigate]);

  if (!doctor || !date || !time) return null;

  const confirmSlot = () => {
    // Check if slot already booked
    const bookedSlots = JSON.parse(localStorage.getItem("bookedSlots") || "[]");
    const slotExists = bookedSlots.some(
      (s) => s.doctorId === doctor.id && s.date === date && s.time === time
    );

    if (slotExists) {
      alert("This slot is already booked. Please go back and select another time.");
      navigate("/book");
      return;
    }

    // Save the booked slot
    const newSlot = { doctorId: doctor.id, date, time, paymentMethod, upiOption };
    localStorage.setItem("bookedSlots", JSON.stringify([...bookedSlots, newSlot]));

    alert(`Appointment confirmed with ${doctor.fullname} on ${date} at ${time}\nPayment: ${paymentMethod}${paymentMethod === "UPI" ? ` (${upiOption})` : ''}`);
    navigate("/"); // redirect to home
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

      // Simulate payment processing
      setProcessing(true);
      setTimeout(() => {
        setProcessing(false);
        alert(`Payment successful via ${upiOption}`);
        confirmSlot();
      }, 2000); // simulate 2-second payment delay
    } else {
      // Cash payment, confirm immediately
      confirmSlot();
    }
  };

  return (
    <div className="booking-page">
      <h2>Confirm Your Appointment</h2>
      <div className="confirmation-details">
        <p><strong>Doctor:</strong> {doctor.fullname}</p>
        <p><strong>Specialty:</strong> {doctor.specialization}</p>
        <p><strong>Clinic:</strong> {doctor.hospital}, {doctor.location}</p>
        <p><strong>Date:</strong> {date}</p>
        <p><strong>Time:</strong> {time}</p>
        <p><strong>Fee:</strong> ₹{doctor.fee}</p>
      </div>

      <h3>Select Payment Method:</h3>
      <label>
        <input
          type="radio"
          name="payment"
          value="Cash"
          checked={paymentMethod === "Cash"}
          onChange={(e) => setPaymentMethod(e.target.value)}
          disabled={processing}
        /> Cash
      </label>
      <br />
      <label>
        <input
          type="radio"
          name="payment"
          value="UPI"
          checked={paymentMethod === "UPI"}
          onChange={(e) => setPaymentMethod(e.target.value)}
          disabled={processing}
        /> UPI
      </label>

      {paymentMethod === "UPI" && (
        <div style={{ marginTop: "10px" }}>
          <label>
            <input
              type="radio"
              name="upi"
              value="PhonePe"
              checked={upiOption === "PhonePe"}
              onChange={(e) => setUpiOption(e.target.value)}
              disabled={processing}
            /> PhonePe
          </label>
          <br />
          <label>
            <input
              type="radio"
              name="upi"
              value="GPay"
              checked={upiOption === "GPay"}
              onChange={(e) => setUpiOption(e.target.value)}
              disabled={processing}
            /> GPay
          </label>
          <br />
          <label>
            <input
              type="radio"
              name="upi"
              value="Other"
              checked={upiOption === "Other"}
              onChange={(e) => setUpiOption(e.target.value)}
              disabled={processing}
            /> Other UPI
          </label>
        </div>
      )}

      <button
        className="confirm-btn"
        onClick={handleConfirmPayment}
        style={{ marginTop: "20px" }}
        disabled={processing}
      >
        {processing ? "Processing Payment..." : "Confirm & Pay"}
      </button>
      <button
        className="back-btn"
        onClick={() => navigate(-1)}
        style={{ marginTop: "10px" }}
        disabled={processing}
      >
        Back
      </button>
    </div>
  );
}
