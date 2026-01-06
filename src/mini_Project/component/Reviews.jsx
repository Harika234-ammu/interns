import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

const Reviews = ({ doctorId, token }) => {
  const [reviews, setReviews] = useState([]);
  const [open, setOpen] = useState(false);

  const fetchReviews = useCallback(async () => {
    if (!doctorId) return;
    try {
      const res = await axios.get(
        `http://localhost:5000/doctor/reviews/${doctorId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviews(res.data || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  }, [doctorId, token]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const toggle = () => setOpen((s) => !s);

  return (
    <div className="collapse" aria-live="polite">
      <div
        className="collapse-header"
        onClick={toggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && toggle()}
        aria-expanded={open}
        aria-controls="reviews-collapse"
      >
        <div className="title">
          <span>⭐ Patient Reviews</span>
          <span className="meta">({reviews.length})</span>
        </div>
        <div className="meta">
          <svg className={`caret ${open ? "open" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <div id="reviews-collapse" className={`collapse-content ${open ? "expanded" : ""}`}>
        <div className="collapse-scroll widget-body">
          {reviews.length === 0 ? (
            <p>No reviews yet</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {reviews.map((r) => (
                <li key={r.id ?? r._id} className="list-item">
                  <div><strong>Rating:</strong> {r.rating}/5</div>
                  <div style={{ marginTop: 6 }}><strong>Comment:</strong> {r.comment || "No comment"}</div>
                  <small style={{ marginTop: 8 }}>{new Date(r.created_at).toLocaleString()}</small>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviews;
