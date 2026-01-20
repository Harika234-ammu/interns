import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "../styles/PatientDash.css";
import PatientReviewPanel from "./PatientReviewPanel";

const PatientDashboard = () => {
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [profile, setProfile] = useState({
    name: "",
    age: "",
    gender: "",
    allergies: "",
    medical_history: "",
    ongoing_medications: "",
    photo: ""
  });

  const [appointments, setAppointments] = useState([]);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  /* ================= LOAD APPOINTMENTS ================= */
  const fetchAppointments = async () => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const res = await axios.get(
      "http://localhost:5000/patient/appointments",
      { headers }
    );

    const formatted = (res.data || []).map(a => {
      const dt = a.appointment_time ? new Date(a.appointment_time) : null;
      return {
        appointment_id: a.appointment_id,
        doctorName: a.doctor_name,
        date: dt,
        time: dt,
        status: a.status
      };
    });

    setAppointments(formatted);
  };

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const fullname = localStorage.getItem("fullname");

    if (!token) {
      navigate("/login");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    axios.get("http://localhost:5000/patient/profile", { headers })
      .then(res => {
        setProfile(p => ({
          ...p,
          ...res.data,
          name: fullname || res.data.name
        }));

        const complete =
          res.data?.age &&
          res.data?.gender &&
          res.data?.medical_history &&
          res.data?.allergies &&
          res.data?.ongoing_medications;

        setIsProfileComplete(Boolean(complete));
      });

    fetchAppointments();
  }, [navigate]);

  /* ================= HELPERS ================= */
  const formatDate = d => d ? d.toLocaleDateString() : "N/A";
  const formatTime = t =>
    t ? t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "N/A";

  /* ================= SAVE PROFILE ================= */
  const saveProfile = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "http://localhost:5000/patient/profile",
        profile,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire("Saved", "Profile saved successfully", "success");
      setIsProfileComplete(true);
    } catch {
      Swal.fire("Error", "Failed to save profile", "error");
    }
  };

  /* ================= IMAGE UPLOAD ================= */
  const handleImageUpload = e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () =>
      setProfile({ ...profile, photo: reader.result });
    reader.readAsDataURL(file);
  };

  /* ================= CANCEL APPOINTMENT ================= */
  const cancelAppointment = async (appointmentId) => {
    const { value: reason } = await Swal.fire({
      title: "Cancel Appointment",
      input: "select",
      inputOptions: {
        emergency: "Emergency",
        busy: "Busy / Not Available",
        reschedule: "Want to reschedule",
        not_well: "Not feeling well",
        other: "Other"
      },
      inputPlaceholder: "Select reason",
      showCancelButton: true,
      confirmButtonText: "Cancel Appointment",
      confirmButtonColor: "#d33",
      inputValidator: value => {
        if (!value) return "Please select a reason";
      }
    });

    if (!reason) return;

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/patient/appointments/cancel/${appointmentId}`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("Cancelled", "Appointment cancelled successfully", "success");
      fetchAppointments();
    } catch {
      Swal.fire("Error", "Failed to cancel appointment", "error");
    }
  };

  /* ================= FILTER ================= */
  const upcoming = appointments.filter(a => a.status === "Scheduled");
  const completed = appointments.filter(a => a.status === "Completed");

  const avatar =
    profile.photo ||
    `https://ui-avatars.com/api/?name=${profile.name || "User"}&background=0D8ABC&color=fff`;

  /* ================= PRESCRIPTIONS ================= */
  const showPrescriptions = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(
        "http://localhost:5000/patient/prescriptions",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.data.length) {
        Swal.fire("Prescriptions", "No prescriptions yet", "info");
        return;
      }

      Swal.fire({
        title: "Your Prescriptions",
        width: 650,
        html: res.data.map(p => `
          <div style="text-align:left;margin-bottom:12px">
            <p><b>Doctor:</b> ${p.doctorName}</p>
            <p><b>Doctor Notes:</b><br/>${p.doctor_notes || "—"}</p>
            <p><b>Prescription:</b><br/>${p.prescription_details}</p>

             ${p.file_url ? `
               <a
                 href="http://localhost:5000${p.file_url}"
                 target="_blank"
                 rel="noopener noreferrer"
                 style="color:#2563eb;text-decoration:underline"
               >
                 View Uploaded File
               </a>
             ` : ""}
             
             <br/>
             <small>${new Date(p.created_at).toLocaleString()}</small>

            <hr/>
          </div>
        `).join("")
      });
    } catch {
      Swal.fire("Error", "Failed to load prescriptions", "error");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="pd-page">

      {/* NAVBAR */}
      <header className="pd-navbar">
        <h2>PATIENT PROFILE</h2>
        <div className="pd-nav-actions">
          <button onClick={() => Swal.fire("Notifications", "No new notifications", "info")}>
            Notifications
          </button>
          <button onClick={showPrescriptions}>Prescriptions</button>
          <button onClick={() => setShowReviews(!showReviews)}>Reviews</button>
          <button
            className="logout"
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* REVIEWS */}
      {showReviews && (
        <div className="pd-box">
          <h3>Your Reviews</h3>
          <PatientReviewPanel />
        </div>
      )}

      {/* MAIN */}
      <div className="pd-container">

        {/* LEFT */}
        <div className="pd-box pd-details">
          <div className="profile-avatar">
            <img src={avatar} alt="avatar" />
            <input type="file" onChange={handleImageUpload} />
          </div>

          <label>Name</label>
          <input value={profile.name} disabled />

          <label>Age</label>
          <select
            value={profile.age}
            onChange={e => setProfile({ ...profile, age: e.target.value })}
          >
            <option value="">Select Age</option>
            {Array.from({ length: 83 }, (_, i) => i + 18).map(a => (
              <option key={a}>{a}</option>
            ))}
          </select>

          <label>Gender</label>
          <select
            value={profile.gender}
            onChange={e => setProfile({ ...profile, gender: e.target.value })}
          >
            <option value="">Select</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>

          <label>Allergies</label>
          <input
            value={profile.allergies}
            onChange={e => setProfile({ ...profile, allergies: e.target.value })}
          />

          <label>Medical History</label>
          <input
            value={profile.medical_history}
            onChange={e => setProfile({ ...profile, medical_history: e.target.value })}
          />

          <label>Medications</label>
          <input
            value={profile.ongoing_medications}
            onChange={e => setProfile({ ...profile, ongoing_medications: e.target.value })}
          />

          {!isProfileComplete && (
            <button className="save-btn" onClick={saveProfile}>
              Save Profile
            </button>
          )}
        </div>

        {/* RIGHT */}
        <div className="pd-side">

          <div className="pd-box">
            <h3>Appointments</h3>
            <p><b>Total:</b> {appointments.length}</p>
            <p><b>Upcoming:</b> {upcoming.length}</p>
            <p><b>Completed:</b> {completed.length}</p>

            <button
              className="book-btn"
              style={{ marginTop: "12px", width: "100%" }}
              disabled={!isProfileComplete}
              onClick={() => navigate("/symptoms")}
            >
              FIND DOCTOR & BOOK APPOINTMENT
            </button>

            {!isProfileComplete && (
              <p className="warning" style={{ marginTop: "8px" }}>
                ⚠ Please save your profile before booking
              </p>
            )}
          </div>

          {upcoming.length > 0 && (
            <div className="pd-box">
              <h3>Upcoming Appointments</h3>
              {upcoming.map(a => (
                <div key={a.appointment_id} className="appointment-row">
                  <p><b>Doctor:</b> {a.doctorName}</p>
                  <p><b>Date:</b> {formatDate(a.date)}</p>
                  <p><b>Time:</b> {formatTime(a.time)}</p>
                  <button
                    className="cancel-btn"
                    onClick={() => cancelAppointment(a.appointment_id)}
                  >
                    Cancel Appointment
                  </button>
                </div>
              ))}
            </div>
          )}

          {completed.length > 0 && (
            <div className="pd-box">
              <h3>Completed Appointments</h3>
              {completed.map(a => (
                <div key={a.appointment_id} className="appointment-row">
                  <p><b>Doctor:</b> {a.doctorName}</p>
                  <p><b>Date:</b> {formatDate(a.date)}</p>
                  <p><b>Time:</b> {formatTime(a.time)}</p>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
