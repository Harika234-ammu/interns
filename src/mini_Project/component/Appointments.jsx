import React, { useEffect, useState } from "react";
import axios from "axios";

const Appointments = ({ doctorId, token }) => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [doctorNotes, setDoctorNotes] = useState("");
  const [prescriptionDetails, setPrescriptionDetails] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false); // collapsed by default

  useEffect(() => {
    if (!doctorId) {
      setLoading(false);
      return;
    }
    let mounted = true;
    const fetchAppointments = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/doctor/appointments/${doctorId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!mounted) return;
        setAppointments(res.data || []);
      } catch (err) {
        console.error("Error fetching appointments:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchAppointments();
    return () => (mounted = false);
  }, [doctorId, token]);

  const completeAppointment = async (id) => {
    const body = new FormData();
    body.append("doctorNotes", doctorNotes);
    body.append("prescriptionDetails", prescriptionDetails);
    if (file) body.append("file", file);

    try {
      await axios.post(
        `http://localhost:5000/doctor/appointments/${id}/complete`,
        body,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("✅ Appointment completed!");
      const res = await axios.get(
        `http://localhost:5000/doctor/appointments/${doctorId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppointments(res.data || []);
      setSelectedAppointment(null);
      setDoctorNotes("");
      setPrescriptionDetails("");
      setFile(null);
    } catch (err) {
      console.error("Error completing appointment:", err);
      alert("❌ Could not complete appointment");
    }
  };

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
        aria-controls="appointments-collapse"
      >
        <div className="title">
          <span>📅 Appointments</span>
          <span className="meta">({appointments.length})</span>
        </div>
        <div className="meta">
          <svg className={`caret ${open ? "open" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <div id="appointments-collapse" className={`collapse-content ${open ? "expanded" : ""}`}>
        <div className="collapse-scroll widget-body">
          {loading ? (
            <p>Loading appointments...</p>
          ) : appointments.length === 0 ? (
            <p>No appointments found.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {appointments.map((appt) => (
                <li key={appt.id} className="list-item">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <strong>{appt.patientName || "Patient"}</strong>
                      <div style={{ color: "#666", fontSize: 13 }}>
                        {appt.date ? new Date(appt.date).toLocaleString() : appt.appointment_time || "—"}
                      </div>
                      <div style={{ marginTop: 6 }}>
                        Age: {appt.age ?? "-"} • Gender: {appt.gender ?? "-"} • Allergies: {appt.allergies ?? "-"}
                      </div>
                      <div style={{ marginTop: 6 }}>
                        Symptoms: {Array.isArray(appt.symptoms) ? appt.symptoms.join(", ") : appt.symptoms || "-"}
                      </div>
                    </div>

                    <div style={{ textAlign: "right", minWidth: 110 }}>
                      <div style={{ marginBottom: 8 }}>
                        <span className={`status-badge ${appt.status === "Scheduled" ? "scheduled" : appt.status === "Completed" ? "completed" : "cancelled"}`}>
                          {appt.status}
                        </span>
                      </div>
                      {appt.status === "Scheduled" && (
                        <button onClick={() => setSelectedAppointment(appt)}>Mark as Completed</button>
                      )}
                    </div>
                  </div>

                  {appt.status === "Completed" && (
                    <div style={{ marginTop: 10 }}>
                      <strong>Doctor Notes:</strong> {appt.doctorNotes || "-"}
                      <br />
                      <strong>Prescription:</strong> {appt.prescriptionDetails || "-"}
                      <br />
                      {appt.prescriptionFile && (
                        <a href={appt.prescriptionFile} target="_blank" rel="noreferrer">Download Prescription</a>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          {selectedAppointment && (
            <div className="list-item" style={{ marginTop: 16 }}>
              <h4 style={{ marginTop: 0 }}>Complete Appointment for {selectedAppointment.patientName}</h4>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  completeAppointment(selectedAppointment.id);
                }}
              >
                <textarea
                  placeholder="Doctor notes"
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  required
                  style={{ width: "100%", minHeight: 80, marginBottom: 10 }}
                />
                <textarea
                  placeholder="Prescription details"
                  value={prescriptionDetails}
                  onChange={(e) => setPrescriptionDetails(e.target.value)}
                  required
                  style={{ width: "100%", minHeight: 80, marginBottom: 10 }}
                />
                <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} style={{ marginBottom: 10 }} />
                <br />
                <button type="submit" className="save-btn">✅ Save & Complete</button>
                <button type="button" onClick={() => setSelectedAppointment(null)} style={{ marginLeft: 10 }}>❌ Cancel</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;
