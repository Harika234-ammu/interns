import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const Notifications = ({ doctorId, token, setNotificationCount }) => {
  const [notifications, setNotifications] = useState([]);

  /* ================= FETCH NOTIFICATIONS ================= */
  useEffect(() => {
    if (!doctorId) return;

    axios
      .get(`http://localhost:5000/doctor/notifications/${doctorId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(res => {
        setNotifications(res.data);

        // 🔴 set unread count for avatar badge
        const unread = res.data.filter(n => !n.is_read).length;
        setNotificationCount(unread);
      })
      .catch(err => {
        console.error("Error fetching notifications", err);
      });
  }, [doctorId, token, setNotificationCount]);

  /* ================= MARK AS READ ================= */
  const markAsRead = (id) => {
    axios
      .put(`http://localhost:5000/doctor/notifications/read/${id}`)
      .then(() => {
        const updated = notifications.map(n =>
          n.id === id ? { ...n, is_read: true } : n
        );

        setNotifications(updated);

        // 🔴 update badge count
        const unread = updated.filter(n => !n.is_read).length;
        setNotificationCount(unread);
      })
      .catch(err => {
        console.error("Error marking notification as read", err);
      });
  };

  /* ================= EMPTY STATE ================= */
  if (!notifications.length) {
    return <p style={{ color: "#64748b" }}>No notifications</p>;
  }

  /* ================= UI ================= */
  return (
    <div>
      {notifications.map(n => (
        <div
          key={n.id}
          style={{
            padding: "10px",
            marginBottom: "8px",
            borderRadius: "8px",
            background: n.is_read ? "#f8fafc" : "#e0f2fe",
            cursor: "pointer",
            border: "1px solid #e2e8f0"
          }}
          onClick={() => {
            Swal.fire("Notification", n.message, "info");
            if (!n.is_read) markAsRead(n.id);
          }}
        >
          <p style={{ margin: 0, fontWeight: n.is_read ? "normal" : "bold" }}>
            {n.message}
          </p>
          <small style={{ color: "#64748b" }}>
            {new Date(n.created_at).toLocaleString()}
          </small>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
