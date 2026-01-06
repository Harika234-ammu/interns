import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "../styles/PatientDash.css";

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

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const fullname = localStorage.getItem("fullname");

    if (!token) {
      navigate("/login");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    // Load profile
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

    // Load appointments
    axios.get("http://localhost:5000/patient/appointments", { headers })
      .then(res => {
        const formatted = (res.data || []).map(a => ({
          doctorName: a.doctor_name || "Doctor",
          date: a.appointment_time,
          time: new Date(a.appointment_time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          }),
          status: a.status
        }));
        setAppointments(formatted);
      });
  }, [navigate]);

  /* ================= SAVE PROFILE ================= */
  const saveProfile = async () => {
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        "http://localhost:5000/patient/profile",
        profile,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("Success", "Profile saved successfully", "success");
      setIsProfileComplete(true);
    } catch {
      Swal.fire("Error", "Failed to save profile", "error");
    }
  };

  /* ================= IMAGE UPLOAD ================= */
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile({ ...profile, photo: reader.result });
    };
    reader.readAsDataURL(file);
  };

  /* ================= SWEETALERT POPUPS ================= */
  const showInfo = (title, text) => {
    Swal.fire({ title, text, icon: "info" });
  };

  const giveReview = (appointment) => {
    Swal.fire({
      title: `Review for Dr. ${appointment.doctorName}`,
      input: "textarea",
      inputLabel: "Your review",
      showCancelButton: true
    }).then(result => {
      if (result.isConfirmed) {
        Swal.fire("Thank you!", "Review submitted", "success");
      }
    });
  };

  /* ================= FILTER ================= */
  const upcoming = appointments.filter(a => a.status === "Scheduled");
  const completed = appointments.filter(a => a.status === "Completed");

  const avatar =
    profile.photo ||
    `https://ui-avatars.com/api/?name=${profile.name || "User"}&background=0D8ABC&color=fff`;

  /* ================= UI ================= */
  return (
    <div className="pd-page">

      {/* NAVBAR */}
      <header className="pd-navbar">
        <h2>PATIENT PROFILE</h2>
        <div className="pd-nav-actions">
          <button onClick={() => showInfo("Notifications", "No new notifications")}>
            Notifications
          </button>
          <button onClick={() => showInfo("Prescriptions", "No prescriptions yet")}>
            Prescriptions
          </button>
          <button onClick={() => showInfo("Reviews", "You can review completed appointments")}>
            Reviews
          </button>
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

      {/* MAIN */}
      <div className="pd-container">

        {/* LEFT BOX */}
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
            {Array.from({ length: 83 }, (_, i) => i + 18).map(age => (
              <option key={age} value={age}>{age}</option>
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

        {/* RIGHT BOX */}
        <div className="pd-side">
          <div className="pd-box">
            <h3>Health Overview</h3>
            <p><b>Allergies:</b> {profile.allergies || "None"}</p>
            <p><b>Medications:</b> {profile.ongoing_medications || "None"}</p>
          </div>

          <div className="pd-box">
            <h3>Appointments</h3>
            <p><b>Total:</b> {appointments.length}</p>
            <p><b>Upcoming:</b> {upcoming.length}</p>
            <p><b>Completed:</b> {completed.length}</p>
          </div>
        </div>
      </div>

      {/* APPOINTMENT DETAILS */}
      <div className="pd-box">
        <h3>Appointment Details</h3>

        {appointments.length === 0 && <p>No appointments found</p>}

        {appointments.map((a, i) => (
          <div key={i} className="appointment-row">
            <p><b>Doctor:</b> {a.doctorName}</p>
            <p><b>Date:</b> {new Date(a.date).toLocaleDateString()}</p>
            <p><b>Time:</b> {a.time}</p>

            {a.status === "Completed" && (
              <button onClick={() => giveReview(a)}>Give Review</button>
            )}
          </div>
        ))}
      </div>

      {/* BOOK BUTTON */}
      <div className="pd-book-box">
        <button
          className="book-btn"
          disabled={!isProfileComplete}
          onClick={() => navigate("/homepage")}
        >
          FIND A DOCTOR <br /> AND BOOK APPOINTMENT
        </button>

        {!isProfileComplete && (
          <p className="warning">⚠ Please save your profile before booking</p>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
