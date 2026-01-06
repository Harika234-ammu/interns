import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./BookingPage.css";

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { doctor, date, time, amount } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState(""); // "UPI" or "Cash"
  const [upiMethod, setUpiMethod] = useState(""); // "PhonePe", "GPay", "Other"
  const [upiId, setUpiId] = useState(""); // for Other UPI input

  // Redirect if details missing
  useEffect(() => {
    if (!doctor || !date || !time || !amount) {
      navigate("/book");
    }
  }, [doctor, date, time, amount, navigate]);

  if (!doctor || !date || !time || !amount) return null;

  const handlePayment = () => {
    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    if (paymentMethod === "UPI" && !upiMethod) {
      alert("Please select a UPI option.");
      return;
    }

    if (paymentMethod === "UPI") {
      let paymentDetails = upiMethod;
      if (upiMethod === "Other") paymentDetails += ` (${upiId})`;
      alert(`Payment of ₹${amount} for ${doctor.name} completed via ${paymentDetails}!`);
    } else if (paymentMethod === "Cash") {
      alert(`Payment of ₹${amount} for ${doctor.name} will be collected in cash.`);
    }

    navigate("/"); // redirect home
  };

  return (
    <div className="booking-page">
      <h2>Payment</h2>
      <div className="confirmation-details">
        <p><strong>Doctor:</strong> {doctor.name}</p>
        <p><strong>Specialty:</strong> {doctor.specialty}</p>
        <p><strong>Clinic:</strong> {doctor.clinic}, {doctor.location}</p>
        <p><strong>Date:</strong> {date}</p>
        <p><strong>Time:</strong> {time}</p>
        <p><strong>Amount to Pay:</strong> ₹{amount}</p>
      </div>

      <h3>Select Payment Method:</h3>
      <div style={{ display: "flex", gap: "20px", margin: "15px 0" }}>
        <label>
          <input
            type="radio"
            name="payment"
            value="UPI"
            checked={paymentMethod === "UPI"}
            onChange={(e) => {
              setPaymentMethod(e.target.value);
              setUpiMethod(""); // reset UPI choice
              setUpiId("");
            }}
          />
          UPI
        </label>

        <label>
          <input
            type="radio"
            name="payment"
            value="Cash"
            checked={paymentMethod === "Cash"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Cash
        </label>
      </div>

      {paymentMethod === "UPI" && (
        <div style={{ marginBottom: "15px" }}>
          <h4>Choose UPI App:</h4>
          <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
            <button
              className={`proceed-btn ${upiMethod === "PhonePe" ? "active" : ""}`}
              onClick={() => setUpiMethod("PhonePe")}
            >
              PhonePe
            </button>
            <button
              className={`proceed-btn ${upiMethod === "GPay" ? "active" : ""}`}
              onClick={() => setUpiMethod("GPay")}
            >
              GPay
            </button>
            <button
              className={`proceed-btn ${upiMethod === "Other" ? "active" : ""}`}
              onClick={() => setUpiMethod("Other")}
            >
              Other UPI
            </button>
          </div>

          {/* Show UPI instructions based on selection */}
          {upiMethod === "PhonePe" && (
            <div style={{ marginBottom: "15px" }}>
              <p>Scan this PhonePe QR code or use PhonePe to pay ₹{amount}.</p>
              <img
                src="https://via.placeholder.com/150?text=PhonePe+QR"
                alt="PhonePe QR"
              />
            </div>
          )}

          {upiMethod === "GPay" && (
            <div style={{ marginBottom: "15px" }}>
              <p>Scan this GPay QR code or use Google Pay to pay ₹{amount}.</p>
              <img
                src="https://via.placeholder.com/150?text=GPay+QR"
                alt="GPay QR"
              />
            </div>
          )}

          {upiMethod === "Other" && (
            <div style={{ marginBottom: "15px" }}>
              <p>Enter your UPI ID to pay ₹{amount}:</p>
              <input
                type="text"
                placeholder="example@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                style={{ padding: "8px", borderRadius: "5px", width: "200px" }}
              />
            </div>
          )}
        </div>
      )}

      <button className="proceed-btn" onClick={handlePayment}>
        Pay Now
      </button>

      <button className="back-btn" onClick={() => navigate(-1)}>
        Back
      </button>
    </div>
  );
}
