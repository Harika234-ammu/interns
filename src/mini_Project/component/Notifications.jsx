import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

const Notifications = ({ doctorId, token }) => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!doctorId) return;
    try {
      const res = await axios.get(
        `http://localhost:5000/doctor/notifications/${doctorId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  }, [doctorId, token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

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
        aria-controls="notifications-collapse"
      >
        <div className="title">
          <span>🔔 Notifications</span>
          <span className="meta">({notifications.length})</span>
        </div>
        <div className="meta">
          <svg className={`caret ${open ? "open" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <div id="notifications-collapse" className={`collapse-content ${open ? "expanded" : ""}`}>
        <div className="collapse-scroll widget-body">
          {notifications.length === 0 ? (
            <p>No notifications</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {notifications.map((n) => (
                <li key={n.id ?? n._id} className="list-item">
                  <div>{n.message}</div>
                  <small>{new Date(n.created_at).toLocaleString()}</small>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
