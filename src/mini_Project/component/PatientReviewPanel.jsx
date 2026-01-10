import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const PatientReviewPanel = () => {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [reviews, setReviews] = useState([]);
  const [completedAppointments, setCompletedAppointments] = useState([]);

  const loadReviews = async () => {
    const res = await axios.get("http://localhost:5000/patient/reviews", { headers });
    setReviews(res.data || []);
  };

  const loadCompletedAppointments = async () => {
    const res = await axios.get("http://localhost:5000/patient/appointments", { headers });
    setCompletedAppointments(
      (res.data || []).filter(a => a.status === "Completed")
    );
  };

  useEffect(() => {
    loadReviews();
    loadCompletedAppointments();
  }, []);

  const addOrEditReview = async (a) => {
    const { value } = await Swal.fire({
      title: `Review for Dr. ${a.doctor_name}`,
      html: `
        <select id="rating" class="swal2-select">
          <option value="">Rating</option>
          <option value="5">⭐⭐⭐⭐⭐</option>
          <option value="4">⭐⭐⭐⭐</option>
          <option value="3">⭐⭐⭐</option>
          <option value="2">⭐⭐</option>
          <option value="1">⭐</option>
        </select>
        <textarea id="comment" class="swal2-textarea" placeholder="Comment"></textarea>
      `,
      showCancelButton: true,
      preConfirm: () => {
        const rating = document.getElementById("rating").value;
        const comment = document.getElementById("comment").value;
        if (!rating) {
          Swal.showValidationMessage("Rating required");
          return;
        }
        return { rating, comment };
      }
    });

    if (!value) return;

    await axios.post(
      "http://localhost:5000/patient/reviews",
      {
        appointment_id: a.appointment_id,
        doctor_id: a.doctor_id,
        rating: value.rating,
        comment: value.comment
      },
      { headers }
    );

    Swal.fire("Success", "Review saved", "success");
    loadReviews();
  };

  return (
    <div>
      {completedAppointments.map(a => (
        <div key={a.appointment_id} className="appointment-row">
          <p><b>Doctor:</b> {a.doctor_name}</p>
          <button onClick={() => addOrEditReview(a)}>
            Add / Update Review
          </button>
        </div>
      ))}

      {reviews.length === 0 ? (
        <p>No reviews yet</p>
      ) : (
        reviews.map(r => (
          <div key={r.id} className="appointment-row">
            <p><b>Doctor:</b> {r.doctorName}</p>
            <p><b>Rating:</b> ⭐ {r.rating} / 5</p>
            <p>{r.comment}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default PatientReviewPanel;
